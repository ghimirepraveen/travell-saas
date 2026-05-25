export interface Destination {
  id: string;
  name: string;
  description: string | null;
  country: string | null;
  city: string | null;
  createdAt: Date;
  updatedAt: Date;
}
