import { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { masterDb } from '../database/masterConnection';
import { tenants } from '../database/schemas/master/auth.schema';
import { HttpException } from '../exceptions/httpException';
import { HttpStatus } from '../constants/httpStatus';
import { ErrorCodes } from '../constants/errorCodes';
import { TenantRecord } from '../types/tenant.types';
import { resolveTenantFromHostHeader } from '@/core/services/tenantResolver.service';
import { getRequestHost } from '../helper/host.helper';

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

export const tenantResolver = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (req.tenantId && req.tenant) {
      next();
      return;
    }

    const forwardedHost = req.headers['x-forwarded-host'];
    const host = getRequestHost(
      typeof forwardedHost === 'string' ? forwardedHost : req.headers.host,
    );
    const fromHost = host ? await resolveTenantFromHostHeader(host) : null;
    if (fromHost) {
      req.tenant = fromHost;
      req.tenantId = fromHost.id;
      next();
      return;
    }

    const headerSubdomain = req.headers['x-tenant-subdomain'] as string | undefined;
    if (headerSubdomain?.trim()) {
      const [tenant] = await masterDb
        .select()
        .from(tenants)
        .where(eq(tenants.subdomain, headerSubdomain.trim().toLowerCase()))
        .limit(1);
      if (tenant && tenant.status === 'active') {
        req.tenant = mapTenant(tenant);
        req.tenantId = tenant.id;
        next();
        return;
      }
    }

    const headerTenantId = req.headers['x-tenant-id'] as string | undefined;
    const tenantId = headerTenantId ?? req.user?.tenantId;

    if (!tenantId) {
      throw new HttpException(
        'Tenant context could not be resolved from host or headers',
        HttpStatus.BAD_REQUEST,
        ErrorCodes.TENANT_NOT_FOUND,
      );
    }

    const [tenant] = await masterDb
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant) {
      throw new HttpException('Tenant not found', HttpStatus.NOT_FOUND, ErrorCodes.TENANT_NOT_FOUND);
    }

    if (tenant.status !== 'active') {
      throw new HttpException('Tenant is not active', HttpStatus.FORBIDDEN, ErrorCodes.TENANT_INACTIVE);
    }

    req.tenant = mapTenant(tenant);
    req.tenantId = tenant.id;
    next();
  } catch (error) {
    next(error);
  }
};
