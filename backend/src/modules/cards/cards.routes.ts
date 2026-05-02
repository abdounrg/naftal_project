import { Router } from 'express';
import { CardsController } from './cards.controller';
import { authenticate } from '../../middleware/auth';
import { allRoles, dpeAndAbove, districtAndAbove } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { requirePermission } from '../../middleware/requirePermission';
import { createCardSchema, updateCardSchema, cardListQuerySchema, createCardMonitoringSchema, updateCardMonitoringSchema, createCardTransferSchema, updateCardTransferSchema } from './cards.validators';

const router = Router();

router.use(authenticate);

// Stock
router.get('/stock', allRoles, requirePermission('card_stock', 'view'), validate(cardListQuerySchema, 'query'), CardsController.list);
router.get('/stock/:id', allRoles, requirePermission('card_stock', 'view'), CardsController.getById);
router.post('/stock', dpeAndAbove, requirePermission('card_stock', 'create'), validate(createCardSchema), CardsController.create);
router.put('/stock/:id', dpeAndAbove, requirePermission('card_stock', 'edit'), validate(updateCardSchema), CardsController.update);
router.delete('/stock/:id', dpeAndAbove, requirePermission('card_stock', 'delete'), CardsController.delete);

// Circulation
router.get('/circulation', allRoles, requirePermission('card_circulation', 'view'), validate(cardListQuerySchema, 'query'), CardsController.circulation);

// Monitoring
router.get('/monitoring', allRoles, requirePermission('card_monitoring', 'view'), CardsController.listMonitoring);
router.post('/monitoring', districtAndAbove, requirePermission('card_monitoring', 'edit'), validate(createCardMonitoringSchema), CardsController.createMonitoring);
router.put('/monitoring/:id', districtAndAbove, requirePermission('card_monitoring', 'edit'), validate(updateCardMonitoringSchema), CardsController.updateMonitoring);
router.delete('/monitoring/:id', districtAndAbove, requirePermission('card_monitoring', 'edit'), CardsController.deleteMonitoring);

// Transfers
router.get('/transfers', allRoles, requirePermission('card_transfers', 'view'), CardsController.listTransfers);
router.post('/transfers', dpeAndAbove, requirePermission('card_transfers', 'create'), validate(createCardTransferSchema), CardsController.createTransfer);
router.put('/transfers/:id', dpeAndAbove, requirePermission('card_transfers', 'edit'), validate(updateCardTransferSchema), CardsController.updateTransfer);
router.delete('/transfers/:id', dpeAndAbove, requirePermission('card_transfers', 'delete'), CardsController.deleteTransfer);

export { router as cardsRoutes };
