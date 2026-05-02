import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/appError';
import { parsePagination, buildPaginationMeta, parseSorting } from '../../utils/pagination';

const CARD_INCLUDE = {
  tpe: { select: { id: true, serial: true, model: true } },
  station: { select: { id: true, name: true, code: true, structure: { select: { id: true, name: true, code: true, district: { select: { id: true, name: true } } } } } },
};

const CARD_SORTABLE = ['cardSerial', 'status', 'receptionDate', 'expirationDate', 'createdAt'];

export class CardsService {
  // ─── Internal list helper (shared by stock & circulation) ───
  private static async _listCards(query: any, statusFilter?: Prisma.ManagementCardWhereInput['status']) {
    const { skip, take, page, per_page } = parsePagination(query);
    const { orderBy } = parseSorting(query, CARD_SORTABLE);
    const where: Prisma.ManagementCardWhereInput = {};

    if (query.search) {
      where.OR = [
        { cardSerial: { contains: query.search, mode: 'insensitive' } },
        { tpe: { serial: { contains: query.search, mode: 'insensitive' } } },
      ];
    }
    if (statusFilter) where.status = statusFilter;
    else if (query.status) where.status = query.status;
    if (query.stationId) where.stationId = parseInt(query.stationId, 10);

    const [data, total] = await Promise.all([
      prisma.managementCard.findMany({ where, include: CARD_INCLUDE, skip, take, orderBy }),
      prisma.managementCard.count({ where }),
    ]);

    const now = new Date();
    const mapped = data.map(d => {
      let status = d.status as string;
      if (d.expirationDate && new Date(d.expirationDate) < now && !['perdu', 'vole', 'en_maintenance', 'en_transfert'].includes(status)) {
        status = 'expire';
      }
      const expDate = d.expirationDate ? new Date(d.expirationDate) : null;
      let amortissement = '';
      if (expDate && expDate > now) {
        const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 365) amortissement = `${Math.floor(diffDays / 365)}a ${Math.floor((diffDays % 365) / 30)}m`;
        else if (diffDays > 30) amortissement = `${Math.floor(diffDays / 30)}m ${diffDays % 30}j`;
        else amortissement = `${diffDays}j`;
      } else if (expDate) {
        amortissement = status === 'expire' ? (d.status === 'en_stock' ? '' : 'Expiré') : '';
      }
      return {
        id: d.id,
        card_serial: d.cardSerial,
        tpe_serial: d.tpe?.serial || '',
        station_code: d.station?.code || '',
        station_name: d.station?.name || '',
        structure_name: d.station?.structure?.name || '',
        structure_code: d.station?.structure?.code || '',
        district: d.station?.structure?.district?.name || '',
        reception_date: d.receptionDate ? new Date(d.receptionDate).toISOString().split('T')[0] : '',
        delivery_date: d.deliveryDate ? new Date(d.deliveryDate).toISOString().split('T')[0] : '',
        expiration_date: d.expirationDate ? new Date(d.expirationDate).toISOString().split('T')[0] : '',
        amortissement,
        status,
      };
    });

    return { data: mapped, meta: buildPaginationMeta(total, page, per_page) };
  }

  // ─── Stock (en_stock cards only) ───
  static async list(query: any) {
    return this._listCards(query, 'en_stock');
  }

  // ─── Circulation (all cards NOT en_stock) ───
  static async circulation(query: any) {
    const { skip, take, page, per_page } = parsePagination(query);
    const { orderBy } = parseSorting(query, CARD_SORTABLE);
    const where: Prisma.ManagementCardWhereInput = {
      status: { not: 'en_stock' },
    };
    if (query.search) {
      where.OR = [
        { cardSerial: { contains: query.search, mode: 'insensitive' } },
        { tpe: { serial: { contains: query.search, mode: 'insensitive' } } },
      ];
    }
    if (query.status && query.status !== 'all') where.status = query.status;
    if (query.stationId) where.stationId = parseInt(query.stationId, 10);

    const [data, total] = await Promise.all([
      prisma.managementCard.findMany({ where, include: CARD_INCLUDE, skip, take, orderBy }),
      prisma.managementCard.count({ where }),
    ]);

    const now = new Date();
    const mapped = data.map(d => {
      let status = d.status as string;
      if (d.expirationDate && new Date(d.expirationDate) < now && !['perdu', 'vole', 'en_maintenance', 'en_transfert'].includes(status)) {
        status = 'expire';
      }
      const expDate = d.expirationDate ? new Date(d.expirationDate) : null;
      let amortissement = '';
      if (expDate && expDate > now) {
        const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 365) amortissement = `${Math.floor(diffDays / 365)}a ${Math.floor((diffDays % 365) / 30)}m`;
        else if (diffDays > 30) amortissement = `${Math.floor(diffDays / 30)}m ${diffDays % 30}j`;
        else amortissement = `${diffDays}j`;
      } else if (expDate) {
        amortissement = 'Expiré';
      }
      return {
        id: d.id,
        card_serial: d.cardSerial,
        tpe_serial: d.tpe?.serial || '',
        station_code: d.station?.code || '',
        station_name: d.station?.name || '',
        structure_name: d.station?.structure?.name || '',
        structure_code: d.station?.structure?.code || '',
        district: d.station?.structure?.district?.name || '',
        reception_date: d.receptionDate ? new Date(d.receptionDate).toISOString().split('T')[0] : '',
        delivery_date: d.deliveryDate ? new Date(d.deliveryDate).toISOString().split('T')[0] : '',
        expiration_date: d.expirationDate ? new Date(d.expirationDate).toISOString().split('T')[0] : '',
        amortissement,
        status,
      };
    });

    return { data: mapped, meta: buildPaginationMeta(total, page, per_page) };
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
    // Resolve frontend field names
    const cardSerial = input.cardSerial || input.card_serial;
    if (!cardSerial) throw AppError.badRequest('cardSerial or card_serial is required');

    // Resolve stationId from station_code if needed
    let { stationId, tpeId } = input;
    if (!stationId && input.station_code) {
      const station = await prisma.station.findUnique({ where: { code: input.station_code } });
      if (!station) throw AppError.notFound('Station not found with code: ' + input.station_code);
      stationId = station.id;
    }

    // Resolve tpeId from tpe_serial if needed
    if (!tpeId && input.tpe_serial) {
      const tpe = await prisma.tpe.findUnique({ where: { serial: input.tpe_serial } });
      if (tpe) tpeId = tpe.id;
    }

    const receptionDate = input.receptionDate || input.reception_date ? new Date(input.receptionDate || input.reception_date) : null;
    const deliveryDate = input.deliveryDate || input.delivery_date ? new Date(input.deliveryDate || input.delivery_date) : null;
    const expirationDate = input.expirationDate || input.expiration_date ? new Date(input.expirationDate || input.expiration_date) : null;

    // Auto-compute status
    let status = input.status || 'en_stock';
    if (expirationDate && expirationDate < new Date()) status = 'expire';
    else if (deliveryDate && status === 'en_stock') status = 'en_circulation';

    const card = await prisma.managementCard.create({
      data: {
        cardSerial,
        stationId,
        tpeId: tpeId || null,
        receptionDate,
        deliveryDate,
        expirationDate,
        status,
      },
      include: CARD_INCLUDE,
    });

    // Auto-create monitoring for problematic statuses
    if (['perdu', 'vole', 'defectueux'].includes(status)) {
      await prisma.cardMonitoring.create({
        data: {
          cardId: card.id,
          stationId: stationId || null,
          status: 'en_traitement',
          anomalyDate: new Date(),
          diagnostic: status === 'perdu' ? 'Carte perdue' : status === 'vole' ? 'Carte volée' : 'Carte défectueuse',
          operationMode: status,
        },
      });
    }

    return card;
  }

  static async update(id: number, input: any) {
    const existing = await this.getById(id);

    // Resolve field names
    const cardSerial = input.cardSerial || input.card_serial;
    let { stationId, tpeId } = input;
    if (!stationId && input.station_code) {
      const station = await prisma.station.findUnique({ where: { code: input.station_code } });
      if (station) stationId = station.id;
    }
    if (!tpeId && input.tpe_serial) {
      const tpe = await prisma.tpe.findUnique({ where: { serial: input.tpe_serial } });
      if (tpe) tpeId = tpe.id;
    }

    const receptionDate = input.receptionDate || input.reception_date ? new Date(input.receptionDate || input.reception_date) : undefined;
    const deliveryDate = input.deliveryDate || input.delivery_date ? new Date(input.deliveryDate || input.delivery_date) : undefined;
    const expirationDate = input.expirationDate || input.expiration_date ? new Date(input.expirationDate || input.expiration_date) : undefined;

    // Auto-compute status
    let status: string | undefined = input.status;
    const effExpDate = expirationDate ?? (existing as any).expirationDate;
    const effDelDate = deliveryDate ?? (existing as any).deliveryDate;
    if (effExpDate && new Date(effExpDate) < new Date()) status = 'expire';
    else if (effDelDate && (status === 'en_stock' || (!status && (existing as any).status === 'en_stock'))) status = 'en_circulation';

    const data: any = {};
    if (cardSerial) data.cardSerial = cardSerial;
    if (stationId !== undefined) data.stationId = stationId;
    if (tpeId !== undefined) data.tpeId = tpeId || null;
    if (receptionDate !== undefined) data.receptionDate = receptionDate;
    if (deliveryDate !== undefined) data.deliveryDate = deliveryDate;
    if (expirationDate !== undefined) data.expirationDate = expirationDate;
    if (status) data.status = status;

    const card = await prisma.managementCard.update({ where: { id }, data, include: CARD_INCLUDE });

    // Auto-create monitoring for problematic statuses (if status just changed)
    if (status && ['perdu', 'vole', 'defectueux', 'expire'].includes(status) && (existing as any).status !== status) {
      const diagnosticMap: Record<string, string> = {
        perdu: 'Carte perdue', vole: 'Carte volée', defectueux: 'Carte défectueuse', expire: 'Carte expirée',
      };
      await prisma.cardMonitoring.create({
        data: {
          cardId: id,
          stationId: card.stationId || null,
          status: 'en_traitement',
          anomalyDate: new Date(),
          diagnostic: diagnosticMap[status] || status,
          operationMode: status === 'defectueux' ? 'Traitement' : status === 'expire' ? 'Renouvellement' : 'Remplacement',
        },
      });
      // Card becomes en_traitement in circulation view
      if (status !== 'en_traitement') {
        await prisma.managementCard.update({ where: { id }, data: { status: 'en_traitement' } });
        card.status = 'en_traitement' as any;
      }
    }

    return card;
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
          station: { select: { id: true, name: true, code: true, structure: { select: { id: true, name: true, code: true, district: { select: { id: true, name: true } } } } } },
          substitutionCard: { select: { id: true, cardSerial: true } },
        },
      }),
      prisma.cardMonitoring.count({ where }),
    ]);

    const mapped = data.map(d => ({
      id: d.id,
      card_number: d.card?.cardSerial || '',
      station_code: d.station?.code || '',
      station_name: d.station?.name || '',
      structure_name: d.station?.structure?.name || '',
      district: d.station?.structure?.district?.name || '',
      operation_mode: d.operationMode || '',
      anomaly_date: d.anomalyDate ? new Date(d.anomalyDate).toISOString().split('T')[0] : '',
      diagnostic: d.diagnostic || '',
      status: d.status,
      substitution_card: d.substitutionCard?.cardSerial || '',
      processing_duration: d.processingDuration,
      immobilization_duration: d.immobilizationDuration,
    }));

    return { data: mapped, meta: buildPaginationMeta(total, page, per_page) };
  }

  static async createMonitoring(input: any) {
    // Resolve cardId from card_number or card_serial
    let { cardId, stationId } = input;
    if (!cardId && (input.card_number || input.card_serial)) {
      const serial = input.card_number || input.card_serial;
      const card = await prisma.managementCard.findFirst({ where: { cardSerial: serial } });
      if (!card) throw AppError.notFound('Card not found with serial: ' + serial);
      cardId = card.id;
    }
    if (!cardId) throw AppError.badRequest('cardId or card_number is required');

    // Resolve stationId from station_code
    if (!stationId && input.station_code) {
      const station = await prisma.station.findUnique({ where: { code: input.station_code } });
      if (!station) throw AppError.notFound('Station not found with code: ' + input.station_code);
      stationId = station.id;
    }

    // Update card status
    await prisma.managementCard.update({
      where: { id: cardId },
      data: { status: 'en_maintenance' },
    });

    return prisma.cardMonitoring.create({
      data: {
        cardId,
        stationId: stationId || null,
        status: input.status || 'en_traitement',
        anomalyDate: input.breakdownDate || input.breakdown_date || input.anomalyDate ? new Date(input.breakdownDate || input.breakdown_date || input.anomalyDate) : new Date(),
        diagnostic: input.diagnostic || null,
        operationMode: input.operationMode || input.operation_mode || null,
        substitutionCardId: input.substitutionCardId || null,
        trsStStr: input.trsSendDate ? new Date(input.trsSendDate) : null,
        trsStrSt: input.trsReceiveDate ? new Date(input.trsReceiveDate) : null,
      },
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
    const resolvedStatuses = ['carte_recue', 'resolue', 'resolved', 'terminee'];
    if (resolvedStatuses.includes(input.status)) {
      await prisma.managementCard.update({ where: { id: record.cardId }, data: { status: 'en_circulation' } });
    }

    return updated;
  }

  static async deleteMonitoring(id: number) {
    const record = await prisma.cardMonitoring.findUnique({ where: { id } });
    if (!record) throw AppError.notFound('Monitoring record not found');
    // Restore card status to en_circulation
    await prisma.managementCard.update({ where: { id: record.cardId }, data: { status: 'en_circulation' } });
    await prisma.cardMonitoring.delete({ where: { id } });
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

    const mapped = data.map(d => ({
      id: d.id,
      source: d.source || '',
      destination: d.destination || '',
      beneficiary_name: d.beneficiaryName || '',
      beneficiary_function: d.beneficiaryFunction || '',
      exit_date: d.exitDate ? new Date(d.exitDate).toISOString().split('T')[0] : '',
      nbr_cards: d.nbrCards || 0,
      cards: d.items?.map((i: any) => i.card?.cardSerial).filter(Boolean).join(', ') || '',
      discharge: d.discharge || '',
      bts_number: d.btsNumber || '',
      reception_date: d.receptionDate ? new Date(d.receptionDate).toISOString().split('T')[0] : '',
    }));

    return { data: mapped, meta: buildPaginationMeta(total, page, per_page) };
  }

  static async createTransfer(input: any) {
    const exitDate = input.exitDate || input.exit_date || null;
    const receptionDate = input.receptionDate || input.reception_date || null;
    const transferredFrom = input.transferredFrom || input.source || '';
    const transferredTo = input.transferredTo || input.destination || '';
    const discharge = input.discharge || input.exitPv || '';
    const btsNumber = input.btsNumber || input.bts_number || '';
    const beneficiaryName = input.beneficiaryName || input.beneficiary_name || '';
    const beneficiaryFunction = input.beneficiaryFunction || input.beneficiary_function || '';

    // Resolve cardIds from comma-separated serials string
    let cardIds: number[] = input.cardIds || [];
    if ((!cardIds || cardIds.length === 0) && input.cards) {
      const serials = String(input.cards).split(/[,;\s]+/).map((s: string) => s.trim()).filter(Boolean);
      if (serials.length > 0) {
        const cards = await prisma.managementCard.findMany({
          where: { cardSerial: { in: serials } },
          select: { id: true },
        });
        cardIds = cards.map(c => c.id);
      }
    }

    const transfer = await prisma.cardTransfer.create({
      data: {
        exitDate: exitDate ? new Date(exitDate) : new Date(),
        receptionDate: receptionDate ? new Date(receptionDate) : null,
        source: transferredFrom,
        destination: transferredTo,
        discharge,
        btsNumber,
        beneficiaryName,
        beneficiaryFunction,
        nbrCards: cardIds.length || parseInt(input.nbr_cards, 10) || 1,
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

    // Determine direction and update card statuses accordingly
    const isDpeToStructure = transferredFrom.toLowerCase().includes('dpe');
    const isStructureToDpe = transferredTo.toLowerCase().includes('dpe');

    if (cardIds.length > 0) {
      if (isDpeToStructure && receptionDate) {
        // DPE → Structure with reception: cards go to en_circulation (delivered)
        await prisma.managementCard.updateMany({
          where: { id: { in: cardIds } },
          data: { status: 'en_circulation', deliveryDate: new Date(receptionDate) },
        });
      } else if (isStructureToDpe) {
        // Structure → DPE: cards being sent for treatment → en_traitement
        await prisma.managementCard.updateMany({
          where: { id: { in: cardIds } },
          data: { status: 'en_traitement' },
        });
      } else {
        // Generic transfer
        await prisma.managementCard.updateMany({
          where: { id: { in: cardIds } },
          data: { status: 'en_transfert' },
        });
      }
    }

    return transfer;
  }

  static async updateTransfer(id: number, input: any) {
    const transfer = await prisma.cardTransfer.findUnique({ where: { id } });
    if (!transfer) throw AppError.notFound('Card transfer not found');

    const exitDate = input.exitDate || input.exit_date;
    const receptionDate = input.receptionDate || input.reception_date;
    const source = input.transferredFrom || input.source;
    const destination = input.transferredTo || input.destination;
    const discharge = input.discharge || input.exitPv;
    const btsNumber = input.btsNumber || input.bts_number;
    const beneficiaryName = input.beneficiaryName || input.beneficiary_name;
    const beneficiaryFunction = input.beneficiaryFunction || input.beneficiary_function;
    const nbrCards = input.nbrCards || input.nbr_cards;

    return prisma.cardTransfer.update({
      where: { id },
      data: {
        ...(exitDate !== undefined && { exitDate: new Date(exitDate) }),
        ...(receptionDate !== undefined && { receptionDate: receptionDate ? new Date(receptionDate) : null }),
        ...(source !== undefined && { source }),
        ...(destination !== undefined && { destination }),
        ...(discharge !== undefined && { discharge }),
        ...(btsNumber !== undefined && { btsNumber }),
        ...(beneficiaryName !== undefined && { beneficiaryName }),
        ...(beneficiaryFunction !== undefined && { beneficiaryFunction }),
        ...(nbrCards !== undefined && { nbrCards: Number(nbrCards) }),
      },
    });
  }

  static async deleteTransfer(id: number) {
    const transfer = await prisma.cardTransfer.findUnique({
      where: { id },
      include: { items: { select: { cardId: true } } },
    });
    if (!transfer) throw AppError.notFound('Card transfer not found');
    // Restore card statuses to en_stock (if they were transferred)
    const cardIds = transfer.items.map(i => i.cardId);
    if (cardIds.length > 0) {
      await prisma.managementCard.updateMany({
        where: { id: { in: cardIds } },
        data: { status: 'en_stock' },
      });
    }
    await prisma.cardTransfer.delete({ where: { id } });
  }
}
