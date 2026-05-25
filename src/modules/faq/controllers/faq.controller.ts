import { Request, Response } from "express";
import { HttpStatus } from "@/core/constants/httpStatus";
import { asyncHandler } from "@/core/middleware/errorHandler.middleware";
import { sendResponse } from "@/core/utils/response.util";
import * as faqService from "../services/faq.service";
import { FaqPaginationInput } from "../validation/faq.validation";

export const createFaq = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const faq = await faqService.createFaq(req.tenantId!, req.body);
    sendResponse(res, faq, HttpStatus.CREATED);
  },
);

export const listFaqs = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const faqs = await faqService.listFaqs(
      req.tenantId!,
      req.query as unknown as FaqPaginationInput,
    );
    sendResponse(res, faqs);
  },
);

export const listFaqsForPublic = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const faqs = await faqService.listFaqsForPublic(
      req.tenantId!,
      req.query as unknown as FaqPaginationInput,
    );
    sendResponse(res, faqs);
  },
);

export const getFaqById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const faq = await faqService.getFaqById(
      req.tenantId!,
      String(req.params.id),
    );
    sendResponse(res, faq);
  },
);

export const updateFaq = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const faq = await faqService.updateFaq(
      req.tenantId!,
      String(req.params.id),
      req.body,
    );
    sendResponse(res, faq);
  },
);

export const deleteFaq = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await faqService.deleteFaq(
      req.tenantId!,
      String(req.params.id),
    );
    sendResponse(res, result);
  },
);
