import { pgSchema, uuid, varchar, timestamp, text } from 'drizzle-orm/pg-core';

const customers = pgSchema('customers');

export const customersTable = customers.table('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 30 }),
  passportNumber: varchar('passport_number', { length: 50 }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
