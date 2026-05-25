import { Router } from "express";
import { authenticationMiddleware } from "@/core/middleware/authentication.middleware";
import { tenantResolver } from "@/core/middleware/tenantResolver.middleware";
import { zodValidationMiddleware } from "@/core/middleware/zodValidation.middleware";
import {
  createFaq,
  deleteFaq,
  getFaqById,
  listFaqs,
  updateFaq,
  listFaqsForPublic,
} from "../controllers/faq.controller";
import {
  createFaqSchema,
  faqIdParamSchema,
  faqPaginationSchema,
  updateFaqSchema,
} from "../validation/faq.validation";

const router = Router();

router.get(
  "/public",
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(faqPaginationSchema, "query"),
  listFaqsForPublic,
);

router.get(
  "/",
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(faqPaginationSchema, "query"),
  listFaqs,
);

router.get(
  "/:id",
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(faqIdParamSchema, "params"),
  getFaqById,
);

router.post(
  "/",
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(createFaqSchema),
  createFaq,
);

router.patch(
  "/:id",
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(faqIdParamSchema, "params"),
  zodValidationMiddleware(updateFaqSchema),
  updateFaq,
);

router.delete(
  "/:id",
  authenticationMiddleware,
  tenantResolver,
  zodValidationMiddleware(faqIdParamSchema, "params"),
  deleteFaq,
);

export default router;
