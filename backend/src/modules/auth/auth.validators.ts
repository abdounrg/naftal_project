import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(128, 'New password is too long'),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export const loginSupportRequestSchema = z.object({
  requesterName: z.string().min(2).max(150),
  requesterEmail: z.string().email(),
  requesterPhone: z
    .string()
    .regex(/^\d{1,10}$/, 'Phone must contain digits only and be at most 10 digits')
    .optional(),
  problemDescription: z.string().min(10).max(2000),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type LoginSupportRequestInput = z.infer<typeof loginSupportRequestSchema>;
