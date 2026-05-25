export interface BookingTraveler {
  id: string;
  customerId: string;
}

export interface Booking {
  id: string;
  referenceCode: string;
  packageId: string;
  departureId: string;
  travelDate: string;
  paxCount: number;
  totalAmount: string;
  currency: string;
  status: string;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  travelers?: BookingTraveler[];
}
