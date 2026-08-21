import { Router } from 'express';
import { prisma } from '@oryn/database';
import { asyncHandler, sendData } from '../../common/http.js';
export const categoriesRouter = Router();
categoriesRouter.get('/', asyncHandler(async (_req, res) => sendData(res, await prisma.category.findMany({ include: { children: true }, orderBy: { name: 'asc' } }))));
