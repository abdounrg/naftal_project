import { Router } from 'express';
import { TpeController } from './tpe.controller';
import { authenticate } from '../../middleware/auth';
import { allRoles, dpeAndAbove, districtAndAbove } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import {
  createTpeSchema, updateTpeSchema, tpeListQuerySchema,
  createMaintenanceSchema, updateMaintenanceSchema,
  createReturnSchema, createTransferSchema, createReformSchema,
} from './tpe.validators';

const router = Router();

router.use(authenticate);

// ─── Stock ───
router.get('/stock', allRoles, validate(tpeListQuerySchema, 'query'), TpeController.list);
router.get('/stock/:id', allRoles, TpeController.getById);
router.post('/stock', dpeAndAbove, validate(createTpeSchema), TpeController.create);
router.put('/stock/:id', dpeAndAbove, validate(updateTpeSchema), TpeController.update);
router.delete('/stock/:id', dpeAndAbove, TpeController.delete);

// ─── Fleet ───
router.get('/fleet', allRoles, validate(tpeListQuerySchema, 'query'), TpeController.fleet);

// ─── Maintenance ───
router.get('/maintenance', allRoles, TpeController.listMaintenance);
router.post('/maintenance', districtAndAbove, validate(createMaintenanceSchema), TpeController.createMaintenance);
router.put('/maintenance/:id', districtAndAbove, validate(updateMaintenanceSchema), TpeController.updateMaintenance);

// ─── Returns ───
router.get('/returns', allRoles, TpeController.listReturns);
router.post('/returns', districtAndAbove, validate(createReturnSchema), TpeController.createReturn);

// ─── Transfers ───
router.get('/transfers', allRoles, TpeController.listTransfers);
router.post('/transfers', dpeAndAbove, validate(createTransferSchema), TpeController.createTransfer);

// ─── Reform ───
router.get('/reforms', allRoles, TpeController.listReforms);
router.post('/reforms', dpeAndAbove, validate(createReformSchema), TpeController.createReform);

export { router as tpeRoutes };
