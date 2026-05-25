import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { getTenantAccessTokenFromRequest } from '../utils/authCookies.util';
import { HttpException } from '../exceptions/httpException';
import { HttpStatus } from '../constants/httpStatus';
import { ErrorCodes } from '../constants/errorCodes';

export const authenticationMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const token = getTenantAccessTokenFromRequest(req);
    if (!token) {
      throw new HttpException(
        'Missing or invalid authentication (cookie or Bearer token)',
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.UNAUTHORIZED
      );
    }
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      role: payload.role,
      tenantId: payload.tenantId,
    };

    if (payload.tenantId) {
      req.tenantId = payload.tenantId;
    }

    next();
  } catch {
    next(
      new HttpException('Invalid or expired token', HttpStatus.UNAUTHORIZED, ErrorCodes.UNAUTHORIZED)
    );
  }
};
