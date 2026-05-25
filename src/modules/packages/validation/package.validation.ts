import { z } from "zod";
import { uuidSchema } from "@/core/validation/commonValidation";

export const PACKAGE_STATUSES = ["draft", "published", "archived"] as const;

export const createPackageSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(255, "Title must be at most 255 characters"),
  destinationId: uuidSchema,
  description: z.string().trim().optional(),
  durationDays: z.coerce.number().int().min(1).optional(),
  basePrice: z.coerce.number().positive("Base price must be greater than 0"),
  currency: z
    .string()
    .trim()
    .length(3, "Currency must be a 3-letter code")
    .transform((value) => value.toUpperCase())
    .optional(),
  status: z.enum(PACKAGE_STATUSES).optional(),
  isFeatured: z.boolean().optional(),
  priority: z.coerce.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
});

export const updatePackageSchema = createPackageSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
  );

export const packageIdParamSchema = z.object({
  id: uuidSchema,
});

export const packagePaginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type PackageStatus = (typeof PACKAGE_STATUSES)[number];
export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
export type PackagePaginationInput = z.infer<typeof packagePaginationSchema>;
