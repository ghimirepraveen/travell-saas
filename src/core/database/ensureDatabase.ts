import { Client } from 'pg';
import { masterDatabaseConfig } from '../config/database.config';
import { logger } from '../utils/logger.util';
import {
  buildMasterPoolConfig,
  shouldAutoCreateDatabase,
} from './pgConnection.util';

/** Managed cloud DB (Render): verify connection only. Local Docker: create DB if missing. */
export const ensureMasterDatabaseExists = async (): Promise<void> => {
  if (!shouldAutoCreateDatabase()) {
    const client = new Client(buildMasterPoolConfig());
    try {
      await client.connect();
      await client.query('SELECT 1');
      logger.info(`Master database connection OK: ${masterDatabaseConfig.database}`);
    } finally {
      await client.end();
    }
    return;
  }

  const adminClient = new Client(buildMasterPoolConfig('postgres'));

  try {
    await adminClient.connect();

    const result = await adminClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [masterDatabaseConfig.database]
    );

    if (result.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE "${masterDatabaseConfig.database}"`);
      logger.info(`Created master database: ${masterDatabaseConfig.database}`);
    }
  } finally {
    await adminClient.end();
  }
};

export const ensureDatabaseExists = async (databaseName: string): Promise<void> => {
  if (!shouldAutoCreateDatabase()) {
    const client = new Client(buildMasterPoolConfig(databaseName));
    try {
      await client.connect();
      await client.query('SELECT 1');
    } finally {
      await client.end();
    }
    return;
  }

  const adminClient = new Client(buildMasterPoolConfig('postgres'));

  try {
    await adminClient.connect();

    const result = await adminClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName]
    );

    if (result.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE "${databaseName}"`);
      logger.info(`Created database: ${databaseName}`);
    }
  } finally {
    await adminClient.end();
  }
};
