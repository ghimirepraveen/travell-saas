import { TenantRecord } from './tenant.types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        tenantId?: string;
      };
      tenant?: TenantRecord;
      tenantId?: string;
    }
  }
}

export {};
