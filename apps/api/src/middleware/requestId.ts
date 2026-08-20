import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = req.header('x-request-id')?.slice(0, 100) || crypto.randomUUID();
  res.setHeader('x-request-id', id);
  res.locals.requestId = id;
  next();
}
