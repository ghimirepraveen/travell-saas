import { eq } from 'drizzle-orm';
import { masterDb } from '../src/core/database/masterConnection';
import { tenants } from '../src/core/database/schemas/master/auth.schema';
import { migrateTenantDatabase } from '../src/core/database/migrationManager';
import { logger } from '../src/core/utils/logger.util';

const run = async (): Promise<void> => {
  const allTenants = await masterDb.select({ databaseName: tenants.databaseName }).from(tenants);
  for (const tenant of allTenants) {
    await migrateTenantDatabase(tenant.databaseName);
  }
  logger.info(`Migrated ${allTenants.length} tenant database(s)`);
};

run().catch((err) => {
  logger.error('Migrate all tenants failed', err);
  process.exit(1);
});
