import * as dotenv from 'dotenv';

dotenv.config();

export const envConfig = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  apiPrefix: process.env.API_PREFIX ?? '/api/v1',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  cookies: {
    /** true in production or when using HTTPS (required for SameSite=None) */
    secure:
      process.env.COOKIE_SECURE === 'true' ||
      (process.env.COOKIE_SECURE !== 'false' &&
        (process.env.NODE_ENV === 'production' || process.env.PLATFORM_APP_PROTOCOL === 'https')),
    sameSite: (process.env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none' | undefined) ?? 'lax',
    /** e.g. .yourdomain.com for subdomain apps */
    domain: process.env.COOKIE_DOMAIN || undefined,
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  masterDb: {
    host: process.env.MASTER_DB_HOST ?? 'localhost',
    port: Number(process.env.MASTER_DB_PORT ?? 5432),
    user: process.env.MASTER_DB_USER ?? 'postgres',
    password: process.env.MASTER_DB_PASSWORD ?? '',
    database: process.env.MASTER_DB_NAME ?? 'travel_saas_master',
  },
  tenantDb: {
    host: process.env.TENANT_DB_HOST ?? 'localhost',
    port: Number(process.env.TENANT_DB_PORT ?? 5432),
    user: process.env.TENANT_DB_USER ?? 'postgres',
    password: process.env.TENANT_DB_PASSWORD ?? '',
  },
  mail: {
    /** Set MAIL_ENABLED=false to never connect to SMTP */
    enabled: process.env.MAIL_ENABLED !== 'false',
    host: process.env.MAIL_HOST ?? '',
    port: Number(process.env.MAIL_PORT ?? 587),
    secure: process.env.MAIL_SECURE === 'true',
    user: process.env.MAIL_USER ?? '',
    password: process.env.MAIL_PASSWORD ?? '',
    from: process.env.MAIL_FROM ?? '"Travel SaaS" <noreply@example.com>',
  },
  tenancy: {
    platformRootDomain: process.env.PLATFORM_ROOT_DOMAIN ?? 'localhost',
    appProtocol: process.env.PLATFORM_APP_PROTOCOL ?? 'http',
    /** Frontend port when using subdomain on localhost, e.g. 5173 */
    appPort: process.env.PLATFORM_APP_PORT ?? '5173',
  },
};
