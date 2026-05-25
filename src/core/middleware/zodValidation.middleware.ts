import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { HttpException } from '@/core/exceptions/httpException';
import { HttpStatus } from '@/core/constants/httpStatus';
import { ErrorCodes } from '@/core/constants/errorCodes';

type ValidationSource = 'body' | 'params' | 'query';

const formatZodErrors = (issues: { message: string }[]): string =>
  issues.map((issue) => issue.message).join('; ');

export const zodValidationMiddleware =
  <T>(schema: ZodSchema<T>, source: ValidationSource = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req[source]);

      if (!result.success) {
        throw new HttpException(
          formatZodErrors(result.error.issues),
          HttpStatus.BAD_REQUEST,
          ErrorCodes.VALIDATION_ERROR,
        );
      }

      req[source] = result.data;
      next();
    } catch (err) {
      next(err);
    }
  };
