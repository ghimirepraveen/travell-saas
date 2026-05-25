import {
  pgSchema,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
} from "drizzle-orm/pg-core";

const siteSettings = pgSchema("site_settings");

export const siteSettingsTable = siteSettings.table("site_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().unique(),
  slug: varchar("slug", { length: 100 })
    .default("site-settings")
    .notNull()
    .unique(),
  siteTitle: varchar("site_title", { length: 255 }).notNull().default(""),
  siteDescription: text("site_description").notNull().default(""),
  heroSectionTitle: varchar("hero_section_title", { length: 255 })
    .notNull()
    .default(""),

  aboutUsContent: text("about_us_content").notNull().default(""),

  contactUsTitle: varchar("contact_us_title", { length: 255 })
    .notNull()
    .default(""),
  contactUsContent: text("contact_us_content").notNull().default(""),
  heroSectionSubtitle: text("hero_section_subtitle").notNull().default(""),
  contactEmail: varchar("contact_email", { length: 255 }).notNull().default(""),
  contactPhone: varchar("contact_phone", { length: 20 }).notNull().default(""),
  facebookUrl: varchar("facebook_url", { length: 255 }).notNull().default(""),
  twitterUrl: varchar("twitter_url", { length: 255 }).notNull().default(""),
  instagramUrl: varchar("instagram_url", { length: 255 }).notNull().default(""),

  tiktokUrl: varchar("tiktok_url", { length: 255 }).notNull().default(""),
  address: text("address").notNull().default(""),

  customerServed: integer("customer_served").notNull().default(0),
  yearsOfExperience: integer("years_of_experience").notNull().default(0),
  totalGuides: integer("total_guides").notNull().default(0),
  totalDestinations: integer("total_destinations").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
