import { ErrorCodes } from "@/core/constants/errorCodes";
import { HttpStatus } from "@/core/constants/httpStatus";
import { HttpException } from "@/core/exceptions/httpException";
import {
  buildPaginatedResult,
  parsePagination,
} from "@/core/helper/pagination_helper";
import { PaginatedResult } from "@/core/types/common.types";
import { TravelPackage } from "../models/package.model";
import * as packageRepository from "../repositories/package.repository";
import {
  CreatePackageInput,
  PackagePaginationInput,
  UpdatePackageInput,
} from "../validation/package.validation";

const createSlugBase = (title: string): string => {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "package";
};

const generateUniqueSlug = async (
  tenantId: string,
  title: string,
): Promise<string> => {
  const baseSlug = createSlugBase(title);
  let slug = baseSlug.slice(0, 150);
  let suffix = 1;

  while (await packageRepository.findPackageBySlug(tenantId, slug)) {
    const suffixText = `-${suffix}`;
    slug = `${baseSlug.slice(0, 150 - suffixText.length)}${suffixText}`;
    suffix += 1;
  }

  return slug;
};

const ensureDestinationExists = async (
  tenantId: string,
  destinationId: string,
): Promise<void> => {
  const exists = await packageRepository.destinationExists(
    tenantId,
    destinationId,
  );

  if (!exists) {
    throw new HttpException(
      "Destination not found",
      HttpStatus.NOT_FOUND,
      ErrorCodes.DESTINATION_NOT_FOUND,
    );
  }
};

export const createPackage = async (
  tenantId: string,
  dto: CreatePackageInput,
): Promise<TravelPackage> => {
  await ensureDestinationExists(tenantId, dto.destinationId);
  const slug = await generateUniqueSlug(tenantId, dto.title);
  return packageRepository.createPackage(tenantId, dto, slug);
};

export const listPackages = async (
  tenantId: string,
  query: PackagePaginationInput,
): Promise<PaginatedResult<TravelPackage>> => {
  const { page, limit, offset } = parsePagination(query);
  const { items, total } =
    await packageRepository.findPackagesPaginatedForPublic(
      tenantId,
      limit,
      offset,
    );

  return buildPaginatedResult(items, total, page, limit);
};

export const listFeaturedPackages = async (
  tenantId: string,
  query: PackagePaginationInput,
): Promise<PaginatedResult<TravelPackage>> => {
  const { page, limit, offset } = parsePagination(query);
  const { items, total } =
    await packageRepository.findPackagesPaginatedForFeatured(
      tenantId,
      limit,
      offset,
    );

  return buildPaginatedResult(items, total, page, limit);
};

export const listPackagesForPublic = async (
  tenantId: string,
  query: PackagePaginationInput,
): Promise<PaginatedResult<TravelPackage>> => {
  const { page, limit, offset } = parsePagination(query);

  const { items, total } =
    await packageRepository.findPackagesPaginatedForPublic(
      tenantId,
      limit,
      offset,
    );

  return buildPaginatedResult(items, total, page, limit);
};

export const getPackageById = async (
  tenantId: string,
  id: string,
): Promise<TravelPackage> => {
  const pkg = await packageRepository.findPackageById(tenantId, id);

  if (!pkg) {
    throw new HttpException(
      "Package not found",
      HttpStatus.NOT_FOUND,
      ErrorCodes.PACKAGE_NOT_FOUND,
    );
  }

  return pkg;
};

export const updatePackage = async (
  tenantId: string,
  id: string,
  dto: UpdatePackageInput,
): Promise<TravelPackage> => {
  if (dto.destinationId) {
    await ensureDestinationExists(tenantId, dto.destinationId);
  }

  const pkg = await packageRepository.updatePackage(tenantId, id, dto);

  if (!pkg) {
    throw new HttpException(
      "Package not found",
      HttpStatus.NOT_FOUND,
      ErrorCodes.PACKAGE_NOT_FOUND,
    );
  }

  return pkg;
};

export const deletePackage = async (
  tenantId: string,
  id: string,
): Promise<{ deleted: true }> => {
  const deleted = await packageRepository.deletePackage(tenantId, id);

  if (!deleted) {
    throw new HttpException(
      "Package not found",
      HttpStatus.NOT_FOUND,
      ErrorCodes.PACKAGE_NOT_FOUND,
    );
  }

  return { deleted: true };
};
