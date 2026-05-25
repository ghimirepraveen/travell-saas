import crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 16;

const getEncryptionKey = (): Buffer => {
  const secret =
    process.env.ENCRYPTION_KEY ??
    (process.env.NODE_ENV === 'production'
      ? ''
      : 'dev-insecure-encryption-key-min-16-chars');
  if (secret.length < 16) {
    throw new Error('ENCRYPTION_KEY must be at least 16 characters');
  }
  return crypto.createHash('sha256').update(secret).digest();
};

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
}

/** Encrypt UTF-8 string (e.g. opaque refresh token) for database storage. */
export const encryptString = (plain: string): EncryptedPayload => {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, key, iv, { authTagLength: 16 });
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: encrypted.toString('base64url'),
    iv: iv.toString('base64url'),
    authTag: authTag.toString('base64url'),
  };
};

export const decryptString = (payload: EncryptedPayload): string => {
  const key = getEncryptionKey();
  const iv = Buffer.from(payload.iv, 'base64url');
  const authTag = Buffer.from(payload.authTag, 'base64url');
  const decipher = crypto.createDecipheriv(ALGO, key, iv, { authTagLength: 16 });
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, 'base64url')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
};

/** Opaque refresh token for clients (URL-safe). */
export const generateOpaqueRefreshToken = (): string => {
  return crypto.randomBytes(48).toString('base64url');
};

/** Deterministic lookup key (not reversible); used to find DB row without decrypting all rows. */
export const sha256Hex = (value: string): string => {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
};

export const timingSafeEqualString = (a: string, b: string): boolean => {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
};
