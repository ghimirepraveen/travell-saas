import { pgSchema, uuid, varchar, timestamp, text, integer } from 'drizzle-orm/pg-core';

const subscription = pgSchema('subscription');

export const subscriptions = subscription.table('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  priceMonthly: integer('price_monthly').notNull().default(0),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const planFeatures = subscription.table('plan_features', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: uuid('plan_id')
    .notNull()
    .references(() => subscriptions.id),
  featureKey: varchar('feature_key', { length: 100 }).notNull(),
  featureValue: varchar('feature_value', { length: 255 }),
});
