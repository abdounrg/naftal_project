import { Request, Response } from 'express';
import { ApiResponse } from '../../utils/apiResponse';
import { asyncWrapper } from '../../middleware/asyncWrapper';
import { NotificationsService } from './notifications.service';

const parseId = (id: string | string[]) => parseInt(id as string, 10);

export class NotificationsController {
  static listMine = asyncWrapper(async (req: Request, res: Response) => {
    const result = await NotificationsService.listMine(req.user!.id, req.query);
    ApiResponse.paginated(res, result.data, result.meta as any);
  });

  static markRead = asyncWrapper(async (req: Request, res: Response) => {
    const notification = await NotificationsService.markRead(req.user!.id, parseId(req.params.id));
    ApiResponse.success(res, notification);
  });

  static markAllRead = asyncWrapper(async (req: Request, res: Response) => {
    await NotificationsService.markAllRead(req.user!.id);
    ApiResponse.success(res, { ok: true });
  });

  static listSupportRequests = asyncWrapper(async (req: Request, res: Response) => {
    const result = await NotificationsService.listSupportRequests(req.query);
    ApiResponse.paginated(res, result.data, result.meta);
  });

  static updateSupportRequest = asyncWrapper(async (req: Request, res: Response) => {
    const updated = await NotificationsService.updateSupportRequest(parseId(req.params.id), req.user!.id, req.body);
    ApiResponse.success(res, updated);
  });
}
