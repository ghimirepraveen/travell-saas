import { PaginatedResult } from "@/core/types/common.types";
import {
  buildPaginatedResult,
  parsePagination,
} from "@/core/helper/pagination_helper";
import { HttpException } from "@/core/exceptions/httpException";
import { HttpStatus } from "@/core/constants/httpStatus";
import { ErrorCodes } from "@/core/constants/errorCodes";
import * as destinationRepository from "../repositories/destination.repository";
import { Destination } from "../models/destination.model";
import {
  CreateDestinationInput,
  DestinationPaginationInput,
  UpdateDestinationInput,
} from "../validation/destination.validation";

export const createDestination = async (
  tenantId: string,
  dto: CreateDestinationInput,
): Promise<Destination> => {
  return destinationRepository.createDestination(tenantId, dto);
};

export const listDestinations = async (
  tenantId: string,
  query: DestinationPaginationInput,
): Promise<PaginatedResult<Destination>> => {
  const { page, limit, offset } = parsePagination(query);
  const { items, total } = await destinationRepository.findDestinationsPaginated(
    tenantId,
    limit,
    offset,
  );

  return buildPaginatedResult(items, total, page, limit);
};

export const getDestinationById = async (
  tenantId: string,
  id: string,
): Promise<Destination> => {
  const destination = await destinationRepository.findDestinationById(tenantId, id);

  if (!destination) {
    throw new HttpException(
      "Destination not found",
      HttpStatus.NOT_FOUND,
      ErrorCodes.DESTINATION_NOT_FOUND,
    );
  }

  return destination;
};

export const updateDestination = async (
  tenantId: string,
  id: string,
  dto: UpdateDestinationInput,
): Promise<Destination> => {
  const destination = await destinationRepository.updateDestination(tenantId, id, dto);

  if (!destination) {
    throw new HttpException(
      "Destination not found",
      HttpStatus.NOT_FOUND,
      ErrorCodes.DESTINATION_NOT_FOUND,
    );
  }

  return destination;
};

export const deleteDestination = async (
  tenantId: string,
  id: string,
): Promise<{ deleted: true }> => {
  const deleted = await destinationRepository.deleteDestination(tenantId, id);

  if (!deleted) {
    throw new HttpException(
      "Destination not found",
      HttpStatus.NOT_FOUND,
      ErrorCodes.DESTINATION_NOT_FOUND,
    );
  }

  return { deleted: true };
};
