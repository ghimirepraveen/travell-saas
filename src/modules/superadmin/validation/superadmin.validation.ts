import { z } from 'zod';
import { emailSchema, optionalFullNameSchema, passwordSchema } from '@/core/validation/commonValidation';

export const superadminRegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: optionalFullNameSchema,
});

export const superadminLoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type RegisterSuperadminInput = z.infer<typeof superadminRegisterSchema>;
export type LoginSuperadminInput = z.infer<typeof superadminLoginSchema>;
