import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const globalSettings = pgTable('global_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
