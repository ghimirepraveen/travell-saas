import { pgSchema, uuid, varchar, timestamp, integer, date, numeric } from 'drizzle-orm/pg-core';
import { travelPackages } from './packages.schema';
import { departures } from './inventory.schema';
import { customersTable } from './customers.schema';

const bookings = pgSchema('bookings');

export const bookingsTable = bookings.table('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  referenceCode: varchar('reference_code', { length: 32 }).notNull().unique(),
  packageId: uuid('package_id')
    .notNull()
    .references(() => travelPackages.id),
  departureId: uuid('departure_id')
    .notNull()
    .references(() => departures.id),
  travelDate: date('travel_date').notNull(),
  paxCount: integer('pax_count').notNull(),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  status: varchar('status', { length: 30 }).notNull().default('pending_payment'),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const bookingTravelers = bookings.table('booking_travelers', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id')
    .notNull()
    .references(() => bookingsTable.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customersTable.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
