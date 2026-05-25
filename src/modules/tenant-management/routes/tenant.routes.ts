import { Router } from 'express';
import { createTenant, listTenants, getTenantById } from '../controllers/tenant.controller';
import { zodValidationMiddleware } from '@/core/middleware/zodValidation.middleware';
import { createTenantSchema } from '../validation/tenant.validation';

const router = Router();

router.get('/', listTenants);
router.get('/:id', getTenantById);
router.post('/', zodValidationMiddleware(createTenantSchema), createTenant);

export default router;
