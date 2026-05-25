import { z } from "zod";
import { uuidSchema } from "@/core/validation/commonValidation";

export const createFaqSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question is required")
    .max(255, "Question must be at most 255 characters"),
  answer: z.string().trim().min(1, "Answer is required"),
  priority: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
});

export const updateFaqSchema = createFaqSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one field is required",
);

export const faqIdParamSchema = z.object({
  id: uuidSchema,
});

export const faqPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateFaqInput = z.infer<typeof createFaqSchema>;
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>;
export type FaqPaginationInput = z.infer<typeof faqPaginationSchema>;
