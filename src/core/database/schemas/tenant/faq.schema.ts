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

const faq = pgSchema("faq");

export const faqTable = faq.table("faq", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: varchar("question", { length: 255 }).notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  priority: integer("priority").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(false),
});
