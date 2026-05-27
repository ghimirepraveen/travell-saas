import { migrateTenantDatabase } from '../src/core/database/migrationManager';
import { logger } from '../src/core/utils/logger.util';

const databaseName = process.argv[2];

if (!databaseName) {
  console.error('Usage: npm run migrate:tenant -- <database_name>');
  process.exit(1);
}

migrateTenantDatabase(databaseName)
  .then(() => logger.info(`Tenant migration finished for ${databaseName}`))
  .catch((err) => {
    logger.error('Tenant migration failed', err);
    process.exit(1);
  });
