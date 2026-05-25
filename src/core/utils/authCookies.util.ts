import { CookieOptions, Request, Response } from 'express';
import { envConfig } from '@/core/config/env.config';

export const TENANT_AUTH_COOKIES = {
  access: 'access_token',
  refresh: 'refresh_token',
} as const;

export const SUPERADMIN_AUTH_COOKIE = 'superadmin_token' as const;

const parseDurationToMs = (value: string): number => {
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }
  const match = /^(\d+)([smhd])$/i.exec(trimmed);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return amount * (multipliers[unit] ?? multipliers.d);
};

const baseCookieOptions = (): CookieOptions => {
  const options: CookieOptions = {
    httpOnly: true,
    secure: envConfig.cookies.secure,
    sameSite: envConfig.cookies.sameSite,
    path: '/',
  };
  if (envConfig.cookies.domain) {
    options.domain = envConfig.cookies.domain;
  }
  return options;
};

export const setTenantAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
): void => {
  const base = baseCookieOptions();
  res.cookie(TENANT_AUTH_COOKIES.access, accessToken, {
    ...base,
    maxAge: parseDurationToMs(envConfig.jwt.expiresIn),
  });
  res.cookie(TENANT_AUTH_COOKIES.refresh, refreshToken, {
    ...base,
    maxAge: parseDurationToMs(envConfig.jwt.refreshExpiresIn),
  });
};

export const clearTenantAuthCookies = (res: Response): void => {
  const base = baseCookieOptions();
  res.clearCookie(TENANT_AUTH_COOKIES.access, base);
  res.clearCookie(TENANT_AUTH_COOKIES.refresh, base);
};

export const setSuperadminAuthCookie = (res: Response, accessToken: string): void => {
  res.cookie(SUPERADMIN_AUTH_COOKIE, accessToken, {
    ...baseCookieOptions(),
    maxAge: parseDurationToMs(envConfig.jwt.expiresIn),
  });
};

export const clearSuperadminAuthCookie = (res: Response): void => {
  res.clearCookie(SUPERADMIN_AUTH_COOKIE, baseCookieOptions());
};

const bearerTokenFromHeader = (req: Request): string | undefined => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return undefined;
};

export const getTenantAccessTokenFromRequest = (req: Request): string | undefined => {
  const fromCookie = req.cookies?.[TENANT_AUTH_COOKIES.access];
  if (typeof fromCookie === 'string' && fromCookie.length > 0) {
    return fromCookie;
  }
  return bearerTokenFromHeader(req);
};

export const getTenantRefreshTokenFromRequest = (req: Request): string | undefined => {
  const fromCookie = req.cookies?.[TENANT_AUTH_COOKIES.refresh];
  if (typeof fromCookie === 'string' && fromCookie.length > 0) {
    return fromCookie;
  }
  const body = req.body as { refreshToken?: string };
  if (typeof body?.refreshToken === 'string' && body.refreshToken.length > 0) {
    return body.refreshToken;
  }
  return undefined;
};

export const getSuperadminAccessTokenFromRequest = (req: Request): string | undefined => {
  const fromCookie = req.cookies?.[SUPERADMIN_AUTH_COOKIE];
  if (typeof fromCookie === 'string' && fromCookie.length > 0) {
    return fromCookie;
  }
  return bearerTokenFromHeader(req);
};
