import { z } from 'zod';
import { AuditAction, AuditModule, AuditSeverity } from '@prisma/client';

export const listAuditLogsQuerySchema = z.object({
  page: z.string().optional(),
  per_page: z.string().optional(),
  search: z.string().trim().max(255).optional(),
  sort_by: z.string().max(50).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  action: z.nativeEnum(AuditAction).optional(),
  module: z.nativeEnum(AuditModule).optional(),
  severity: z.nativeEnum(AuditSeverity).optional(),
  userId: z.coerce.number().int().positive().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
