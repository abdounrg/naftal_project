import { Prisma, TpeStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/appError';
import { parsePagination, buildPaginationMeta, parseSorting } from '../../utils/pagination';
import { CreateTpeInput, UpdateTpeInput } from './tpe.validators';
import {
  AuthUserScope,
  tpeScopeWhere,
  tpeMaintenanceScopeWhere,
  tpeReturnScopeWhere,
  tpeReformScopeWhere,
} from '../../lib/authScope';

const TPE_INCLUDE = {
  station: { select: { id: true, name: true, code: true, structure: { select: { id: true, name: true, district: { select: { id: true, name: true } } } } } },
};

const TPE_SORTABLE = ['serial', 'model', 'operator', 'status', 'receptionDate', 'createdAt'];

export class TpeService {
  // ─── Stock (all TPEs) ───
  static async list(query: any, user?: AuthUserScope) {
    const { skip, take, page, per_page } = parsePagination(query);
    const { orderBy } = parseSorting(query, TPE_SORTABLE);
    const where: Prisma.TpeWhereInput = { AND: [tpeScopeWhere(user)] };

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

    const mapped = data.map(d => ({
      id: d.id,
      serial: d.serial,
      model: d.model,
      operator: d.operator || '',
      sim_serial: d.simSerial || '',
      sim_ip: d.simIp || '',
      sim_phone: d.simPhone || '',
      purchase_price: d.purchasePrice ? Number(d.purchasePrice) : null,
      inventory_number: d.inventoryNumber || '',
      assignment_type: d.assignmentType || '',
      status: d.status,
      code: d.station?.code || '',
      station_name: d.station?.name || '',
      structure_name: d.station?.structure?.name || '',
      district: d.station?.structure?.district?.name || '',
      reception_date: d.receptionDate ? new Date(d.receptionDate).toISOString().split('T')[0] : '',
      delivery_date: d.deliveryDate ? new Date(d.deliveryDate).toISOString().split('T')[0] : '',
      expiration_date: d.expirationDate ? new Date(d.expirationDate).toISOString().split('T')[0] : '',
      amortissement: (() => {
        if (!d.expirationDate) return '';
        const now = new Date();
        const exp = new Date(d.expirationDate);
        const diff = exp.getTime() - now.getTime();
        if (diff <= 0) return 'Expiré';
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days > 365) { const y = Math.floor(days / 365); const m = Math.floor((days % 365) / 30); return `${y}a ${m}m`; }
        if (days > 30) { const m = Math.floor(days / 30); const d2 = days % 30; return `${m}m ${d2}j`; }
        return `${days}j`;
      })(),
    }));

    return { data: mapped, meta: buildPaginationMeta(total, page, per_page) };
  }

  static async getById(id: number, user?: AuthUserScope) {
    const tpe = await prisma.tpe.findFirst({
      where: { id, AND: [tpeScopeWhere(user)] },
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

  static async update(id: number, input: UpdateTpeInput, user?: AuthUserScope) {
    await this.getById(id, user);
    const { stationCode, ...rest } = input as any;
    let data: any = rest;
    if (stationCode && !rest.stationId) {
      const station = await prisma.station.findFirst({ where: { code: stationCode } });
      if (!station) throw AppError.notFound(`Station with code '${stationCode}' not found`);
      data = { ...rest, stationId: station.id };
    }
    return prisma.tpe.update({ where: { id }, data, include: TPE_INCLUDE });
  }

  static async delete(id: number, user?: AuthUserScope) {
    await this.getById(id, user);
    await prisma.tpe.delete({ where: { id } });
  }

  // ─── TPEs by structure code ───
  static async listByStructure(structureCode: string, user?: AuthUserScope) {
    const structure = await prisma.structure.findUnique({
      where: { code: structureCode },
      select: { id: true, districtId: true, stations: { select: { id: true } } },
    });
    if (!structure) return [];
    // Scope check: user with district/structure scope cannot read other tenants' structures
    if (user) {
      if (user.role === 'district_member' && user.districtId !== structure.districtId) return [];
      if ((user.role === 'agency_member' || user.role === 'antenna_member') && user.structureId !== structure.id) return [];
    }
    const stationIds = structure.stations.map(s => s.id);
    if (stationIds.length === 0) return [];

    return prisma.tpe.findMany({
      where: { stationId: { in: stationIds } },
      select: {
        id: true,
        serial: true,
        model: true,
        status: true,
        station: { select: { id: true, code: true, name: true } },
      },
      orderBy: { serial: 'asc' },
    });
  }

  // ─── Maintenance ───
  static async listMaintenance(query: any, user?: AuthUserScope) {
    const { skip, take, page, per_page } = parsePagination(query);
    const where: Prisma.TpeMaintenanceWhereInput = { AND: [tpeMaintenanceScopeWhere(user)] };

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
          station: { select: { id: true, name: true, code: true, structure: { select: { id: true, name: true, code: true, district: { select: { id: true, name: true } } } } } },
        },
      }),
      prisma.tpeMaintenance.count({ where }),
    ]);

    const mapped = data.map(d => ({
      id: d.id,
      serial: d.tpe?.serial || '',
      model: d.tpe?.model || '',
      station_code: d.station?.code || '',
      station_name: d.station?.name || '',
      structure_code: d.station?.structure?.code || '',
      structure_name: d.station?.structure?.name || '',
      district: d.station?.structure?.district?.name || '',
      operation_mode: d.operationMode || '',
      breakdown_date: d.breakdownDate ? new Date(d.breakdownDate).toISOString().split('T')[0] : '',
      problem_type: d.problemType || '',
      diagnostic: d.diagnostic || '',
      status: d.status,
      trs_st_str: d.trsStStr ? new Date(d.trsStStr).toISOString().split('T')[0] : null,
      trs_str_dpe: d.trsStrDpe ? new Date(d.trsStrDpe).toISOString().split('T')[0] : null,
      trs_dpe_dcsi: d.trsDpeDcsi ? new Date(d.trsDpeDcsi).toISOString().split('T')[0] : null,
      trs_dcsi_dpe: d.trsDcsiDpe ? new Date(d.trsDcsiDpe).toISOString().split('T')[0] : null,
      trs_dpe_str: d.trsDpeStr ? new Date(d.trsDpeStr).toISOString().split('T')[0] : null,
      trs_str_st: d.trsStrSt ? new Date(d.trsStrSt).toISOString().split('T')[0] : null,
      processing_duration: d.processingDuration,
      immobilization_duration: d.immobilizationDuration,
      created_at: d.createdAt,
    }));

    return { data: mapped, meta: buildPaginationMeta(total, page, per_page) };
  }

  static async createMaintenance(input: any) {
    // Resolve serial → tpeId
    const tpe = await prisma.tpe.findUnique({ where: { serial: input.serial } });
    if (!tpe) throw AppError.notFound('TPE not found with serial: ' + input.serial);

    // Resolve station_code → stationId
    const station = await prisma.station.findUnique({ where: { code: input.station_code } });
    if (!station) throw AppError.notFound('Station not found with code: ' + input.station_code);

    const mode = (input.operation_mode || '').trim();

    // Non-repair modes are immediate operations: log a maintenance record AND transition the TPE
    // to its target status without keeping it in maintenance.
    //   - Restitution           → TPE returns to en_stock
    //   - Reconfiguration       → TPE goes back to en_service
    //   - Changement raison sociale → TPE stays in en_service (business name change only)
    const immediateModes: Record<string, { tpeStatus: TpeStatus; recordStatus: any }> = {
      'Restitution': { tpeStatus: TpeStatus.en_stock, recordStatus: 'retourne' },
      'Reconfiguration': { tpeStatus: TpeStatus.en_service, recordStatus: 'reconfigure' },
      'Changement raison sociale': { tpeStatus: TpeStatus.en_service, recordStatus: 'reconfigure' },
    };

    if (mode in immediateModes) {
      const { tpeStatus, recordStatus } = immediateModes[mode];
      // Optional transfer-target station for Reconfiguration (TPE moves to a new station).
      let newStationId: number | null = null;
      if (mode === 'Reconfiguration' && input.new_station_code) {
        const newStation = await prisma.station.findUnique({ where: { code: input.new_station_code } });
        if (!newStation) throw AppError.notFound('New station not found with code: ' + input.new_station_code);
        newStationId = newStation.id;
      }
      return prisma.$transaction(async (tx) => {
        const record = await tx.tpeMaintenance.create({
          data: {
            tpeId: tpe.id,
            stationId: station.id,
            operationMode: mode,
            breakdownDate: input.breakdown_date,
            problemType: input.problem_type || null,
            diagnostic: input.diagnostic || null,
            status: recordStatus,
          },
          include: {
            tpe: { select: { id: true, serial: true, model: true } },
            station: { select: { id: true, name: true, code: true, structure: { select: { id: true, name: true, code: true, district: { select: { id: true, name: true } } } } } },
          },
        });
        await tx.tpe.update({
          where: { id: tpe.id },
          data: {
            status: tpeStatus,
            ...(newStationId ? { stationId: newStationId } : {}),
          },
        });
        return record;
      });
    }

    // Default (Reparation): wrap status update + maintenance creation atomically.
    return prisma.$transaction(async (tx) => {
      await tx.tpe.update({ where: { id: tpe.id }, data: { status: TpeStatus.en_maintenance } });
      return tx.tpeMaintenance.create({
        data: {
          tpeId: tpe.id,
          stationId: station.id,
          operationMode: mode,
          breakdownDate: input.breakdown_date,
          problemType: input.problem_type || null,
          diagnostic: input.diagnostic || null,
          status: input.status || 'en_panne',
        },
        include: {
          tpe: { select: { id: true, serial: true, model: true } },
          station: { select: { id: true, name: true, code: true, structure: { select: { id: true, name: true, code: true, district: { select: { id: true, name: true } } } } } },
        },
      });
    });
  }

  static async updateMaintenance(id: number, input: any) {
    const record = await prisma.tpeMaintenance.findUnique({ where: { id } });
    if (!record) throw AppError.notFound('Maintenance record not found');

    // Statuses that mean the TPE is back in service → delete from maintenance
    const backInServiceStatuses = ['repare', 'changement_sim', 'reconfigure', 'retourne', 'remplace'];
    // Statuses that mean the TPE is reformed → delete from maintenance + delete from stock
    const reformStatuses = ['reforme', 'irreparable'];

    const newStatus = input.status;

    if (newStatus && backInServiceStatuses.includes(newStatus)) {
      // TPE goes back to en_service, remove maintenance record (atomic)
      await prisma.$transaction([
        prisma.tpe.update({ where: { id: record.tpeId }, data: { status: TpeStatus.en_service } }),
        prisma.tpeMaintenance.delete({ where: { id } }),
      ]);
      return { id, deleted: true, tpeStatus: 'en_service' };
    }

    if (newStatus && reformStatuses.includes(newStatus)) {
      // TPE is reformed → update status, create reform record, delete from maintenance (atomic)
      await prisma.$transaction([
        prisma.tpe.update({ where: { id: record.tpeId }, data: { status: TpeStatus.reforme } }),
        prisma.tpeReform.create({
          data: {
            tpeId: record.tpeId,
            reformDate: new Date(),
            reason: newStatus === 'irreparable' ? 'Irreparable - auto reformed from maintenance' : 'Reformed from maintenance',
          },
        }),
        prisma.tpeMaintenance.delete({ where: { id } }),
      ]);
      return { id, deleted: true, tpeStatus: 'reforme' };
    }

    // Normal update (status still in progress)
    const updateData: any = {};
    if (input.operation_mode !== undefined) updateData.operationMode = input.operation_mode;
    if (input.breakdown_date !== undefined) updateData.breakdownDate = input.breakdown_date;
    if (input.problem_type !== undefined) updateData.problemType = input.problem_type || null;
    if (input.diagnostic !== undefined) updateData.diagnostic = input.diagnostic || null;
    if (input.status !== undefined) updateData.status = input.status;

    // Resolve station_code if provided
    if (input.station_code) {
      const station = await prisma.station.findUnique({ where: { code: input.station_code } });
      if (station) updateData.stationId = station.id;
    }

    return prisma.tpeMaintenance.update({
      where: { id },
      data: updateData,
      include: {
        tpe: { select: { id: true, serial: true, model: true } },
        station: { select: { id: true, name: true, code: true, structure: { select: { id: true, name: true, code: true, district: { select: { id: true, name: true } } } } } },
      },
    });
  }

  static async deleteMaintenance(id: number) {
    const record = await prisma.tpeMaintenance.findUnique({ where: { id } });
    if (!record) throw AppError.notFound('Maintenance record not found');

    await prisma.$transaction([
      prisma.tpeMaintenance.delete({ where: { id } }),
      prisma.tpe.updateMany({
        where: { id: record.tpeId, status: TpeStatus.en_maintenance },
        data: { status: TpeStatus.en_stock },
      }),
    ]);
  }

  static async getDistinctProblemTypes() {
    const results = await prisma.tpeMaintenance.findMany({
      where: { problemType: { not: null } },
      select: { problemType: true },
      distinct: ['problemType'],
      orderBy: { problemType: 'asc' },
    });
    return results.map(r => r.problemType).filter(Boolean);
  }

  // ─── Returns ───
  static async listReturns(query: any, user?: AuthUserScope) {
    const { skip, take, page, per_page } = parsePagination(query);
    const where: Prisma.TpeReturnWhereInput = tpeReturnScopeWhere(user);

    const [data, total] = await Promise.all([
      prisma.tpeReturn.findMany({
        where,
        skip, take,
        orderBy: { createdAt: 'desc' },
        include: {
          tpe: { select: { id: true, serial: true, model: true, operator: true, simSerial: true, simIp: true, simPhone: true } },
          oldStation: { select: { id: true, name: true, code: true } },
          newStation: { select: { id: true, name: true, code: true } },
        },
      }),
      prisma.tpeReturn.count({ where }),
    ]);

    const mapped = data.map(d => ({
      id: d.id,
      serial: d.tpe?.serial || '',
      model: d.tpe?.model || '',
      return_reason: d.returnReason || '',
      operator: d.tpe?.operator || '',
      sim_serial: d.tpe?.simSerial || '',
      sim_ip: d.tpe?.simIp || '',
      sim_phone: d.tpe?.simPhone || '',
      old_station_code: d.oldStation?.code || '',
      old_station_name: d.oldStation?.name || '',
      new_station_code: d.newStation?.code || '',
      new_station_name: d.newStation?.name || '',
      trs_st1_str: d.trsSt1Str ? new Date(d.trsSt1Str).toISOString().split('T')[0] : '',
      trs_str_dpe: d.trsStrDpe ? new Date(d.trsStrDpe).toISOString().split('T')[0] : '',
      trs_dpe_dcsi: d.trsDpeDcsi ? new Date(d.trsDpeDcsi).toISOString().split('T')[0] : '',
      trs_dcsi_dpe: d.trsDcsiDpe ? new Date(d.trsDcsiDpe).toISOString().split('T')[0] : '',
      trs_dpe_str: d.trsDpeStr ? new Date(d.trsDpeStr).toISOString().split('T')[0] : '',
      trs_str_st2: d.trsStrSt2 ? new Date(d.trsStrSt2).toISOString().split('T')[0] : '',
      processing_duration: d.processingDuration ?? '',
      immobilization_duration: d.immobilizationDuration ?? '',
    }));

    return { data: mapped, meta: buildPaginationMeta(total, page, per_page) };
  }

  static async createReturn(input: any) {
    // Resolve serial → tpeId if not provided
    let { tpeId, oldStationId, newStationId } = input;
    if (!tpeId && input.serial) {
      const tpe = await prisma.tpe.findUnique({ where: { serial: input.serial } });
      if (!tpe) throw AppError.notFound('TPE not found with serial: ' + input.serial);
      tpeId = tpe.id;
    }
    if (!tpeId) throw AppError.badRequest('Either tpeId or serial is required');

    // Resolve station codes → stationIds
    if (!oldStationId && input.old_station_code) {
      const station = await prisma.station.findUnique({ where: { code: input.old_station_code } });
      if (!station) throw AppError.notFound('Old station not found with code: ' + input.old_station_code);
      oldStationId = station.id;
    }

    if (!newStationId && input.new_station_code) {
      const station = await prisma.station.findUnique({ where: { code: input.new_station_code } });
      if (!station) throw AppError.notFound('New station not found with code: ' + input.new_station_code);
      newStationId = station.id;
    }

    // Move TPE to new station and mark as 'a_retourner' so the workflow status is consistent.
    // Use a transaction so partial state cannot persist if the second write fails.
    return prisma.$transaction(async (tx) => {
      if (newStationId) {
        await tx.tpe.update({
          where: { id: tpeId },
          data: { stationId: newStationId, status: TpeStatus.a_retourner },
        });
      } else {
        await tx.tpe.update({
          where: { id: tpeId },
          data: { status: TpeStatus.a_retourner },
        });
      }

      return tx.tpeReturn.create({
        data: {
          tpeId,
          oldStationId: oldStationId || null,
          newStationId: newStationId || null,
          returnReason: input.return_reason || input.reason || '',
          trsSt1Str: input.returnDate || input.return_date ? new Date(input.returnDate || input.return_date) : new Date(),
        },
        include: {
          tpe: { select: { id: true, serial: true, model: true } },
          oldStation: { select: { id: true, name: true, code: true } },
          newStation: { select: { id: true, name: true, code: true } },
        },
      });
    });
  }

  static async updateReturn(id: number, input: any) {
    const record = await prisma.tpeReturn.findUnique({ where: { id } });
    if (!record) throw AppError.notFound('Return record not found');

    const data: any = {};
    if (input.return_reason || input.reason) data.returnReason = input.return_reason || input.reason;
    if (input.operator) data.operator = input.operator;

    // Resolve new station
    if (input.new_station_code) {
      const station = await prisma.station.findUnique({ where: { code: input.new_station_code } });
      if (station) data.newStationId = station.id;
    } else if (input.newStationId) {
      data.newStationId = input.newStationId;
    }

    return prisma.tpeReturn.update({
      where: { id },
      data,
      include: {
        tpe: { select: { id: true, serial: true, model: true } },
        oldStation: { select: { id: true, name: true, code: true } },
        newStation: { select: { id: true, name: true, code: true } },
      },
    });
  }

  static async deleteReturn(id: number) {
    const record = await prisma.tpeReturn.findUnique({ where: { id } });
    if (!record) throw AppError.notFound('Return record not found');
    await prisma.tpeReturn.delete({ where: { id } });
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

    const mapped = data.map(d => ({
      id: d.id,
      source: d.source || '',
      destination: d.destination || '',
      beneficiary_name: d.beneficiaryName || '',
      beneficiary_function: d.beneficiaryFunction || '',
      exit_date: d.exitDate ? new Date(d.exitDate).toISOString().split('T')[0] : '',
      nbr_tpe: d.nbrTpe || 0,
      tpe_numbers: d.items?.map((i: any) => i.tpe?.serial).filter(Boolean).join(', ') || '',
      discharge: d.discharge || '',
      bts_number: d.btsNumber || '',
      reception_date: d.receptionDate ? new Date(d.receptionDate).toISOString().split('T')[0] : '',
    }));

    return { data: mapped, meta: buildPaginationMeta(total, page, per_page) };
  }

  static async createTransfer(input: any) {
    // Accept frontend field names and resolve
    const exitDate = input.exitDate || input.exit_date || null;
    const receptionDate = input.receptionDate || input.reception_date || null;
    const transferredFrom = input.transferredFrom || input.source || '';
    const transferredTo = input.transferredTo || input.destination || '';
    const discharge = input.discharge || '';
    const beneficiaryName = input.beneficiaryName || input.beneficiary_name || '';
    const beneficiaryFunction = input.beneficiaryFunction || input.beneficiary_function || '';
    const btsNumber = input.btsNumber || input.bts_number || '';

    // Resolve tpeIds from tpe_numbers string if tpeIds not provided
    let tpeIds: number[] = input.tpeIds || [];
    if ((!tpeIds || tpeIds.length === 0) && input.tpe_numbers) {
      const serials = String(input.tpe_numbers).split(/[,;\s]+/).map((s: string) => s.trim()).filter(Boolean);
      if (serials.length > 0) {
        const tpes = await prisma.tpe.findMany({
          where: { serial: { in: serials } },
          select: { id: true },
        });
        tpeIds = tpes.map(t => t.id);
      }
    }

    const transfer = await prisma.$transaction(async (tx) => {
      const created = await tx.tpeTransfer.create({
        data: {
          exitDate: exitDate ? new Date(exitDate) : new Date(),
          receptionDate: receptionDate ? new Date(receptionDate) : null,
          source: transferredFrom,
          destination: transferredTo,
          discharge,
          beneficiaryName,
          beneficiaryFunction,
          btsNumber,
          nbrTpe: tpeIds.length || parseInt(input.nbr_tpe) || 0,
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

      if (tpeIds.length > 0) {
        const isDpeToStructure = transferredFrom.toLowerCase().includes('dpe');
        const newStatus = isDpeToStructure && receptionDate ? TpeStatus.en_service : TpeStatus.en_transfert;
        await tx.tpe.updateMany({
          where: { id: { in: tpeIds } },
          data: { status: newStatus },
        });
      }

      return created;
    });

    return transfer;
  }

  static async updateTransfer(id: number, input: any) {
    const transfer = await prisma.tpeTransfer.findUnique({
      where: { id },
      include: { items: { select: { tpeId: true } } },
    });
    if (!transfer) throw AppError.notFound('TPE transfer not found');

    const exitDate = input.exitDate || input.exit_date || transfer.exitDate;
    const receptionDateInput = input.receptionDate || input.reception_date;
    const hasReceptionDateUpdate = receptionDateInput !== undefined;
    const newReceptionDate = receptionDateInput ? new Date(receptionDateInput) : null;
    const source = input.transferredFrom || input.source;
    const destination = input.transferredTo || input.destination;

    return prisma.$transaction(async (tx) => {
      const updated = await tx.tpeTransfer.update({
        where: { id },
        data: {
          source: source ?? undefined,
          destination: destination ?? undefined,
          beneficiaryName: input.beneficiaryName || input.beneficiary_name || undefined,
          beneficiaryFunction: input.beneficiaryFunction || input.beneficiary_function || undefined,
          exitDate: exitDate ? new Date(exitDate) : undefined,
          receptionDate: hasReceptionDateUpdate ? newReceptionDate : undefined,
          discharge: input.discharge ?? undefined,
          btsNumber: input.btsNumber || input.bts_number || undefined,
          nbrTpe: input.nbr_tpe ? parseInt(input.nbr_tpe, 10) : undefined,
        },
        include: {
          items: {
            include: { tpe: { select: { id: true, serial: true, model: true } } },
          },
        },
      });

      // If reception date was just added on a DPE→Structure transfer, flip
      // any still-en_transfert TPEs to en_service. We do not flip back when a
      // reception date is cleared, to avoid surprising state regressions.
      if (hasReceptionDateUpdate && newReceptionDate && transfer.items.length > 0) {
        const isDpeToStructure = (updated.source || '').toLowerCase().includes('dpe');
        if (isDpeToStructure) {
          const tpeIds = transfer.items.map(i => i.tpeId);
          await tx.tpe.updateMany({
            where: { id: { in: tpeIds }, status: TpeStatus.en_transfert },
            data: { status: TpeStatus.en_service },
          });
        }
      }

      return updated;
    });
  }

  static async deleteTransfer(id: number) {
    const transfer = await prisma.tpeTransfer.findUnique({
      where: { id },
      include: { items: { select: { tpeId: true } } },
    });
    if (!transfer) throw AppError.notFound('TPE transfer not found');

    const tpeIds = transfer.items.map((i: any) => i.tpeId);
    await prisma.$transaction([
      ...(tpeIds.length > 0
        ? [prisma.tpe.updateMany({
            where: { id: { in: tpeIds }, status: TpeStatus.en_transfert },
            data: { status: TpeStatus.en_stock },
          })]
        : []),
      prisma.tpeTransfer.delete({ where: { id } }),
    ]);
  }

  // ─── Reform ───
  static async listReforms(query: any, user?: AuthUserScope) {
    const { skip, take, page, per_page } = parsePagination(query);
    const where: Prisma.TpeReformWhereInput = tpeReformScopeWhere(user);

    const [data, total] = await Promise.all([
      prisma.tpeReform.findMany({
        where,
        skip, take,
        orderBy: { reformDate: 'desc' },
        include: {
          tpe: { select: { id: true, serial: true, model: true, station: { select: { id: true, name: true, code: true, structure: { select: { id: true, name: true, code: true, district: { select: { id: true, name: true } } } } } } } },
        },
      }),
      prisma.tpeReform.count({ where }),
    ]);

    const mapped = data.map(d => ({
      id: d.id,
      serial: d.tpe?.serial || '',
      model: d.tpe?.model || '',
      station_name: d.tpe?.station?.name || '',
      structure_name: d.tpe?.station?.structure?.name || '',
      district: d.tpe?.station?.structure?.district?.name || '',
      reform_pv: d.reformPv || '',
      reform_date: d.reformDate ? new Date(d.reformDate).toISOString().split('T')[0] : '',
      reason: d.reason || '',
    }));

    return { data: mapped, meta: buildPaginationMeta(total, page, per_page) };
  }

  static async createReform(input: any) {
    // Resolve serial → tpeId if not provided
    let { tpeId } = input;
    if (!tpeId && input.serial) {
      const tpe = await prisma.tpe.findUnique({ where: { serial: input.serial } });
      if (!tpe) throw AppError.notFound('TPE not found with serial: ' + input.serial);
      tpeId = tpe.id;
    }
    if (!tpeId) throw AppError.badRequest('Either tpeId or serial is required');

    // Atomically update TPE status, clean up maintenance records, and create reform.
    return prisma.$transaction(async (tx) => {
      await tx.tpe.update({ where: { id: tpeId }, data: { status: TpeStatus.reforme } });
      await tx.tpeMaintenance.deleteMany({ where: { tpeId } });
      return tx.tpeReform.create({
        data: {
          tpeId,
          reformPv: input.reformPv || input.reform_pv || null,
          reformDate: input.reformDate || input.reform_date || new Date(),
          reason: input.reason || null,
        },
        include: {
          tpe: { select: { id: true, serial: true, model: true } },
        },
      });
    });
  }

  static async updateReform(id: number, input: any) {
    const record = await prisma.tpeReform.findUnique({ where: { id } });
    if (!record) throw AppError.notFound('Reform record not found');

    return prisma.tpeReform.update({
      where: { id },
      data: {
        reformPv: input.reformPv || input.reform_pv || undefined,
        reformDate: input.reformDate || input.reform_date ? new Date(input.reformDate || input.reform_date) : undefined,
        reason: input.reason ?? undefined,
      },
      include: {
        tpe: { select: { id: true, serial: true, model: true } },
      },
    });
  }

  static async deleteReform(id: number) {
    const record = await prisma.tpeReform.findUnique({ where: { id } });
    if (!record) throw AppError.notFound('Reform record not found');

    await prisma.$transaction(async (tx) => {
      await tx.tpeReform.delete({ where: { id } });
      const remaining = await tx.tpeReform.count({ where: { tpeId: record.tpeId } });
      if (remaining === 0) {
        await tx.tpe.update({ where: { id: record.tpeId }, data: { status: TpeStatus.en_stock } });
      }
    });
  }
}
