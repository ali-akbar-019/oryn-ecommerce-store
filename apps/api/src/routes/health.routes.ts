import { Router } from 'express';
import { prisma } from '@oryn/database';

export const healthRouter = Router() as Router;

// GET /health - Basic health check
healthRouter.get('/health', (_req, res) => {
  console.log('Health endpoint hit');
  res.json({ status: 'ok', service: 'oryn-api' });
});

// GET /ready - Readiness check with database connectivity
healthRouter.get('/ready', async (_req, res) => {
  console.log('Ready endpoint hit');

  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ready',
      service: 'oryn-api',
      dependencies: { database: 'ok' }
    });
  } catch {
    res.status(503).json({
      status: 'not_ready',
      service: 'oryn-api',
      dependencies: { database: 'unavailable' }
    });
  }
});