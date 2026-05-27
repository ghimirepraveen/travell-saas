import { ensureMasterDatabaseExists } from '../src/core/database/ensureDatabase';
import { migrateMaster } from '../src/core/database/migrationManager';
import { logger } from '../src/core/utils/logger.util';

const run = async (): Promise<void> => {
  await ensureMasterDatabaseExists();
  await migrateMaster();
  logger.info('Database setup complete (master). Create a tenant via POST /api/v1/admin/tenants');
};

run().catch((err) => {
  logger.error('DB setup failed', err);
  process.exit(1);
});
