import { eq, or } from 'drizzle-orm';
import { Request } from 'express';
import { masterDb } from '@/core/database/masterConnection';
import { tenants } from '@/core/database/schemas/master/auth.schema';
import { HttpException } from '@/core/exceptions/httpException';
import { HttpStatus } from '@/core/constants/httpStatus';
import { ErrorCodes } from '@/core/constants/errorCodes';
import { envConfig } from '@/core/config/env.config';
import { extractSubdomainFromHost, getRequestHost } from '@/core/helper/host.helper';
import { TenantRecord } from '@/core/types/tenant.types';

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

const loadActiveTenantBySubdomain = async (subdomain: string): Promise<TenantRecord | null> => {
  const key = subdomain.trim().toLowerCase();
  const [tenant] = await masterDb
    .select()
    .from(tenants)
    .where(or(eq(tenants.subdomain, key), eq(tenants.slug, key)))
    .limit(1);

  if (!tenant || tenant.status !== 'active') {
    return null;
  }
  return mapTenant(tenant);
};

const loadActiveTenantById = async (tenantId: string): Promise<TenantRecord | null> => {
  const [tenant] = await masterDb
    .select()
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);
  if (!tenant || tenant.status !== 'active') {
    return null;
  }
  return mapTenant(tenant);
};

/** Subdomain from Host / X-Forwarded-Host (primary for frontend). */
export const resolveTenantFromHostHeader = async (host: string): Promise<TenantRecord | null> => {
  const subdomain = extractSubdomainFromHost(host, envConfig.tenancy.platformRootDomain);
  if (!subdomain) {
    return null;
  }
  return loadActiveTenantBySubdomain(subdomain);
};

export type TenantIdentifierInput = {
  tenantId?: string;
  tenantSlug?: string;
};

/** Fallback when Host has no subdomain (Postman, scripts). */
export const resolveTenantId = async (input: TenantIdentifierInput): Promise<string> => {
  if (input.tenantId) {
    const tenant = await loadActiveTenantById(input.tenantId);
    if (!tenant) {
      throw new HttpException('Tenant not found or inactive', HttpStatus.NOT_FOUND, ErrorCodes.TENANT_NOT_FOUND);
    }
    return tenant.id;
  }

  const slug = input.tenantSlug?.trim().toLowerCase();
  if (!slug) {
    throw new HttpException(
      'tenantId or tenantSlug is required',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR,
    );
  }

  const tenant = await loadActiveTenantBySubdomain(slug);
  if (!tenant) {
    throw new HttpException(
      'Agency not found. Check the signup link or agency code.',
      HttpStatus.NOT_FOUND,
      ErrorCodes.TENANT_NOT_FOUND,
    );
  }
  return tenant.id;
};

/**
 * Resolve tenant for auth/public routes.
 * Priority: Host subdomain → x-tenant-subdomain → x-tenant-id → body slug/id
 */
export const resolveTenantForRequest = async (req: Request): Promise<TenantRecord> => {
  const forwardedHost = req.headers['x-forwarded-host'];
  const host = getRequestHost(
    typeof forwardedHost === 'string' ? forwardedHost : req.headers.host,
  );

  const fromHost = host ? await resolveTenantFromHostHeader(host) : null;
  if (fromHost) {
    return fromHost;
  }

  const headerSubdomain = req.headers['x-tenant-subdomain'];
  if (typeof headerSubdomain === 'string' && headerSubdomain.trim()) {
    const tenant = await loadActiveTenantBySubdomain(headerSubdomain);
    if (tenant) {
      return tenant;
    }
  }

  const headerTenantId = req.headers['x-tenant-id'];
  if (typeof headerTenantId === 'string' && headerTenantId.trim()) {
    const tenant = await loadActiveTenantById(headerTenantId.trim());
    if (tenant) {
      return tenant;
    }
  }

  const body = req.body as { tenantId?: string; tenantSlug?: string };
  if (body?.tenantId || body?.tenantSlug) {
    const tenantId = await resolveTenantId({
      tenantId: body.tenantId,
      tenantSlug: body.tenantSlug,
    });
    const tenant = await loadActiveTenantById(tenantId);
    if (tenant) {
      return tenant;
    }
  }

  throw new HttpException(
    `Could not resolve agency from host. Use a subdomain such as agency.${envConfig.tenancy.platformRootDomain} or send header x-tenant-subdomain.`,
    HttpStatus.BAD_REQUEST,
    ErrorCodes.TENANT_NOT_FOUND,
  );
};

export const getActiveTenantName = async (tenantId: string): Promise<string> => {
  const tenant = await loadActiveTenantById(tenantId);
  if (!tenant) {
    throw new HttpException('Tenant not found or inactive', HttpStatus.NOT_FOUND, ErrorCodes.TENANT_NOT_FOUND);
  }
  return tenant.name;
};

export const getTenantPublicProfile = async (slug: string) => {
  const tenant = await loadActiveTenantBySubdomain(slug);
  if (!tenant) {
    throw new HttpException('Agency not found', HttpStatus.NOT_FOUND, ErrorCodes.TENANT_NOT_FOUND);
  }
  return { tenantId: tenant.id, slug: slug.trim().toLowerCase(), name: tenant.name };
};

export const getTenantSlugById = async (tenantId: string): Promise<string> => {
  const [tenant] = await masterDb
    .select({ slug: tenants.slug })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);
  if (!tenant) {
    throw new HttpException('Tenant not found', HttpStatus.NOT_FOUND, ErrorCodes.TENANT_NOT_FOUND);
  }
  return tenant.slug;
};
