import { Router } from 'express';
import { CardsController } from './cards.controller';
import { authenticate } from '../../middleware/auth';
import { allRoles, dpeAndAbove, districtAndAbove } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createCardSchema, updateCardSchema, cardListQuerySchema, createCardMonitoringSchema, updateCardMonitoringSchema, createCardTransferSchema } from './cards.validators';

const router = Router();

router.use(authenticate);

// Stock
router.get('/stock', allRoles, validate(cardListQuerySchema, 'query'), CardsController.list);
router.get('/stock/:id', allRoles, CardsController.getById);
router.post('/stock', dpeAndAbove, validate(createCardSchema), CardsController.create);
router.put('/stock/:id', dpeAndAbove, validate(updateCardSchema), CardsController.update);
router.delete('/stock/:id', dpeAndAbove, CardsController.delete);

// Circulation
router.get('/circulation', allRoles, validate(cardListQuerySchema, 'query'), CardsController.circulation);

// Monitoring
router.get('/monitoring', allRoles, CardsController.listMonitoring);
router.post('/monitoring', districtAndAbove, validate(createCardMonitoringSchema), CardsController.createMonitoring);
router.put('/monitoring/:id', districtAndAbove, validate(updateCardMonitoringSchema), CardsController.updateMonitoring);

// Transfers
router.get('/transfers', allRoles, CardsController.listTransfers);
router.post('/transfers', dpeAndAbove, validate(createCardTransferSchema), CardsController.createTransfer);

export { router as cardsRoutes };
