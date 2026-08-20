import { Router } from 'express';
import { prisma } from '@oryn/database';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'oryn-api' });
});

healthRouter.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready', service: 'oryn-api', dependencies: { database: 'ok' } });
  } catch {
    res.status(503).json({ status: 'not_ready', service: 'oryn-api', dependencies: { database: 'unavailable' } });
  }
});
