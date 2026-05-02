import { z } from 'zod';
import { UserRole, UserStatus } from '@prisma/client';

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z
    .string()
    .regex(/^\d{1,10}$/, 'Phone must contain digits only and be at most 10 digits')
    .optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.nativeEnum(UserRole),
  districtId: z.coerce.number().int().positive().optional(),
  structureId: z.coerce.number().int().positive().optional().nullable(),
  structureCode: z.string().optional(),
  status: z.nativeEnum(UserStatus).default('active').optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true }).extend({
  password: z.string().min(8).optional(),
});

export const userListQuerySchema = z.object({
  page: z.string().optional(),
  per_page: z.string().optional(),
  search: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  districtId: z.string().optional(),
});

export const approvalSchema = z.object({
  // Empty schema - just validates that it's valid JSON
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
