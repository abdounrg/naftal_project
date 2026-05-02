import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { CONSTANTS } from '../../config/constants';
import { AppError } from '../../utils/appError';
import { parsePagination, buildPaginationMeta, parseSorting } from '../../utils/pagination';
import { CreateUserInput, UpdateUserInput } from './users.validators';
import { getEffectivePermissions, UserPermissions, SECTION_KEYS, ALLOWED_ACTIONS } from '../../config/permissions';
import { AuthUserScope, userScopeWhere } from '../../lib/authScope';

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  requestedById: true,
  districtId: true,
  structureId: true,
  permissions: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  district: { select: { id: true, name: true, code: true } },
  structure: { select: { id: true, name: true, code: true } },
  requestedBy: { select: { id: true, name: true, email: true } },
};

const SORTABLE_FIELDS = ['name', 'email', 'role', 'status', 'createdAt', 'lastLoginAt'];

export class UsersService {
  static async list(query: any, user?: AuthUserScope) {
    const { skip, take, page, per_page } = parsePagination(query);
    const { orderBy } = parseSorting(query, SORTABLE_FIELDS);

    const where: Prisma.UserWhereInput = { AND: [userScopeWhere(user)] };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.role) where.role = query.role;
    if (query.status) where.status = query.status;
    if (query.districtId) where.districtId = parseInt(query.districtId, 10);

    const [data, total] = await Promise.all([
      prisma.user.findMany({ where, select: USER_SELECT, skip, take, orderBy }),
      prisma.user.count({ where }),
    ]);

    return { data, meta: buildPaginationMeta(total, page, per_page) };
  }

  static async getById(id: number, viewer?: AuthUserScope) {
    const user = await prisma.user.findFirst({ where: { id, AND: [userScopeWhere(viewer)] }, select: USER_SELECT });
    if (!user) throw AppError.notFound('User not found');
    return user;
  }

  static async create(input: CreateUserInput, isAdmin: boolean = false, requestedById?: number) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw AppError.conflict('A user with this email already exists');

    const passwordHash = await bcrypt.hash(input.password, CONSTANTS.BCRYPT_ROUNDS);
    const { password, structureCode, ...rest } = input as any;

    // Resolve structureCode to structureId and districtId
    if (structureCode && !rest.structureId) {
      const structure = await prisma.structure.findUnique({
        where: { code: structureCode },
        include: { district: true },
      });
      if (!structure) throw AppError.notFound(`Structure with code '${structureCode}' not found`);
      rest.structureId = structure.id;
      rest.districtId = structure.districtId;
    }

    // If not admin, set status to pending (requires approval)
    if (!isAdmin) {
      rest.status = 'pending';
      rest.requestedById = requestedById;
    }

    return prisma.user.create({
      data: { ...rest, passwordHash },
      select: USER_SELECT,
    });
  }

  static async listPending(query: any, viewer?: AuthUserScope) {
    const { skip, take, page, per_page } = parsePagination(query);
    const { orderBy } = parseSorting(query, SORTABLE_FIELDS);

    const where: Prisma.UserWhereInput = { status: 'pending', AND: [userScopeWhere(viewer)] };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({ where, select: USER_SELECT, skip, take, orderBy }),
      prisma.user.count({ where }),
    ]);

    return { data, meta: buildPaginationMeta(total, page, per_page) };
  }

  static async approveUser(id: number) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw AppError.notFound('User not found');
    if (user.status !== 'pending') throw AppError.conflict('User is not in pending status');

    return prisma.user.update({
      where: { id },
      data: { status: 'active' },
      select: USER_SELECT,
    });
  }

  static async rejectUser(id: number) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw AppError.notFound('User not found');
    if (user.status !== 'pending') throw AppError.conflict('User is not in pending status');

    await prisma.$transaction([
      prisma.auditLog.deleteMany({ where: { userId: id } }),
      prisma.refreshToken.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    return user;
  }

  static async update(id: number, input: UpdateUserInput, viewer?: AuthUserScope) {
    await this.getById(id, viewer);

    const { password, structureCode, ...rest } = input as any;
    const data: any = { ...rest };

    if (password) {
      data.passwordHash = await bcrypt.hash(password, CONSTANTS.BCRYPT_ROUNDS);
    }

    // Resolve structureCode to structureId and districtId
    if (structureCode) {
      const structure = await prisma.structure.findUnique({
        where: { code: structureCode },
        include: { district: true },
      });
      if (!structure) throw AppError.notFound(`Structure with code '${structureCode}' not found`);
      data.structureId = structure.id;
      data.districtId = structure.districtId;
    }

    return prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT,
    });
  }

  static async delete(id: number, viewer?: AuthUserScope) {
    await this.getById(id, viewer);

    await prisma.$transaction([
      prisma.auditLog.deleteMany({ where: { userId: id } }),
      prisma.refreshToken.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);
  }

  static async getPermissions(id: number) {
    const user = await prisma.user.findUnique({ where: { id }, select: { role: true, permissions: true } });
    if (!user) throw AppError.notFound('User not found');
    return getEffectivePermissions(user.role, user.permissions);
  }

  static async updatePermissions(id: number, permissions: Partial<UserPermissions>) {
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
    if (!user) throw AppError.notFound('User not found');

    // Validate structure: only accept known section keys with boolean action values, enforce allowed actions
    const sanitized: Record<string, Record<string, boolean>> = {};
    for (const key of SECTION_KEYS) {
      if (permissions[key] && typeof permissions[key] === 'object') {
        const section = permissions[key];
        const allowed = ALLOWED_ACTIONS[key];
        sanitized[key] = {
          view: allowed.includes('view') && typeof section.view === 'boolean' ? section.view : false,
          create: allowed.includes('create') && typeof section.create === 'boolean' ? section.create : false,
          edit: allowed.includes('edit') && typeof section.edit === 'boolean' ? section.edit : false,
          delete: allowed.includes('delete') && typeof section.delete === 'boolean' ? section.delete : false,
        };
      }
    }

    await prisma.user.update({ where: { id }, data: { permissions: sanitized } });
    return getEffectivePermissions(user.role, sanitized);
  }
}
