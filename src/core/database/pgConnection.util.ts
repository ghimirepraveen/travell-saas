import type { PoolConfig } from 'pg';
import { masterDatabaseConfig, tenantDatabaseConfig } from '../config/database.config';

const isTruthy = (value?: string): boolean =>
  value === 'true' || value === '1' || value === 'yes';

const isCloudHost = (host: string): boolean =>
  /render\.com|neon\.tech|supabase\.co|rds\.amazonaws\.com/i.test(host);

/** Render, Neon, etc. require SSL. Set DB_SSL=true or use a known cloud host. */
export const resolvePgSsl = (host?: string): PoolConfig['ssl'] => {
  if (process.env.DB_SSL === 'false') {
    return undefined;
  }
  if (isTruthy(process.env.DB_SSL) || isCloudHost(host ?? masterDatabaseConfig.host)) {
    return { rejectUnauthorized: false };
  }
  return undefined;
};

/** Local Docker: create DBs on startup. Render/cloud: DB already exists — set DB_AUTO_CREATE=false */
export const shouldAutoCreateDatabase = (): boolean =>
  process.env.DB_AUTO_CREATE !== 'false';

export const buildMasterPoolConfig = (database?: string): PoolConfig => ({
  host: masterDatabaseConfig.host,
  port: masterDatabaseConfig.port,
  user: masterDatabaseConfig.user,
  password: masterDatabaseConfig.password,
  database: database ?? masterDatabaseConfig.database,
  ssl: resolvePgSsl(masterDatabaseConfig.host),
});

export const buildTenantPoolConfig = (databaseName: string): PoolConfig => ({
  host: tenantDatabaseConfig.host,
  port: tenantDatabaseConfig.port,
  user: tenantDatabaseConfig.user,
  password: tenantDatabaseConfig.password,
  database: databaseName,
  ssl: resolvePgSsl(tenantDatabaseConfig.host),
});
