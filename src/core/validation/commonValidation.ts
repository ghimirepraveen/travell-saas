import { z } from 'zod';

export const emailSchema = z.string().trim().email('email must be a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'password must be at least 8 characters');

export const uuidSchema = z.string().uuid('invalid uuid');

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(100)
  .regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with hyphens');

export const optionalFullNameSchema = z.string().trim().optional();
