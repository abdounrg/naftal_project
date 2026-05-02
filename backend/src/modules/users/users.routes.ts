import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../../middleware/auth';
import { adminOnly } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { requirePermission } from '../../middleware/requirePermission';
import { createUserSchema, updateUserSchema, userListQuerySchema } from './users.validators';

const router = Router();

// Self-service: any authenticated user may submit a new-user request (creates pending account).
router.post('/', authenticate, validate(createUserSchema), UsersController.create);

// All other routes require admin AND the granular users permission.
router.use(authenticate, adminOnly);

router.get('/', requirePermission('users', 'view'), validate(userListQuerySchema, 'query'), UsersController.list);
router.get('/pending/list', requirePermission('users', 'view'), validate(userListQuerySchema, 'query'), UsersController.listPending);
router.get('/:id', requirePermission('users', 'view'), UsersController.getById);
router.put('/:id', requirePermission('users', 'edit'), validate(updateUserSchema), UsersController.update);
router.delete('/:id', requirePermission('users', 'delete'), UsersController.delete);
router.post('/:id/approve', requirePermission('users', 'edit'), UsersController.approveUser);
router.post('/:id/reject', requirePermission('users', 'delete'), UsersController.rejectUser);
router.get('/:id/permissions', requirePermission('users', 'view'), UsersController.getPermissions);
router.put('/:id/permissions', requirePermission('users', 'edit'), UsersController.updatePermissions);

export { router as usersRoutes };
