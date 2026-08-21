import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export function asyncHandler<T extends (req: Request, res: Response, next: NextFunction) => Promise<unknown>>(handler: T) {
  return (req: Request, res: Response, next: NextFunction) => Promise.resolve(handler(req, res, next)).catch(next);
}

export function sendData(res: Response, data: unknown, status = 200) {
  return res.status(status).json({ data });
}

// Express 5's route param / query types allow `string | string[]` (repeated segments).
// This app only uses single-value params, so normalize to a plain string.
export function asStr(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}
