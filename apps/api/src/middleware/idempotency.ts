import type { NextFunction, Request, Response } from 'express';
import type { AuthRequest } from './auth.js';

const cache = new Map<string, {
  status: number;
  body: unknown;
  expiresAt: number;
}>();

export function idempotency(windowMs = 10 * 60_000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.header('Idempotency-Key');

    if (!key || !['POST', 'PATCH'].includes(req.method)) {
      return next();
    }

    const scopedKey = `${(req as AuthRequest).user?.id ?? req.ip}:${req.method}:${req.path}:${key}`;
    const cached = cache.get(scopedKey);

    if (cached && cached.expiresAt > Date.now()) {
      return res.status(cached.status).json(cached.body);
    }

    const originalJson = res.json.bind(res);

    res.json = ((body: unknown) => {
      cache.set(scopedKey, {
        status: res.statusCode,
        body,
        expiresAt: Date.now() + windowMs
      });
      return originalJson(body);
    }) as Response['json'];

    next();
  };
}