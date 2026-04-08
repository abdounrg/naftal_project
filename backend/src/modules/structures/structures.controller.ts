import { Request, Response } from 'express';
import { StructuresService } from './structures.service';
import { ApiResponse } from '../../utils/apiResponse';
import { asyncWrapper } from '../../middleware/asyncWrapper';
import { logAudit } from '../../utils/auditLogger';
import { AuditAction, AuditModule } from '@prisma/client';

const parseId = (id: string | string[]) => parseInt(id as string, 10);

export class StructuresController {
  // Districts
  static listDistricts = asyncWrapper(async (_req: Request, res: Response) => {
    const data = await StructuresService.listDistricts();
    ApiResponse.success(res, data);
  });

  static getDistrict = asyncWrapper(async (req: Request, res: Response) => {
    const data = await StructuresService.getDistrict(parseId(req.params.id));
    ApiResponse.success(res, data);
  });

  // Structures
  static listStructures = asyncWrapper(async (req: Request, res: Response) => {
    const data = await StructuresService.listStructures(req.query);
    ApiResponse.success(res, data);
  });

  static getStructure = asyncWrapper(async (req: Request, res: Response) => {
    const data = await StructuresService.getStructure(parseId(req.params.id));
    ApiResponse.success(res, data);
  });

  static createStructure = asyncWrapper(async (req: Request, res: Response) => {
    const data = await StructuresService.createStructure(req.body);
    logAudit(req, { action: AuditAction.create, module: AuditModule.structures, target: `structure:${data.id}`, details: `Created structure ${data.name} (${data.code})` });
    ApiResponse.created(res, data);
  });

  static updateStructure = asyncWrapper(async (req: Request, res: Response) => {
    const data = await StructuresService.updateStructure(parseId(req.params.id), req.body);
    logAudit(req, { action: AuditAction.update, module: AuditModule.structures, target: `structure:${data.id}`, details: `Updated structure ${data.name}` });
    ApiResponse.success(res, data);
  });

  static deleteStructure = asyncWrapper(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    await StructuresService.deleteStructure(id);
    logAudit(req, { action: AuditAction.delete, module: AuditModule.structures, target: `structure:${id}`, details: `Deleted structure id=${id}`, severity: 'warning' as any });
    ApiResponse.noContent(res);
  });

  // Stations
  static listStations = asyncWrapper(async (req: Request, res: Response) => {
    const data = await StructuresService.listStations(req.query);
    ApiResponse.success(res, data);
  });

  static getStation = asyncWrapper(async (req: Request, res: Response) => {
    const data = await StructuresService.getStation(parseId(req.params.id));
    ApiResponse.success(res, data);
  });

  static createStation = asyncWrapper(async (req: Request, res: Response) => {
    const data = await StructuresService.createStation(req.body);
    logAudit(req, { action: AuditAction.create, module: AuditModule.structures, target: `station:${data.id}`, details: `Created station ${data.name} (${data.code})` });
    ApiResponse.created(res, data);
  });

  static updateStation = asyncWrapper(async (req: Request, res: Response) => {
    const data = await StructuresService.updateStation(parseId(req.params.id), req.body);
    logAudit(req, { action: AuditAction.update, module: AuditModule.structures, target: `station:${data.id}`, details: `Updated station ${data.name}` });
    ApiResponse.success(res, data);
  });

  static deleteStation = asyncWrapper(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    await StructuresService.deleteStation(id);
    logAudit(req, { action: AuditAction.delete, module: AuditModule.structures, target: `station:${id}`, details: `Deleted station id=${id}`, severity: 'warning' as any });
    ApiResponse.noContent(res);
  });
}
