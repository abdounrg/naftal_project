import { z } from 'zod';
import { ChargerTransferType } from '@prisma/client';

export const createChargerSchema = z.object({
  model: z.string().min(1),
  tpeModel: z.string().min(1),
  quantity: z.coerce.number().int().nonnegative(),
});

export const updateChargerSchema = createChargerSchema.partial();

export const createBaseSchema = z.object({
  serial: z.string().min(1),
  model: z.string().min(1),
  quantity: z.coerce.number().int().nonnegative(),
});

export const updateBaseSchema = createBaseSchema.partial();

export const createChargerTransferSchema = z.object({
  type: z.nativeEnum(ChargerTransferType),
  exitDate: z.coerce.date(),
  receptionDate: z.coerce.date().optional(),
  transferredFrom: z.string().min(1),
  transferredTo: z.string().min(1),
  exitPv: z.string().optional(),
  receptionPv: z.string().optional(),
  quantity: z.coerce.number().int().positive(),
  model: z.string().min(1),
  baseId: z.coerce.number().int().positive().optional(),
});
