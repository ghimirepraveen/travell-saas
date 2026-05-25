import { Request, Response } from 'express';
import * as bookingService from '../services/booking.service';
import { sendResponse } from '@/core/utils/response.util';
import { HttpStatus } from '@/core/constants/httpStatus';
import { asyncHandler } from '@/core/middleware/errorHandler.middleware';

export const createBooking = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId!;
  const booking = await bookingService.createBooking(tenantId, req.body, req.user?.id);
  sendResponse(res, booking, HttpStatus.CREATED);
});

export const getBookingById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId!;
  const booking = await bookingService.getBookingById(tenantId, String(req.params.id));
  sendResponse(res, booking);
});

export const listBookings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId!;
  const bookings = await bookingService.listBookings(tenantId);
  sendResponse(res, bookings);
});
