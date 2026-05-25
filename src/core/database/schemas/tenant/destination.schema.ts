import { pgSchema, uuid, varchar, timestamp, text } from "drizzle-orm/pg-core";

const destinations = pgSchema("destinations");

export const destinationsTable = destinations.table("destinations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
