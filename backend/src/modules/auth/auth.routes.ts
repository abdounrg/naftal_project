import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { authRateLimiter, refreshRateLimiter, publicContactRateLimiter } from '../../middleware/rateLimiter';
import { loginSchema, refreshSchema, changePasswordSchema, loginSupportRequestSchema } from './auth.validators';

const router = Router();

router.post('/login', authRateLimiter, validate(loginSchema), AuthController.login);
router.post('/refresh', refreshRateLimiter, validate(refreshSchema), AuthController.refresh);
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.me);
router.post('/change-password', authenticate, validate(changePasswordSchema), AuthController.changePassword);
router.post('/login-support-request', publicContactRateLimiter, validate(loginSupportRequestSchema), AuthController.createLoginSupportRequest);
router.put('/avatar', authenticate, AuthController.updateAvatar);
router.delete('/avatar', authenticate, AuthController.removeAvatar);

export { router as authRoutes };
