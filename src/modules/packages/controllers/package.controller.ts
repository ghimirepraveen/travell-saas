import { Request, Response } from "express";
import { HttpStatus } from "@/core/constants/httpStatus";
import { asyncHandler } from "@/core/middleware/errorHandler.middleware";
import { sendResponse } from "@/core/utils/response.util";
import * as packageService from "../services/package.service";
import { PackagePaginationInput } from "../validation/package.validation";

export const createPackage = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const pkg = await packageService.createPackage(req.tenantId!, req.body);
    sendResponse(res, pkg, HttpStatus.CREATED);
  },
);

export const listPackages = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const packages = await packageService.listPackages(
      req.tenantId!,
      req.query as unknown as PackagePaginationInput,
    );
    sendResponse(res, packages);
  },
);

export const listPackagesForPublic = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const packages = await packageService.listPackagesForPublic(
      req.tenantId!,
      req.query as unknown as PackagePaginationInput,
    );
    sendResponse(res, packages);
  },
);

export const listFeaturedPackages = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const packages = await packageService.listFeaturedPackages(
      req.tenantId!,
      req.query as unknown as PackagePaginationInput,
    );
    sendResponse(res, packages);
  },
);

export const getPackageById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const pkg = await packageService.getPackageById(
      req.tenantId!,
      String(req.params.id),
    );
    sendResponse(res, pkg);
  },
);

export const updatePackage = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const pkg = await packageService.updatePackage(
      req.tenantId!,
      String(req.params.id),
      req.body,
    );
    sendResponse(res, pkg);
  },
);
