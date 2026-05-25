import { Pool } from "pg";
import {
  buildMasterPoolConfig,
  buildTenantPoolConfig,
} from "./pgConnection.util";

const MASTER_SCHEMAS = ["auth", "subscription"] as const;

const TENANT_SCHEMAS = [
  "auth",
  "packages",
  "inventory",
  "customers",
  "bookings",
  "destinations",
  "site_settings",
  "faq",
  "enquiries",
] as const;

const createSchemas = async (
  pool: Pool,
  schemas: readonly string[],
): Promise<void> => {
  for (const schema of schemas) {
    await pool.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
  }
};

export const ensureMasterPgSchemas = async (): Promise<void> => {
  const pool = new Pool(buildMasterPoolConfig());
  try {
    await createSchemas(pool, MASTER_SCHEMAS);
  } finally {
    await pool.end();
  }
};

export const ensureTenantPgSchemas = async (
  databaseName: string,
): Promise<void> => {
  const pool = new Pool(buildTenantPoolConfig(databaseName));
  try {
    await createSchemas(pool, TENANT_SCHEMAS);
  } finally {
    await pool.end();
  }
};
