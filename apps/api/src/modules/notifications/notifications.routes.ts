import { Router, type Router as RouterType } from 'express';
import { prisma } from '@oryn/database';
import { asStr, asyncHandler, sendData } from '../../common/http.js';
import { requireAuth, type AuthRequest } from '../../middleware/auth.js';

export const notificationsRouter: RouterType = Router();
notificationsRouter.use(requireAuth);

// GET /notifications - Get all notifications for the authenticated user
notificationsRouter.get(
    '/',
    asyncHandler(async (req, res) => {
        const userId = (req as AuthRequest).user!.id;

        const [items, unread, preferences] = await Promise.all([
            prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 50
            }),
            prisma.notification.count({
                where: { userId, readAt: null }
            }),
            prisma.notificationPreference.findUnique({
                where: { userId }
            })
        ]);

        sendData(res, { items, unread, preferences });
    })
);

// PATCH /notifications/:id/read - Mark a single notification as read
notificationsRouter.patch(
    '/:id/read',
    asyncHandler(async (req, res) => {
        const userId = (req as AuthRequest).user!.id;

        const item = await prisma.notification.updateMany({
            where: {
                id: asStr(req.params.id),
                userId
            },
            data: { readAt: new Date() }
        });

        sendData(res, { updated: item.count });
    })
);

// POST /notifications/read-all - Mark all notifications as read
notificationsRouter.post(
    '/read-all',
    asyncHandler(async (req, res) => {
        const userId = (req as AuthRequest).user!.id;

        const result = await prisma.notification.updateMany({
            where: {
                userId,
                readAt: null
            },
            data: { readAt: new Date() }
        });

        sendData(res, { updated: result.count });
    })
);