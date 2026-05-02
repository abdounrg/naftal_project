import { Router } from 'express';
import { TpeController } from './tpe.controller';
import { authenticate } from '../../middleware/auth';
import { allRoles, dpeAndAbove, districtAndAbove } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { requirePermission } from '../../middleware/requirePermission';
import {
  createTpeSchema, updateTpeSchema, tpeListQuerySchema,
  createMaintenanceSchema, updateMaintenanceSchema,
  createReturnSchema, updateReturnSchema, createTransferSchema, updateTransferSchema, createReformSchema, updateReformSchema,
} from './tpe.validators';

const router = Router();

router.use(authenticate);

// ─── Stock ───
router.get('/stock', allRoles, requirePermission('tpe_stock', 'view'), validate(tpeListQuerySchema, 'query'), TpeController.list);
router.get('/stock/by-structure/:code', allRoles, requirePermission('tpe_stock', 'view'), TpeController.listByStructure);
router.get('/stock/:id', allRoles, requirePermission('tpe_stock', 'view'), TpeController.getById);
router.post('/stock', dpeAndAbove, requirePermission('tpe_stock', 'create'), validate(createTpeSchema), TpeController.create);
router.put('/stock/:id', dpeAndAbove, requirePermission('tpe_stock', 'edit'), validate(updateTpeSchema), TpeController.update);
router.delete('/stock/:id', dpeAndAbove, requirePermission('tpe_stock', 'delete'), TpeController.delete);

// ─── Maintenance ───
router.get('/maintenance', allRoles, requirePermission('tpe_maintenance', 'view'), TpeController.listMaintenance);
router.get('/maintenance/problem-types', allRoles, requirePermission('tpe_maintenance', 'view'), TpeController.getDistinctProblemTypes);
router.post('/maintenance', districtAndAbove, requirePermission('tpe_maintenance', 'create'), validate(createMaintenanceSchema), TpeController.createMaintenance);
router.put('/maintenance/:id', districtAndAbove, requirePermission('tpe_maintenance', 'edit'), validate(updateMaintenanceSchema), TpeController.updateMaintenance);
router.delete('/maintenance/:id', districtAndAbove, requirePermission('tpe_maintenance', 'delete'), TpeController.deleteMaintenance);

// ─── Returns ───
router.get('/returns', allRoles, requirePermission('tpe_returns', 'view'), TpeController.listReturns);
router.post('/returns', districtAndAbove, requirePermission('tpe_returns', 'create'), validate(createReturnSchema), TpeController.createReturn);
router.put('/returns/:id', districtAndAbove, requirePermission('tpe_returns', 'edit'), validate(updateReturnSchema), TpeController.updateReturn);
router.delete('/returns/:id', districtAndAbove, requirePermission('tpe_returns', 'delete'), TpeController.deleteReturn);

// ─── Transfers ───
router.get('/transfers', allRoles, requirePermission('tpe_transfers', 'view'), TpeController.listTransfers);
router.post('/transfers', dpeAndAbove, requirePermission('tpe_transfers', 'create'), validate(createTransferSchema), TpeController.createTransfer);
router.put('/transfers/:id', dpeAndAbove, requirePermission('tpe_transfers', 'edit'), validate(updateTransferSchema), TpeController.updateTransfer);
router.delete('/transfers/:id', dpeAndAbove, requirePermission('tpe_transfers', 'delete'), TpeController.deleteTransfer);

// ─── Reform ───
router.get('/reforms', allRoles, requirePermission('tpe_reform', 'view'), TpeController.listReforms);
router.post('/reforms', dpeAndAbove, requirePermission('tpe_reform', 'create'), validate(createReformSchema), TpeController.createReform);
router.put('/reforms/:id', dpeAndAbove, requirePermission('tpe_reform', 'edit'), validate(updateReformSchema), TpeController.updateReform);
router.delete('/reforms/:id', dpeAndAbove, requirePermission('tpe_reform', 'delete'), TpeController.deleteReform);

export { router as tpeRoutes };
