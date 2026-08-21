import { Router, type Router as RouterType } from 'express';
import { prisma } from '@oryn/database';
import { asStr, asyncHandler, sendData } from '../../common/http.js';

export const productsRouter: RouterType = Router();

// GET /products - Get all products with pagination and filtering
productsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : undefined;
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit ?? 24), 1), 60);

    const where = {
      status: 'ACTIVE' as const,
      ...(q ? {
        OR: [
          { name: { contains: q } },
          { brand: { contains: q } },
          { description: { contains: q } }
        ]
      } : {}),
      ...(category ? { category: { slug: category } } : {})
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          variants: { orderBy: { price: 'asc' } },
          category: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    sendData(res, {
      items,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    });
  })
);

// GET /products/:id - Get a single product by ID
productsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findFirst({
      where: {
        id: asStr(req.params.id),
        status: 'ACTIVE'
      },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: {
          include: { inventory: true },
          orderBy: { price: 'asc' }
        },
        attributes: { include: { values: true } },
        reviews: {
          where: { approved: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found.'
        }
      });
    }

    sendData(res, product);
  })
);