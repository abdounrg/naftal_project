import { z } from 'zod';

export const createCardSchema = z.object({
  cardSerial: z.string().min(1),
  tpeId: z.coerce.number().int().positive().optional(),
  stationId: z.coerce.number().int().positive(),
  receptionDate: z.coerce.date().optional(),
  deliveryDate: z.coerce.date().optional(),
  expirationDate: z.coerce.date().optional(),
  status: z.string().default('en_stock'),
});

export const updateCardSchema = createCardSchema.partial();

export const cardListQuerySchema = z.object({
  page: z.string().optional(),
  per_page: z.string().optional(),
  search: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  status: z.string().optional(),
  stationId: z.string().optional(),
});

export const createCardMonitoringSchema = z.object({
  cardId: z.coerce.number().int().positive(),
  stationId: z.coerce.number().int().positive(),
  status: z.string().default('en_cours'),
  breakdownDate: z.coerce.date().optional(),
  substitutionCardId: z.coerce.number().int().positive().optional(),
  trsSendDate: z.coerce.date().optional(),
  trsReceiveDate: z.coerce.date().optional(),
  dateSend: z.coerce.date().optional(),
  dateReturn: z.coerce.date().optional(),
});

export const updateCardMonitoringSchema = createCardMonitoringSchema.partial();

export const createCardTransferSchema = z.object({
  exitDate: z.coerce.date(),
  receptionDate: z.coerce.date().optional(),
  transferredFrom: z.string().min(1),
  transferredTo: z.string().min(1),
  exitPv: z.string().optional(),
  receptionPv: z.string().optional(),
  cardIds: z.array(z.coerce.number().int().positive()).min(1),
});
