import { Request, Response } from 'express';
import * as superadminService from '../services/superadmin.service';
import { sendResponse } from '@/core/utils/response.util';
import { HttpStatus } from '@/core/constants/httpStatus';
import { asyncHandler } from '@/core/middleware/errorHandler.middleware';
import { setSuperadminAuthCookie } from '@/core/utils/authCookies.util';

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password, fullName } = req.body;
  const admin = await superadminService.registerSuperadmin(email, password, fullName);
  sendResponse(res, admin, HttpStatus.CREATED);
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const { user, token } = await superadminService.loginSuperadmin(email, password);
  setSuperadminAuthCookie(res, token);
  sendResponse(res, { user });
});
