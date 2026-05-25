import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: './src/core/database/schemas/tenant/index.ts',
  out: './src/core/database/migrations/tenant',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.TENANT_DB_HOST ?? 'localhost',
    port: Number(process.env.TENANT_DB_PORT ?? 5432),
    user: process.env.TENANT_DB_USER ?? 'postgres',
    password: process.env.TENANT_DB_PASSWORD ?? '',
    database: 'tenant_template',
  },
});
