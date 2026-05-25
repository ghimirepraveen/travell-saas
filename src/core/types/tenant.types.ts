export type TenantStatus = 'active' | 'inactive' | 'suspended';

export interface TenantRecord {
  id: string;
  name: string;
  slug: string;
  databaseName: string;
  status: TenantStatus;
  planId: string | null;
  country: string | null;
  timezone: string | null;
  createdAt: Date;
  updatedAt: Date;
}
