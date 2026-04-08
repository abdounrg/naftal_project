import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { CONSTANTS } from '../../config/constants';
import { AppError } from '../../utils/appError';
import { AuditAction, AuditModule, AuditSeverity } from '@prisma/client';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  static async login(
    email: string,
    password: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ user: any; tokens: TokenPair }> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // Check account lock
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw AppError.tooManyRequests(`Account locked. Try again in ${minutesLeft} minute(s)`);
    }

    if (user.status !== 'active') {
      throw AppError.forbidden('Account is not active');
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      // Increment failed login count
      const failedLogins = user.failedLogins + 1;
      const update: any = { failedLogins };
      if (failedLogins >= CONSTANTS.MAX_FAILED_LOGINS) {
        update.lockedUntil = new Date(Date.now() + CONSTANTS.LOCK_DURATION_MINUTES * 60 * 1000);
        update.failedLogins = 0;
      }
      await prisma.user.update({ where: { id: user.id }, data: update });

      // Audit failed login
      await this.logAudit(user.id, user.name, user.role, AuditAction.login, AuditModule.auth, `Failed login attempt (${failedLogins})`, ipAddress, AuditSeverity.warning);

      throw AppError.unauthorized('Invalid email or password');
    }

    // Reset failed logins on success
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokenPair(user, ipAddress, userAgent);

    // Audit successful login
    await this.logAudit(user.id, user.name, user.role, AuditAction.login, AuditModule.auth, 'Successful login', ipAddress, AuditSeverity.info);

    const { passwordHash: _, failedLogins: _f, lockedUntil: _l, ...safeUser } = user;
    return { user: { ...safeUser, lastLoginAt: new Date() }, tokens };
  }

  static async refresh(
    refreshTokenValue: string,
    ipAddress: string,
    userAgent: string
  ): Promise<TokenPair> {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenValue },
      include: { user: true },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      // If token was already revoked, this could be a reuse attack — revoke the entire family
      if (storedToken?.revokedAt && storedToken.family) {
        await prisma.refreshToken.updateMany({
          where: { family: storedToken.family, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        await this.logAudit(storedToken.userId, storedToken.user.name, storedToken.user.role, AuditAction.login, AuditModule.auth, 'Refresh token reuse detected — family revoked', ipAddress, AuditSeverity.critical);
      }
      throw AppError.unauthorized('Invalid refresh token');
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Issue new pair in same family
    const user = storedToken.user;
    return this.generateTokenPair(user, ipAddress, userAgent, storedToken.family);
  }

  static async logout(userId: number, refreshTokenValue?: string) {
    if (refreshTokenValue) {
      // Revoke specific token and its family
      const token = await prisma.refreshToken.findUnique({ where: { token: refreshTokenValue } });
      if (token) {
        await prisma.refreshToken.updateMany({
          where: { family: token.family, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
    } else {
      // Revoke all user tokens
      await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }

  static async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { district: true, structure: true },
    });
    if (!user) throw AppError.notFound('User not found');
    const { passwordHash: _, failedLogins: _f, lockedUntil: _l, ...safeUser } = user;
    return safeUser;
  }

  private static async generateTokenPair(
    user: any,
    ipAddress: string,
    userAgent: string,
    family?: string
  ): Promise<TokenPair> {
    const tokenFamily = family || crypto.randomUUID();

    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        districtId: user.districtId,
        structureId: user.structureId,
      },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRY } as any
    );

    const refreshTokenValue = crypto.randomBytes(64).toString('hex');

    // Parse expiry for DB storage
    const expiresIn = this.parseExpiry(env.JWT_REFRESH_EXPIRY);

    await prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        family: tokenFamily,
        expiresAt: new Date(Date.now() + expiresIn),
        ipAddress,
        userAgent: userAgent.slice(0, 500),
      },
    });

    return { accessToken, refreshToken: refreshTokenValue };
  }

  private static parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7d
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return value * (multipliers[unit] || 86400000);
  }

  private static async logAudit(
    userId: number,
    userName: string,
    userRole: string,
    action: AuditAction,
    module: AuditModule,
    details: string,
    ipAddress: string,
    severity: AuditSeverity
  ) {
    await prisma.auditLog.create({
      data: { userId, userName, userRole, action, module, target: 'session', details, ipAddress, severity },
    }).catch(() => { /* audit logging should never break the flow */ });
  }
}
