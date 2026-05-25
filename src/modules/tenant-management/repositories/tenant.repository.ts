import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { masterDb } from '@/core/database/masterConnection';
import { tenants } from '@/core/database/schemas/master/auth.schema';
import { buildTenantDatabaseName } from '@/core/config/database.config';
import { migrateTenantDatabase } from '@/core/database/migrationManager';
import { CreateTenantInput } from '../validation/tenant.validation';
import { TenantRecord } from '@/core/types/tenant.types';
import { DatabaseException } from '@/core/exceptions/databaseException';

const mapTenant = (row: typeof tenants.$inferSelect): TenantRecord => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  databaseName: row.databaseName,
  status: row.status as TenantRecord['status'],
  planId: row.planId,
  country: row.country,
  timezone: row.timezone,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const createTenant = async (dto: CreateTenantInput): Promise<TenantRecord> => {
  const tenantId = uuidv4();
  const databaseName = buildTenantDatabaseName(tenantId);

  try {
    const [createdTenant] = await masterDb
      .insert(tenants)
      .values({
        id: tenantId,
        name: dto.name,
        slug: dto.slug,
        subdomain: dto.slug,
        databaseName,
        country: dto.country ?? null,
        timezone: dto.timezone ?? null,
        status: 'active',
      })
      .returning();

    await migrateTenantDatabase(databaseName, tenantId);
    return mapTenant(createdTenant);
  } catch (error) {
    await masterDb.delete(tenants).where(eq(tenants.id, tenantId));
    throw new DatabaseException(
      error instanceof Error ? error.message : 'Failed to provision tenant database'
    );
  }
};

export const findAllTenants = async (): Promise<TenantRecord[]> => {
  const rows = await masterDb.select().from(tenants);
  return rows.map(mapTenant);
};

export const findTenantById = async (id: string): Promise<TenantRecord | null> => {
  const [row] = await masterDb.select().from(tenants).where(eq(tenants.id, id)).limit(1);
  return row ? mapTenant(row) : null;
};

export const deleteTenantById = async (id: string): Promise<void> => {
  await masterDb.delete(tenants).where(eq(tenants.id, id));
};
