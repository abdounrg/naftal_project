import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/appError';
import {
  getEffectivePermissions,
  type Action,
  type UserPermissions,
} from '../config/permissions';

type Section = keyof UserPermissions;

/**
 * Enforces granular section/action permissions on a route.
 *
 * Loads the authenticated user's role + stored permission overrides from the
 * database, computes effective permissions through `getEffectivePermissions`
 * (which clamps to allowed actions per section), and rejects the request with
 * 403 if the user is not granted the requested action.
 *
 * Must run AFTER `authenticate`. Coexists with role-based middleware (the
 * role check acts as a coarse first filter; this is the precise check).
 */
export function requirePermission(section: Section, action: Action) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(AppError.unauthorized());

    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { role: true, permissions: true, status: true },
      });

      if (!dbUser) return next(AppError.unauthorized('User no longer exists'));
      if (dbUser.status !== 'active') {
        return next(AppError.forbidden('Account is not active'));
      }

      const effective = getEffectivePermissions(dbUser.role, dbUser.permissions);
      const allowed = effective[section]?.[action] === true;
      if (!allowed) {
        return next(
          AppError.forbidden(
            `Permission denied: ${section}.${action}`,
          ),
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
