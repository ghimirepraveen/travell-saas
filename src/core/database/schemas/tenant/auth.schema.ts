import { pgSchema, uuid, varchar, timestamp, text } from 'drizzle-orm/pg-core';

const auth = pgSchema('auth');

export const users = auth.table('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: varchar('full_name', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull().default('agent'),
  isActive: varchar('is_active', { length: 5 }).notNull().default('true'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const roles = auth.table('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
});

export const permissions = auth.table('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  description: text('description'),
});

/** Encrypted opaque refresh token; lookup_hash = SHA-256(plain token) for O(1) fetch. */
export const refreshTokens = auth.table('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenLookupHash: varchar('token_lookup_hash', { length: 64 }).notNull().unique(),
  ciphertext: text('ciphertext').notNull(),
  iv: varchar('iv', { length: 64 }).notNull(),
  authTag: varchar('auth_tag', { length: 64 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
