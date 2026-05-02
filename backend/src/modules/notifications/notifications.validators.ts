import { z } from 'zod';
import { SupportRequestStatus } from '@prisma/client';

export const notificationListQuerySchema = z.object({
  page: z.string().optional(),
  per_page: z.string().optional(),
  status: z.enum(['unread', 'read']).optional(),
});

export const updateSupportRequestSchema = z.object({
  status: z.nativeEnum(SupportRequestStatus),
  adminNotes: z.string().max(1000).optional(),
});

export const supportRequestListQuerySchema = z.object({
  page: z.string().optional(),
  per_page: z.string().optional(),
  status: z.nativeEnum(SupportRequestStatus).optional(),
});

export type UpdateSupportRequestInput = z.infer<typeof updateSupportRequestSchema>;
