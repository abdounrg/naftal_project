import { Router } from 'express';
import { TpeController } from './tpe.controller';
import { authenticate } from '../../middleware/auth';
import { allRoles, dpeAndAbove, districtAndAbove } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import {
  createTpeSchema, updateTpeSchema, tpeListQuerySchema,
  createMaintenanceSchema, updateMaintenanceSchema,
  createReturnSchema, updateReturnSchema, createTransferSchema, updateTransferSchema, createReformSchema, updateReformSchema,
} from './tpe.validators';

const router = Router();

router.use(authenticate);

// ─── Stock ───
router.get('/stock', allRoles, validate(tpeListQuerySchema, 'query'), TpeController.list);
router.get('/stock/by-structure/:code', allRoles, TpeController.listByStructure);
router.get('/stock/:id', allRoles, TpeController.getById);
router.post('/stock', dpeAndAbove, validate(createTpeSchema), TpeController.create);
router.put('/stock/:id', dpeAndAbove, validate(updateTpeSchema), TpeController.update);
router.delete('/stock/:id', dpeAndAbove, TpeController.delete);

// ─── Maintenance ───
router.get('/maintenance', allRoles, TpeController.listMaintenance);
router.get('/maintenance/problem-types', allRoles, TpeController.getDistinctProblemTypes);
router.post('/maintenance', districtAndAbove, validate(createMaintenanceSchema), TpeController.createMaintenance);
router.put('/maintenance/:id', districtAndAbove, validate(updateMaintenanceSchema), TpeController.updateMaintenance);
router.delete('/maintenance/:id', districtAndAbove, TpeController.deleteMaintenance);

// ─── Returns ───
router.get('/returns', allRoles, TpeController.listReturns);
router.post('/returns', districtAndAbove, validate(createReturnSchema), TpeController.createReturn);
router.put('/returns/:id', districtAndAbove, validate(updateReturnSchema), TpeController.updateReturn);
router.delete('/returns/:id', districtAndAbove, TpeController.deleteReturn);

// ─── Transfers ───
router.get('/transfers', allRoles, TpeController.listTransfers);
router.post('/transfers', dpeAndAbove, validate(createTransferSchema), TpeController.createTransfer);
router.put('/transfers/:id', dpeAndAbove, validate(updateTransferSchema), TpeController.updateTransfer);
router.delete('/transfers/:id', dpeAndAbove, TpeController.deleteTransfer);

// ─── Reform ───
router.get('/reforms', allRoles, TpeController.listReforms);
router.post('/reforms', dpeAndAbove, validate(createReformSchema), TpeController.createReform);
router.put('/reforms/:id', dpeAndAbove, validate(updateReformSchema), TpeController.updateReform);
router.delete('/reforms/:id', dpeAndAbove, TpeController.deleteReform);

export { router as tpeRoutes };
