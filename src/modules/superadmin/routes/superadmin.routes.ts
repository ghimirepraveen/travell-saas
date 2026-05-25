import { Router } from 'express';
import { register, login } from '../controllers/superadmin.controller';
import { zodValidationMiddleware } from '@/core/middleware/zodValidation.middleware';
import {
  superadminLoginSchema,
  superadminRegisterSchema,
} from '../validation/superadmin.validation';

const router = Router();

router.post('/register', zodValidationMiddleware(superadminRegisterSchema), register);
router.post('/login', zodValidationMiddleware(superadminLoginSchema), login);

export default router;
