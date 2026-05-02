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
  type: z.nativeEnum(ChargerTransferType).optional(),
  exitDate: z.coerce.date().optional(),
  exit_date: z.string().optional(),
  receptionDate: z.coerce.date().optional(),
  reception_date: z.string().optional(),
  transferredFrom: z.string().optional(),
  source: z.string().optional(),
  transferredTo: z.string().optional(),
  destination: z.string().optional(),
  exitPv: z.string().optional(),
  receptionPv: z.string().optional(),
  discharge: z.string().optional(),
  beneficiary_name: z.string().optional(),
  beneficiary_function: z.string().optional(),
  nbr_items: z.string().optional(),
  nbrItems: z.coerce.number().int().positive().optional(),
  bts_number: z.string().optional(),
  btsNumber: z.string().optional(),
  quantity: z.coerce.number().int().positive().optional(),
  model: z.string().optional(),
  base_serial: z.string().optional(),
  base_model: z.string().optional(),
  baseId: z.coerce.number().int().positive().optional(),
  base_id: z.coerce.number().int().positive().optional(),
});

export const updateChargerTransferSchema = createChargerTransferSchema.partial();
