import { Router } from 'express';
import { ChargersController } from './chargers.controller';
import { authenticate } from '../../middleware/auth';
import { allRoles, dpeAndAbove } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createChargerSchema, updateChargerSchema, createBaseSchema, updateBaseSchema, createChargerTransferSchema, updateChargerTransferSchema } from './chargers.validators';

const router = Router();

router.use(authenticate);

// Charger stock
router.get('/stock', allRoles, ChargersController.listChargers);
router.post('/stock', dpeAndAbove, validate(createChargerSchema), ChargersController.createCharger);
router.put('/stock/:id', dpeAndAbove, validate(updateChargerSchema), ChargersController.updateCharger);
router.delete('/stock/:id', dpeAndAbove, ChargersController.deleteCharger);

// Bases
router.get('/bases', allRoles, ChargersController.listBases);
router.post('/bases', dpeAndAbove, validate(createBaseSchema), ChargersController.createBase);
router.put('/bases/:id', dpeAndAbove, validate(updateBaseSchema), ChargersController.updateBase);
router.delete('/bases/:id', dpeAndAbove, ChargersController.deleteBase);

// Transfers
router.get('/transfers', allRoles, ChargersController.listTransfers);
router.post('/transfers', dpeAndAbove, validate(createChargerTransferSchema), ChargersController.createTransfer);
router.put('/transfers/:id', dpeAndAbove, validate(updateChargerTransferSchema), ChargersController.updateTransfer);
router.delete('/transfers/:id', dpeAndAbove, ChargersController.deleteTransfer);

export { router as chargersRoutes };
