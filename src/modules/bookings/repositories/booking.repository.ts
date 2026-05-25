import { and, desc, eq, sql } from 'drizzle-orm';
import { withTenantDb } from '@/core/database/tenantDb';
import {
  bookingsTable,
  bookingTravelers,
} from '@/core/database/schemas/tenant/bookings.schema';
import { travelPackages } from '@/core/database/schemas/tenant/packages.schema';
import { departures } from '@/core/database/schemas/tenant/inventory.schema';
import { customersTable } from '@/core/database/schemas/tenant/customers.schema';
import { CreateBookingInput } from '../validation/booking.validation';
import { Booking } from '../models/booking.model';
import { DatabaseException } from '@/core/exceptions/databaseException';

const generateReferenceCode = (): string => {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TRV-${Date.now().toString(36).toUpperCase()}-${suffix}`;
};

export const createBooking = async (
  tenantId: string,
  dto: CreateBookingInput,
  createdBy?: string
): Promise<Booking> => {
  return withTenantDb(tenantId, async (db) => {
    return db.transaction(async (tx) => {
      const [pkg] = await tx
        .select()
        .from(travelPackages)
        .where(eq(travelPackages.id, dto.packageId))
        .limit(1);

      if (!pkg) {
        throw new DatabaseException('Package not found');
      }

      if (pkg.status !== 'published') {
        throw new DatabaseException('Package is not published');
      }

      const [departure] = await tx
        .select()
        .from(departures)
        .where(
          and(eq(departures.id, dto.departureId), eq(departures.packageId, dto.packageId))
        )
        .limit(1);

      if (!departure) {
        throw new DatabaseException('Departure not found for this package');
      }

      const available = departure.totalSeats - departure.bookedSeats;
      if (available < dto.paxCount) {
        throw new DatabaseException('Not enough seats available on this departure');
      }

      const basePrice = Number(pkg.basePrice);
      const totalAmount = (basePrice * dto.paxCount).toFixed(2);
      const referenceCode = generateReferenceCode();

      const [booking] = await tx
        .insert(bookingsTable)
        .values({
          referenceCode,
          packageId: dto.packageId,
          departureId: dto.departureId,
          travelDate: dto.travelDate,
          paxCount: dto.paxCount,
          totalAmount,
          currency: pkg.currency,
          status: 'pending_payment',
          createdBy: createdBy ?? null,
        })
        .returning();

      for (const traveler of dto.travelers) {
        const [customer] = await tx
          .select({ id: customersTable.id })
          .from(customersTable)
          .where(eq(customersTable.id, traveler.customerId))
          .limit(1);

        if (!customer) {
          throw new DatabaseException(`Customer not found: ${traveler.customerId}`);
        }

        await tx.insert(bookingTravelers).values({
          bookingId: booking.id,
          customerId: traveler.customerId,
        });
      }

      await tx
        .update(departures)
        .set({ bookedSeats: sql`${departures.bookedSeats} + ${dto.paxCount}` })
        .where(eq(departures.id, dto.departureId));

      const travelers = await tx
        .select({
          id: bookingTravelers.id,
          customerId: bookingTravelers.customerId,
        })
        .from(bookingTravelers)
        .where(eq(bookingTravelers.bookingId, booking.id));

      return {
        ...booking,
        travelDate: String(booking.travelDate),
        totalAmount: String(booking.totalAmount),
        travelers,
      };
    });
  });
};

export const findBookingById = async (
  tenantId: string,
  bookingId: string
): Promise<Booking | null> => {
  return withTenantDb(tenantId, async (db) => {
    const [booking] = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.id, bookingId))
      .limit(1);

    if (!booking) return null;

    const travelers = await db
      .select({
        id: bookingTravelers.id,
        customerId: bookingTravelers.customerId,
      })
      .from(bookingTravelers)
      .where(eq(bookingTravelers.bookingId, bookingId));

    return {
      ...booking,
      travelDate: String(booking.travelDate),
      totalAmount: String(booking.totalAmount),
      travelers,
    };
  });
};

export const findAllBookings = async (tenantId: string): Promise<Booking[]> => {
  return withTenantDb(tenantId, async (db) => {
    const rows = await db
      .select()
      .from(bookingsTable)
      .orderBy(desc(bookingsTable.createdAt));
    return rows.map((b) => ({
      ...b,
      travelDate: String(b.travelDate),
      totalAmount: String(b.totalAmount),
    }));
  });
};
