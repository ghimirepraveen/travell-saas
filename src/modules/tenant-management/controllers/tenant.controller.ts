import { Request, Response } from 'express';
import * as tenantService from '../services/tenant.service';
import { sendResponse } from '@/core/utils/response.util';
import { HttpStatus } from '@/core/constants/httpStatus';
import { asyncHandler } from '@/core/middleware/errorHandler.middleware';

export const createTenant = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const tenant = await tenantService.createTenant(req.body);
  sendResponse(res, tenant, HttpStatus.CREATED);
});

export const listTenants = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const tenants = await tenantService.listTenants();
  sendResponse(res, tenants);
});

export const getTenantById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const tenant = await tenantService.getTenantById(String(req.params.id));
  sendResponse(res, tenant);
});
