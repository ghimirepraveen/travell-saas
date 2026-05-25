export interface TravelPackage {
  id: string;
  title: string;
  slug: string;
  destinationId: string;
  destinationName?: string | null;
  description: string | null;
  durationDays: number;
  basePrice: string;
  currency: string;
  status: string;
  isFeatured: boolean;
  priority: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}
