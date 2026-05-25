import { Request, Response } from "express";
import { HttpStatus } from "@/core/constants/httpStatus";
import { asyncHandler } from "@/core/middleware/errorHandler.middleware";
import { sendResponse } from "@/core/utils/response.util";
import * as packageEnquiryService from "../services/packageEnquery.service";
import { PackageEnquiryPaginationInput } from "../validation/packageEnquery.validation";

export const createPackageEnquiry = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const enquiry = await packageEnquiryService.createPackageEnquiry(
      req.tenantId!,
      req.body,
    );
    sendResponse(res, enquiry, HttpStatus.CREATED);
  },
);

export const listPackageEnquiries = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const enquiries = await packageEnquiryService.listPackageEnquiries(
      req.tenantId!,
      req.query as unknown as PackageEnquiryPaginationInput,
    );
    sendResponse(res, enquiries);
  },
);

export const getPackageEnquiryById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const enquiry = await packageEnquiryService.getPackageEnquiryById(
      req.tenantId!,
      String(req.params.id),
    );
    sendResponse(res, enquiry);
  },
);

export const updatePackageEnquiry = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const enquiry = await packageEnquiryService.updatePackageEnquiry(
      req.tenantId!,
      String(req.params.id),
      req.body,
    );
    sendResponse(res, enquiry);
  },
);

export const deletePackageEnquiry = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await packageEnquiryService.deletePackageEnquiry(
      req.tenantId!,
      String(req.params.id),
    );
    sendResponse(res, result);
  },
);
