import type { RequestHandler } from 'express';
import { AppError } from '../common/http.js';
import { requireAuth, type AuthRequest } from './auth.js';

const ADMIN_ROLES = new Set(['Platform Owner', 'Administrator']);

export const requireAdmin: RequestHandler = (req, res, next) => {
  requireAuth(req, res, (error) => {
    if (error) return next(error);

    const user = (req as AuthRequest).user;

    if (!user || !ADMIN_ROLES.has(user.role)) {
      return next(new AppError(403, 'ADMIN_REQUIRED', 'Administrator access is required.'));
    }

    next();
  });
};