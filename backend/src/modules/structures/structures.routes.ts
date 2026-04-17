import { Router } from 'express';
import { StructuresController } from './structures.controller';
import { authenticate } from '../../middleware/auth';
import { allRoles } from '../../middleware/rbac';

const router = Router();

router.use(authenticate, allRoles);

// Districts
router.get('/districts', StructuresController.listDistricts);
router.get('/districts/:id', StructuresController.getDistrict);

// Lookup by code
router.get('/structures/lookup/:code', StructuresController.lookupStructureByCode);
router.get('/stations/lookup/:code', StructuresController.lookupStationByCode);

// Structures
router.get('/structures', StructuresController.listStructures);
router.get('/structures/:id', StructuresController.getStructure);
router.post('/structures', StructuresController.createStructure);
router.put('/structures/:id', StructuresController.updateStructure);
router.delete('/structures/:id', StructuresController.deleteStructure);

// Stations
router.get('/stations', StructuresController.listStations);
router.get('/stations/:id', StructuresController.getStation);
router.post('/stations', StructuresController.createStation);
router.put('/stations/:id', StructuresController.updateStation);
router.delete('/stations/:id', StructuresController.deleteStation);

export { router as structuresRoutes };
