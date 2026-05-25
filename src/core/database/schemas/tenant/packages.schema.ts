import {
  pgSchema,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  numeric,
  boolean,
} from "drizzle-orm/pg-core";
import { destinationsTable } from "./destination.schema";

const packages = pgSchema("packages");

export const travelPackages = packages.table("travel_packages", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  destinationId: uuid("destination_id")
    .references(() => destinationsTable.id)
    .notNull(),
  description: text("description"),
  durationDays: integer("duration_days").notNull().default(1),
  basePrice: numeric("base_price", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  priority: integer("priority").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(false),
});
