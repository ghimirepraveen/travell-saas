import { z } from "zod";
import { slugSchema } from "@/core/validation/commonValidation";

export const siteSettingsUpdateSchema = z
  .object({
    siteTitle: z.string().trim().max(255).optional(),
    siteDescription: z.string().trim().optional(),
    heroSectionTitle: z.string().trim().max(255).optional(),
    aboutUsContent: z.string().trim().optional(),
    contactUsTitle: z.string().trim().max(255).optional(),
    contactUsContent: z.string().trim().optional(),
    heroSectionSubtitle: z.string().trim().optional(),
    contactEmail: z.string().trim().email().optional(),
    contactPhone: z.string().trim().max(20).optional(),
    facebookUrl: z.string().trim().url().optional(),
    twitterUrl: z.string().trim().url().optional(),
    instagramUrl: z.string().trim().url().optional(),
    tiktokUrl: z.string().trim().url().optional(),
    address: z.string().trim().optional(),
    customerServed: z.coerce.number().int().min(0).optional(),
    yearsOfExperience: z.coerce.number().int().min(0).optional(),
    totalGuides: z.coerce.number().int().min(0).optional(),
    totalDestinations: z.coerce.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const siteSettingsSlugParamSchema = z.object({
  slug: slugSchema,
});

export type UpdateSiteSettingsInput = z.infer<typeof siteSettingsUpdateSchema>;
export type SiteSettingsSlugParamInput = z.infer<
  typeof siteSettingsSlugParamSchema
>;
