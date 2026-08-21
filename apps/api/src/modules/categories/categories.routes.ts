import { Router, type Router as RouterType } from 'express';
import { prisma } from '@oryn/database';
import { asyncHandler, sendData } from '../../common/http.js';

export const categoriesRouter: RouterType = Router();

categoriesRouter.get(
    '/',
    asyncHandler(async (_req, res) => {
        const categories = await prisma.category.findMany({
            include: { children: true },
            orderBy: { name: 'asc' }
        });
        sendData(res, categories);
    })
);