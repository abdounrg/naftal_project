import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { authRateLimiter } from '../../middleware/rateLimiter';
import { loginSchema, refreshSchema, loginSupportRequestSchema } from './auth.validators';

const router = Router();

router.post('/login', authRateLimiter, validate(loginSchema), AuthController.login);
router.post('/refresh', validate(refreshSchema), AuthController.refresh);
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.me);
router.post('/login-support-request', validate(loginSupportRequestSchema), AuthController.createLoginSupportRequest);

export { router as authRoutes };
