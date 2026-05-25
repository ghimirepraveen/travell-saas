import { and, eq, gt, isNull } from 'drizzle-orm';
import { withTenantDb } from '@/core/database/tenantDb';
import { users, refreshTokens } from '@/core/database/schemas/tenant/auth.schema';
import { hashPassword, comparePassword } from '@/core/utils/encryption.util';
import {
  encryptString,
  sha256Hex,
  decryptString,
  timingSafeEqualString,
} from '@/core/utils/tokenEncryption.util';
import { getRefreshTokenTtlMs } from '@/core/utils/tokenTtl.util';

export const registerUser = async (
  tenantId: string,
  email: string,
  password: string,
  fullName?: string,
  role = 'agent',
) => {
  return withTenantDb(tenantId, async (db) => {
    const passwordHash = await hashPassword(password);
    const [user] = await db
      .insert(users)
      .values({ email, passwordHash, fullName: fullName ?? null, role })
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
      });
    return user;
  });
};

export const findUserByEmail = async (tenantId: string, email: string) => {
  return withTenantDb(tenantId, async (db) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user ?? null;
  });
};

export const findUserById = async (tenantId: string, userId: string) => {
  return withTenantDb(tenantId, async (db) => {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return user ?? null;
  });
};

export const validateUserCredentials = async (
  tenantId: string,
  email: string,
  password: string,
) => {
  const user = await findUserByEmail(tenantId, email);
  if (!user || user.isActive !== 'true') return null;
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) return null;
  return { id: user.id, email: user.email, role: user.role, tenantId };
};

export const insertRefreshToken = async (
  tenantId: string,
  userId: string,
  plainRefreshToken: string,
): Promise<void> => {
  const lookupHash = sha256Hex(plainRefreshToken);
  const encrypted = encryptString(plainRefreshToken);
  const expiresAt = new Date(Date.now() + getRefreshTokenTtlMs());

  await withTenantDb(tenantId, async (db) => {
    await db.insert(refreshTokens).values({
      userId,
      tokenLookupHash: lookupHash,
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      expiresAt,
    });
  });
};

export const findValidRefreshSessionByLookupHash = async (
  tenantId: string,
  lookupHash: string,
) => {
  return withTenantDb(tenantId, async (db) => {
    const [row] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenLookupHash, lookupHash),
          isNull(refreshTokens.revokedAt),
          gt(refreshTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);
    return row ?? null;
  });
};

export const revokeRefreshTokenByLookupHash = async (
  tenantId: string,
  lookupHash: string,
): Promise<void> => {
  await withTenantDb(tenantId, async (db) => {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.tokenLookupHash, lookupHash));
  });
};

/** Decrypt stored payload and verify it matches the client refresh token (constant-time). */
export const verifyRefreshTokenRow = (
  row: typeof refreshTokens.$inferSelect,
  plainRefreshToken: string,
): boolean => {
  try {
    const decrypted = decryptString({
      ciphertext: row.ciphertext,
      iv: row.iv,
      authTag: row.authTag,
    });
    return timingSafeEqualString(decrypted, plainRefreshToken);
  } catch {
    return false;
  }
};
