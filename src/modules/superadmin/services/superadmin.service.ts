import * as superadminRepository from '../repositories/superadmin.repository';
import { signAccessToken } from '@/core/utils/jwt';
import { HttpException } from '@/core/exceptions/httpException';
import { HttpStatus } from '@/core/constants/httpStatus';
import { ErrorCodes } from '@/core/constants/errorCodes';

export const registerSuperadmin = async (
  email: string,
  password: string,
  fullName?: string
) => {
  const existing = await superadminRepository.findSuperadminByEmail(email);
  if (existing) {
    throw new HttpException(
      'Email already registered',
      HttpStatus.CONFLICT,
      ErrorCodes.VALIDATION_ERROR
    );
  }
  return superadminRepository.registerSuperadmin(email, password, fullName);
};

export const loginSuperadmin = async (email: string, password: string) => {
  const admin = await superadminRepository.validateSuperadminCredentials(email, password);
  if (!admin) {
    throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED, ErrorCodes.UNAUTHORIZED);
  }
  const accessToken = signAccessToken({ sub: admin.id, role: admin.role });
  return { user: admin, token: accessToken } as const;
};
