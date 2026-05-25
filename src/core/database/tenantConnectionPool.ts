import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { masterDb } from './masterConnection';
import { tenants } from './schemas/master/auth.schema';
import { buildTenantDatabaseName } from '../config/database.config';
import { buildTenantPoolConfig } from './pgConnection.util';
import * as tenantSchema from './schemas/tenant';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger.util';

type TenantDb = NodePgDatabase<typeof tenantSchema>;

const pools = new Map<string, Pool>();
const databases = new Map<string, TenantDb>();

const resolveDatabaseName = async (tenantId: string): Promise<string> => {
  const [tenant] = await masterDb
    .select({ databaseName: tenants.databaseName })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  if (!tenant) {
    return buildTenantDatabaseName(tenantId);
  }
  return tenant.databaseName;
};

export const getTenantDb = async (tenantId: string): Promise<TenantDb> => {
  if (databases.has(tenantId)) {
    return databases.get(tenantId)!;
  }

  const databaseName = await resolveDatabaseName(tenantId);

  const pool = new Pool(buildTenantPoolConfig(databaseName));

  const db = drizzle(pool, { schema: tenantSchema });
  pools.set(tenantId, pool);
  databases.set(tenantId, db);

  logger.debug(`Tenant DB connection established`, { tenantId, databaseName });
  return db;
};

export const closeTenantConnection = async (tenantId: string): Promise<void> => {
  const pool = pools.get(tenantId);
  if (pool) {
    await pool.end();
    pools.delete(tenantId);
    databases.delete(tenantId);
  }
};
