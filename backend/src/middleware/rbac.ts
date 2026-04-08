import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AppError } from '../utils/appError';

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(AppError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
}

/** Shortcut: only administrators */
export const adminOnly = authorize(UserRole.administrator);

/** Shortcut: DPE-level and above */
export const dpeAndAbove = authorize(UserRole.administrator, UserRole.dpe_member);

/** Shortcut: district-level and above */
export const districtAndAbove = authorize(
  UserRole.administrator,
  UserRole.dpe_member,
  UserRole.district_member
);

/** Shortcut: all authenticated users */
export const allRoles = authorize(
  UserRole.administrator,
  UserRole.dpe_member,
  UserRole.district_member,
  UserRole.agency_member,
  UserRole.antenna_member
);
