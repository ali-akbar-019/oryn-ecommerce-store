import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';
import { prisma } from '@oryn/database';
import { AppError, asStr, asyncHandler, sendData } from '../../common/http.js';
import { requireAuth, type AuthRequest } from '../../middleware/auth.js';

const productSchema = z.object({
    productId: z.string()
});

export const wishlistRouter: RouterType = Router();
wishlistRouter.use(requireAuth);

// GET /wishlist - Get user's wishlist
wishlistRouter.get(
    '/',
    asyncHandler(async (req, res) => {
        const userId = (req as AuthRequest).user!.id;

        const wishlist = await prisma.wishlist.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: true,
                                variants: true
                            }
                        }
                    }
                }
            }
        });

        sendData(res, wishlist ?? { id: null, items: [] });
    })
);

// POST /wishlist/items - Add item to wishlist
wishlistRouter.post(
    '/items',
    asyncHandler(async (req, res) => {
        const userId = (req as AuthRequest).user!.id;
        const { productId } = productSchema.parse(req.body);

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found.');
        }

        // Get or create wishlist
        const wishlist = await prisma.wishlist.upsert({
            where: { userId },
            update: {},
            create: { userId }
        });

        // Add item to wishlist
        const item = await prisma.wishlistItem.upsert({
            where: {
                wishlistId_productId: {
                    wishlistId: wishlist.id,
                    productId
                }
            },
            update: {},
            create: {
                wishlistId: wishlist.id,
                productId
            }
        });

        sendData(res, item, 201);
    })
);

// DELETE /wishlist/items/:productId - Remove item from wishlist
wishlistRouter.delete(
    '/items/:productId',
    asyncHandler(async (req, res) => {
        const userId = (req as AuthRequest).user!.id;

        const wishlist = await prisma.wishlist.findUnique({
            where: { userId }
        });

        if (!wishlist) {
            return res.status(204).send();
        }

        await prisma.wishlistItem.deleteMany({
            where: {
                wishlistId: wishlist.id,
                productId: asStr(req.params.productId)
            }
        });

        res.status(204).send();
    })
);