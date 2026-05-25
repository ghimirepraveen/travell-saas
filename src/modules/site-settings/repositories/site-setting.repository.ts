import { eq } from "drizzle-orm";
import { withTenantDb } from "@/core/database/tenantDb";
import { siteSettingsTable } from "@/core/database/schemas/tenant/sitesetting.schema";
import {
  SiteSetting,
  UpdateSiteSettingInput,
} from "../models/site-setting.model";

const DEFAULT_SITE_SETTINGS_SLUG = "site-settings";

export const findSiteSettingsByTenantId = async (
  tenantId: string,
): Promise<SiteSetting | null> => {
  return withTenantDb(tenantId, async (db) => {
    const [siteSettings] = await db.select().from(siteSettingsTable).limit(1);
    return siteSettings ?? null;
  });
};

export const findSiteSettingsBySlug = async (
  tenantId: string,
  slug: string = DEFAULT_SITE_SETTINGS_SLUG,
): Promise<SiteSetting | null> => {
  return withTenantDb(tenantId, async (db) => {
    const [siteSettings] = await db
      .select()
      .from(siteSettingsTable)
      .where(eq(siteSettingsTable.slug, slug))
      .limit(1);

    return siteSettings ?? null;
  });
};

export const updateSiteSettingsBySlug = async (
  tenantId: string,
  slug: string = DEFAULT_SITE_SETTINGS_SLUG,
  dto: UpdateSiteSettingInput,
): Promise<SiteSetting | null> => {
  return withTenantDb(tenantId, async (db) => {
    const [siteSettings] = await db
      .update(siteSettingsTable)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(siteSettingsTable.slug, slug))
      .returning();

    return siteSettings ?? null;
  });
};

export const updateSiteSettingsByTenantId = async (
  tenantId: string,
  dto: UpdateSiteSettingInput,
): Promise<SiteSetting | null> => {
  return updateSiteSettingsBySlug(tenantId, DEFAULT_SITE_SETTINGS_SLUG, dto);
};
