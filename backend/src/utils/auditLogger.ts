import { Request } from 'express';
import { AuditAction, AuditModule, AuditSeverity } from '@prisma/client';
import { prisma } from '../lib/prisma';

/**
 * Extracts the real client IP from a request.
 * Handles X-Forwarded-For (proxy/load-balancer), strips IPv4-mapped IPv6 prefixes.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded).split(',')[0].trim();
    if (first) return normalizeIp(first);
  }
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  return normalizeIp(ip);
}

function normalizeIp(ip: string): string {
  // Strip IPv4-mapped IPv6 prefix (::ffff:1.2.3.4 → 1.2.3.4)
  return ip.replace(/^::ffff:/, '');
}

interface AuditOptions {
  action: AuditAction;
  module: AuditModule;
  target?: string;
  details?: string;
  severity?: AuditSeverity;
}

/**
 * Fire-and-forget audit log entry. Never throws — audit logging must never break request flow.
 */
export function logAudit(req: Request, opts: AuditOptions): void {
  const user = req.user;
  if (!user) return;

  prisma.auditLog
    .create({
      data: {
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: opts.action,
        module: opts.module,
        target: opts.target ?? null,
        details: opts.details ?? null,
        ipAddress: getClientIp(req),
        severity: opts.severity ?? AuditSeverity.info,
      },
    })
    .catch(() => {
      /* intentionally swallowed */
    });
}
