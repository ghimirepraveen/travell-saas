import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, sql } from "drizzle-orm";
import { Pool } from "pg";
import path from "path";
import { masterDatabaseConfig } from "../config/database.config";
import { ensureDatabaseExists } from "./ensureDatabase";
import {
  buildMasterPoolConfig,
  buildTenantPoolConfig,
} from "./pgConnection.util";
import { logger } from "../utils/logger.util";
import {
  ensureMasterPgSchemas,
  ensureTenantPgSchemas,
} from "./ensurePgSchemas";
import { masterDb } from "./masterConnection";
import { tenants } from "./schemas/master/auth.schema";
import * as masterSchema from "./schemas/master";
import * as tenantSchema from "./schemas/tenant";

const masterMigrationsFolder = path.join(__dirname, "migrations", "master");
const tenantMigrationsFolder = path.join(__dirname, "migrations", "tenant");
type TenantDb = NodePgDatabase<typeof tenantSchema>;

const resolveTenantIdByDatabaseName = async (
  databaseName: string,
): Promise<string | null> => {
  const [tenant] = await masterDb
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.databaseName, databaseName))
    .limit(1);

  return tenant?.id ?? null;
};

const ensureSiteSettingsSeed = async (
  db: TenantDb,
  tenantId: string,
): Promise<void> => {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "site_settings"."site_settings" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "tenant_id" uuid NOT NULL UNIQUE,
      "slug" varchar(100) NOT NULL UNIQUE DEFAULT 'site-settings',
      "site_title" varchar(255) NOT NULL DEFAULT '',
      "site_description" text NOT NULL DEFAULT '',
      "hero_section_title" varchar(255) NOT NULL DEFAULT '',
      "about_us_content" text NOT NULL DEFAULT '',
      "contact_us_title" varchar(255) NOT NULL DEFAULT '',
      "contact_us_content" text NOT NULL DEFAULT '',
      "hero_section_subtitle" text NOT NULL DEFAULT '',
      "contact_email" varchar(255) NOT NULL DEFAULT '',
      "contact_phone" varchar(20) NOT NULL DEFAULT '',
      "facebook_url" varchar(255) NOT NULL DEFAULT '',
      "twitter_url" varchar(255) NOT NULL DEFAULT '',
      "instagram_url" varchar(255) NOT NULL DEFAULT '',
      "tiktok_url" varchar(255) NOT NULL DEFAULT '',
      "address" text NOT NULL DEFAULT '',
      "customer_served" integer NOT NULL DEFAULT 0,
      "years_of_experience" integer NOT NULL DEFAULT 0,
      "total_guides" integer NOT NULL DEFAULT 0,
      "total_destinations" integer NOT NULL DEFAULT 0,
      "updated_at" timestamp with time zone NOT NULL DEFAULT now()
    );
  `);

  await db
    .insert(tenantSchema.siteSettingsTable)
    .values({
      tenantId,
      slug: "site-settings",
    })
    .onConflictDoNothing();
};

export const migrateMaster = async (): Promise<void> => {
  await ensureDatabaseExists(masterDatabaseConfig.database);
  await ensureMasterPgSchemas();

  const pool = new Pool(buildMasterPoolConfig());
  const db = drizzle(pool, { schema: masterSchema });
  await migrate(db, { migrationsFolder: masterMigrationsFolder });
  await pool.end();
  logger.info("Master database migrations completed");
};

export const migrateTenantDatabase = async (
  databaseName: string,
  tenantId?: string,
): Promise<void> => {
  await ensureDatabaseExists(databaseName);
  await ensureTenantPgSchemas(databaseName);

  const pool = new Pool(buildTenantPoolConfig(databaseName));
  const db = drizzle(pool, { schema: tenantSchema });
  await migrate(db, { migrationsFolder: tenantMigrationsFolder });
  const resolvedTenantId =
    tenantId ?? (await resolveTenantIdByDatabaseName(databaseName));

  if (resolvedTenantId) {
    await ensureSiteSettingsSeed(db, resolvedTenantId);
  } else {
    logger.warn(
      "Skipped site settings seed because tenant id could not be resolved",
      {
        databaseName,
      },
    );
  }

  await pool.end();
  logger.info(`Tenant database migrations completed: ${databaseName}`);
};
