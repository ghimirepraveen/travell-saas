import { envConfig } from '../config/env.config';

/** Frontend login URL for an agency subdomain, e.g. http://himalayan-tours.localhost:5173/login */
export const buildAgencyLoginUrl = (slug: string): string => {
  const { tenancy } = envConfig;
  const protocol = tenancy.appProtocol;
  const port = tenancy.appPort ? `:${tenancy.appPort}` : '';
  return `${protocol}://${slug}.${tenancy.platformRootDomain}${port}/login`;
};
