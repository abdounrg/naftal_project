import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/appError';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination';

export class ChargersService {
  // ─── Charger Stock ───
  static async listChargers() {
    return prisma.charger.findMany({ orderBy: { model: 'asc' } });
  }

  static async createCharger(input: any) {
    return prisma.charger.create({ data: input });
  }

  static async updateCharger(id: number, input: any) {
    const charger = await prisma.charger.findUnique({ where: { id } });
    if (!charger) throw AppError.notFound('Charger not found');
    return prisma.charger.update({ where: { id }, data: input });
  }

  static async deleteCharger(id: number) {
    const charger = await prisma.charger.findUnique({ where: { id } });
    if (!charger) throw AppError.notFound('Charger not found');
    await prisma.charger.delete({ where: { id } });
  }

  // ─── Base Stock ───
  static async listBases() {
    return prisma.base.findMany({ orderBy: { model: 'asc' } });
  }

  static async createBase(input: any) {
    return prisma.base.create({ data: input });
  }

  static async updateBase(id: number, input: any) {
    const base = await prisma.base.findUnique({ where: { id } });
    if (!base) throw AppError.notFound('Base not found');
    return prisma.base.update({ where: { id }, data: input });
  }

  // ─── Charger Transfers ───
  static async listTransfers(query: any) {
    const { skip, take, page, per_page } = parsePagination(query);

    const [data, total] = await Promise.all([
      prisma.chargerTransfer.findMany({
        skip, take,
        orderBy: { exitDate: 'desc' },
        include: { base: { select: { id: true, serial: true, model: true } } },
      }),
      prisma.chargerTransfer.count(),
    ]);

    return { data, meta: buildPaginationMeta(total, page, per_page) };
  }

  static async createTransfer(input: any) {
    return prisma.chargerTransfer.create({
      data: input,
      include: { base: { select: { id: true, serial: true, model: true } } },
    });
  }
}
