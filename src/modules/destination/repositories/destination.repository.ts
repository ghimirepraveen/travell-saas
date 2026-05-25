import { desc, eq, sql } from "drizzle-orm";

import { withTenantDb } from "@/core/database/tenantDb";
import { destinationsTable } from "@/core/database/schemas/tenant/destination.schema";
import { Destination } from "../models/destination.model";
import {
  CreateDestinationInput,
  UpdateDestinationInput,
} from "../validation/destination.validation";

export const createDestination = async (
  tenantId: string,
  dto: CreateDestinationInput,
): Promise<Destination> => {
  return withTenantDb(tenantId, async (db) => {
    const [destination] = await db
      .insert(destinationsTable)
      .values({
        name: dto.name,
        description: dto.description ?? null,
        country: dto.country ?? null,
        city: dto.city ?? null,
      })
      .returning();

    return destination;
  });
};

export const findDestinationsPaginated = async (
  tenantId: string,
  limit: number,
  offset: number,
): Promise<{ items: Destination[]; total: number }> => {
  return withTenantDb(tenantId, async (db) => {
    const items = await db
      .select()
      .from(destinationsTable)
      .orderBy(desc(destinationsTable.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db
      .select({ total: sql<number>`count(*)`.mapWith(Number) })
      .from(destinationsTable);

    return {
      items,
      total: totalRow?.total ?? 0,
    };
  });
};

export const findDestinationById = async (
  tenantId: string,
  id: string,
): Promise<Destination | null> => {
  return withTenantDb(tenantId, async (db) => {
    const [destination] = await db
      .select()
      .from(destinationsTable)
      .where(eq(destinationsTable.id, id))
      .limit(1);

    return destination ?? null;
  });
};

export const updateDestination = async (
  tenantId: string,
  id: string,
  dto: UpdateDestinationInput,
): Promise<Destination | null> => {
  return withTenantDb(tenantId, async (db) => {
    const [destination] = await db
      .update(destinationsTable)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(destinationsTable.id, id))
      .returning();

    return destination ?? null;
  });
};
