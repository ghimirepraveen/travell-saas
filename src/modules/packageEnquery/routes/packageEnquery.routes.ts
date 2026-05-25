import { Router } from "express";
import { authenticationMiddleware } from "@/core/middleware/authentication.middleware";
import { tenantResolver } from "@/core/middleware/tenantResolver.middleware";
import { zodValidationMiddleware } from "@/core/middleware/zodValidation.middleware";
import {
  createPackageEnquiry,
  deletePackageEnquiry,
  getPackageEnquiryById,
  listPackageEnquiries,
  updatePackageEnquiry,
} from "../controllers/packageEnquery.controller";
import {
  createPackageEnquirySchema,
  packageEnquiryIdParamSchema,
  packageEnquiryPaginationSchema,
  updatePackageEnquirySchema,
} from "../validation/packageEnquery.validation";

const router = Router();

router.get(
  "/",
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(packageEnquiryPaginationSchema, "query"),
  listPackageEnquiries,
);

router.get(
  "/:id",
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(packageEnquiryIdParamSchema, "params"),
  getPackageEnquiryById,
);

router.post(
  "/",
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(createPackageEnquirySchema),
  createPackageEnquiry,
);

router.patch(
  "/:id",
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(packageEnquiryIdParamSchema, "params"),
  zodValidationMiddleware(updatePackageEnquirySchema),
  updatePackageEnquiry,
);

router.delete(
  "/:id",
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(packageEnquiryIdParamSchema, "params"),
  deletePackageEnquiry,
);

export default router;
