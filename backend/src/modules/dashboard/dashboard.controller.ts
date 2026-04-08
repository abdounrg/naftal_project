import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';
import { ApiResponse } from '../../utils/apiResponse';
import { asyncWrapper } from '../../middleware/asyncWrapper';

export class DashboardController {
  static getStats = asyncWrapper(async (_req: Request, res: Response) => {
    const stats = await DashboardService.getStats();
    ApiResponse.success(res, stats);
  });

  static getDistribution = asyncWrapper(async (_req: Request, res: Response) => {
    const distribution = await DashboardService.getTpeDistribution();
    ApiResponse.success(res, distribution);
  });
}
