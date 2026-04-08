import { Request, Response } from 'express';
import { ChargersService } from './chargers.service';
import { ApiResponse } from '../../utils/apiResponse';
import { asyncWrapper } from '../../middleware/asyncWrapper';
import { logAudit } from '../../utils/auditLogger';
import { AuditAction, AuditModule } from '@prisma/client';

const parseId = (id: string | string[]) => parseInt(id as string, 10);

export class ChargersController {
  // ─── Charger Stock ───
  static listChargers = asyncWrapper(async (_req: Request, res: Response) => {
    const data = await ChargersService.listChargers();
    ApiResponse.success(res, data);
  });

  static createCharger = asyncWrapper(async (req: Request, res: Response) => {
    const charger = await ChargersService.createCharger(req.body);
    logAudit(req, { action: AuditAction.create, module: AuditModule.chargers, target: `charger:${charger.id}`, details: `Created charger ${charger.model} id=${charger.id}` });
    ApiResponse.created(res, charger);
  });

  static updateCharger = asyncWrapper(async (req: Request, res: Response) => {
    const charger = await ChargersService.updateCharger(parseId(req.params.id), req.body);
    logAudit(req, { action: AuditAction.update, module: AuditModule.chargers, target: `charger:${charger.id}`, details: `Updated charger ${charger.model} id=${charger.id}` });
    ApiResponse.success(res, charger);
  });

  static deleteCharger = asyncWrapper(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    await ChargersService.deleteCharger(id);
    logAudit(req, { action: AuditAction.delete, module: AuditModule.chargers, target: `charger:${id}`, details: `Deleted charger id=${id}`, severity: 'warning' as any });
    ApiResponse.noContent(res);
  });

  // ─── Bases ───
  static listBases = asyncWrapper(async (_req: Request, res: Response) => {
    const data = await ChargersService.listBases();
    ApiResponse.success(res, data);
  });

  static createBase = asyncWrapper(async (req: Request, res: Response) => {
    const base = await ChargersService.createBase(req.body);
    logAudit(req, { action: AuditAction.create, module: AuditModule.chargers, target: `base:${base.id}`, details: `Created base ${base.serial}` });
    ApiResponse.created(res, base);
  });

  static updateBase = asyncWrapper(async (req: Request, res: Response) => {
    const base = await ChargersService.updateBase(parseId(req.params.id), req.body);
    logAudit(req, { action: AuditAction.update, module: AuditModule.chargers, target: `base:${base.id}`, details: `Updated base ${base.serial}` });
    ApiResponse.success(res, base);
  });

  // ─── Transfers ───
  static listTransfers = asyncWrapper(async (req: Request, res: Response) => {
    const result = await ChargersService.listTransfers(req.query);
    ApiResponse.paginated(res, result.data, result.meta);
  });

  static createTransfer = asyncWrapper(async (req: Request, res: Response) => {
    const transfer = await ChargersService.createTransfer(req.body);
    logAudit(req, { action: AuditAction.transfer, module: AuditModule.chargers, target: `transfer:${transfer.id}`, details: `Charger transfer created` });
    ApiResponse.created(res, transfer);
  });
}
