import { Router } from "express";
import {
  createStaff,
  login,
  refresh,
  logout,
} from "../controllers/auth.controller";
import { zodValidationMiddleware } from "@/core/middleware/zodValidation.middleware";
import { resolveTenantFromHost } from "@/core/middleware/resolveTenantHost.middleware";
import { authenticationMiddleware } from "@/core/middleware/authentication.middleware";
import { authorize } from "@/core/middleware/authorization.middleware";
import { createStaffSchema, loginSchema } from "../validation/auth.validation";
import { asyncHandler } from "@/core/middleware/errorHandler.middleware";
import { getTenantPublicProfile } from "@/core/services/tenantResolver.service";
import { sendResponse } from "@/core/utils/response.util";

const router = Router();

router.get(
  "/agency/:slug",
  asyncHandler(async (req, res) => {
    const profile = await getTenantPublicProfile(String(req.params.slug));
    sendResponse(res, profile);
  }),
);

/** Public: login, refresh, logout (tenant from Host subdomain) */
router.post(
  "/login",
  resolveTenantFromHost,
  zodValidationMiddleware(loginSchema),
  login,
);
/** Refresh/logout read tokens from HttpOnly cookies (body optional for Postman/scripts). */
router.post("/refresh", resolveTenantFromHost, refresh);
router.post("/logout", resolveTenantFromHost, logout);

/** Protected: only owner or admin can add staff */
router.post(
  "/users",
  resolveTenantFromHost,
  authenticationMiddleware,
  authorize(["owner", "admin"]),
  zodValidationMiddleware(createStaffSchema),
  createStaff,
);

export default router;
