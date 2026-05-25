import {
  pgSchema,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  numeric,
} from "drizzle-orm/pg-core";

const reviews = pgSchema("reviews");

export const reviewsTable = reviews.table("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),

  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }),
  customerPhone: varchar("customer_phone", { length: 30 }),
  rating: integer("rating").notNull().default(5),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
