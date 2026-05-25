import { ErrorCodes } from "@/core/constants/errorCodes";
import { HttpStatus } from "@/core/constants/httpStatus";
import { HttpException } from "@/core/exceptions/httpException";
import {
  buildPaginatedResult,
  parsePagination,
} from "@/core/helper/pagination_helper";
import { PaginatedResult } from "@/core/types/common.types";
import { PackageEnquiry } from "../models/packageEnquery.model";
import * as packageEnquiryRepository from "../repositories/packageEnquery.repository";
import {
  CreatePackageEnquiryInput,
  PackageEnquiryPaginationInput,
  UpdatePackageEnquiryInput,
} from "../validation/packageEnquery.validation";

export const createPackageEnquiry = async (
  tenantId: string,
  dto: CreatePackageEnquiryInput,
): Promise<PackageEnquiry> => {
  return packageEnquiryRepository.createPackageEnquiry(tenantId, dto);
};

export const listPackageEnquiries = async (
  tenantId: string,
  query: PackageEnquiryPaginationInput,
): Promise<PaginatedResult<PackageEnquiry>> => {
  const { page, limit, offset } = parsePagination(query);
  const { items, total } =
    await packageEnquiryRepository.findPackageEnquiriesPaginated(
      tenantId,
      limit,
      offset,
    );

  return buildPaginatedResult(items, total, page, limit);
};

export const getPackageEnquiryById = async (
  tenantId: string,
  id: string,
): Promise<PackageEnquiry> => {
  const enquiry = await packageEnquiryRepository.findPackageEnquiryById(
    tenantId,
    id,
  );

  if (!enquiry) {
    throw new HttpException(
      "Package enquiry not found",
      HttpStatus.NOT_FOUND,
      ErrorCodes.PACKAGE_ENQUIRY_NOT_FOUND,
    );
  }

  return enquiry;
};

export const updatePackageEnquiry = async (
  tenantId: string,
  id: string,
  dto: UpdatePackageEnquiryInput,
): Promise<PackageEnquiry> => {
  const enquiry = await packageEnquiryRepository.updatePackageEnquiry(
    tenantId,
    id,
    dto,
  );

  if (!enquiry) {
    throw new HttpException(
      "Package enquiry not found",
      HttpStatus.NOT_FOUND,
      ErrorCodes.PACKAGE_ENQUIRY_NOT_FOUND,
    );
  }

  return enquiry;
};

export const deletePackageEnquiry = async (
  tenantId: string,
  id: string,
): Promise<{ deleted: true }> => {
  const deleted = await packageEnquiryRepository.deletePackageEnquiry(
    tenantId,
    id,
  );

  if (!deleted) {
    throw new HttpException(
      "Package enquiry not found",
      HttpStatus.NOT_FOUND,
      ErrorCodes.PACKAGE_ENQUIRY_NOT_FOUND,
    );
  }

  return { deleted: true };
};
