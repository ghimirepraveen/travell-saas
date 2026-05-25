import * as tenantRepository from "../repositories/tenant.repository";
import * as authService from "@/modules/auth/services/auth.service";
import * as mailService from "@/core/services/mail.service";
import { CreateTenantInput } from '../validation/tenant.validation';
import { TenantRecord } from "@/core/types/tenant.types";
import { HttpException } from "@/core/exceptions/httpException";
import { HttpStatus } from "@/core/constants/httpStatus";
import { ErrorCodes } from "@/core/constants/errorCodes";
import { buildAgencyLoginUrl } from "@/core/helper/tenantUrl.helper";
import { logger } from "@/core/utils/logger.util";

export type CreateTenantResult = {
  tenant: TenantRecord;
  owner: { id: string; email: string; fullName: string | null; role: string };
  loginUrl: string;
  ownerEmailSent: boolean;
};

export const createTenant = async (
  dto: CreateTenantInput,
): Promise<CreateTenantResult> => {
  const tenant = await tenantRepository.createTenant(dto);
  const loginUrl = buildAgencyLoginUrl(dto.slug);

  try {
    const owner = await authService.createTenantOwner(
      tenant.id,
      dto.owner.email,
      dto.owner.password,
      dto.owner.fullName,
    );
    let ownerEmailSent = false;
    try {
      const mailResult = await mailService.sendOwnerOnboardingEmail({
        to: dto.owner.email,
        fullName: dto.owner.fullName ?? null,
        agencyName: dto.name,
        loginUrl,
        email: dto.owner.email,
        temporaryPassword: dto.owner.password,
      });
      ownerEmailSent = mailResult.sent;
    } catch (err) {
      logger.error("Owner onboarding email failed", {
        tenantId: tenant.id,
        email: dto.owner.email,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    return {
      tenant,
      owner: {
        id: owner.id,
        email: owner.email,
        fullName: owner.fullName,
        role: owner.role,
      },
      loginUrl,
      ownerEmailSent,
    };
  } catch (error) {
    await tenantRepository.deleteTenantById(tenant.id);
    if (error instanceof HttpException) {
      throw error;
    }
    logger.error('Failed to create agency owner account', {
      tenantId: tenant.id,
      email: dto.owner.email,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new HttpException(
      'Failed to create agency owner account',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
    );
  }
};

export const listTenants = async (): Promise<TenantRecord[]> => {
  return tenantRepository.findAllTenants();
};

export const getTenantById = async (id: string): Promise<TenantRecord> => {
  const tenant = await tenantRepository.findTenantById(id);
  if (!tenant) {
    throw new HttpException(
      "Tenant not found",
      HttpStatus.NOT_FOUND,
      ErrorCodes.TENANT_NOT_FOUND,
    );
  }
  return tenant;
};
