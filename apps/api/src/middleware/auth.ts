import type { RequestHandler } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { AppError } from '../common/http.js';
import { env } from '../config/env.js';

function decode(token: string, secret: string) {
  const [body, signature] = token.split('.');

  if (!body || !signature) {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid authentication token.');
  }

  const expected = createHmac('sha256', secret)
    .update(body)
    .digest('base64url');

  if (signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid authentication token.');
  }

  const payload = JSON.parse(
    Buffer.from(body, 'base64url').toString('utf8')
  ) as { sub: string; exp: number; role: string };

  if (!payload.sub || payload.exp < Date.now()) {
    throw new AppError(401, 'TOKEN_EXPIRED', 'Authentication token expired.');
  }

  return payload;
}

export type AuthRequest = Parameters<RequestHandler>[0] & {
  user?: { id: string; role: string }
};

export const requireAuth: RequestHandler = (req, _res, next) => {
  try {
    const header = req.header('authorization');

    if (!header?.startsWith('Bearer ')) {
      throw new AppError(401, 'AUTH_REQUIRED', 'Authentication is required.');
    }

    const payload = decode(header.slice(7), env.JWT_ACCESS_SECRET);
    (req as AuthRequest).user = {
      id: payload.sub,
      role: payload.role
    };
    next();
  } catch (error) {
    next(error);
  }
};