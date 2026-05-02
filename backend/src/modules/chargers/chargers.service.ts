import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/appError';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination';

export class ChargersService {
  // ─── Charger Stock ───
  static async listChargers() {
    const data = await prisma.charger.findMany({ orderBy: { model: 'asc' } });
    return data.map(d => ({
      id: d.id,
      model: d.model,
      tpe_model: d.tpeModel || '',
      quantity: d.quantity,
    }));
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

  static async deleteBase(id: number) {
    const base = await prisma.base.findUnique({ where: { id } });
    if (!base) throw AppError.notFound('Base not found');
    await prisma.base.delete({ where: { id } });
  }

  // ─── Charger Transfers ───
  static async listTransfers(query: any) {
    const { skip, take, page, per_page } = parsePagination(query);

    const [rows, total] = await Promise.all([
      prisma.chargerTransfer.findMany({
        skip, take,
        orderBy: { exitDate: 'desc' },
        include: { base: { select: { id: true, serial: true, model: true } } },
      }),
      prisma.chargerTransfer.count(),
    ]);

    const data = rows.map(r => ({
      id: r.id,
      type: r.type,
      source: r.source,
      destination: r.destination,
      beneficiary_name: r.beneficiaryName || '',
      beneficiary_function: r.beneficiaryFunction || '',
      exit_date: r.exitDate ? new Date(r.exitDate).toISOString().split('T')[0] : '',
      nbr_items: r.nbrItems,
      discharge: r.discharge || '',
      bts_number: r.btsNumber || '',
      reception_date: r.receptionDate ? new Date(r.receptionDate).toISOString().split('T')[0] : null,
      base_serial: r.base?.serial || '',
      base_model: r.base?.model || '',
      base_id: r.baseId,
    }));

    return { data, meta: buildPaginationMeta(total, page, per_page) };
  }

  static async createTransfer(input: any) {
    const exitRaw = input.exitDate || input.exit_date;
    const recepRaw = input.receptionDate || input.reception_date;
    const data: any = {
      type: input.type || 'charger',
      exitDate: exitRaw ? new Date(exitRaw) : new Date(),
      receptionDate: recepRaw ? new Date(recepRaw) : null,
      source: input.source || '',
      destination: input.destination || '',
      discharge: input.discharge || null,
      beneficiaryName: input.beneficiary_name || input.beneficiaryName || null,
      beneficiaryFunction: input.beneficiary_function || input.beneficiaryFunction || null,
      nbrItems: input.nbr_items ? parseInt(input.nbr_items) : (input.nbrItems ? parseInt(input.nbrItems) : 1),
      btsNumber: input.bts_number || input.btsNumber || null,
      baseId: input.base_id ? parseInt(input.base_id) : (input.baseId ? parseInt(input.baseId) : null),
    };

    return prisma.chargerTransfer.create({
      data,
      include: { base: { select: { id: true, serial: true, model: true } } },
    });
  }

  static async updateTransfer(id: number, input: any) {
    const transfer = await prisma.chargerTransfer.findUnique({ where: { id } });
    if (!transfer) throw AppError.notFound('Charger transfer not found');

    const exitRaw = input.exitDate || input.exit_date;
    const recepRaw = input.receptionDate || input.reception_date;

    const data: any = {
      type: input.type || transfer.type,
      source: input.source ?? input.transferredFrom ?? undefined,
      destination: input.destination ?? input.transferredTo ?? undefined,
      discharge: input.discharge ?? undefined,
      beneficiaryName: input.beneficiary_name ?? input.beneficiaryName ?? undefined,
      beneficiaryFunction: input.beneficiary_function ?? input.beneficiaryFunction ?? undefined,
      btsNumber: input.bts_number ?? input.btsNumber ?? undefined,
      baseId: input.base_id ? parseInt(input.base_id, 10) : (input.baseId ? parseInt(input.baseId, 10) : undefined),
    };

    if (exitRaw !== undefined) data.exitDate = exitRaw ? new Date(exitRaw) : transfer.exitDate;
    if (recepRaw !== undefined) data.receptionDate = recepRaw ? new Date(recepRaw) : null;
    if (input.nbr_items !== undefined || input.nbrItems !== undefined) {
      data.nbrItems = input.nbr_items ? parseInt(input.nbr_items, 10) : (input.nbrItems ? parseInt(input.nbrItems, 10) : transfer.nbrItems);
    }

    return prisma.chargerTransfer.update({
      where: { id },
      data,
      include: { base: { select: { id: true, serial: true, model: true } } },
    });
  }

  static async deleteTransfer(id: number) {
    const transfer = await prisma.chargerTransfer.findUnique({ where: { id } });
    if (!transfer) throw AppError.notFound('Charger transfer not found');
    await prisma.chargerTransfer.delete({ where: { id } });
  }
}
