import { ErrorCodes } from "@/core/constants/errorCodes";
import { HttpStatus } from "@/core/constants/httpStatus";
import { HttpException } from "@/core/exceptions/httpException";
import {
  buildPaginatedResult,
  parsePagination,
} from "@/core/helper/pagination_helper";
import { PaginatedResult } from "@/core/types/common.types";
import { Faq } from "../models/faq.model";
import * as faqRepository from "../repositories/faq.repository";
import {
  CreateFaqInput,
  FaqPaginationInput,
  UpdateFaqInput,
} from "../validation/faq.validation";

export const createFaq = async (
  tenantId: string,
  dto: CreateFaqInput,
): Promise<Faq> => {
  return faqRepository.createFaq(tenantId, dto);
};

export const listFaqs = async (
  tenantId: string,
  query: FaqPaginationInput,
): Promise<PaginatedResult<Faq>> => {
  const { page, limit, offset } = parsePagination(query);
  const { items, total } = await faqRepository.findFaqsPaginated(
    tenantId,
    limit,
    offset,
  );

  return buildPaginatedResult(items, total, page, limit);
};

export const listFaqsForPublic = async (
  tenantId: string,
  query: FaqPaginationInput,
): Promise<PaginatedResult<Faq>> => {
  const { page, limit, offset } = parsePagination(query);
  const { items, total } = await faqRepository.findFaqsPaginated(
    tenantId,
    limit,
    offset,
  );

  return buildPaginatedResult(items, total, page, limit);
};

export const getFaqById = async (
  tenantId: string,
  id: string,
): Promise<Faq> => {
  const faq = await faqRepository.findFaqById(tenantId, id);

  if (!faq) {
    throw new HttpException(
      "FAQ not found",
      HttpStatus.NOT_FOUND,
      ErrorCodes.FAQ_NOT_FOUND,
    );
  }

  return faq;
};

export const updateFaq = async (
  tenantId: string,
  id: string,
  dto: UpdateFaqInput,
): Promise<Faq> => {
  const faq = await faqRepository.updateFaq(tenantId, id, dto);

  if (!faq) {
    throw new HttpException(
      "FAQ not found",
      HttpStatus.NOT_FOUND,
      ErrorCodes.FAQ_NOT_FOUND,
    );
  }

  return faq;
};

export const deleteFaq = async (
  tenantId: string,
  id: string,
): Promise<{ deleted: true }> => {
  const deleted = await faqRepository.deleteFaq(tenantId, id);

  if (!deleted) {
    throw new HttpException(
      "FAQ not found",
      HttpStatus.NOT_FOUND,
      ErrorCodes.FAQ_NOT_FOUND,
    );
  }

  return { deleted: true };
};
