import { desc, eq, sql } from "drizzle-orm";
import { withTenantDb } from "@/core/database/tenantDb";
import { enquiriesTable } from "@/core/database/schemas/tenant/packageEnquery.schema";
import { travelPackages } from "@/core/database/schemas/tenant/packages.schema";
import { PackageEnquiry } from "../models/packageEnquery.model";
import {
  CreatePackageEnquiryInput,
  UpdatePackageEnquiryInput,
} from "../validation/packageEnquery.validation";

export const createPackageEnquiry = async (
  tenantId: string,
  dto: CreatePackageEnquiryInput,
): Promise<PackageEnquiry> => {
  return withTenantDb(tenantId, async (db) => {
    const [enquiry] = await db
      .insert(enquiriesTable)
      .values({
        customerId: dto.customerId,
        packageId: dto.packageId,
        name: dto.name,
      })
      .returning();

    return enquiry;
  });
};

export const findPackageEnquiriesPaginated = async (
  tenantId: string,
  limit: number,
  offset: number,
): Promise<{ items: PackageEnquiry[]; total: number }> => {
  return withTenantDb(tenantId, async (db) => {
    const items = await db
      .select({
        id: enquiriesTable.id,
        customerId: enquiriesTable.customerId,
        packageId: enquiriesTable.packageId,
        packageTitle: travelPackages.title,
        name: enquiriesTable.name,
        createdAt: enquiriesTable.createdAt,
        updatedAt: enquiriesTable.updatedAt,
      })
      .from(enquiriesTable)
      .leftJoin(travelPackages, eq(enquiriesTable.packageId, travelPackages.id))
      .orderBy(desc(enquiriesTable.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db
      .select({ total: sql<number>`count(*)`.mapWith(Number) })
      .from(enquiriesTable);

    return {
      items,
      total: totalRow?.total ?? 0,
    };
  });
};

export const findPackageEnquiryById = async (
  tenantId: string,
  id: string,
): Promise<PackageEnquiry | null> => {
  return withTenantDb(tenantId, async (db) => {
    const [enquiry] = await db
      .select({
        id: enquiriesTable.id,
        customerId: enquiriesTable.customerId,
        packageId: enquiriesTable.packageId,
        packageTitle: travelPackages.title,
        name: enquiriesTable.name,
        createdAt: enquiriesTable.createdAt,
        updatedAt: enquiriesTable.updatedAt,
      })
      .from(enquiriesTable)
      .leftJoin(travelPackages, eq(enquiriesTable.packageId, travelPackages.id))
      .where(eq(enquiriesTable.id, id))
      .limit(1);

    return enquiry ?? null;
  });
};

export const updatePackageEnquiry = async (
  tenantId: string,
  id: string,
  dto: UpdatePackageEnquiryInput,
): Promise<PackageEnquiry | null> => {
  return withTenantDb(tenantId, async (db) => {
    const [enquiry] = await db
      .update(enquiriesTable)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(enquiriesTable.id, id))
      .returning();

    return enquiry ?? null;
  });
};

export const deletePackageEnquiry = async (
  tenantId: string,
  id: string,
): Promise<boolean> => {
  return withTenantDb(tenantId, async (db) => {
    const [enquiry] = await db
      .delete(enquiriesTable)
      .where(eq(enquiriesTable.id, id))
      .returning({ id: enquiriesTable.id });

    return Boolean(enquiry);
  });
};
