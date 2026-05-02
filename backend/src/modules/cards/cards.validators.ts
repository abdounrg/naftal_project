import { z } from 'zod';

export const createCardSchema = z.object({
  cardSerial: z.string().optional(),
  card_serial: z.string().optional(),
  tpeId: z.coerce.number().int().positive().optional(),
  tpe_serial: z.string().optional(),
  stationId: z.coerce.number().int().positive().optional(),
  station_code: z.string().optional(),
  structure_code: z.string().optional(),
  receptionDate: z.coerce.date().optional(),
  reception_date: z.string().optional(),
  deliveryDate: z.coerce.date().optional(),
  delivery_date: z.string().optional(),
  expirationDate: z.coerce.date().optional(),
  expiration_date: z.string().optional(),
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
  cardId: z.coerce.number().int().positive().optional(),
  card_number: z.string().optional(),
  card_serial: z.string().optional(),
  stationId: z.coerce.number().int().positive().optional(),
  station_code: z.string().optional(),
  structure_code: z.string().optional(),
  status: z.string().default('en_cours'),
  breakdownDate: z.coerce.date().optional(),
  breakdown_date: z.string().optional(),
  substitutionCardId: z.coerce.number().int().positive().optional(),
  substitution_card: z.string().optional(),
  trsSendDate: z.coerce.date().optional(),
  trsReceiveDate: z.coerce.date().optional(),
  dateSend: z.coerce.date().optional(),
  dateReturn: z.coerce.date().optional(),
});

export const updateCardMonitoringSchema = createCardMonitoringSchema.partial();

export const createCardTransferSchema = z.object({
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
  cards: z.string().optional(),
  cardIds: z.array(z.coerce.number().int().positive()).optional(),
  btsNumber: z.string().optional(),
  bts_number: z.string().optional(),
  beneficiaryName: z.string().optional(),
  beneficiary_name: z.string().optional(),
  beneficiaryFunction: z.string().optional(),
  beneficiary_function: z.string().optional(),
  nbr_cards: z.coerce.number().int().optional(),
  nbrCards: z.coerce.number().int().optional(),
});

export const updateCardTransferSchema = createCardTransferSchema.partial();
