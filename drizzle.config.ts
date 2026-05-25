import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: './src/core/database/schemas/master/index.ts',
  out: './src/core/database/migrations/master',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.MASTER_DB_HOST ?? 'localhost',
    port: Number(process.env.MASTER_DB_PORT ?? 5432),
    user: process.env.MASTER_DB_USER ?? 'postgres',
    password: process.env.MASTER_DB_PASSWORD ?? '',
    database: process.env.MASTER_DB_NAME ?? 'travel_saas_master',
  },
});
