import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@oryn/database';
import { AppError, asyncHandler, sendData } from '../../common/http';
import { requireAuth, type AuthRequest } from '../../middleware/auth';

const itemSchema = z.object({ variantId: z.string(), quantity: z.number().int().min(1).max(99) });
export const cartRouter = Router();
cartRouter.use(requireAuth);
cartRouter.get('/', asyncHandler(async (req, res) => {
  const userId = (req as AuthRequest).user!.id;
  const cart = await prisma.cart.findFirst({ where: { userId }, include: { items: { include: { product: { include: { images: true } }, variant: true } } } });
  sendData(res, cart ?? { id: null, items: [] });
}));
cartRouter.post('/items', asyncHandler(async (req, res) => {
  const userId = (req as AuthRequest).user!.id; const input = itemSchema.parse(req.body);
  const variant = await prisma.productVariant.findUnique({ where: { id: input.variantId }, include: { product: true, inventory: true } });
  if (!variant || variant.product.status !== 'ACTIVE') throw new AppError(404, 'VARIANT_NOT_FOUND', 'Product variant not found.');
  if ((variant.inventory?.quantity ?? variant.stockQuantity) < input.quantity) throw new AppError(409, 'INSUFFICIENT_STOCK', 'The selected quantity is not available.');
  const cart = await prisma.cart.upsert({ where: { userId }, update: {}, create: { userId } });
  const item = await prisma.cartItem.upsert({ where: { cartId_variantId: { cartId: cart.id, variantId: input.variantId } }, update: { quantity: input.quantity }, create: { cartId: cart.id, productId: variant.productId, variantId: input.variantId, quantity: input.quantity } });
  sendData(res, item, 201);
}));
cartRouter.patch('/items/:id', asyncHandler(async (req, res) => {
  const userId = (req as AuthRequest).user!.id; const quantity = z.number().int().min(1).max(99).parse(req.body.quantity);
  const item = await prisma.cartItem.findFirst({ where: { id: req.params.id, cart: { userId } }, include: { variant: { include: { inventory: true } } } });
  if (!item) throw new AppError(404, 'CART_ITEM_NOT_FOUND', 'Cart item not found.');
  const available = item.variant.inventory?.quantity ?? item.variant.stockQuantity;
  if (quantity > available) throw new AppError(409, 'INSUFFICIENT_STOCK', 'The selected quantity is not available.');
  sendData(res, await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } }));
}));
cartRouter.delete('/items/:id', asyncHandler(async (req, res) => {
  const userId = (req as AuthRequest).user!.id; const item = await prisma.cartItem.findFirst({ where: { id: req.params.id, cart: { userId } } });
  if (!item) throw new AppError(404, 'CART_ITEM_NOT_FOUND', 'Cart item not found.');
  await prisma.cartItem.delete({ where: { id: item.id } }); res.status(204).send();
}));
