import { HttpException } from "@/core/exceptions/httpException";
import { HttpStatus } from "@/core/constants/httpStatus";
import { ErrorCodes } from "@/core/constants/errorCodes";
import * as siteSettingRepository from "../repositories/site-setting.repository";
import {
  SiteSetting,
  UpdateSiteSettingInput,
} from "../models/site-setting.model";

export const getSiteSettingsByTenantId = async (
  tenantId: string,
): Promise<SiteSetting> => {
  const siteSettings =
    await siteSettingRepository.findSiteSettingsByTenantId(tenantId);

  if (!siteSettings) {
    throw new HttpException(
      "Site settings not found",
      HttpStatus.NOT_FOUND,
      ErrorCodes.NOT_FOUND,
    );
  }

  return siteSettings;
};

export const getSiteSettingsBySlug = async (
  tenantId: string,
  slug: string,
): Promise<SiteSetting> => {
  const siteSettings = await siteSettingRepository.findSiteSettingsBySlug(
    tenantId,
    slug,
  );

  if (!siteSettings) {
    throw new HttpException(
      "Site settings not found",
      HttpStatus.NOT_FOUND,
      ErrorCodes.NOT_FOUND,
    );
  }

  return siteSettings;
};

export const updateSiteSettingsByTenantId = async (
  tenantId: string,
  dto: UpdateSiteSettingInput,
): Promise<SiteSetting> => {
  const siteSettings = await siteSettingRepository.updateSiteSettingsByTenantId(
    tenantId,
    dto,
  );

  if (!siteSettings) {
    throw new HttpException(
      "Site settings not found",
      HttpStatus.NOT_FOUND,
      ErrorCodes.NOT_FOUND,
    );
  }

  return siteSettings;
};
