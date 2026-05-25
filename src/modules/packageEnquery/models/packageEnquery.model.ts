export interface PackageEnquiry {
  id: string;
  customerId: string;
  packageId: string;
  packageTitle?: string | null;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
