import { Router } from 'express';
import { AuditLogsController } from './audit-logs.controller';
import { authenticate } from '../../middleware/auth';
import { adminOnly } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { listAuditLogsQuerySchema } from './audit-logs.validators';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/', validate(listAuditLogsQuerySchema, 'query'), AuditLogsController.list);
router.get('/stats', AuditLogsController.getStats);
router.get('/recent-logins', AuditLogsController.getRecentLogins);
router.get('/:id', AuditLogsController.getById);

export { router as auditLogsRoutes };
