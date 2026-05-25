import { Router } from "express";
import { authenticationMiddleware } from "@/core/middleware/authentication.middleware";
import { tenantResolver } from "@/core/middleware/tenantResolver.middleware";
import { zodValidationMiddleware } from "@/core/middleware/zodValidation.middleware";
import {
  createDestination,
  getDestinationById,
  listDestinations,
  listDestinationsForPublic,
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
  "/public",
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(destinationPaginationSchema, "query"),
  listDestinationsForPublic,
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

export default router;
