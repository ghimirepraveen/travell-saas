import { envConfig } from './env.config';

export const masterDatabaseConfig = envConfig.masterDb;
export const tenantDatabaseConfig = envConfig.tenantDb;

export const buildTenantDatabaseName = (tenantId: string): string =>
  `tenant_${tenantId.replace(/-/g, '')}`;
