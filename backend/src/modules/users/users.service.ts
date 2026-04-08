import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { CONSTANTS } from '../../config/constants';
import { AppError } from '../../utils/appError';
import { parsePagination, buildPaginationMeta, parseSorting } from '../../utils/pagination';
import { CreateUserInput, UpdateUserInput } from './users.validators';

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  districtId: true,
  structureId: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  district: { select: { id: true, name: true, code: true } },
  structure: { select: { id: true, name: true, code: true } },
};

const SORTABLE_FIELDS = ['name', 'email', 'role', 'status', 'createdAt', 'lastLoginAt'];

export class UsersService {
  static async list(query: any) {
    const { skip, take, page, per_page } = parsePagination(query);
    const { orderBy } = parseSorting(query, SORTABLE_FIELDS);

    const where: Prisma.UserWhereInput = {};

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

  static async getById(id: number) {
    const user = await prisma.user.findUnique({ where: { id }, select: USER_SELECT });
    if (!user) throw AppError.notFound('User not found');
    return user;
  }

  static async create(input: CreateUserInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw AppError.conflict('A user with this email already exists');

    const passwordHash = await bcrypt.hash(input.password, CONSTANTS.BCRYPT_ROUNDS);
    const { password, ...rest } = input;

    return prisma.user.create({
      data: { ...rest, passwordHash },
      select: USER_SELECT,
    });
  }

  static async update(id: number, input: UpdateUserInput) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw AppError.notFound('User not found');

    const data: any = { ...input };

    if (input.password) {
      data.passwordHash = await bcrypt.hash(input.password, CONSTANTS.BCRYPT_ROUNDS);
      delete data.password;
    }

    return prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT,
    });
  }

  static async delete(id: number) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw AppError.notFound('User not found');
    await prisma.user.delete({ where: { id } });
  }
}
