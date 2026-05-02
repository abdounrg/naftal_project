import { Router } from 'express';
import { StructuresController } from './structures.controller';
import { authenticate } from '../../middleware/auth';
import { allRoles } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { requirePermission } from '../../middleware/requirePermission';
import {
  createStructureSchema,
  updateStructureSchema,
  createStationSchema,
  updateStationSchema,
  listStructuresQuerySchema,
  listStationsQuerySchema,
} from './structures.validators';

const router = Router();

router.use(authenticate, allRoles);

// Districts (read-only org metadata, gated under structures.view)
router.get('/districts', requirePermission('structures', 'view'), StructuresController.listDistricts);
router.get('/districts/:id', requirePermission('structures', 'view'), StructuresController.getDistrict);

// Lookup by code — used by forms across the app, kept open to authenticated users
router.get('/structures/lookup/:code', StructuresController.lookupStructureByCode);
router.get('/stations/lookup/:code', StructuresController.lookupStationByCode);

// Structures
router.get('/structures', requirePermission('structures', 'view'), validate(listStructuresQuerySchema, 'query'), StructuresController.listStructures);
router.get('/structures/:id', requirePermission('structures', 'view'), StructuresController.getStructure);
router.post('/structures', requirePermission('structures', 'create'), validate(createStructureSchema), StructuresController.createStructure);
router.put('/structures/:id', requirePermission('structures', 'edit'), validate(updateStructureSchema), StructuresController.updateStructure);
router.delete('/structures/:id', requirePermission('structures', 'delete'), StructuresController.deleteStructure);

// Stations
router.get('/stations', requirePermission('stations', 'view'), validate(listStationsQuerySchema, 'query'), StructuresController.listStations);
router.get('/stations/:id', requirePermission('stations', 'view'), StructuresController.getStation);
router.post('/stations', requirePermission('stations', 'create'), validate(createStationSchema), StructuresController.createStation);
router.put('/stations/:id', requirePermission('stations', 'edit'), validate(updateStationSchema), StructuresController.updateStation);
router.delete('/stations/:id', requirePermission('stations', 'delete'), StructuresController.deleteStation);

export { router as structuresRoutes };
