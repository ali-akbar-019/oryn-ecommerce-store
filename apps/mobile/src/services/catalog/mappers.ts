import type { ApiProduct, ApiProductVariant, ProductCardModel } from './types';

export function money(value: string | number | null | undefined) {
  if (value == null) return '';
  return `$${Number(value).toFixed(2)}`;
}

export function primaryVariant(product: ApiProduct): ApiProductVariant | undefined {
  return [...product.variants].sort((a, b) => Number(a.price) - Number(b.price))[0];
}

export function toCard(product: ApiProduct): ProductCardModel {
  const variant = primaryVariant(product);
  return {
    id: product.id,
    name: product.name,
    category: product.category.name,
    price: money(variant?.price),
    compareAt: variant?.compareAtPrice != null ? money(variant.compareAtPrice) : undefined,
    image: product.images[0]?.url ?? 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85',
  };
}

export function variantAttributes(product: ApiProduct, variant: ApiProductVariant) {
  return Object.entries(variant.attributes ?? {}).map(([key, value]) => `${key}:${String(value)}`);
}
