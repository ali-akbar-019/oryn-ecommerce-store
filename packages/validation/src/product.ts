import { z } from 'zod';

export const productVariantSchema = z.object({
  sku: z.string().min(1),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional(),
  stockQuantity: z.number().int().nonnegative(),
  attributes: z.record(z.string(), z.string())
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(220),
  description: z.string().max(10000).optional(),
  categoryId: z.string().min(1),
  variants: z.array(productVariantSchema).min(1)
});
