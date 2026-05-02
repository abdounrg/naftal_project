import { Router } from 'express';
import { ChargersController } from './chargers.controller';
import { authenticate } from '../../middleware/auth';
import { allRoles, dpeAndAbove } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { requirePermission } from '../../middleware/requirePermission';
import { createChargerSchema, updateChargerSchema, createBaseSchema, updateBaseSchema, createChargerTransferSchema, updateChargerTransferSchema } from './chargers.validators';

const router = Router();

router.use(authenticate);

// Charger stock
router.get('/stock', allRoles, requirePermission('charger_stock', 'view'), ChargersController.listChargers);
router.post('/stock', dpeAndAbove, requirePermission('charger_stock', 'create'), validate(createChargerSchema), ChargersController.createCharger);
router.put('/stock/:id', dpeAndAbove, requirePermission('charger_stock', 'edit'), validate(updateChargerSchema), ChargersController.updateCharger);
router.delete('/stock/:id', dpeAndAbove, requirePermission('charger_stock', 'delete'), ChargersController.deleteCharger);

// Bases (treated as part of charger_stock)
router.get('/bases', allRoles, requirePermission('charger_stock', 'view'), ChargersController.listBases);
router.post('/bases', dpeAndAbove, requirePermission('charger_stock', 'create'), validate(createBaseSchema), ChargersController.createBase);
router.put('/bases/:id', dpeAndAbove, requirePermission('charger_stock', 'edit'), validate(updateBaseSchema), ChargersController.updateBase);
router.delete('/bases/:id', dpeAndAbove, requirePermission('charger_stock', 'delete'), ChargersController.deleteBase);

// Transfers
router.get('/transfers', allRoles, requirePermission('charger_transfers', 'view'), ChargersController.listTransfers);
router.post('/transfers', dpeAndAbove, requirePermission('charger_transfers', 'create'), validate(createChargerTransferSchema), ChargersController.createTransfer);
router.put('/transfers/:id', dpeAndAbove, requirePermission('charger_transfers', 'edit'), validate(updateChargerTransferSchema), ChargersController.updateTransfer);
router.delete('/transfers/:id', dpeAndAbove, requirePermission('charger_transfers', 'delete'), ChargersController.deleteTransfer);

export { router as chargersRoutes };
