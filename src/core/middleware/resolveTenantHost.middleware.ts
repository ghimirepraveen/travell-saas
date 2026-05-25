import { Request, Response, NextFunction } from 'express';
import { resolveTenantForRequest } from '@/core/services/tenantResolver.service';

/**
 * Sets req.tenant and req.tenantId from request Host subdomain (or fallbacks).
 * Use on auth routes and optionally before tenantResolver on API routes.
 */
export const resolveTenantFromHost = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const tenant = await resolveTenantForRequest(req);
    req.tenant = tenant;
    req.tenantId = tenant.id;
    next();
  } catch (error) {
    next(error);
  }
};
