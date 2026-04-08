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
  status: z.nativeEnum(TpeStatus).default('en_stock'),
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
  tpeId: z.coerce.number().int().positive(),
  stationId: z.coerce.number().int().positive(),
  breakdownDate: z.coerce.date(),
  trsSendDate: z.coerce.date().optional(),
  trsReceiveDate: z.coerce.date().optional(),
  dateSend: z.coerce.date().optional(),
  dateReturn: z.coerce.date().optional(),
  hasBatteryIssue: z.boolean().default(false),
  hasChargerIssue: z.boolean().default(false),
  status: z.string().default('en_panne'),
});

export const updateMaintenanceSchema = createMaintenanceSchema.partial();

export const createReturnSchema = z.object({
  tpeId: z.coerce.number().int().positive(),
  oldStationId: z.coerce.number().int().positive(),
  newStationId: z.coerce.number().int().positive(),
  returnDate: z.coerce.date(),
  reason: z.string().optional(),
});

export const createTransferSchema = z.object({
  exitDate: z.coerce.date(),
  receptionDate: z.coerce.date().optional(),
  transferredFrom: z.string().min(1),
  transferredTo: z.string().min(1),
  exitPv: z.string().optional(),
  receptionPv: z.string().optional(),
  tpeIds: z.array(z.coerce.number().int().positive()).min(1),
});

export const createReformSchema = z.object({
  tpeId: z.coerce.number().int().positive(),
  reformDate: z.coerce.date(),
  reformPv: z.string().optional(),
  reason: z.string().optional(),
});

export type CreateTpeInput = z.infer<typeof createTpeSchema>;
export type UpdateTpeInput = z.infer<typeof updateTpeSchema>;
