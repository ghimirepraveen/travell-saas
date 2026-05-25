import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { buildMasterPoolConfig } from './pgConnection.util';
import * as masterSchema from './schemas/master';

const pool = new Pool(buildMasterPoolConfig());

export const masterDb = drizzle(pool, { schema: masterSchema });

export const getMasterPool = (): Pool => pool;
