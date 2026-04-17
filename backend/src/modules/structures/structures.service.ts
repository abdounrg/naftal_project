import { Prisma, StructureType } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/appError';

export class StructuresService {
  // ─── Districts ───
  static async listDistricts() {
    return prisma.district.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { structures: true, users: true } } },
    });
  }

  static async getDistrict(id: number) {
    const district = await prisma.district.findUnique({
      where: { id },
      include: { structures: { include: { stations: true } }, _count: { select: { users: true } } },
    });
    if (!district) throw AppError.notFound('District not found');
    return district;
  }

  static async lookupStructureByCode(code: string) {
    const structure = await prisma.structure.findUnique({
      where: { code },
      include: {
        district: { select: { id: true, name: true, code: true } },
        stations: { select: { id: true, code: true, name: true }, orderBy: { name: 'asc' } },
      },
    });
    return structure;
  }

  static async lookupStationByCode(code: string) {
    const station = await prisma.station.findUnique({
      where: { code },
      include: {
        structure: { select: { id: true, name: true, code: true, district: { select: { id: true, name: true, code: true } } } },
      },
    });
    return station;
  }

  // ─── Structures ───
  static async listStructures(query: any) {
    const where: Prisma.StructureWhereInput = {};
    if (query.districtId) where.districtId = parseInt(query.districtId, 10);
    if (query.type) where.type = query.type as StructureType;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return prisma.structure.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        district: { select: { id: true, name: true } },
        _count: { select: { stations: true, users: true } },
      },
    });
  }

  static async getStructure(id: number) {
    const structure = await prisma.structure.findUnique({
      where: { id },
      include: { district: true, stations: true, _count: { select: { users: true } } },
    });
    if (!structure) throw AppError.notFound('Structure not found');
    return structure;
  }

  static async createStructure(data: { districtId: number; code: string; name: string; type: StructureType; wilaya?: string; address?: string }) {
    return prisma.structure.create({
      data,
      include: { district: { select: { id: true, name: true } }, _count: { select: { stations: true, users: true } } },
    });
  }

  static async updateStructure(id: number, data: { districtId?: number; code?: string; name?: string; type?: StructureType; wilaya?: string; address?: string }) {
    const existing = await prisma.structure.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Structure not found');
    return prisma.structure.update({
      where: { id },
      data,
      include: { district: { select: { id: true, name: true } }, _count: { select: { stations: true, users: true } } },
    });
  }

  static async deleteStructure(id: number) {
    const existing = await prisma.structure.findUnique({ where: { id }, include: { _count: { select: { stations: true } } } });
    if (!existing) throw AppError.notFound('Structure not found');
    if (existing._count.stations > 0) throw AppError.badRequest('Cannot delete structure with existing stations');
    return prisma.structure.delete({ where: { id } });
  }

  // ─── Stations ───
  static async listStations(query: any) {
    const where: Prisma.StationWhereInput = {};
    if (query.structureId) where.structureId = parseInt(query.structureId, 10);
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return prisma.station.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        structure: { select: { id: true, name: true, district: { select: { id: true, name: true } } } },
        _count: { select: { tpes: true, managementCards: true } },
      },
    });
  }

  static async getStation(id: number) {
    const station = await prisma.station.findUnique({
      where: { id },
      include: {
        structure: { include: { district: true } },
        _count: { select: { tpes: true, managementCards: true, tpeMaintenance: true } },
      },
    });
    if (!station) throw AppError.notFound('Station not found');
    return station;
  }

  static async createStation(data: { structureId: number; code: string; name: string; wilaya?: string; address?: string }) {
    return prisma.station.create({
      data,
      include: {
        structure: { select: { id: true, name: true, district: { select: { id: true, name: true } } } },
        _count: { select: { tpes: true, managementCards: true } },
      },
    });
  }

  static async updateStation(id: number, data: { structureId?: number; code?: string; name?: string; wilaya?: string; address?: string }) {
    const existing = await prisma.station.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Station not found');
    return prisma.station.update({
      where: { id },
      data,
      include: {
        structure: { select: { id: true, name: true, district: { select: { id: true, name: true } } } },
        _count: { select: { tpes: true, managementCards: true } },
      },
    });
  }

  static async deleteStation(id: number) {
    const existing = await prisma.station.findUnique({ where: { id }, include: { _count: { select: { tpes: true } } } });
    if (!existing) throw AppError.notFound('Station not found');
    if (existing._count.tpes > 0) throw AppError.badRequest('Cannot delete station with existing TPEs');
    return prisma.station.delete({ where: { id } });
  }
}
