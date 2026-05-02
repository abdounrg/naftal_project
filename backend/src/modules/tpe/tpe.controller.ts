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

  static listByStructure = asyncWrapper(async (req: Request, res: Response) => {
    const code = req.params.code as string;
    const data = await TpeService.listByStructure(code);
    ApiResponse.success(res, data);
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

  static deleteMaintenance = asyncWrapper(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    await TpeService.deleteMaintenance(id);
    logAudit(req, { action: AuditAction.delete, module: AuditModule.tpe, target: `maintenance:${id}`, details: `Deleted TPE maintenance record`, severity: 'warning' as any });
    ApiResponse.noContent(res);
  });

  static getDistinctProblemTypes = asyncWrapper(async (_req: Request, res: Response) => {
    const types = await TpeService.getDistinctProblemTypes();
    ApiResponse.success(res, types);
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

  static updateReturn = asyncWrapper(async (req: Request, res: Response) => {
    const record = await TpeService.updateReturn(parseId(req.params.id), req.body);
    logAudit(req, { action: AuditAction.update, module: AuditModule.tpe, target: `return:${record.id}`, details: `Updated TPE return record` });
    ApiResponse.success(res, record);
  });

  static deleteReturn = asyncWrapper(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    await TpeService.deleteReturn(id);
    logAudit(req, { action: AuditAction.delete, module: AuditModule.tpe, target: `return:${id}`, details: `Deleted TPE return record`, severity: 'warning' as any });
    ApiResponse.noContent(res);
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

  static updateTransfer = asyncWrapper(async (req: Request, res: Response) => {
    const transfer = await TpeService.updateTransfer(parseId(req.params.id), req.body);
    logAudit(req, { action: AuditAction.update, module: AuditModule.tpe, target: `transfer:${transfer.id}`, details: `Updated TPE transfer` });
    ApiResponse.success(res, transfer);
  });

  static deleteTransfer = asyncWrapper(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    await TpeService.deleteTransfer(id);
    logAudit(req, { action: AuditAction.delete, module: AuditModule.tpe, target: `transfer:${id}`, details: `Deleted TPE transfer id=${id}`, severity: 'warning' as any });
    ApiResponse.noContent(res);
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

  static updateReform = asyncWrapper(async (req: Request, res: Response) => {
    const record = await TpeService.updateReform(parseId(req.params.id), req.body);
    logAudit(req, { action: AuditAction.update, module: AuditModule.tpe, target: `reform:${record.id}`, details: `Updated TPE reform record` });
    ApiResponse.success(res, record);
  });

  static deleteReform = asyncWrapper(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    await TpeService.deleteReform(id);
    logAudit(req, { action: AuditAction.delete, module: AuditModule.tpe, target: `reform:${id}`, details: `Deleted TPE reform record`, severity: 'warning' as any });
    ApiResponse.noContent(res);
  });
}
