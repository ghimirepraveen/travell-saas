import { z } from 'zod';
import { emailSchema, optionalFullNameSchema, passwordSchema, slugSchema } from '@/core/validation/commonValidation';

const tenantOwnerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: optionalFullNameSchema,
});

export const createTenantSchema = z.object({
  name: z.string().trim().min(2).max(255),
  slug: slugSchema,
  country: z.string().length(2).optional(),
  timezone: z.string().trim().optional(),
  owner: tenantOwnerSchema,
});

export type TenantOwnerInput = z.infer<typeof tenantOwnerSchema>;
export type CreateTenantInput = z.infer<typeof createTenantSchema>;
