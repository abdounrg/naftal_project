import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/auth';
import { allRoles } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { requirePermission } from '../../middleware/requirePermission';
import { dashboardQuerySchema } from './dashboard.validators';

const router = Router();

// Public stats for the landing page (no auth required).
router.get('/public-stats', DashboardController.getPublicStats);

router.use(authenticate, allRoles, requirePermission('dashboard', 'view'));

router.get('/stats', validate(dashboardQuerySchema, 'query'), DashboardController.getStats);
router.get('/distribution', validate(dashboardQuerySchema, 'query'), DashboardController.getDistribution);
router.get('/stations-without-tpe', validate(dashboardQuerySchema, 'query'), DashboardController.getStationsWithoutTpe);

export { router as dashboardRoutes };
