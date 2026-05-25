import { Router } from 'express';
import {
  createBooking,
  getBookingById,
  listBookings,
} from '../controllers/booking.controller';
import { authenticationMiddleware } from '@/core/middleware/authentication.middleware';
import { tenantResolver } from '@/core/middleware/tenantResolver.middleware';
import { zodValidationMiddleware } from '@/core/middleware/zodValidation.middleware';
import { createBookingSchema } from '../validation/booking.validation';

const router = Router();

router.get('/', authenticationMiddleware, tenantResolver, listBookings);
router.get('/:id', authenticationMiddleware, tenantResolver, getBookingById);
router.post(
  '/',
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(createBookingSchema),
  createBooking,
);

export default router;
