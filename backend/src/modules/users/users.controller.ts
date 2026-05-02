import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { ApiResponse } from '../../utils/apiResponse';
import { asyncWrapper } from '../../middleware/asyncWrapper';
import { logAudit } from '../../utils/auditLogger';
import { AuditAction, AuditModule } from '@prisma/client';
import { NotificationService } from '../../utils/notificationService';

const parseId = (id: string | string[]) => parseInt(id as string, 10);

export class UsersController {
  static list = asyncWrapper(async (req: Request, res: Response) => {
    const result = await UsersService.list(req.query, req.user);
    ApiResponse.paginated(res, result.data, result.meta);
  });

  static getById = asyncWrapper(async (req: Request, res: Response) => {
    const user = await UsersService.getById(parseId(req.params.id), req.user);
    ApiResponse.success(res, user);
  });

  static create = asyncWrapper(async (req: Request, res: Response) => {
    // Check if user is admin
    const isAdmin = req.user?.role === 'administrator';
    const requesterId = req.user?.id;
    const user = await UsersService.create(req.body, isAdmin, requesterId);

    if (!isAdmin && requesterId) {
      await NotificationService.notifyAdmins({
        type: 'new_pending_user',
        title: 'New pending user request',
        message: `${req.user?.name || 'A user'} requested creation of ${user.name}`,
        payload: { userId: user.id, requestedById: requesterId },
      });
    }

    const message = isAdmin ? 'User created successfully' : 'User request created. Awaiting admin approval.';
    logAudit(req, { action: AuditAction.create, module: AuditModule.users, target: `user:${user.id}`, details: `Created user ${user.name} (${user.email})` });
    ApiResponse.created(res, user, message);
  });

  static listPending = asyncWrapper(async (req: Request, res: Response) => {
    const result = await UsersService.listPending(req.query, req.user);
    ApiResponse.paginated(res, result.data, result.meta);
  });

  static approveUser = asyncWrapper(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    const user = await UsersService.approveUser(id);

    if (user.requestedById) {
      await NotificationService.notifyUser({
        userId: user.requestedById,
        type: 'user_request_approved',
        title: 'User request approved',
        message: `Your request for ${user.name} has been approved`,
        payload: { userId: user.id, email: user.email },
      });
    }

    await NotificationService.notifyUser({
      userId: user.id,
      type: 'user_request_approved',
      title: 'Your account is approved',
      message: 'Your account request has been approved by an administrator',
      payload: { userId: user.id },
    });

    logAudit(req, { action: AuditAction.update, module: AuditModule.users, target: `user:${id}`, details: `Approved pending user ${user.name}` });
    ApiResponse.success(res, user, 'User approved and activated');
  });

  static rejectUser = asyncWrapper(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    const rejectedUser = await UsersService.rejectUser(id);

    if (rejectedUser.requestedById) {
      await NotificationService.notifyUser({
        userId: rejectedUser.requestedById,
        type: 'user_request_rejected',
        title: 'User request rejected',
        message: `Your request for ${rejectedUser.name} has been rejected`,
        payload: { userId: rejectedUser.id, email: rejectedUser.email },
      });
    }

    logAudit(req, { action: AuditAction.delete, module: AuditModule.users, target: `user:${id}`, details: `Rejected and deleted pending user`, severity: 'warning' as any });
    ApiResponse.noContent(res);
  });

  static update = asyncWrapper(async (req: Request, res: Response) => {
    const user = await UsersService.update(parseId(req.params.id), req.body, req.user);
    logAudit(req, { action: AuditAction.update, module: AuditModule.users, target: `user:${user.id}`, details: `Updated user ${user.name}` });
    ApiResponse.success(res, user);
  });

  static delete = asyncWrapper(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    await UsersService.delete(id, req.user);
    logAudit(req, { action: AuditAction.delete, module: AuditModule.users, target: `user:${id}`, details: `Deleted user id=${id}`, severity: 'warning' as any });
    ApiResponse.noContent(res);
  });

  static getPermissions = asyncWrapper(async (req: Request, res: Response) => {
    const permissions = await UsersService.getPermissions(parseId(req.params.id));
    ApiResponse.success(res, permissions);
  });

  static updatePermissions = asyncWrapper(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    const permissions = await UsersService.updatePermissions(id, req.body);
    logAudit(req, { action: AuditAction.update, module: AuditModule.users, target: `user:${id}`, details: `Updated permissions for user id=${id}` });
    ApiResponse.success(res, permissions);
  });
}
