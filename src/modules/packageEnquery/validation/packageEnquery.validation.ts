import { z } from "zod";
import { uuidSchema } from "@/core/validation/commonValidation";

export const createPackageEnquirySchema = z.object({
  customerId: uuidSchema,
  packageId: uuidSchema,
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters"),
});

export const updatePackageEnquirySchema = createPackageEnquirySchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
  );

export const packageEnquiryIdParamSchema = z.object({
  id: uuidSchema,
});

export const packageEnquiryPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(["open", "closed", "pending"]).optional(),
});

export type CreatePackageEnquiryInput = z.infer<
  typeof createPackageEnquirySchema
>;
export type UpdatePackageEnquiryInput = z.infer<
  typeof updatePackageEnquirySchema
>;
export type PackageEnquiryPaginationInput = z.infer<
  typeof packageEnquiryPaginationSchema
>;
