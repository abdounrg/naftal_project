import { Router } from 'express';
import { ChargersController } from './chargers.controller';
import { authenticate } from '../../middleware/auth';
import { allRoles, dpeAndAbove } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createChargerSchema, updateChargerSchema, createBaseSchema, updateBaseSchema, createChargerTransferSchema } from './chargers.validators';

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

// Transfers
router.get('/transfers', allRoles, ChargersController.listTransfers);
router.post('/transfers', dpeAndAbove, validate(createChargerTransferSchema), ChargersController.createTransfer);

export { router as chargersRoutes };
