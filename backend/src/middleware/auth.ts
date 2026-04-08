import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/appError';

interface JwtPayload {
  sub: number;
  email: string;
  name: string;
  role: string;
  districtId: number | null;
  structureId: number | null;
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(AppError.unauthorized('Missing or invalid authorization header'));
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const payload = decoded as unknown as JwtPayload;
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role as any,
      districtId: payload.districtId,
      structureId: payload.structureId,
    };
    next();
  } catch {
    next(AppError.unauthorized('Invalid or expired token'));
  }
}
