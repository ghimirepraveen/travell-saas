import {
  pgSchema,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  numeric,
} from "drizzle-orm/pg-core";

const enquiries = pgSchema("enquiries");

export const enquiriesTable = enquiries.table("enquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull(),
  packageId: uuid("package_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
