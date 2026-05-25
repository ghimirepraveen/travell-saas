import { pgSchema, uuid, timestamp, integer, date } from 'drizzle-orm/pg-core';
import { travelPackages } from './packages.schema';

const inventory = pgSchema('inventory');

export const departures = inventory.table('departures', {
  id: uuid('id').primaryKey().defaultRandom(),
  packageId: uuid('package_id')
    .notNull()
    .references(() => travelPackages.id),
  departureDate: date('departure_date').notNull(),
  totalSeats: integer('total_seats').notNull(),
  bookedSeats: integer('booked_seats').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
