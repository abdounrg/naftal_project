import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/auth';
import { allRoles } from '../../middleware/rbac';

const router = Router();

router.use(authenticate, allRoles);

router.get('/stats', DashboardController.getStats);
router.get('/distribution', DashboardController.getDistribution);

export { router as dashboardRoutes };
