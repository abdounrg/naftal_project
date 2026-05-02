import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { adminOnly } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { NotificationsController } from './notifications.controller';
import {
  notificationListQuerySchema,
  supportRequestListQuerySchema,
  updateSupportRequestSchema,
} from './notifications.validators';

const router = Router();

router.use(authenticate);

router.get('/', validate(notificationListQuerySchema, 'query'), NotificationsController.listMine);
router.post('/read-all', NotificationsController.markAllRead);
router.post('/:id/read', NotificationsController.markRead);

router.get('/support-requests/list', adminOnly, validate(supportRequestListQuerySchema, 'query'), NotificationsController.listSupportRequests);
router.patch('/support-requests/:id', adminOnly, validate(updateSupportRequestSchema), NotificationsController.updateSupportRequest);

export { router as notificationsRoutes };
