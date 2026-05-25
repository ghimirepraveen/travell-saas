import { envConfig } from "../config/env.config";

/** Parse JWT-style expiresIn (e.g. 7d, 24h, 3600s) to milliseconds. */
export const parseExpiresInToMs = (expiresIn: string): number => {
  const match = /^(\d+)([smhd])$/i.exec(expiresIn.trim());
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const mult: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return value * (mult[unit] ?? 7 * 24 * 60 * 60 * 1000);
};

export const getRefreshTokenTtlMs = (): number =>
  parseExpiresInToMs(envConfig.jwt.refreshExpiresIn);
