import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/httpException';
import { ErrorCodes } from '../constants/errorCodes';
import { HttpStatus } from '../constants/httpStatus';
import { logger } from '../utils/logger.util';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof HttpException) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error_code: err.errorCode,
      status_code: err.statusCode,
    });
    return;
  }

  logger.error(err.message, { stack: err.stack });
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal server error',
    error_code: ErrorCodes.DATABASE_ERROR,
    status_code: HttpStatus.INTERNAL_SERVER_ERROR,
  });
};

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
