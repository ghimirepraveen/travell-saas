import { Router } from "express";
import { authenticationMiddleware } from "@/core/middleware/authentication.middleware";
import { tenantResolver } from "@/core/middleware/tenantResolver.middleware";
import { zodValidationMiddleware } from "@/core/middleware/zodValidation.middleware";
import {
  createDestination,
  deleteDestination,
  getDestinationById,
  listDestinations,
  updateDestination,
} from "../controllers/destination.controller";
import {
  createDestinationSchema,
  destinationIdParamSchema,
  destinationPaginationSchema,
  updateDestinationSchema,
} from "../validation/destination.validation";

const router = Router();

router.get(
  "/",
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(destinationPaginationSchema, "query"),
  listDestinations,
);

router.get(
  "/:id",
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(destinationIdParamSchema, "params"),
  getDestinationById,
);

router.post(
  "/",
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(createDestinationSchema),
  createDestination,
);

router.patch(
  "/:id",
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(destinationIdParamSchema, "params"),
  zodValidationMiddleware(updateDestinationSchema),
  updateDestination,
);

router.delete(
  "/:id",
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(destinationIdParamSchema, "params"),
  deleteDestination,
);

export default router;
