import { Router, type Router as RouterType } from 'express';
import { prisma } from '@oryn/database';
import { z } from 'zod';
import { asyncHandler, AppError, sendData, asStr } from '../../common/http.js';
import { requireAdmin } from '../../middleware/admin.js';
import type { AuthRequest } from '../../middleware/auth.js';

// ============ Schema Definitions ============
const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  brand: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  categoryId: z.string(),
  images: z.array(z.object({
    url: z.string().url(),
    altText: z.string().optional(),
    sortOrder: z.number().int().min(0).default(0)
  })).default([]),
  variants: z.array(z.object({
    sku: z.string().min(2),
    price: z.coerce.number().nonnegative(),
    compareAtPrice: z.coerce.number().nonnegative().optional().nullable(),
    stockQuantity: z.coerce.number().int().min(0).default(0),
    attributes: z.record(z.string(), z.any())
  })).default([])
});

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional().nullable(),
  parentId: z.string().optional().nullable()
});

const stockSchema = z.object({
  quantity: z.coerce.number().int().min(0),
  reason: z.string().min(2).default('ADMIN_ADJUSTMENT')
});

const orderSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED']),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED']).optional()
});

const couponSchema = z.object({
  code: z.string().min(3).max(32),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.coerce.number().positive(),
  startsAt: z.coerce.date(),
  expiresAt: z.coerce.date().optional().nullable(),
  maxUses: z.coerce.number().int().positive().optional().nullable(),
  maxUsesPerUser: z.coerce.number().int().positive().optional().nullable(),
  active: z.boolean().default(true)
});

const shippingSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  price: z.coerce.number().nonnegative(),
  active: z.boolean().default(true)
});

const notificationSchema = z.object({
  userId: z.string(),
  type: z.string().min(2),
  title: z.string().min(2),
  body: z.string().min(2),
  deepLink: z.string().optional().nullable()
});

const returnSchema = z.object({
  status: z.enum(['REQUESTED', 'APPROVED', 'REJECTED', 'RECEIVED', 'REFUNDED', 'CANCELLED']),
  notes: z.string().optional().nullable()
});

const adminSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(10),
  roleId: z.string()
});

const roleSchema = z.object({
  name: z.string().min(2)
});

// ============ Router Setup ============
export const adminRouter: RouterType = Router();
adminRouter.use(requireAdmin);

// ============ Analytics ============
adminRouter.get('/analytics', asyncHandler(async (_req, res) => {
  const [ordersByStatus, paymentsByStatus, salesByDay, topProducts] = await Promise.all([
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.payment.groupBy({ by: ['status'], _count: { _all: true }, _sum: { amount: true } }),
    prisma.order.findMany({
      where: { paymentStatus: 'PAID' },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: 'desc' },
      take: 500
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10
    })
  ]);

  const ids = topProducts.map(item => item.productId);
  const products = ids.length
    ? await prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true }
    })
    : [];

  const names = new Map(products.map(product => [product.id, product.name]));

  const daily = new Map<string, number>();
  for (const order of salesByDay) {
    const key = order.createdAt.toISOString().slice(0, 10);
    daily.set(key, (daily.get(key) ?? 0) + Number(order.total));
  }

  const sales = [...daily.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, revenue]) => ({ day, revenue }));

  sendData(res, {
    ordersByStatus,
    paymentsByStatus,
    salesByDay: sales,
    topProducts: topProducts.map(item => ({
      productId: item.productId,
      name: names.get(item.productId) ?? 'Unknown product',
      quantity: item._sum.quantity ?? 0
    }))
  });
}));

// ============ Settings ============
adminRouter.get('/settings', asyncHandler(async (_req, res) => {
  let settings = await prisma.storeSetting.findFirst();
  if (!settings) settings = await prisma.storeSetting.create({ data: {} });
  const shipping = await prisma.shippingMethod.findMany({ orderBy: { name: 'asc' } });
  sendData(res, { settings, shipping });
}));

adminRouter.patch('/settings', asyncHandler(async (req, res) => {
  const input = z.object({
    storeName: z.string().min(2),
    currency: z.string().length(3),
    defaultShippingId: z.string().nullable().optional(),
    returnWindowDays: z.coerce.number().int().min(0).max(365),
    sessionHours: z.coerce.number().int().min(1).max(168),
    editorialTheme: z.boolean()
  }).parse(req.body);

  let current = await prisma.storeSetting.findFirst();
  current = current
    ? await prisma.storeSetting.update({ where: { id: current.id }, data: input })
    : await prisma.storeSetting.create({ data: input });

  const actor = (req as AuthRequest).user!;
  await prisma.adminAuditLog.create({
    data: {
      actorId: actor.id,
      action: 'UPDATE_SETTINGS',
      resource: 'StoreSetting',
      resourceId: current.id,
      metadata: input
    }
  });

  sendData(res, current);
}));

// ============ Dashboard ============
adminRouter.get('/dashboard', asyncHandler(async (_req, res) => {
  const [products, orders, customers, paid, pendingOrders, lowStock, recentOrders, topProducts] = await Promise.all([
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: { name: 'Customer' } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' } }),
    prisma.order.count({ where: { status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING'] } } }),
    prisma.productVariant.count({ where: { OR: [{ stockQuantity: 0 }, { stockQuantity: { lt: 10 } }] } }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        total: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
        user: { select: { firstName: true, lastName: true, email: true } }
      }
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    })
  ]);

  const productIds = topProducts.map(x => x.productId);
  const productsById = productIds.length
    ? await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true }
    })
    : [];

  const names = new Map(productsById.map(x => [x.id, x.name]));

  sendData(res, {
    products,
    orders,
    customers,
    revenue: Number(paid._sum.total ?? 0),
    pendingOrders,
    lowStock,
    recentOrders,
    topProducts: topProducts.map(x => ({
      productId: x.productId,
      name: names.get(x.productId) ?? 'Unknown product',
      quantity: x._sum.quantity ?? 0
    }))
  });
}));

// ============ Product Management ============
adminRouter.get('/products', asyncHandler(async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
  const page = Math.max(Number(req.query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit ?? 25), 1), 100);

  const where: any = {};
  if (q) where.OR = [{ name: { contains: q } }, { sku: { contains: q } }];
  if (status) where.status = status as any;
  if (categoryId) where.categoryId = categoryId;

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        variants: { include: { inventory: true } }
      },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.product.count({ where })
  ]);

  sendData(res, { items, page, limit, total, pages: Math.ceil(total / limit) });
}));

adminRouter.post('/products', asyncHandler(async (req, res) => {
  const input = productSchema.parse(req.body);

  const existing = await prisma.product.findUnique({ where: { slug: input.slug } });
  if (existing) throw new AppError(409, 'SLUG_IN_USE', 'Product slug already exists.');

  const product = await prisma.product.create({
    data: {
      name: input.name,
      slug: input.slug,
      brand: input.brand,
      description: input.description,
      status: input.status,
      categoryId: input.categoryId,
      images: { create: input.images },
      variants: {
        create: input.variants.map(v => ({
          sku: v.sku,
          price: v.price,
          compareAtPrice: v.compareAtPrice,
          stockQuantity: v.stockQuantity,
          attributes: v.attributes,
          inventory: { create: { quantity: v.stockQuantity } }
        }))
      }
    },
    include: {
      category: true,
      images: true,
      variants: { include: { inventory: true } }
    }
  });

  sendData(res, product, 201);
}));

adminRouter.get('/products/:id', asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: asStr(req.params.id) },
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: { include: { inventory: true } },
      attributes: { include: { values: true } }
    }
  });

  if (!product) throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found.');
  sendData(res, product);
}));

adminRouter.patch('/products/:id', asyncHandler(async (req, res) => {
  const input = productSchema.partial().parse(req.body);
  const product = await prisma.product.update({
    where: { id: asStr(req.params.id) },
    data: {
      name: input.name,
      slug: input.slug,
      brand: input.brand,
      description: input.description,
      status: input.status,
      categoryId: input.categoryId
    }
  });
  sendData(res, product);
}));

// ===== Product Duplicate =====
adminRouter.post('/products/:id/duplicate', asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: asStr(req.params.id) },
    include: {
      variants: true,
      images: true,
      attributes: { include: { values: true } }
    }
  });
  if (!product) throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found.');

  const duplicate = await prisma.$transaction(async (tx) => {
    const newProduct = await tx.product.create({
      data: {
        name: `${product.name} (Copy)`,
        slug: `${product.slug}-copy-${Date.now()}`,
        brand: product.brand,
        description: product.description,
        status: 'DRAFT',
        categoryId: product.categoryId,
      }
    });

    // Copy variants
    for (const variant of product.variants) {
      await tx.productVariant.create({
        data: {
          productId: newProduct.id,
          sku: `${variant.sku}-copy-${Date.now()}`,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          stockQuantity: variant.stockQuantity,
          attributes: variant.attributes,
          inventory: { create: { quantity: variant.stockQuantity } }
        }
      });
    }

    // Copy images
    for (const image of product.images) {
      await tx.productImage.create({
        data: {
          productId: newProduct.id,
          url: image.url,
          altText: image.altText,
          sortOrder: image.sortOrder
        }
      });
    }

    return newProduct;
  });

  sendData(res, duplicate, 201);
}));

// ===== Bulk Product Update =====
adminRouter.patch('/products/bulk', asyncHandler(async (req, res) => {
  const { ids, data } = z.object({
    ids: z.array(z.string()),
    data: z.object({ status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional() })
  }).parse(req.body);

  const result = await prisma.product.updateMany({
    where: { id: { in: ids } },
    data: { status: data.status }
  });

  sendData(res, { updated: result.count });
}));

// ===== Hard Delete Product =====
adminRouter.delete('/products/:id', asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: asStr(req.params.id) }
  });
  if (!product) throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found.');

  if (product.status !== 'DRAFT') {
    await prisma.product.update({
      where: { id: asStr(req.params.id) },
      data: { status: 'ARCHIVED' }
    });
  } else {
    await prisma.product.delete({
      where: { id: asStr(req.params.id) }
    });
  }

  sendData(res, { id: req.params.id, deleted: true });
}));

// ============ Category Management ============
adminRouter.get('/categories', asyncHandler(async (_req, res) => {
  sendData(res, await prisma.category.findMany({
    include: { _count: { select: { products: true, children: true } } },
    orderBy: { name: 'asc' }
  }));
}));

adminRouter.post('/categories', asyncHandler(async (req, res) => {
  sendData(res, await prisma.category.create({
    data: categorySchema.parse(req.body)
  }), 201);
}));

adminRouter.patch('/categories/:id', asyncHandler(async (req, res) => {
  sendData(res, await prisma.category.update({
    where: { id: asStr(req.params.id) },
    data: categorySchema.partial().parse(req.body)
  }));
}));

adminRouter.delete('/categories/:id', asyncHandler(async (req, res) => {
  const count = await prisma.product.count({ where: { categoryId: asStr(req.params.id) } });
  if (count) throw new AppError(409, 'CATEGORY_HAS_PRODUCTS', 'Move products before deleting this category.');

  await prisma.category.delete({ where: { id: asStr(req.params.id) } });
  sendData(res, { id: req.params.id, deleted: true });
}));

// ============ Inventory Management ============
adminRouter.get('/inventory', asyncHandler(async (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

  const where: any = {};
  if (search) {
    where.OR = [
      { product: { name: { contains: search } } },
      { sku: { contains: search } }
    ];
  }

  const variants = await prisma.productVariant.findMany({
    where,
    include: {
      product: { select: { id: true, name: true, slug: true } },
      inventory: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  // Filter by stock status
  let filtered = variants;
  if (status === 'healthy') {
    filtered = variants.filter(v => (v.inventory?.quantity ?? v.stockQuantity) > 10);
  } else if (status === 'low-stock') {
    filtered = variants.filter(v => {
      const stock = v.inventory?.quantity ?? v.stockQuantity;
      return stock <= 10 && stock > 0;
    });
  } else if (status === 'out-of-stock') {
    filtered = variants.filter(v => (v.inventory?.quantity ?? v.stockQuantity) === 0);
  }

  sendData(res, { items: filtered });
}));

adminRouter.patch('/inventory/:variantId', asyncHandler(async (req, res) => {
  const input = stockSchema.parse(req.body);

  const variant = await prisma.productVariant.findUnique({
    where: { id: asStr(req.params.variantId) },
    include: { inventory: true }
  });

  if (!variant) throw new AppError(404, 'VARIANT_NOT_FOUND', 'Variant not found.');

  const current = variant.inventory?.quantity ?? variant.stockQuantity;
  const delta = input.quantity - current;

  const result = await prisma.$transaction(async (tx) => {
    const inventory = variant.inventory
      ? await tx.inventory.update({
        where: { variantId: variant.id },
        data: { quantity: input.quantity }
      })
      : await tx.inventory.create({
        data: { variantId: variant.id, quantity: input.quantity }
      });

    await tx.productVariant.update({
      where: { id: variant.id },
      data: { stockQuantity: input.quantity }
    });

    await tx.inventoryTransaction.create({
      data: {
        inventoryId: inventory.id,
        quantityDelta: delta,
        reason: input.reason
      }
    });

    return inventory;
  });

  sendData(res, result);
}));

// ===== Bulk Inventory Update =====
adminRouter.patch('/inventory/bulk', asyncHandler(async (req, res) => {
  const { ids, quantity, reason } = z.object({
    ids: z.array(z.string()),
    quantity: z.coerce.number().int().min(0),
    reason: z.string().min(2).default('BULK_ADJUSTMENT')
  }).parse(req.body);

  const results = await Promise.all(
    ids.map(async (id) => {
      const variant = await prisma.productVariant.findUnique({
        where: { id },
        include: { inventory: true }
      });
      if (!variant) return null;

      const current = variant.inventory?.quantity ?? variant.stockQuantity;
      const delta = quantity - current;

      const inventory = variant.inventory
        ? await prisma.inventory.update({
          where: { variantId: variant.id },
          data: { quantity }
        })
        : await prisma.inventory.create({
          data: { variantId: variant.id, quantity }
        });

      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { stockQuantity: quantity }
      });

      await prisma.inventoryTransaction.create({
        data: {
          inventoryId: inventory.id,
          quantityDelta: delta,
          reason: reason
        }
      });

      return inventory;
    })
  );

  sendData(res, { updated: results.filter(Boolean).length });
}));

// ============ Order Management ============
adminRouter.get('/orders', asyncHandler(async (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const paymentStatus = typeof req.query.paymentStatus === 'string' ? req.query.paymentStatus : undefined;
  const dateFrom = typeof req.query.dateFrom === 'string' ? req.query.dateFrom : undefined;
  const dateTo = typeof req.query.dateTo === 'string' ? req.query.dateTo : undefined;

  const where: any = {};
  if (status) where.status = status as never;
  if (paymentStatus) where.paymentStatus = paymentStatus as never;
  if (dateFrom) where.createdAt = { ...where.createdAt, gte: new Date(dateFrom) };
  if (dateTo) where.createdAt = { ...where.createdAt, lte: new Date(dateTo) };

  sendData(res, await prisma.order.findMany({
    where,
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      items: true,
      payment: true,
      address: true
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  }));
}));

adminRouter.get('/orders/:id', asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: asStr(req.params.id) },
    include: {
      user: true,
      address: true,
      items: { include: { product: true, variant: true } },
      payment: { include: { transactions: true } },
      statusHistory: { orderBy: { createdAt: 'asc' } }
    }
  });

  if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found.');
  sendData(res, order);
}));

adminRouter.patch('/orders/:id', asyncHandler(async (req, res) => {
  const input = orderSchema.parse(req.body);

  const current = await prisma.order.findUnique({ where: { id: asStr(req.params.id) } });
  if (!current) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found.');

  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: asStr(req.params.id) },
      data: { status: input.status, paymentStatus: input.paymentStatus }
    });

    if (current.status !== input.status) {
      await tx.orderStatusHistory.create({
        data: {
          orderId: updated.id,
          status: input.status,
          note: `Order status updated to ${input.status.replaceAll('_', ' ').toLowerCase()}.`
        }
      });

      await tx.notification.create({
        data: {
          userId: updated.userId,
          type: 'ORDER_UPDATE',
          title: 'Your order was updated',
          body: `Your order is now ${input.status.replaceAll('_', ' ').toLowerCase()}.`,
          deepLink: `/orders/${updated.id}`
        }
      });
    }

    return updated;
  });

  const actor = (req as AuthRequest).user!;
  await prisma.adminAuditLog.create({
    data: {
      actorId: actor.id,
      action: 'UPDATE_ORDER',
      resource: 'Order',
      resourceId: order.id,
      metadata: { status: input.status, paymentStatus: input.paymentStatus }
    }
  });

  sendData(res, order);
}));

// ===== Order Notes =====
adminRouter.post('/orders/:id/notes', asyncHandler(async (req, res) => {
  const { note } = z.object({ note: z.string().min(1) }).parse(req.body);
  const order = await prisma.order.findUnique({ where: { id: asStr(req.params.id) } });
  if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found.');

  await prisma.orderStatusHistory.create({
    data: {
      orderId: order.id,
      status: order.status,
      note: `[Admin Note] ${note}`
    }
  });

  sendData(res, { success: true });
}));

// ===== Refund Order =====
adminRouter.post('/orders/:id/refund', asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: asStr(req.params.id) },
    include: { payment: true }
  });
  if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found.');
  if (order.paymentStatus !== 'PAID') {
    throw new AppError(400, 'NOT_PAID', 'Order is not paid.');
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: 'REFUNDED' }
  });

  await prisma.adminAuditLog.create({
    data: {
      actorId: (req as AuthRequest).user!.id,
      action: 'REFUND_ORDER',
      resource: 'Order',
      resourceId: order.id,
      metadata: { orderId: order.id, amount: Number(order.total) }
    }
  });

  sendData(res, updated);
}));

// ============ Customer Management ============
adminRouter.get('/customers', asyncHandler(async (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const dateFrom = typeof req.query.dateFrom === 'string' ? req.query.dateFrom : undefined;
  const dateTo = typeof req.query.dateTo === 'string' ? req.query.dateTo : undefined;

  const where: any = { role: { name: 'Customer' } };
  if (status) where.status = status as never;
  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { email: { contains: search } }
    ];
  }
  if (dateFrom) where.createdAt = { ...where.createdAt, gte: new Date(dateFrom) };
  if (dateTo) where.createdAt = { ...where.createdAt, lte: new Date(dateTo) };

  sendData(res, await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      status: true,
      createdAt: true,
      _count: { select: { orders: true, reviews: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 200
  }));
}));

adminRouter.get('/customers/:id', asyncHandler(async (req, res) => {
  const customer = await prisma.user.findFirst({
    where: { id: asStr(req.params.id), role: { name: 'Customer' } },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      status: true,
      createdAt: true,
      addresses: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { items: true, payment: true }
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: { product: { select: { id: true, name: true } } }
      }
    }
  });

  if (!customer) throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found.');
  sendData(res, customer);
}));

// ===== Update Customer =====
adminRouter.patch('/customers/:id', asyncHandler(async (req, res) => {
  const input = z.object({
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
  }).parse(req.body);

  const user = await prisma.user.findFirst({
    where: { id: asStr(req.params.id), role: { name: 'Customer' } }
  });
  if (!user) throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found.');

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { status: input.status }
  });

  await prisma.adminAuditLog.create({
    data: {
      actorId: (req as AuthRequest).user!.id,
      action: 'UPDATE_CUSTOMER_STATUS',
      resource: 'User',
      resourceId: updated.id,
      metadata: { status: input.status }
    }
  });

  sendData(res, updated);
}));

// ===== Bulk Customer Update =====
adminRouter.patch('/customers/bulk', asyncHandler(async (req, res) => {
  const { ids, data } = z.object({
    ids: z.array(z.string()),
    data: z.object({ status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']) })
  }).parse(req.body);

  const result = await prisma.user.updateMany({
    where: { id: { in: ids }, role: { name: 'Customer' } },
    data: { status: data.status }
  });

  await prisma.adminAuditLog.create({
    data: {
      actorId: (req as AuthRequest).user!.id,
      action: 'BULK_UPDATE_CUSTOMERS',
      resource: 'User',
      metadata: { ids, status: data.status }
    }
  });

  sendData(res, { updated: result.count });
}));

// ============ Inventory History ============
adminRouter.get('/inventory/:variantId/history', asyncHandler(async (req, res) => {
  const variant = await prisma.productVariant.findUnique({
    where: { id: asStr(req.params.variantId) },
    include: {
      inventory: {
        include: {
          transactions: { orderBy: { createdAt: 'desc' }, take: 100 }
        }
      }
    }
  });

  if (!variant?.inventory) throw new AppError(404, 'INVENTORY_NOT_FOUND', 'Inventory record not found.');

  sendData(res, {
    variantId: variant.id,
    sku: variant.sku,
    transactions: variant.inventory.transactions
  });
}));

// ============ Review Management ============
adminRouter.get('/reviews', asyncHandler(async (_req, res) => {
  sendData(res, await prisma.review.findMany({
    include: {
      product: { select: { id: true, name: true } },
      user: { select: { id: true, firstName: true, lastName: true, email: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 200
  }));
}));

adminRouter.get('/reviews/:id', asyncHandler(async (req, res) => {
  const review = await prisma.review.findUnique({
    where: { id: asStr(req.params.id) },
    include: { product: true, user: true }
  });

  if (!review) throw new AppError(404, 'REVIEW_NOT_FOUND', 'Review not found.');
  sendData(res, review);
}));

adminRouter.patch('/reviews/:id', asyncHandler(async (req, res) => {
  const input = z.object({ approved: z.boolean() }).parse(req.body);

  const review = await prisma.review.update({
    where: { id: asStr(req.params.id) },
    data: { approved: input.approved }
  });

  const actor = (req as AuthRequest).user!;
  await prisma.adminAuditLog.create({
    data: {
      actorId: actor.id,
      action: input.approved ? 'APPROVE_REVIEW' : 'REJECT_REVIEW',
      resource: 'Review',
      resourceId: review.id,
      metadata: { approved: input.approved }
    }
  });

  sendData(res, review);
}));

// ============ Coupons ============
adminRouter.get('/coupons', asyncHandler(async (_req, res) => {
  sendData(res, await prisma.coupon.findMany({
    include: { usages: true },
    orderBy: { createdAt: 'desc' }
  }));
}));

adminRouter.post('/coupons', asyncHandler(async (req, res) => {
  const input = couponSchema.parse(req.body);
  const coupon = await prisma.coupon.create({
    data: { ...input, code: input.code.toUpperCase() }
  });
  sendData(res, coupon, 201);
}));

// ============ Returns ============
adminRouter.get('/returns', asyncHandler(async (_req, res) => {
  sendData(res, await prisma.return.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      order: { select: { id: true, total: true, status: true } },
      items: true
    },
    orderBy: { createdAt: 'desc' },
    take: 200
  }));
}));

adminRouter.patch('/returns/:id', asyncHandler(async (req, res) => {
  const input = returnSchema.parse(req.body);

  const item = await prisma.return.update({
    where: { id: asStr(req.params.id) },
    data: { status: input.status, notes: input.notes }
  });

  const actor = (req as AuthRequest).user!;
  await prisma.adminAuditLog.create({
    data: {
      actorId: actor.id,
      action: 'UPDATE_RETURN',
      resource: 'Return',
      resourceId: item.id,
      metadata: { status: input.status }
    }
  });

  sendData(res, item);
}));

// ============ Payments ============
adminRouter.get('/payments', asyncHandler(async (_req, res) => {
  sendData(res, await prisma.payment.findMany({
    include: {
      transactions: true,
      order: {
        select: {
          id: true,
          user: { select: { firstName: true, lastName: true, email: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 200
  }));
}));

// ============ Shipping Methods ============
adminRouter.get('/shipping', asyncHandler(async (_req, res) => {
  sendData(res, await prisma.shippingMethod.findMany({
    orderBy: { createdAt: 'desc' }
  }));
}));

adminRouter.post('/shipping', asyncHandler(async (req, res) => {
  sendData(res, await prisma.shippingMethod.create({
    data: shippingSchema.parse(req.body)
  }), 201);
}));

adminRouter.patch('/shipping/:id', asyncHandler(async (req, res) => {
  sendData(res, await prisma.shippingMethod.update({
    where: { id: asStr(req.params.id) },
    data: shippingSchema.partial().parse(req.body)
  }));
}));

// ============ Notifications ============
adminRouter.get('/notifications', asyncHandler(async (_req, res) => {
  sendData(res, await prisma.notification.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, email: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 200
  }));
}));

adminRouter.post('/notifications', asyncHandler(async (req, res) => {
  sendData(res, await prisma.notification.create({
    data: notificationSchema.parse(req.body)
  }), 201);
}));

adminRouter.delete('/notifications/:id', asyncHandler(async (req, res) => {
  await prisma.notification.delete({ where: { id: asStr(req.params.id) } });
  sendData(res, { id: req.params.id, deleted: true });
}));

// ============ Administrator Management ============
adminRouter.get('/administrators', asyncHandler(async (_req, res) => {
  sendData(res, await prisma.user.findMany({
    where: { role: { name: { in: ['Platform Owner', 'Administrator'] } } },
    include: { role: true },
    orderBy: { createdAt: 'desc' }
  }));
}));

adminRouter.post('/administrators', asyncHandler(async (req, res) => {
  const input = adminSchema.parse(req.body);

  const exists = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() }
  });

  if (exists) throw new AppError(409, 'EMAIL_IN_USE', 'An account with this email already exists.');

  const crypto = await import('node:crypto');
  const { promisify } = await import('node:util');
  const scrypt = promisify(crypto.scrypt);

  const salt = crypto.randomBytes(16);
  const derived = await scrypt(input.password, salt, 64) as Buffer;
  const passwordHash = `${salt.toString('hex')}:${derived.toString('hex')}`;

  const user = await prisma.user.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email.toLowerCase(),
      passwordHash,
      roleId: input.roleId
    },
    include: { role: true }
  });

  sendData(res, user, 201);
}));

adminRouter.delete('/administrators/:id', asyncHandler(async (req, res) => {
  const target = await prisma.user.findUnique({
    where: { id: asStr(req.params.id) },
    include: { role: true }
  });

  if (!target) throw new AppError(404, 'ADMIN_NOT_FOUND', 'Administrator not found.');
  if (target.role.name === 'Platform Owner') {
    throw new AppError(403, 'OWNER_PROTECTED', 'Platform Owner cannot be deleted.');
  }

  await prisma.user.delete({ where: { id: target.id } });
  sendData(res, { id: target.id, deleted: true });
}));

// ============ Roles ============
adminRouter.get('/roles', asyncHandler(async (_req, res) => {
  sendData(res, await prisma.role.findMany({
    include: {
      users: { select: { id: true } },
      permissions: { include: { permission: true } }
    },
    orderBy: { name: 'asc' }
  }));
}));

adminRouter.post('/roles', asyncHandler(async (req, res) => {
  sendData(res, await prisma.role.create({
    data: roleSchema.parse(req.body)
  }), 201);
}));

adminRouter.delete('/roles/:id', asyncHandler(async (req, res) => {
  const role = await prisma.role.findUnique({
    where: { id: asStr(req.params.id) },
    include: { users: true }
  });

  if (!role) throw new AppError(404, 'ROLE_NOT_FOUND', 'Role not found.');
  if (role.users.length) {
    throw new AppError(409, 'ROLE_IN_USE', 'Reassign administrators before deleting this role.');
  }

  await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
  await prisma.role.delete({ where: { id: role.id } });
  sendData(res, { id: role.id, deleted: true });
}));

// ============ Audit Logs ============
adminRouter.get('/audit-logs', asyncHandler(async (_req, res) => {
  sendData(res, await prisma.adminAuditLog.findMany({
    include: {
      actor: { select: { firstName: true, lastName: true, email: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 300
  }));
}));