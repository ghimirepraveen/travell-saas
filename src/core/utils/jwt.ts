import jwt, { SignOptions } from "jsonwebtoken";
import { envConfig } from "../config/env.config";

export interface JwtPayload {
  sub: string;
  role: string;
  tenantId?: string;
}

export const signAccessToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: envConfig.jwt.expiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, envConfig.jwt.secret, options);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, envConfig.jwt.secret) as JwtPayload;
};
