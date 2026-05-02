import { TpeStatus, MaintenanceStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export class DashboardService {
  static async getStats() {
    const [
      totalTpes,
      tpesByStatus,
      totalCards,
      totalChargers,
      totalStations,
      totalUsers,
      maintenanceActive,
      recentTransfers,
      stationsWithoutTpe,
    ] = await Promise.all([
      prisma.tpe.count(),
      prisma.tpe.groupBy({ by: ['status'], _count: true }),
      prisma.managementCard.count(),
      prisma.charger.aggregate({ _sum: { quantity: true } }),
      prisma.station.count(),
      prisma.user.count(),
      prisma.tpeMaintenance.count({
        where: { status: { in: [MaintenanceStatus.en_panne, MaintenanceStatus.trs_envoye, MaintenanceStatus.trs_recu, MaintenanceStatus.envoye_fournisseur] } },
      }),
      prisma.tpeTransfer.count({
        where: { receptionDate: null },
      }),
      prisma.station.count({
        where: { tpes: { none: {} } },
      }),
    ]);

    const statusMap: Record<string, number> = {};
    tpesByStatus.forEach((s) => {
      statusMap[s.status] = s._count;
    });

    return {
      tpe: {
        total: totalTpes,
        en_service: statusMap[TpeStatus.en_service] || 0,
        en_stock: statusMap[TpeStatus.en_stock] || 0,
        en_maintenance: statusMap[TpeStatus.en_maintenance] || 0,
        en_panne: statusMap[TpeStatus.en_panne] || 0,
        en_transfert: statusMap[TpeStatus.en_transfert] || 0,
        reforme: statusMap[TpeStatus.reforme] || 0,
      },
      cards: { total: totalCards },
      chargers: { total: totalChargers._sum.quantity || 0 },
      stations: { total: totalStations, withoutTpe: stationsWithoutTpe },
      users: { total: totalUsers },
      maintenance: { active: maintenanceActive },
      transfers: { pending: recentTransfers },
    };
  }

  static async getTpeDistribution() {
    const byModel = await prisma.tpe.groupBy({ by: ['model'], _count: true });
    const byOperator = await prisma.tpe.groupBy({ by: ['operator'], _count: true });

    return {
      byModel: byModel.map((m) => ({ model: m.model, count: m._count })),
      byOperator: byOperator.map((o) => ({ operator: o.operator, count: o._count })),
    };
  }

  static async getStationsWithoutTpe() {
    return prisma.station.findMany({
      where: { tpes: { none: {} } },
      orderBy: { name: 'asc' },
      include: {
        structure: { select: { id: true, name: true, code: true, district: { select: { id: true, name: true, code: true } } } },
      },
    });
  }
}
