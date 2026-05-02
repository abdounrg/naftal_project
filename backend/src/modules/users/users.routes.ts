import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../../middleware/auth';
import { adminOnly } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createUserSchema, updateUserSchema, userListQuerySchema } from './users.validators';

const router = Router();

// Public request endpoint - allow authenticated users to request new users
router.post('/', authenticate, validate(createUserSchema), UsersController.create);

// All other routes require admin
router.use(authenticate, adminOnly);

router.get('/', validate(userListQuerySchema, 'query'), UsersController.list);
router.get('/pending/list', validate(userListQuerySchema, 'query'), UsersController.listPending);
router.get('/:id', UsersController.getById);
router.put('/:id', validate(updateUserSchema), UsersController.update);
router.delete('/:id', UsersController.delete);
router.post('/:id/approve', UsersController.approveUser);
router.post('/:id/reject', UsersController.rejectUser);
router.get('/:id/permissions', UsersController.getPermissions);
router.put('/:id/permissions', UsersController.updatePermissions);

export { router as usersRoutes };
