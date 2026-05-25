import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { sendResponse } from '@/core/utils/response.util';
import { HttpStatus } from '@/core/constants/httpStatus';
import { asyncHandler } from '@/core/middleware/errorHandler.middleware';
import { HttpException } from '@/core/exceptions/httpException';
import { ErrorCodes } from '@/core/constants/errorCodes';
import {
  clearTenantAuthCookies,
  getTenantRefreshTokenFromRequest,
  setTenantAuthCookies,
} from '@/core/utils/authCookies.util';

/** Owner or admin creates staff — requires auth cookie or Bearer token. */
export const createStaff = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId!;
  const { email, password, fullName, role } = req.body;
  const result = await authService.createStaffByAdmin(
    tenantId,
    email,
    password,
    fullName,
    role,
  );
  sendResponse(res, result, HttpStatus.CREATED);
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId!;
  const { email, password } = req.body;
  const { user, token, refreshToken } = await authService.loginUser(tenantId, email, password);
  setTenantAuthCookies(res, token, refreshToken);
  sendResponse(res, { user });
});

export const refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId!;
  const refreshToken = getTenantRefreshTokenFromRequest(req);
  if (!refreshToken) {
    throw new HttpException(
      'Refresh token required (cookie or body)',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR,
    );
  }
  const { user, token, refreshToken: newRefresh } = await authService.refreshAccessToken(
    tenantId,
    refreshToken,
  );
  setTenantAuthCookies(res, token, newRefresh);
  sendResponse(res, { user });
});

export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId!;
  const refreshToken = getTenantRefreshTokenFromRequest(req);
  if (refreshToken) {
    await authService.logoutWithRefreshToken(tenantId, refreshToken);
  }
  clearTenantAuthCookies(res);
  sendResponse(res, { loggedOut: true });
});
