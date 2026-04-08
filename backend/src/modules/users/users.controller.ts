import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { ApiResponse } from '../../utils/apiResponse';
import { asyncWrapper } from '../../middleware/asyncWrapper';
import { logAudit } from '../../utils/auditLogger';
import { AuditAction, AuditModule } from '@prisma/client';

const parseId = (id: string | string[]) => parseInt(id as string, 10);

export class UsersController {
  static list = asyncWrapper(async (req: Request, res: Response) => {
    const result = await UsersService.list(req.query);
    ApiResponse.paginated(res, result.data, result.meta);
  });

  static getById = asyncWrapper(async (req: Request, res: Response) => {
    const user = await UsersService.getById(parseId(req.params.id));
    ApiResponse.success(res, user);
  });

  static create = asyncWrapper(async (req: Request, res: Response) => {
    const user = await UsersService.create(req.body);
    logAudit(req, { action: AuditAction.create, module: AuditModule.users, target: `user:${user.id}`, details: `Created user ${user.name} (${user.email})` });
    ApiResponse.created(res, user);
  });

  static update = asyncWrapper(async (req: Request, res: Response) => {
    const user = await UsersService.update(parseId(req.params.id), req.body);
    logAudit(req, { action: AuditAction.update, module: AuditModule.users, target: `user:${user.id}`, details: `Updated user ${user.name}` });
    ApiResponse.success(res, user);
  });

  static delete = asyncWrapper(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    await UsersService.delete(id);
    logAudit(req, { action: AuditAction.delete, module: AuditModule.users, target: `user:${id}`, details: `Deleted user id=${id}`, severity: 'warning' as any });
    ApiResponse.noContent(res);
  });
}
