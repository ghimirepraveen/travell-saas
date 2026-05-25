import { Request, Response } from "express";
import { HttpStatus } from "@/core/constants/httpStatus";
import { asyncHandler } from "@/core/middleware/errorHandler.middleware";
import { sendResponse } from "@/core/utils/response.util";
import * as destinationService from "../services/destination.service";
import { DestinationPaginationInput } from "../validation/destination.validation";

export const createDestination = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const destination = await destinationService.createDestination(req.tenantId!, req.body);
    sendResponse(res, destination, HttpStatus.CREATED);
  },
);

export const listDestinations = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const destinations = await destinationService.listDestinations(
      req.tenantId!,
      req.query as unknown as DestinationPaginationInput,
    );
    sendResponse(res, destinations);
  },
);

export const getDestinationById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const destination = await destinationService.getDestinationById(
      req.tenantId!,
      String(req.params.id),
    );
    sendResponse(res, destination);
  },
);

export const updateDestination = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const destination = await destinationService.updateDestination(
      req.tenantId!,
      String(req.params.id),
      req.body,
    );
    sendResponse(res, destination);
  },
);

export const deleteDestination = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await destinationService.deleteDestination(
      req.tenantId!,
      String(req.params.id),
    );
    sendResponse(res, result);
  },
);
