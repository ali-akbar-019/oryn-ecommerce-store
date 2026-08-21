import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@oryn/database';
import { asyncHandler, AppError, sendData } from '../../common/http.js';
import { requireAuth, type AuthRequest } from '../../middleware/auth.js';
import { loginSchema, refreshSchema, registerSchema } from './auth.schemas.js';
import * as service from './auth.service.js';

const profileSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80)
});

const passwordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8).max(128)
});

const preferencesSchema = z.object({
  orderUpdates: z.boolean(),
  promotions: z.boolean(),
  productAlerts: z.boolean()
});

export const authRouter = Router() as Router;

// Register
authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    sendData(res, await service.register(input), 201);
  })
);

// Login
authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    return sendData(res, await service.login(input.email, input.password));
  })
);

// Refresh Token
authRouter.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const input = refreshSchema.parse(req.body);
    sendData(res, await service.refresh(input.refreshToken));
  })
);

// Get Current User
authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: (req as AuthRequest).user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        role: { select: { name: true } },
        notificationPreference: true
      }
    });
    sendData(res, user);
  })
);

// Update Profile
authRouter.patch(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = (req as AuthRequest).user!.id;
    const input = profileSchema.parse(req.body);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: input,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        role: { select: { name: true } },
        notificationPreference: true
      }
    });

    sendData(res, updated);
  })
);

// Change Password
authRouter.patch(
  '/password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = (req as AuthRequest).user!.id;
    const input = passwordSchema.parse(req.body);

    await service.changePassword(userId, input.currentPassword, input.newPassword);
    sendData(res, { success: true });
  })
);

// Update Notification Preferences
authRouter.patch(
  '/preferences',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = (req as AuthRequest).user!.id;
    const input = preferencesSchema.parse(req.body);

    const preferences = await prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...input },
      update: input
    });

    sendData(res, preferences);
  })
);

// Delete Account
authRouter.delete(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = (req as AuthRequest).user!.id;
    await prisma.user.delete({ where: { id: userId } });
    res.status(204).send();
  })
);