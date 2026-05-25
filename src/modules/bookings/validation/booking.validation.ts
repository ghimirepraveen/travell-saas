import { z } from 'zod';
import { uuidSchema } from '@/core/validation/commonValidation';

const bookingTravelerSchema = z.object({
  customerId: uuidSchema,
});

export const createBookingSchema = z.object({
  packageId: uuidSchema,
  departureId: uuidSchema,
  travelDate: z.string().date('travelDate must be a valid ISO date (YYYY-MM-DD)'),
  paxCount: z.number().int().min(1),
  travelers: z.array(bookingTravelerSchema).min(1),
});

export type BookingTravelerInput = z.infer<typeof bookingTravelerSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
