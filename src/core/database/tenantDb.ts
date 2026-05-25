import { getTenantDb } from './tenantConnectionPool';

export const withTenantDb = async <T>(
  tenantId: string,
  fn: (db: Awaited<ReturnType<typeof getTenantDb>>) => Promise<T>
): Promise<T> => {
  const db = await getTenantDb(tenantId);
  return fn(db);
};
