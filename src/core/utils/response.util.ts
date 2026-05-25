import { Response } from 'express';
import { ApiResponse } from '../types/common.types';

export const sendResponse = <T>(
  res: Response,
  data: T,
  statusCode = 200
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    status_code: statusCode,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number,
  errorCode: string
): Response<ApiResponse> => {
  return res.status(statusCode).json({
    success: false,
    message,
    error_code: errorCode,
    status_code: statusCode,
  });
};
