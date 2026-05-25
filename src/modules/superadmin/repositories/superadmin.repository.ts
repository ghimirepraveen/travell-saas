import { eq } from 'drizzle-orm';
import { masterDb } from '@/core/database/masterConnection';
import { superadmins } from '@/core/database/schemas/master/auth.schema';
import { hashPassword, comparePassword } from '@/core/utils/encryption.util';

export const registerSuperadmin = async (
  email: string,
  password: string,
  fullName?: string
) => {
  const passwordHash = await hashPassword(password);
  const [admin] = await masterDb
    .insert(superadmins)
    .values({ email, passwordHash, fullName: fullName ?? null })
    .returning({
      id: superadmins.id,
      email: superadmins.email,
      fullName: superadmins.fullName,
    });
  return admin;
};

export const findSuperadminByEmail = async (email: string) => {
  const [admin] = await masterDb
    .select()
    .from(superadmins)
    .where(eq(superadmins.email, email))
    .limit(1);
  return admin ?? null;
};

export const validateSuperadminCredentials = async (email: string, password: string) => {
  const admin = await findSuperadminByEmail(email);
  if (!admin) return null;
  const valid = await comparePassword(password, admin.passwordHash);
  if (!valid) return null;
  return { id: admin.id, email: admin.email, role: 'superadmin' };
};
