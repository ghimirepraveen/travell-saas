import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import path from 'path';
import { masterDatabaseConfig } from '../config/database.config';
import { ensureDatabaseExists } from './ensureDatabase';
import { buildMasterPoolConfig, buildTenantPoolConfig } from './pgConnection.util';
import { logger } from '../utils/logger.util';
import { ensureMasterPgSchemas, ensureTenantPgSchemas } from './ensurePgSchemas';
import * as masterSchema from './schemas/master';
import * as tenantSchema from './schemas/tenant';

const masterMigrationsFolder = path.join(__dirname, 'migrations', 'master');
const tenantMigrationsFolder = path.join(__dirname, 'migrations', 'tenant');

export const migrateMaster = async (): Promise<void> => {
  await ensureDatabaseExists(masterDatabaseConfig.database);
  await ensureMasterPgSchemas();

  const pool = new Pool(buildMasterPoolConfig());
  const db = drizzle(pool, { schema: masterSchema });
  await migrate(db, { migrationsFolder: masterMigrationsFolder });
  await pool.end();
  logger.info('Master database migrations completed');
};

export const migrateTenantDatabase = async (databaseName: string): Promise<void> => {
  await ensureDatabaseExists(databaseName);
  await ensureTenantPgSchemas(databaseName);

  const pool = new Pool(buildTenantPoolConfig(databaseName));
  const db = drizzle(pool, { schema: tenantSchema });
  await migrate(db, { migrationsFolder: tenantMigrationsFolder });
  await pool.end();
  logger.info(`Tenant database migrations completed: ${databaseName}`);
};
