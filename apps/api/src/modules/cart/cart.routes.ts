import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@oryn/database';
import { AppError, asStr, asyncHandler, sendData } from '../../common/http.js';
import { requireAuth, type AuthRequest } from '../../middleware/auth.js';

const itemSchema = z.object({ variantId: z.string().min(1), quantity: z.number().int().min(1).max(99) });
export const cartRouter = Router();
cartRouter.use(requireAuth);

const cartInclude = {
  items: {
    include: {
      product: { include: { images: { orderBy: { sortOrder: 'asc' as const } } } },
      variant: { include: { inventory: true } },
    },
    orderBy: { createdAt: 'asc' as const },
  },
} as const;

async function getOrCreateCart(userId: string) {
  const existing = await prisma.cart.findFirst({ where: { userId } });
  if (existing) return existing;
  return prisma.cart.create({ data: { userId } });
}

async function getCart(userId: string) {
  return prisma.cart.findFirst({ where: { userId }, include: cartInclude });
}

cartRouter.get('/', asyncHandler(async (req, res) => {
  const userId = (req as AuthRequest).user!.id;
  sendData(res, await getCart(userId) ?? { id: null, items: [] });
}));

cartRouter.post('/items', asyncHandler(async (req, res) => {
  const userId = (req as AuthRequest).user!.id;
  const input = itemSchema.parse(req.body);
  const variant = await prisma.productVariant.findUnique({ where: { id: input.variantId }, include: { product: true, inventory: true } });
  if (!variant || variant.product.status !== 'ACTIVE') throw new AppError(404, 'VARIANT_NOT_FOUND', 'Product variant not found.');
  const available = variant.inventory?.quantity ?? variant.stockQuantity;
  const existing = await prisma.cartItem.findFirst({ where: { cart: { userId }, variantId: input.variantId } });
  const nextQuantity = (existing?.quantity ?? 0) + input.quantity;
  if (nextQuantity > available) throw new AppError(409, 'INSUFFICIENT_STOCK', 'The selected quantity is not available.');
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId: input.variantId } },
    update: { quantity: nextQuantity },
    create: { cartId: cart.id, productId: variant.productId, variantId: input.variantId, quantity: input.quantity },
  });
  sendData(res, await getCart(userId), 201);
}));

cartRouter.patch('/items/:id', asyncHandler(async (req, res) => {
  const userId = (req as AuthRequest).user!.id;
  const quantity = z.number().int().min(1).max(99).parse(req.body.quantity);
  const item = await prisma.cartItem.findFirst({ where: { id: asStr(req.params.id), cart: { userId } }, include: { variant: { include: { inventory: true } } } });
  if (!item) throw new AppError(404, 'CART_ITEM_NOT_FOUND', 'Cart item not found.');
  const available = item.variant.inventory?.quantity ?? item.variant.stockQuantity;
  if (quantity > available) throw new AppError(409, 'INSUFFICIENT_STOCK', 'The selected quantity is not available.');
  await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
  sendData(res, await getCart(userId));
}));

cartRouter.delete('/items/:id', asyncHandler(async (req, res) => {
  const userId = (req as AuthRequest).user!.id;
  const item = await prisma.cartItem.findFirst({ where: { id: asStr(req.params.id), cart: { userId } } });
  if (!item) throw new AppError(404, 'CART_ITEM_NOT_FOUND', 'Cart item not found.');
  await prisma.cartItem.delete({ where: { id: item.id } });
  sendData(res, await getCart(userId));
}));
