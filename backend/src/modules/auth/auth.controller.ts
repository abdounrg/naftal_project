import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../utils/apiResponse';
import { asyncWrapper } from '../../middleware/asyncWrapper';
import { getClientIp } from '../../utils/auditLogger';

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
    ApiResponse.success(res, { message: 'Logged out successfully' });
  });

  static me = asyncWrapper(async (req: Request, res: Response) => {
    const profile = await AuthService.getProfile(req.user!.id);
    ApiResponse.success(res, profile);
  });
}
