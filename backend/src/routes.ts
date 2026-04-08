import { Router } from 'express';
import { authRoutes } from './modules/auth/auth.routes';
import { usersRoutes } from './modules/users/users.routes';
import { structuresRoutes } from './modules/structures/structures.routes';
import { tpeRoutes } from './modules/tpe/tpe.routes';
import { chargersRoutes } from './modules/chargers/chargers.routes';
import { cardsRoutes } from './modules/cards/cards.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { auditLogsRoutes } from './modules/audit-logs/audit-logs.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', usersRoutes);
apiRouter.use('/org', structuresRoutes);
apiRouter.use('/tpe', tpeRoutes);
apiRouter.use('/chargers', chargersRoutes);
apiRouter.use('/cards', cardsRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/audit-logs', auditLogsRoutes);

export { apiRouter };
