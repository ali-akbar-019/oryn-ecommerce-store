import { Router } from 'express';
import { prisma } from '@oryn/database';
import { AppError, asStr, asyncHandler, sendData } from '../../common/http.js';
import { requireAuth, type AuthRequest } from '../../middleware/auth.js';
import { z } from 'zod';

const checkoutSchema = z.object({
  addressId: z.string(),
  currency: z.string().length(3).default('USD'),
  shippingMethodId: z.string().optional(),
});

export const ordersRouter = Router();
ordersRouter.use(requireAuth);

ordersRouter.get('/shipping-methods', asyncHandler(async (_req, res) =>
  sendData(res, await prisma.shippingMethod.findMany({
    where: { active: true },
    orderBy: [{ price: 'asc' }, { name: 'asc' }],
  }))
));

ordersRouter.get('/', asyncHandler(async (req, res) => {
  const userId = (req as AuthRequest).user!.id;
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: true,
      payment: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });
  sendData(res, orders);
}));

ordersRouter.get('/:id', asyncHandler(async (req, res) => {
  const userId = (req as AuthRequest).user!.id;
  const order = await prisma.order.findFirst({
    where: { id: asStr(req.params.id), userId },
    include: {
      items: { include: { product: { select: { id: true, name: true, slug: true, images: { orderBy: { sortOrder: 'asc' }, take: 1 } } } } },
      address: true,
      payment: { include: { transactions: { orderBy: { createdAt: 'desc' } } } },
      returns: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  });
  if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found.');
  sendData(res, order);
}));

ordersRouter.post('/', asyncHandler(async (req, res) => {
  const userId = (req as AuthRequest).user!.id;
  const input = checkoutSchema.parse(req.body);
  const cart = await prisma.cart.findFirst({
    where: { userId },
    include: { items: { include: { product: true, variant: { include: { inventory: true } } } } },
  });
  const address = await prisma.address.findFirst({ where: { id: input.addressId, userId } });
  if (!address) throw new AppError(400, 'ADDRESS_INVALID', 'Delivery address is invalid.');
  if (!cart?.items.length) throw new AppError(400, 'CART_EMPTY', 'Your cart is empty.');

  for (const item of cart.items) {
    const available = item.variant.inventory?.quantity ?? item.variant.stockQuantity;
    if (available < item.quantity) {
      throw new AppError(409, 'INVENTORY_CHANGED', `${item.product.name} is no longer available in the requested quantity.`);
    }
  }

  const shipping = input.shippingMethodId
    ? await prisma.shippingMethod.findFirst({ where: { id: input.shippingMethodId, active: true } })
    : null;
  if (input.shippingMethodId && !shipping) {
    throw new AppError(400, 'SHIPPING_METHOD_INVALID', 'The selected shipping method is no longer available.');
  }

  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0);
  const shippingTotal = Number(shipping?.price ?? 0);
  const total = subtotal + shippingTotal;

  const order = await prisma.$transaction(async tx => {
    const created = await tx.order.create({
      data: {
        userId,
        addressId: address.id,
        subtotal,
        discountTotal: 0,
        shippingTotal,
        taxTotal: 0,
        total,
        currency: input.currency.toUpperCase(),
        statusHistory: { create: { status: 'PENDING', note: 'Order placed.' } },
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.product.name,
            variantSnapshot: JSON.parse(JSON.stringify(item.variant.attributes)),
            unitPrice: item.variant.price,
            quantity: item.quantity,
            lineTotal: Number(item.variant.price) * item.quantity,
          })),
        },
        payment: { create: { provider: 'mock', amount: total, currency: input.currency.toUpperCase() } },
      },
      include: { items: true, payment: true, statusHistory: true },
    });

    for (const item of cart.items) {
      const inventory = item.variant.inventory;
      if (inventory) {
        await tx.inventory.update({ where: { id: inventory.id }, data: { quantity: { decrement: item.quantity } } });
        await tx.inventoryTransaction.create({ data: { inventoryId: inventory.id, quantityDelta: -item.quantity, reason: 'ORDER_CREATED', referenceId: created.id } });
      } else {
        await tx.productVariant.update({ where: { id: item.variantId }, data: { stockQuantity: { decrement: item.quantity } } });
      }
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return created;
  });

  sendData(res, order, 201);
}));
