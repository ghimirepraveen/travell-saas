import { migrateMaster } from '../src/core/database/migrationManager';
import { logger } from '../src/core/utils/logger.util';

migrateMaster()
  .then(() => logger.info('Master migration script finished'))
  .catch((err) => {
    logger.error('Master migration failed', err);
    process.exit(1);
  });
