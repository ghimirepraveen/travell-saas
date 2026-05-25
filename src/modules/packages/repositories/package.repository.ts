import { and, desc, eq, sql } from "drizzle-orm";
import { withTenantDb } from "@/core/database/tenantDb";
import { destinationsTable } from "@/core/database/schemas/tenant/destination.schema";
import { travelPackages } from "@/core/database/schemas/tenant/packages.schema";
import { TravelPackage } from "../models/package.model";
import {
  CreatePackageInput,
  UpdatePackageInput,
} from "../validation/package.validation";

const packageSelect = {
  id: travelPackages.id,
  title: travelPackages.title,
  slug: travelPackages.slug,
  destinationId: travelPackages.destinationId,
  destinationName: destinationsTable.name,
  description: travelPackages.description,
  durationDays: travelPackages.durationDays,
  basePrice: travelPackages.basePrice,
  currency: travelPackages.currency,
  status: travelPackages.status,
  isFeatured: travelPackages.isFeatured,
  priority: travelPackages.priority,
  isPublished: travelPackages.isPublished,
  createdAt: travelPackages.createdAt,
  updatedAt: travelPackages.updatedAt,
};

export const destinationExists = async (
  tenantId: string,
  destinationId: string,
): Promise<boolean> => {
  return withTenantDb(tenantId, async (db) => {
    const [destination] = await db
      .select({ id: destinationsTable.id })
      .from(destinationsTable)
      .where(eq(destinationsTable.id, destinationId))
      .limit(1);

    return Boolean(destination);
  });
};

export const findPackageBySlug = async (
  tenantId: string,
  slug: string,
): Promise<{ id: string } | null> => {
  return withTenantDb(tenantId, async (db) => {
    const [pkg] = await db
      .select({ id: travelPackages.id })
      .from(travelPackages)
      .where(eq(travelPackages.slug, slug))
      .limit(1);

    return pkg ?? null;
  });
};

export const createPackage = async (
  tenantId: string,
  dto: CreatePackageInput,
  slug: string,
): Promise<TravelPackage> => {
  return withTenantDb(tenantId, async (db) => {
    const [created] = await db
      .insert(travelPackages)
      .values({
        title: dto.title,
        slug,
        destinationId: dto.destinationId,
        description: dto.description ?? null,
        durationDays: dto.durationDays ?? 1,
        basePrice: dto.basePrice.toFixed(2),
        currency: dto.currency ?? "USD",
        status: dto.status ?? "draft",
        isFeatured: dto.isFeatured ?? false,
        priority: dto.priority ?? 0,
        isPublished: dto.isPublished ?? false,
      })
      .returning({ id: travelPackages.id });

    const [pkg] = await db
      .select(packageSelect)
      .from(travelPackages)
      .leftJoin(
        destinationsTable,
        eq(travelPackages.destinationId, destinationsTable.id),
      )
      .where(eq(travelPackages.id, created.id))
      .limit(1);

    return pkg;
  });
};

export const findPackagesPaginated = async (
  tenantId: string,
  limit: number,
  offset: number,
): Promise<{ items: TravelPackage[]; total: number }> => {
  return withTenantDb(tenantId, async (db) => {
    const items = await db
      .select(packageSelect)
      .from(travelPackages)
      .leftJoin(
        destinationsTable,
        eq(travelPackages.destinationId, destinationsTable.id),
      )
      .orderBy(desc(travelPackages.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db
      .select({ total: sql<number>`count(*)`.mapWith(Number) })
      .from(travelPackages);

    return {
      items,
      total: totalRow?.total ?? 0,
    };
  });
};

export const findPackagesPaginatedForPublic = async (
  tenantId: string,
  limit: number,
  offset: number,
): Promise<{ items: TravelPackage[]; total: number }> => {
  return withTenantDb(tenantId, async (db) => {
    const items = await db
      .select(packageSelect)
      .from(travelPackages)
      .leftJoin(
        destinationsTable,
        eq(travelPackages.destinationId, destinationsTable.id),
      )
      .where(eq(travelPackages.isPublished, true))
      .orderBy(desc(travelPackages.priority), desc(travelPackages.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db
      .select({ total: sql<number>`count(*)`.mapWith(Number) })
      .from(travelPackages)
      .where(eq(travelPackages.isPublished, true));

    return {
      items,
      total: totalRow?.total ?? 0,
    };
  });
};

export const findPackagesPaginatedForFeatured = async (
  tenantId: string,
  limit: number,
  offset: number,
): Promise<{ items: TravelPackage[]; total: number }> => {
  return withTenantDb(tenantId, async (db) => {
    const items = await db
      .select(packageSelect)
      .from(travelPackages)
      .leftJoin(
        destinationsTable,
        eq(travelPackages.destinationId, destinationsTable.id),
      )
      .where(and(
        eq(travelPackages.isPublished, true),
        eq(travelPackages.isFeatured, true),
      ))
      .orderBy(desc(travelPackages.priority), desc(travelPackages.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db
      .select({ total: sql<number>`count(*)`.mapWith(Number) })
      .from(travelPackages)
      .where(and(
        eq(travelPackages.isPublished, true),
        eq(travelPackages.isFeatured, true),
      ));

    return {
      items,
      total: totalRow?.total ?? 0,
    };
  });
};
export const findPackageById = async (
  tenantId: string,
  id: string,
): Promise<TravelPackage | null> => {
  return withTenantDb(tenantId, async (db) => {
    const [pkg] = await db
      .select(packageSelect)
      .from(travelPackages)
      .leftJoin(
        destinationsTable,
        eq(travelPackages.destinationId, destinationsTable.id),
      )
      .where(eq(travelPackages.id, id))
      .limit(1);

    return pkg ?? null;
  });
};

export const updatePackage = async (
  tenantId: string,
  id: string,
  dto: UpdatePackageInput,
): Promise<TravelPackage | null> => {
  return withTenantDb(tenantId, async (db) => {
    const [updated] = await db
      .update(travelPackages)
      .set({
        ...dto,
        basePrice:
          dto.basePrice === undefined ? undefined : dto.basePrice.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(travelPackages.id, id))
      .returning({ id: travelPackages.id });

    if (!updated) {
      return null;
    }

    const [pkg] = await db
      .select(packageSelect)
      .from(travelPackages)
      .leftJoin(
        destinationsTable,
        eq(travelPackages.destinationId, destinationsTable.id),
      )
      .where(eq(travelPackages.id, updated.id))
      .limit(1);

    return pkg ?? null;
  });
};

export const deletePackage = async (
  tenantId: string,
  id: string,
): Promise<boolean> => {
  return withTenantDb(tenantId, async (db) => {
    const [pkg] = await db
      .delete(travelPackages)
      .where(eq(travelPackages.id, id))
      .returning({ id: travelPackages.id });

    return Boolean(pkg);
  });
};
