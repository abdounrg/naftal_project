import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';
import { ApiResponse } from '../../utils/apiResponse';
import { asyncWrapper } from '../../middleware/asyncWrapper';

export class DashboardController {
  static getPublicStats = asyncWrapper(async (_req: Request, res: Response) => {
    const stats = await DashboardService.getPublicStats();
    ApiResponse.success(res, stats);
  });

  static getStats = asyncWrapper(async (_req: Request, res: Response) => {
    const stats = await DashboardService.getStats();
    ApiResponse.success(res, stats);
  });

  static getDistribution = asyncWrapper(async (_req: Request, res: Response) => {
    const distribution = await DashboardService.getTpeDistribution();
    ApiResponse.success(res, distribution);
  });

  static getStationsWithoutTpe = asyncWrapper(async (_req: Request, res: Response) => {
    const stations = await DashboardService.getStationsWithoutTpe();
    ApiResponse.success(res, stations);
  });
}
