import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/appError';
import { parsePagination, buildPaginationMeta, parseSorting } from '../../utils/pagination';

const CARD_INCLUDE = {
  tpe: { select: { id: true, serial: true, model: true } },
  station: { select: { id: true, name: true, code: true, structure: { select: { id: true, name: true, district: { select: { id: true, name: true } } } } } },
};

const CARD_SORTABLE = ['cardSerial', 'status', 'receptionDate', 'expirationDate', 'createdAt'];

export class CardsService {
  // ─── Stock (all cards) ───
  static async list(query: any) {
    const { skip, take, page, per_page } = parsePagination(query);
    const { orderBy } = parseSorting(query, CARD_SORTABLE);
    const where: Prisma.ManagementCardWhereInput = {};

    if (query.search) {
      where.OR = [
        { cardSerial: { contains: query.search, mode: 'insensitive' } },
        { tpe: { serial: { contains: query.search, mode: 'insensitive' } } },
      ];
    }
    if (query.status) where.status = query.status;
    if (query.stationId) where.stationId = parseInt(query.stationId, 10);

    const [data, total] = await Promise.all([
      prisma.managementCard.findMany({ where, include: CARD_INCLUDE, skip, take, orderBy }),
      prisma.managementCard.count({ where }),
    ]);

    return { data, meta: buildPaginationMeta(total, page, per_page) };
  }

  // ─── Circulation (en_circulation only) ───
  static async circulation(query: any) {
    return this.list({ ...query, status: 'en_circulation' });
  }

  static async getById(id: number) {
    const card = await prisma.managementCard.findUnique({
      where: { id },
      include: {
        ...CARD_INCLUDE,
        monitoring: { orderBy: { createdAt: 'desc' }, take: 5, include: { substitutionCard: { select: { id: true, cardSerial: true } } } },
      },
    });
    if (!card) throw AppError.notFound('Management card not found');
    return card;
  }

  static async create(input: any) {
    return prisma.managementCard.create({ data: input, include: CARD_INCLUDE });
  }

  static async update(id: number, input: any) {
    await this.getById(id);
    return prisma.managementCard.update({ where: { id }, data: input, include: CARD_INCLUDE });
  }

  static async delete(id: number) {
    await this.getById(id);
    await prisma.managementCard.delete({ where: { id } });
  }

  // ─── Monitoring ───
  static async listMonitoring(query: any) {
    const { skip, take, page, per_page } = parsePagination(query);
    const where: Prisma.CardMonitoringWhereInput = {};

    if (query.search) {
      where.card = { cardSerial: { contains: query.search, mode: 'insensitive' } };
    }
    if (query.status) where.status = query.status;
    if (query.stationId) where.stationId = parseInt(query.stationId, 10);

    const [data, total] = await Promise.all([
      prisma.cardMonitoring.findMany({
        where, skip, take,
        orderBy: { createdAt: 'desc' },
        include: {
          card: { select: { id: true, cardSerial: true } },
          station: { select: { id: true, name: true } },
          substitutionCard: { select: { id: true, cardSerial: true } },
        },
      }),
      prisma.cardMonitoring.count({ where }),
    ]);

    return { data, meta: buildPaginationMeta(total, page, per_page) };
  }

  static async createMonitoring(input: any) {
    // Update card status
    await prisma.managementCard.update({
      where: { id: input.cardId },
      data: { status: 'en_maintenance' },
    });

    return prisma.cardMonitoring.create({
      data: input,
      include: {
        card: { select: { id: true, cardSerial: true } },
        station: { select: { id: true, name: true } },
        substitutionCard: { select: { id: true, cardSerial: true } },
      },
    });
  }

  static async updateMonitoring(id: number, input: any) {
    const record = await prisma.cardMonitoring.findUnique({ where: { id } });
    if (!record) throw AppError.notFound('Monitoring record not found');

    const updated = await prisma.cardMonitoring.update({
      where: { id },
      data: input,
      include: {
        card: { select: { id: true, cardSerial: true } },
        station: { select: { id: true, name: true } },
        substitutionCard: { select: { id: true, cardSerial: true } },
      },
    });

    // Update card status based on monitoring resolution
    if (input.status === 'carte_recue') {
      await prisma.managementCard.update({ where: { id: record.cardId }, data: { status: 'en_circulation' } });
    }

    return updated;
  }

  // ─── Transfers ───
  static async listTransfers(query: any) {
    const { skip, take, page, per_page } = parsePagination(query);

    const [data, total] = await Promise.all([
      prisma.cardTransfer.findMany({
        skip, take,
        orderBy: { exitDate: 'desc' },
        include: {
          items: {
            include: { card: { select: { id: true, cardSerial: true } } },
          },
        },
      }),
      prisma.cardTransfer.count(),
    ]);

    return { data, meta: buildPaginationMeta(total, page, per_page) };
  }

  static async createTransfer(input: any) {
    const { cardIds, ...transferData } = input;

    const transfer = await prisma.cardTransfer.create({
      data: {
        ...transferData,
        items: {
          create: cardIds.map((cardId: number) => ({ cardId })),
        },
      },
      include: {
        items: {
          include: { card: { select: { id: true, cardSerial: true } } },
        },
      },
    });

    // Update card statuses
    await prisma.managementCard.updateMany({
      where: { id: { in: cardIds } },
      data: { status: 'en_transfert' },
    });

    return transfer;
  }
}
