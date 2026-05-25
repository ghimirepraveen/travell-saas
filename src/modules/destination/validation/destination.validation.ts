import { z } from "zod";
import { uuidSchema } from "@/core/validation/commonValidation";
import { is } from "drizzle-orm";

export const createDestinationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters"),
  description: z.string().trim().optional(),
  country: z
    .string()
    .trim()
    .max(100, "Country must be at most 100 characters")
    .optional(),
  city: z
    .string()
    .trim()
    .max(100, "City must be at most 100 characters")
    .optional(),
});

export const updateDestinationSchema = createDestinationSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
  );

export const destinationIdParamSchema = z.object({
  id: uuidSchema,
});

export const destinationPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  isPublished: z.coerce.boolean().optional(),
});

export type CreateDestinationInput = z.infer<typeof createDestinationSchema>;
export type UpdateDestinationInput = z.infer<typeof updateDestinationSchema>;
export type DestinationPaginationInput = z.infer<
  typeof destinationPaginationSchema
>;
