import {
  pgSchema,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  numeric,
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
  destination: varchar("destination", { length: 255 }),
  durationDays: integer("duration_days").notNull().default(1),
  basePrice: numeric("base_price", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
