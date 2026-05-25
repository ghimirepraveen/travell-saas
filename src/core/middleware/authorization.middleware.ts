import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/httpException';
import { HttpStatus } from '../constants/httpStatus';
import { ErrorCodes } from '../constants/errorCodes';

export const authorize =
  (allowedRoles: string[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        new HttpException('Authentication required', HttpStatus.UNAUTHORIZED, ErrorCodes.UNAUTHORIZED)
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new HttpException('Insufficient permissions', HttpStatus.FORBIDDEN, ErrorCodes.FORBIDDEN)
      );
    }

    next();
  };
