import { Prisma, TpeStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/appError';
import { parsePagination, buildPaginationMeta, parseSorting } from '../../utils/pagination';
import { CreateTpeInput, UpdateTpeInput } from './tpe.validators';

const TPE_INCLUDE = {
  station: { select: { id: true, name: true, code: true, structure: { select: { id: true, name: true, district: { select: { id: true, name: true } } } } } },
};

const TPE_SORTABLE = ['serial', 'model', 'operator', 'status', 'receptionDate', 'createdAt'];

export class TpeService {
  // ─── Stock (all TPEs) ───
  static async list(query: any) {
    const { skip, take, page, per_page } = parsePagination(query);
    const { orderBy } = parseSorting(query, TPE_SORTABLE);
    const where: Prisma.TpeWhereInput = {};

    if (query.search) {
      where.OR = [
        { serial: { contains: query.search, mode: 'insensitive' } },
        { inventoryNumber: { contains: query.search, mode: 'insensitive' } },
        { simPhone: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.status) where.status = query.status as TpeStatus;
    if (query.model) where.model = query.model as any;
    if (query.operator) where.operator = query.operator as any;
    if (query.stationId) where.stationId = parseInt(query.stationId, 10);

    const [data, total] = await Promise.all([
      prisma.tpe.findMany({ where, include: TPE_INCLUDE, skip, take, orderBy }),
      prisma.tpe.count({ where }),
    ]);

    return { data, meta: buildPaginationMeta(total, page, per_page) };
  }

  static async getById(id: number) {
    const tpe = await prisma.tpe.findUnique({
      where: { id },
      include: {
        ...TPE_INCLUDE,
        maintenance: { orderBy: { createdAt: 'desc' }, take: 5 },
        managementCards: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!tpe) throw AppError.notFound('TPE not found');
    return tpe;
  }

  static async create(input: CreateTpeInput) {
    const { stationCode, ...rest } = input as any;
    let resolvedStationId = rest.stationId;
    if (!resolvedStationId && stationCode) {
      const station = await prisma.station.findFirst({ where: { code: stationCode } });
      if (!station) throw AppError.notFound(`Station with code '${stationCode}' not found`);
      resolvedStationId = station.id;
    }
    return prisma.tpe.create({ data: { ...rest, stationId: resolvedStationId }, include: TPE_INCLUDE });
  }

  static async update(id: number, input: UpdateTpeInput) {
    await this.getById(id);
    const { stationCode, ...rest } = input as any;
    let data: any = rest;
    if (stationCode && !rest.stationId) {
      const station = await prisma.station.findFirst({ where: { code: stationCode } });
      if (!station) throw AppError.notFound(`Station with code '${stationCode}' not found`);
      data = { ...rest, stationId: station.id };
    }
    return prisma.tpe.update({ where: { id }, data, include: TPE_INCLUDE });
  }

  static async delete(id: number) {
    await this.getById(id);
    await prisma.tpe.delete({ where: { id } });
  }

  // ─── Maintenance ───
  static async listMaintenance(query: any) {
    const { skip, take, page, per_page } = parsePagination(query);
    const where: Prisma.TpeMaintenanceWhereInput = {};

    if (query.search) {
      where.tpe = { serial: { contains: query.search, mode: 'insensitive' } };
    }
    if (query.status) where.status = query.status as any;
    if (query.stationId) where.stationId = parseInt(query.stationId, 10);

    const [data, total] = await Promise.all([
      prisma.tpeMaintenance.findMany({
        where, skip, take,
        orderBy: { createdAt: 'desc' },
        include: {
          tpe: { select: { id: true, serial: true, model: true } },
          station: { select: { id: true, name: true, code: true } },
        },
      }),
      prisma.tpeMaintenance.count({ where }),
    ]);

    return { data, meta: buildPaginationMeta(total, page, per_page) };
  }

  static async createMaintenance(input: any) {
    // Update TPE status to en_maintenance
    await prisma.tpe.update({ where: { id: input.tpeId }, data: { status: TpeStatus.en_maintenance } });

    return prisma.tpeMaintenance.create({
      data: input,
      include: {
        tpe: { select: { id: true, serial: true, model: true } },
        station: { select: { id: true, name: true } },
      },
    });
  }

  static async updateMaintenance(id: number, input: any) {
    const record = await prisma.tpeMaintenance.findUnique({ where: { id } });
    if (!record) throw AppError.notFound('Maintenance record not found');

    const updated = await prisma.tpeMaintenance.update({
      where: { id },
      data: input,
      include: {
        tpe: { select: { id: true, serial: true, model: true } },
        station: { select: { id: true, name: true } },
      },
    });

    // If maintenance resolved, update TPE status back
    if (input.status === 'repare') {
      await prisma.tpe.update({ where: { id: record.tpeId }, data: { status: TpeStatus.en_service } });
    } else if (input.status === 'reforme') {
      await prisma.tpe.update({ where: { id: record.tpeId }, data: { status: TpeStatus.reforme } });
    }

    return updated;
  }

  // ─── Returns ───
  static async listReturns(query: any) {
    const { skip, take, page, per_page } = parsePagination(query);

    const [data, total] = await Promise.all([
      prisma.tpeReturn.findMany({
        skip, take,
        orderBy: { createdAt: 'desc' },
        include: {
          tpe: { select: { id: true, serial: true, model: true } },
          oldStation: { select: { id: true, name: true } },
          newStation: { select: { id: true, name: true } },
        },
      }),
      prisma.tpeReturn.count(),
    ]);

    return { data, meta: buildPaginationMeta(total, page, per_page) };
  }

  static async createReturn(input: any) {
    // Move TPE to new station
    await prisma.tpe.update({
      where: { id: input.tpeId },
      data: { stationId: input.newStationId },
    });

    return prisma.tpeReturn.create({
      data: {
        tpeId: input.tpeId,
        oldStationId: input.oldStationId,
        newStationId: input.newStationId,
        returnReason: input.reason || '',
        trsSt1Str: input.returnDate,
      },
      include: {
        tpe: { select: { id: true, serial: true, model: true } },
        oldStation: { select: { id: true, name: true } },
        newStation: { select: { id: true, name: true } },
      },
    });
  }

  // ─── Transfers ───
  static async listTransfers(query: any) {
    const { skip, take, page, per_page } = parsePagination(query);

    const [data, total] = await Promise.all([
      prisma.tpeTransfer.findMany({
        skip, take,
        orderBy: { exitDate: 'desc' },
        include: {
          items: {
            include: { tpe: { select: { id: true, serial: true, model: true } } },
          },
        },
      }),
      prisma.tpeTransfer.count(),
    ]);

    return { data, meta: buildPaginationMeta(total, page, per_page) };
  }

  static async createTransfer(input: any) {
    const { tpeIds, ...transferData } = input;

    const transfer = await prisma.tpeTransfer.create({
      data: {
        ...transferData,
        items: {
          create: tpeIds.map((tpeId: number) => ({ tpeId })),
        },
      },
      include: {
        items: {
          include: { tpe: { select: { id: true, serial: true, model: true } } },
        },
      },
    });

    // Update TPE statuses
    await prisma.tpe.updateMany({
      where: { id: { in: tpeIds } },
      data: { status: TpeStatus.en_transfert },
    });

    return transfer;
  }

  // ─── Reform ───
  static async listReforms(query: any) {
    const { skip, take, page, per_page } = parsePagination(query);

    const [data, total] = await Promise.all([
      prisma.tpeReform.findMany({
        skip, take,
        orderBy: { reformDate: 'desc' },
        include: {
          tpe: { select: { id: true, serial: true, model: true, station: { select: { id: true, name: true } } } },
        },
      }),
      prisma.tpeReform.count(),
    ]);

    return { data, meta: buildPaginationMeta(total, page, per_page) };
  }

  static async createReform(input: any) {
    // Update TPE status to reformed
    await prisma.tpe.update({ where: { id: input.tpeId }, data: { status: TpeStatus.reforme } });

    return prisma.tpeReform.create({
      data: input,
      include: {
        tpe: { select: { id: true, serial: true, model: true } },
      },
    });
  }
}
