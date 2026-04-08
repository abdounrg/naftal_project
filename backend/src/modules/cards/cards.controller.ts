import { Request, Response } from 'express';
import { CardsService } from './cards.service';
import { ApiResponse } from '../../utils/apiResponse';
import { asyncWrapper } from '../../middleware/asyncWrapper';
import { logAudit } from '../../utils/auditLogger';
import { AuditAction, AuditModule } from '@prisma/client';

const parseId = (id: string | string[]) => parseInt(id as string, 10);

export class CardsController {
  // ─── Stock ───
  static list = asyncWrapper(async (req: Request, res: Response) => {
    const result = await CardsService.list(req.query);
    ApiResponse.paginated(res, result.data, result.meta);
  });

  static getById = asyncWrapper(async (req: Request, res: Response) => {
    const card = await CardsService.getById(parseId(req.params.id));
    ApiResponse.success(res, card);
  });

  static create = asyncWrapper(async (req: Request, res: Response) => {
    const card = await CardsService.create(req.body);
    logAudit(req, { action: AuditAction.create, module: AuditModule.cards, target: `card:${card.id}`, details: `Created card ${card.cardSerial ?? card.id}` });
    ApiResponse.created(res, card);
  });

  static update = asyncWrapper(async (req: Request, res: Response) => {
    const card = await CardsService.update(parseId(req.params.id), req.body);
    logAudit(req, { action: AuditAction.update, module: AuditModule.cards, target: `card:${card.id}`, details: `Updated card ${card.cardSerial ?? card.id}` });
    ApiResponse.success(res, card);
  });

  static delete = asyncWrapper(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    await CardsService.delete(id);
    logAudit(req, { action: AuditAction.delete, module: AuditModule.cards, target: `card:${id}`, details: `Deleted card id=${id}`, severity: 'warning' as any });
    ApiResponse.noContent(res);
  });

  // ─── Circulation ───
  static circulation = asyncWrapper(async (req: Request, res: Response) => {
    const result = await CardsService.circulation(req.query);
    ApiResponse.paginated(res, result.data, result.meta);
  });

  // ─── Monitoring ───
  static listMonitoring = asyncWrapper(async (req: Request, res: Response) => {
    const result = await CardsService.listMonitoring(req.query);
    ApiResponse.paginated(res, result.data, result.meta);
  });

  static createMonitoring = asyncWrapper(async (req: Request, res: Response) => {
    const record = await CardsService.createMonitoring(req.body);
    ApiResponse.created(res, record);
  });

  static updateMonitoring = asyncWrapper(async (req: Request, res: Response) => {
    const record = await CardsService.updateMonitoring(parseId(req.params.id), req.body);
    ApiResponse.success(res, record);
  });

  // ─── Transfers ───
  static listTransfers = asyncWrapper(async (req: Request, res: Response) => {
    const result = await CardsService.listTransfers(req.query);
    ApiResponse.paginated(res, result.data, result.meta);
  });

  static createTransfer = asyncWrapper(async (req: Request, res: Response) => {
    const transfer = await CardsService.createTransfer(req.body);
    logAudit(req, { action: AuditAction.transfer, module: AuditModule.cards, target: `transfer:${transfer.id}`, details: `Card transfer created` });
    ApiResponse.created(res, transfer);
  });
}
