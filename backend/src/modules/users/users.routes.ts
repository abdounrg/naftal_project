import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../../middleware/auth';
import { adminOnly } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createUserSchema, updateUserSchema, userListQuerySchema } from './users.validators';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/', validate(userListQuerySchema, 'query'), UsersController.list);
router.get('/:id', UsersController.getById);
router.post('/', validate(createUserSchema), UsersController.create);
router.put('/:id', validate(updateUserSchema), UsersController.update);
router.delete('/:id', UsersController.delete);

export { router as usersRoutes };
