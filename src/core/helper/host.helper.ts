/**
 * Extract tenant subdomain from Host header.
 * Examples (PLATFORM_ROOT_DOMAIN=localhost):
 *   himalayan-tours.localhost:3000 → himalayan-tours
 *   localhost:3000 → null
 *
 * Examples (PLATFORM_ROOT_DOMAIN=travelsaas.com):
 *   himalayan-tours.travelsaas.com → himalayan-tours
 */
export const extractSubdomainFromHost = (host: string, rootDomain: string): string | null => {
  const hostname = host.split(',')[0].trim().split(':')[0].toLowerCase();
  const root = rootDomain.split(':')[0].toLowerCase();

  if (!hostname || hostname === root) {
    return null;
  }

  const suffix = `.${root}`;
  if (!hostname.endsWith(suffix)) {
    return null;
  }

  const subdomain = hostname.slice(0, -suffix.length);
  if (!subdomain || subdomain.includes('.')) {
    return null;
  }

  return subdomain;
};

export const getRequestHost = (hostHeader: string | undefined): string => {
  return hostHeader?.split(',')[0].trim() ?? '';
};
