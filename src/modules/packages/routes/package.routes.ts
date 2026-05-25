import { Router } from "express";
import { authenticationMiddleware } from "@/core/middleware/authentication.middleware";
import { tenantResolver } from "@/core/middleware/tenantResolver.middleware";
import { zodValidationMiddleware } from "@/core/middleware/zodValidation.middleware";
import {
  createPackage,
  getPackageById,
  listFeaturedPackages,
  listPackages,
  listPackagesForPublic,
  updatePackage,
} from "../controllers/package.controller";
import {
  createPackageSchema,
  packageIdParamSchema,
  packagePaginationSchema,
  updatePackageSchema,
} from "../validation/package.validation";

const router = Router();

router.get(
  "/",
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(packagePaginationSchema, "query"),
  listPackages,
);

router.get(
  "/public",
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(packagePaginationSchema, "query"),
  listPackagesForPublic,
);

router.get(
  "/featured",
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(packagePaginationSchema, "query"),
  listFeaturedPackages,
);

router.get(
  "/:id",
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(packageIdParamSchema, "params"),
  getPackageById,
);

router.post(
  "/",
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(createPackageSchema),
  createPackage,
);

router.patch(
  "/:id",
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(packageIdParamSchema, "params"),
  zodValidationMiddleware(updatePackageSchema),
  updatePackage,
);

export default router;
