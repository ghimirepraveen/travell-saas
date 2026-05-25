import { pgSchema } from 'drizzle-orm/pg-core';

export const authSchema = pgSchema('auth');
export const subscriptionSchema = pgSchema('subscription');
export const packagesSchema = pgSchema('packages');
export const inventorySchema = pgSchema('inventory');
export const customersSchema = pgSchema('customers');
export const bookingsSchema = pgSchema('bookings');
