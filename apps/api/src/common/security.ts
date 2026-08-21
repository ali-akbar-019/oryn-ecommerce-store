import cors from 'cors';
import helmet from 'helmet';
import type { Express } from 'express';
import { env } from '../config/env.js';

export function applySecurity(app: Express) {
  app.disable('x-powered-by');

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }));

  app.use(cors({
    origin: env.CORS_ORIGINS.length ? env.CORS_ORIGINS : false,
    credentials: true
  }));
}