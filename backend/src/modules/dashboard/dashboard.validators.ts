import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  districtId: z.coerce.number().int().positive().optional(),
  structureId: z.coerce.number().int().positive().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
