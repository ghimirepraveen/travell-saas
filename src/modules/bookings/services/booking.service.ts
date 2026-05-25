import * as bookingRepository from '../repositories/booking.repository';
import { CreateBookingInput } from '../validation/booking.validation';
import { Booking } from '../models/booking.model';
import { HttpException } from '@/core/exceptions/httpException';
import { HttpStatus } from '@/core/constants/httpStatus';
import { ErrorCodes } from '@/core/constants/errorCodes';
import { DatabaseException } from '@/core/exceptions/databaseException';

export const createBooking = async (
  tenantId: string,
  dto: CreateBookingInput,
  userId?: string
): Promise<Booking> => {
  if (dto.travelers.length !== dto.paxCount) {
    throw new HttpException(
      'Number of travelers must match pax count',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  try {
    return await bookingRepository.createBooking(tenantId, dto, userId);
  } catch (error) {
    if (error instanceof DatabaseException) {
      const message = error.message;
      if (message.includes('not published')) {
        throw new HttpException(message, HttpStatus.BAD_REQUEST, ErrorCodes.PACKAGE_NOT_PUBLISHED);
      }
      if (message.includes('seats')) {
        throw new HttpException(message, HttpStatus.CONFLICT, ErrorCodes.INVENTORY_UNAVAILABLE);
      }
      throw new HttpException(message, HttpStatus.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR);
    }
    throw error;
  }
};

export const getBookingById = async (tenantId: string, bookingId: string): Promise<Booking> => {
  const booking = await bookingRepository.findBookingById(tenantId, bookingId);
  if (!booking) {
    throw new HttpException('Booking not found', HttpStatus.NOT_FOUND, ErrorCodes.BOOKING_NOT_FOUND);
  }
  return booking;
};

export const listBookings = async (tenantId: string): Promise<Booking[]> => {
  return bookingRepository.findAllBookings(tenantId);
};
