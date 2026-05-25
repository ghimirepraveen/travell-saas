import { Router } from "express";
import { authenticationMiddleware } from "@/core/middleware/authentication.middleware";
import { tenantResolver } from "@/core/middleware/tenantResolver.middleware";
import { zodValidationMiddleware } from "@/core/middleware/zodValidation.middleware";
import {
  getSiteSettings,
  getSiteSettingsBySlug,
  updateSiteSettings,
} from "../controllers/site-setting.controller";
import {
  siteSettingsSlugParamSchema,
  siteSettingsUpdateSchema,
} from "../validation/sitesetting.validation";

const router = Router();

router.get("/", authenticationMiddleware, tenantResolver, getSiteSettings);
router.get(
  "/:slug",

  tenantResolver,
  zodValidationMiddleware(siteSettingsSlugParamSchema, "params"),
  getSiteSettingsBySlug,
);

router.patch(
  "/",
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(siteSettingsUpdateSchema),
  updateSiteSettings,
);

export default router;
