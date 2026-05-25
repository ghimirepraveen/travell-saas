import * as authRepository from "../repositories/auth.repository";
import { signAccessToken } from "@/core/utils/jwt";
import { HttpException } from "@/core/exceptions/httpException";
import { HttpStatus } from "@/core/constants/httpStatus";
import { ErrorCodes } from "@/core/constants/errorCodes";
import * as mailService from "@/core/services/mail.service";
import { logger } from "@/core/utils/logger.util";
import {
  generateOpaqueRefreshToken,
  sha256Hex,
} from "@/core/utils/tokenEncryption.util";
import {
  getActiveTenantName,
  getTenantSlugById,
} from "@/core/services/tenantResolver.service";
import { buildAgencyLoginUrl } from "@/core/helper/tenantUrl.helper";

type AuthUser = { id: string; email: string; role: string; tenantId: string };

const issueAuthPair = async (tenantId: string, user: AuthUser) => {
  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    tenantId: user.tenantId,
  });
  const refreshToken = generateOpaqueRefreshToken();
  await authRepository.insertRefreshToken(tenantId, user.id, refreshToken);
  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    },
    token: accessToken,
    refreshToken,
  } as const;
};

const assertEmailAvailable = async (
  tenantId: string,
  email: string,
): Promise<void> => {
  const existing = await authRepository.findUserByEmail(tenantId, email);
  if (existing) {
    throw new HttpException(
      "Email already registered",
      HttpStatus.CONFLICT,
      ErrorCodes.VALIDATION_ERROR,
    );
  }
};

/** Insert staff row only (no tokens). */
export const createStaffUser = async (
  tenantId: string,
  email: string,
  password: string,
  fullName?: string,
  role = "agent",
): Promise<{
  id: string;
  email: string;
  fullName: string | null;
  role: string;
}> => {
  if (role === "owner") {
    throw new HttpException(
      "Owner accounts are created only when provisioning a new agency",
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR,
    );
  }

  await getActiveTenantName(tenantId);
  await assertEmailAvailable(tenantId, email);
  return authRepository.registerUser(tenantId, email, password, fullName, role);
};

/** First owner when platform creates a tenant. */
export const createTenantOwner = async (
  tenantId: string,
  email: string,
  password: string,
  fullName?: string,
) => {
  await assertEmailAvailable(tenantId, email);
  return authRepository.registerUser(
    tenantId,
    email,
    password,
    fullName,
    "owner",
  );
};

/** Owner or admin adds staff (protected route). */
export const createStaffByAdmin = async (
  tenantId: string,
  email: string,
  password: string,
  fullName?: string,
  role?: string,
) => {
  const agencyName = await getActiveTenantName(tenantId);
  const slug = await getTenantSlugById(tenantId);
  const loginUrl = buildAgencyLoginUrl(slug);

  const user = await createStaffUser(
    tenantId,
    email,
    password,
    fullName,
    role ?? "agent",
  );

  void mailService
    .sendStaffInviteEmail({
      to: email,
      fullName: fullName ?? null,
      agencyName,
      loginUrl,
    })
    .catch((err) => {
      logger.error("Staff invite email failed", {
        email,
        error: err instanceof Error ? err.message : String(err),
      });
    });

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    loginUrl,
  };
};

export const loginUser = async (
  tenantId: string,
  email: string,
  password: string,
) => {
  await getActiveTenantName(tenantId);
  const user = await authRepository.validateUserCredentials(
    tenantId,
    email,
    password,
  );
  if (!user) {
    throw new HttpException(
      "Invalid credentials",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.UNAUTHORIZED,
    );
  }
  return issueAuthPair(tenantId, user);
};

export const refreshAccessToken = async (
  tenantId: string,
  refreshToken: string,
) => {
  await getActiveTenantName(tenantId);
  const lookupHash = sha256Hex(refreshToken);
  const row = await authRepository.findValidRefreshSessionByLookupHash(
    tenantId,
    lookupHash,
  );
  if (!row || !authRepository.verifyRefreshTokenRow(row, refreshToken)) {
    throw new HttpException(
      "Invalid or expired refresh token",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.REFRESH_TOKEN_INVALID,
    );
  }

  const dbUser = await authRepository.findUserById(tenantId, row.userId);
  if (!dbUser || dbUser.isActive !== "true") {
    await authRepository.revokeRefreshTokenByLookupHash(tenantId, lookupHash);
    throw new HttpException(
      "User no longer active",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.UNAUTHORIZED,
    );
  }

  await authRepository.revokeRefreshTokenByLookupHash(tenantId, lookupHash);

  return issueAuthPair(tenantId, {
    id: dbUser.id,
    email: dbUser.email,
    role: dbUser.role,
    tenantId,
  });
};

export const logoutWithRefreshToken = async (
  tenantId: string,
  refreshToken: string,
): Promise<void> => {
  await getActiveTenantName(tenantId);
  const lookupHash = sha256Hex(refreshToken);
  const row = await authRepository.findValidRefreshSessionByLookupHash(
    tenantId,
    lookupHash,
  );
  if (!row || !authRepository.verifyRefreshTokenRow(row, refreshToken)) {
    throw new HttpException(
      "Invalid refresh token",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.REFRESH_TOKEN_INVALID,
    );
  }
  await authRepository.revokeRefreshTokenByLookupHash(tenantId, lookupHash);
};
