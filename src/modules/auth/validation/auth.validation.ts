import { z } from 'zod';
import { emailSchema, optionalFullNameSchema, passwordSchema } from '@/core/validation/commonValidation';

const STAFF_ROLES = ['admin', 'agent', 'accountant', 'viewer'] as const;

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const createStaffSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: optionalFullNameSchema,
  role: z.enum(STAFF_ROLES).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
