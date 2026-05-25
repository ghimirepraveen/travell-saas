import { desc, eq, sql } from "drizzle-orm";
import { withTenantDb } from "@/core/database/tenantDb";
import { faqTable } from "@/core/database/schemas/tenant/faq.schema";
import { Faq } from "../models/faq.model";
import { CreateFaqInput, UpdateFaqInput } from "../validation/faq.validation";

export const createFaq = async (
  tenantId: string,
  dto: CreateFaqInput,
): Promise<Faq> => {
  return withTenantDb(tenantId, async (db) => {
    const [faq] = await db
      .insert(faqTable)
      .values({
        question: dto.question,
        answer: dto.answer,
        priority: dto.priority ?? 0,
        isPublished: dto.isPublished ?? false,
      })
      .returning();

    return faq;
  });
};

export const findFaqsPaginated = async (
  tenantId: string,
  limit: number,
  offset: number,
): Promise<{ items: Faq[]; total: number }> => {
  return withTenantDb(tenantId, async (db) => {
    const items = await db
      .select()
      .from(faqTable)
      .orderBy(desc(faqTable.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db
      .select({ total: sql<number>`count(*)`.mapWith(Number) })
      .from(faqTable);

    return {
      items,
      total: totalRow?.total ?? 0,
    };
  });
};

export const findFaqsPaginatedForPublic = async (
  tenantId: string,
  limit: number,
  offset: number,
): Promise<{ items: Faq[]; total: number }> => {
  return withTenantDb(tenantId, async (db) => {
    const items = await db
      .select()
      .from(faqTable)
      .where(eq(faqTable.isPublished, true))
      .orderBy(desc(faqTable.priority))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db
      .select({ total: sql<number>`count(*)`.mapWith(Number) })
      .from(faqTable);

    return {
      items,
      total: totalRow?.total ?? 0,
    };
  });
};
export const findFaqById = async (
  tenantId: string,
  id: string,
): Promise<Faq | null> => {
  return withTenantDb(tenantId, async (db) => {
    const [faq] = await db
      .select()
      .from(faqTable)
      .where(eq(faqTable.id, id))
      .limit(1);

    return faq ?? null;
  });
};

export const updateFaq = async (
  tenantId: string,
  id: string,
  dto: UpdateFaqInput,
): Promise<Faq | null> => {
  return withTenantDb(tenantId, async (db) => {
    const [faq] = await db
      .update(faqTable)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(faqTable.id, id))
      .returning();

    return faq ?? null;
  });
};

export const deleteFaq = async (
  tenantId: string,
  id: string,
): Promise<boolean> => {
  return withTenantDb(tenantId, async (db) => {
    const [faq] = await db
      .delete(faqTable)
      .where(eq(faqTable.id, id))
      .returning({ id: faqTable.id });

    return Boolean(faq);
  });
};
