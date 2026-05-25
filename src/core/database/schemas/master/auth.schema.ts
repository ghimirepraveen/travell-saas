import { pgSchema, uuid, varchar, timestamp, text } from "drizzle-orm/pg-core";

const auth = pgSchema("auth");

export const tenants = auth.table("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  databaseName: varchar("database_name", { length: 100 }).notNull().unique(),
  subdomain: varchar("subdomain", { length: 100 }).notNull().unique(),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  planId: uuid("plan_id"),
  country: varchar("country", { length: 2 }),
  timezone: varchar("timezone", { length: 64 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const superadmins = auth.table("superadmins", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: varchar("full_name", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
