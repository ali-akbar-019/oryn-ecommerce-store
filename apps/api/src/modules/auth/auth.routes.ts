import { Router } from 'express';
import { prisma } from '@oryn/database';
import { asyncHandler, sendData } from '../../common/http';
import { requireAuth, type AuthRequest } from '../../middleware/auth';
import { loginSchema, refreshSchema, registerSchema } from './auth.schemas';
import * as service from './auth.service';

export const authRouter = Router();
authRouter.post('/register', asyncHandler(async (req, res) => sendData(res, await service.register(registerSchema.parse(req.body)), 201)));
authRouter.post('/login', asyncHandler(async (req, res) => { const input = loginSchema.parse(req.body); return sendData(res, await service.login(input.email, input.password)); }));
authRouter.post('/refresh', asyncHandler(async (req, res) => sendData(res, await service.refresh(refreshSchema.parse(req.body).refreshToken))));
authRouter.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: (req as AuthRequest).user!.id }, select: { id: true, email: true, firstName: true, lastName: true, status: true, role: { select: { name: true } } } });
  sendData(res, user);
}));
