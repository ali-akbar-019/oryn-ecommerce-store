import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';
import { prisma } from '@oryn/database';
import { AppError, asStr, asyncHandler, sendData } from '../../common/http.js';
import { requireAuth, type AuthRequest } from '../../middleware/auth.js';

const schema = z.object({
    productId: z.string(),
    rating: z.number().int().min(1).max(5),
    title: z.string().trim().max(120).optional(),
    body: z.string().trim().min(1).max(2000)
});

const updateSchema = schema.pick({ rating: true, title: true, body: true });

export const reviewsRouter: RouterType = Router();
reviewsRouter.use(requireAuth);

// GET /reviews/mine - Get all reviews by the authenticated user
reviewsRouter.get(
    '/mine',
    asyncHandler(async (req, res) => {
        const userId = (req as AuthRequest).user!.id;

        const reviews = await prisma.review.findMany({
            where: { userId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        images: { orderBy: { sortOrder: 'asc' }, take: 1 }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        sendData(res, reviews);
    })
);

// POST /reviews - Create a new review
reviewsRouter.post(
    '/',
    asyncHandler(async (req, res) => {
        const userId = (req as AuthRequest).user!.id;
        const input = schema.parse(req.body);

        // Check if user purchased the product
        const purchased = await prisma.orderItem.findFirst({
            where: {
                productId: input.productId,
                order: { userId, status: 'DELIVERED' }
            }
        });

        if (!purchased) {
            throw new AppError(
                403,
                'REVIEW_NOT_ELIGIBLE',
                'Reviews are available after purchasing and receiving the product.'
            );
        }

        // Check if user already reviewed this product
        const existing = await prisma.review.findFirst({
            where: { productId: input.productId, userId }
        });

        if (existing) {
            throw new AppError(
                409,
                'REVIEW_EXISTS',
                'You have already reviewed this product.'
            );
        }

        const review = await prisma.review.create({
            data: {
                ...input,
                userId,
                approved: false // Reviews need admin approval
            }
        });

        sendData(res, review, 201);
    })
);

// PATCH /reviews/:id - Update a review
reviewsRouter.patch(
    '/:id',
    asyncHandler(async (req, res) => {
        const userId = (req as AuthRequest).user!.id;
        const input = updateSchema.parse(req.body);

        const review = await prisma.review.findFirst({
            where: { id: asStr(req.params.id), userId }
        });

        if (!review) {
            throw new AppError(404, 'REVIEW_NOT_FOUND', 'Review not found.');
        }

        const updated = await prisma.review.update({
            where: { id: review.id },
            data: {
                ...input,
                approved: false // Re-approval needed after update
            }
        });

        sendData(res, updated);
    })
);

// DELETE /reviews/:id - Delete a review
reviewsRouter.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        const userId = (req as AuthRequest).user!.id;

        const result = await prisma.review.deleteMany({
            where: { id: asStr(req.params.id), userId }
        });

        if (!result.count) {
            throw new AppError(404, 'REVIEW_NOT_FOUND', 'Review not found.');
        }

        res.status(204).send();
    })
);