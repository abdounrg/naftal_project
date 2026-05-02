import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../utils/apiResponse';
import { asyncWrapper } from '../../middleware/asyncWrapper';
import { getClientIp, logAudit } from '../../utils/auditLogger';
import { AuditAction, AuditModule } from '@prisma/client';

export class AuthController {
  static login = asyncWrapper(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await AuthService.login(email, password, ipAddress, userAgent);

    ApiResponse.success(res, {
      user: result.user,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
    });
  });

  static refresh = asyncWrapper(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'unknown';

    const tokens = await AuthService.refresh(refreshToken, ipAddress, userAgent);

    ApiResponse.success(res, tokens);
  });

  static logout = asyncWrapper(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    await AuthService.logout(req.user!.id, refreshToken);
    logAudit(req, {
      action: AuditAction.logout,
      module: AuditModule.auth,
      target: `user:${req.user!.id}`,
      details: refreshToken ? 'User logged out (single session)' : 'User logged out (all sessions)',
    });
    ApiResponse.success(res, { message: 'Logged out successfully' });
  });

  static me = asyncWrapper(async (req: Request, res: Response) => {
    const profile = await AuthService.getProfile(req.user!.id);
    ApiResponse.success(res, profile);
  });

  static changePassword = asyncWrapper(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const ipAddress = getClientIp(req);
    await AuthService.changePassword(req.user!.id, currentPassword, newPassword, ipAddress);
    ApiResponse.success(res, { message: 'Password changed successfully' });
  });

  static createLoginSupportRequest = asyncWrapper(async (req: Request, res: Response) => {
    const request = await AuthService.createLoginSupportRequest(req.body);
    ApiResponse.created(res, request, 'Support request sent successfully');
  });

  static updateAvatar = asyncWrapper(async (req: Request, res: Response) => {
    const result = await AuthService.updateAvatar(req.user!.id, req.body?.avatarUrl);
    ApiResponse.success(res, result, 'Avatar updated');
  });

  static removeAvatar = asyncWrapper(async (req: Request, res: Response) => {
    const result = await AuthService.removeAvatar(req.user!.id);
    ApiResponse.success(res, result, 'Avatar removed');
  });
}
