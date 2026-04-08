import { Request, Response } from 'express';
import { AuditLogsService } from './audit-logs.service';
import { ApiResponse } from '../../utils/apiResponse';
import { asyncWrapper } from '../../middleware/asyncWrapper';

const parseId = (id: string | string[]) => parseInt(id as string, 10);

export class AuditLogsController {
  static list = asyncWrapper(async (req: Request, res: Response) => {
    const result = await AuditLogsService.list(req.query);
    ApiResponse.paginated(res, result.data, result.meta);
  });

  static getById = asyncWrapper(async (req: Request, res: Response) => {
    const log = await AuditLogsService.getById(parseId(req.params.id));
    ApiResponse.success(res, log);
  });

  static getStats = asyncWrapper(async (_req: Request, res: Response) => {
    const stats = await AuditLogsService.getStats();
    ApiResponse.success(res, stats);
  });

  static getRecentLogins = asyncWrapper(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const data = await AuditLogsService.getRecentLogins(limit);
    ApiResponse.success(res, data);
  });
}
