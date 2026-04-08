import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/appError';
import { parsePagination, buildPaginationMeta, parseSorting } from '../../utils/pagination';

const AUDIT_SORTABLE = ['createdAt', 'userName', 'action', 'module', 'severity'];

export class AuditLogsService {
  static async list(query: any) {
    const { skip, take, page, per_page } = parsePagination(query);
    const { orderBy } = parseSorting(query, AUDIT_SORTABLE, 'createdAt');
    const where: Prisma.AuditLogWhereInput = {};

    if (query.search) {
      where.OR = [
        { userName: { contains: query.search, mode: 'insensitive' } },
        { target: { contains: query.search, mode: 'insensitive' } },
        { details: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.action) where.action = query.action;
    if (query.module) where.module = query.module;
    if (query.severity) where.severity = query.severity;
    if (query.userId) where.userId = parseInt(query.userId, 10);
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({ where, skip, take, orderBy }),
      prisma.auditLog.count({ where }),
    ]);

    return { data, meta: buildPaginationMeta(total, page, per_page) };
  }

  static async getById(id: number) {
    const log = await prisma.auditLog.findUnique({ where: { id } });
    if (!log) throw AppError.notFound('Audit log not found');
    return log;
  }

  static async getStats() {
    const [byAction, byModule, bySeverity, totalToday] = await Promise.all([
      prisma.auditLog.groupBy({ by: ['action'], _count: true }),
      prisma.auditLog.groupBy({ by: ['module'], _count: true }),
      prisma.auditLog.groupBy({ by: ['severity'], _count: true }),
      prisma.auditLog.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
    ]);

    return {
      byAction: byAction.map((a) => ({ action: a.action, count: a._count })),
      byModule: byModule.map((m) => ({ module: m.module, count: m._count })),
      bySeverity: bySeverity.map((s) => ({ severity: s.severity, count: s._count })),
      totalToday,
    };
  }

  static async getRecentLogins(limit = 10) {
    return prisma.auditLog.findMany({
      where: { action: 'login' },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
