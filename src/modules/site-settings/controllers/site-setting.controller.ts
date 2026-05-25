import { Request, Response } from "express";
import { asyncHandler } from "@/core/middleware/errorHandler.middleware";
import { sendResponse } from "@/core/utils/response.util";
import { HttpStatus } from "@/core/constants/httpStatus";
import * as siteSettingService from "../services/site-setting.service";

export const getSiteSettings = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const siteSettings = await siteSettingService.getSiteSettingsByTenantId(
      req.tenantId!,
    );
    sendResponse(res, siteSettings);
  },
);

export const getSiteSettingsBySlug = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const siteSettings = await siteSettingService.getSiteSettingsBySlug(
      req.tenantId!,
      String(req.params.slug),
    );
    sendResponse(res, siteSettings);
  },
);

export const updateSiteSettings = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const siteSettings = await siteSettingService.updateSiteSettingsByTenantId(
      req.tenantId!,
      req.body,
    );
    sendResponse(res, siteSettings, HttpStatus.OK);
  },
);
