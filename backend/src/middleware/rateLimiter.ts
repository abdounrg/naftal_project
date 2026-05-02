import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
  // Skip authenticated requests — they're already gated by JWT and per-route RBAC.
  // The global limiter only protects unauthenticated traffic from floods.
  skip: (req) => Boolean(req.headers.authorization?.startsWith('Bearer ')),
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again in 15 minutes' },
  // Only count failed attempts — successful logins shouldn't drain the budget.
  skipSuccessfulRequests: true,
});

/** Stricter limiter for token refresh — protects refresh-token brute force / table bloat */
export const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many refresh attempts, please log in again' },
});

/** Limiter for unauthenticated public-facing endpoints (e.g., login support request) */
export const publicContactRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later' },
});
