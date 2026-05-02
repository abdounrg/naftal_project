import { z } from 'zod';
import { StructureType } from '@prisma/client';

const code = z.string().trim().min(1).max(50);
const name = z.string().trim().min(1).max(255);

export const createStructureSchema = z.object({
  districtId: z.coerce.number().int().positive(),
  code,
  name,
  type: z.nativeEnum(StructureType),
  wilaya: z.string().trim().max(100).optional(),
  address: z.string().trim().max(500).optional(),
});

export const updateStructureSchema = createStructureSchema.partial();

export const createStationSchema = z.object({
  structureId: z.coerce.number().int().positive(),
  code,
  name,
  wilaya: z.string().trim().max(100).optional(),
  address: z.string().trim().max(500).optional(),
});

export const updateStationSchema = createStationSchema.partial();

export const listStructuresQuerySchema = z.object({
  districtId: z.string().optional(),
  type: z.nativeEnum(StructureType).optional(),
  search: z.string().trim().max(255).optional(),
});

export const listStationsQuerySchema = z.object({
  structureId: z.string().optional(),
  search: z.string().trim().max(255).optional(),
});
