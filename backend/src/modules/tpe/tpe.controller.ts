import { Request, Response } from 'express';
import { TpeService } from './tpe.service';
import { ApiResponse } from '../../utils/apiResponse';
import { asyncWrapper } from '../../middleware/asyncWrapper';
import { logAudit } from '../../utils/auditLogger';
import { AuditAction, AuditModule } from '@prisma/client';

const parseId = (id: string | string[]) => parseInt(id as string, 10);

export class TpeController {
  // ─── Stock ───
  static list = asyncWrapper(async (req: Request, res: Response) => {
    const result = await TpeService.list(req.query);
    ApiResponse.paginated(res, result.data, result.meta);
  });

  static getById = asyncWrapper(async (req: Request, res: Response) => {
    const tpe = await TpeService.getById(parseId(req.params.id));
    ApiResponse.success(res, tpe);
  });

  static create = asyncWrapper(async (req: Request, res: Response) => {
    const tpe = await TpeService.create(req.body);
    logAudit(req, { action: AuditAction.create, module: AuditModule.tpe, target: `tpe:${tpe.id}`, details: `Created TPE ${tpe.serial}` });
    ApiResponse.created(res, tpe);
  });

  static update = asyncWrapper(async (req: Request, res: Response) => {
    const tpe = await TpeService.update(parseId(req.params.id), req.body);
    logAudit(req, { action: AuditAction.update, module: AuditModule.tpe, target: `tpe:${tpe.id}`, details: `Updated TPE ${tpe.serial}` });
    ApiResponse.success(res, tpe);
  });

  static delete = asyncWrapper(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    await TpeService.delete(id);
    logAudit(req, { action: AuditAction.delete, module: AuditModule.tpe, target: `tpe:${id}`, details: `Deleted TPE id=${id}`, severity: 'warning' as any });
    ApiResponse.noContent(res);
  });

  // ─── Maintenance ───
  static listMaintenance = asyncWrapper(async (req: Request, res: Response) => {
    const result = await TpeService.listMaintenance(req.query);
    ApiResponse.paginated(res, result.data, result.meta);
  });

  static createMaintenance = asyncWrapper(async (req: Request, res: Response) => {
    const record = await TpeService.createMaintenance(req.body);
    logAudit(req, { action: AuditAction.create, module: AuditModule.tpe, target: `maintenance:${record.id}`, details: `Created TPE maintenance record` });
    ApiResponse.created(res, record);
  });

  static updateMaintenance = asyncWrapper(async (req: Request, res: Response) => {
    const record = await TpeService.updateMaintenance(parseId(req.params.id), req.body);
    logAudit(req, { action: AuditAction.update, module: AuditModule.tpe, target: `maintenance:${record.id}`, details: `Updated TPE maintenance record` });
    ApiResponse.success(res, record);
  });

  // ─── Returns ───
  static listReturns = asyncWrapper(async (req: Request, res: Response) => {
    const result = await TpeService.listReturns(req.query);
    ApiResponse.paginated(res, result.data, result.meta);
  });

  static createReturn = asyncWrapper(async (req: Request, res: Response) => {
    const record = await TpeService.createReturn(req.body);
    logAudit(req, { action: AuditAction.create, module: AuditModule.tpe, target: `return:${record.id}`, details: `Created TPE return record` });
    ApiResponse.created(res, record);
  });

  // ─── Transfers ───
  static listTransfers = asyncWrapper(async (req: Request, res: Response) => {
    const result = await TpeService.listTransfers(req.query);
    ApiResponse.paginated(res, result.data, result.meta);
  });

  static createTransfer = asyncWrapper(async (req: Request, res: Response) => {
    const transfer = await TpeService.createTransfer(req.body);
    logAudit(req, { action: AuditAction.transfer, module: AuditModule.tpe, target: `transfer:${transfer.id}`, details: `TPE transfer created` });
    ApiResponse.created(res, transfer);
  });

  // ─── Reform ───
  static listReforms = asyncWrapper(async (req: Request, res: Response) => {
    const result = await TpeService.listReforms(req.query);
    ApiResponse.paginated(res, result.data, result.meta);
  });

  static createReform = asyncWrapper(async (req: Request, res: Response) => {
    const record = await TpeService.createReform(req.body);
    logAudit(req, { action: AuditAction.delete, module: AuditModule.tpe, target: `reform:${record.id}`, details: `TPE marked for reform`, severity: 'warning' as any });
    ApiResponse.created(res, record);
  });
}
