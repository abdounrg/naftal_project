import { z } from 'zod';
import { TpeModel, Operator, AssignmentType, TpeStatus } from '@prisma/client';

const tpeBaseSchema = z.object({
  serial: z.string().min(1),
  model: z.nativeEnum(TpeModel),
  purchasePrice: z.coerce.number().positive().optional(),
  operator: z.nativeEnum(Operator),
  simSerial: z.string().optional(),
  simIp: z.string().optional(),
  simPhone: z.string().optional(),
  receptionDate: z.coerce.date().optional(),
  deliveryDate: z.coerce.date().optional(),
  expirationDate: z.coerce.date().optional(),
  assignmentType: z.nativeEnum(AssignmentType).optional(),
  // Accept either numeric stationId OR alphanumeric stationCode (e.g. '261a')
  stationId: z.coerce.number().int().positive().optional(),
  stationCode: z.string().optional(),
  status: z.nativeEnum(TpeStatus).default('en_service'),
  inventoryNumber: z.string().optional(),
});

export const createTpeSchema = tpeBaseSchema.refine(
  (d) => d.stationId != null || d.stationCode != null,
  { message: 'Either stationId or stationCode must be provided', path: ['stationCode'] },
);

export const updateTpeSchema = tpeBaseSchema.partial();

export const tpeListQuerySchema = z.object({
  page: z.string().optional(),
  per_page: z.string().optional(),
  search: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  status: z.string().optional(),
  model: z.string().optional(),
  operator: z.string().optional(),
  stationId: z.string().optional(),
});

export const createMaintenanceSchema = z.object({
  // Accept serial + station_code from the frontend (resolved in service)
  serial: z.string().min(1),
  station_code: z.string().min(1),
  structure_code: z.string().optional(),
  model: z.string().optional(),
  operation_mode: z.string().optional().default(''),
  breakdown_date: z.coerce.date(),
  diagnostic: z.string().optional().default(''),
  problem_type: z.string().optional().default(''),
  status: z.string().default('en_panne'),
});

export const updateMaintenanceSchema = z.object({
  serial: z.string().optional(),
  station_code: z.string().optional(),
  structure_code: z.string().optional(),
  model: z.string().optional(),
  operation_mode: z.string().optional(),
  breakdown_date: z.coerce.date().optional(),
  diagnostic: z.string().optional(),
  problem_type: z.string().optional(),
  status: z.string().optional(),
});

export const createReturnSchema = z.object({
  // Accept either numeric IDs or string codes (resolved in service)
  tpeId: z.coerce.number().int().positive().optional(),
  serial: z.string().optional(),
  oldStationId: z.coerce.number().int().positive().optional(),
  old_station_code: z.string().optional(),
  newStationId: z.coerce.number().int().positive().optional(),
  new_station_code: z.string().optional(),
  returnDate: z.coerce.date().optional(),
  return_date: z.string().optional(),
  reason: z.string().optional(),
  return_reason: z.string().optional(),
  model: z.string().optional(),
  operator: z.string().optional(),
});

export const updateReturnSchema = createReturnSchema.partial();

export const createTransferSchema = z.object({
  // Accept both camelCase and snake_case field names
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
  bts_number: z.string().optional(),
  nbr_tpe: z.string().optional(),
  tpe_numbers: z.string().optional(),
  tpeIds: z.array(z.coerce.number().int().positive()).optional(),
});

export const updateTransferSchema = createTransferSchema.partial();

export const createReformSchema = z.object({
  // Accept either numeric tpeId or serial string (resolved in service)
  tpeId: z.coerce.number().int().positive().optional(),
  serial: z.string().optional(),
  reformDate: z.coerce.date().optional(),
  reform_date: z.string().optional(),
  reformPv: z.string().optional(),
  reform_pv: z.string().optional(),
  reason: z.string().optional(),
  // Frontend also sends these (ignored in service but need to pass validation)
  model: z.string().optional(),
  structure_code: z.string().optional(),
  station_code: z.string().optional(),
});

export const updateReformSchema = createReformSchema.partial();

export type CreateTpeInput = z.infer<typeof createTpeSchema>;
export type UpdateTpeInput = z.infer<typeof updateTpeSchema>;
