import type { ApiProduct, ApiProductVariant, ProductCardModel } from './types';

export function money(value: string | number | null | undefined) {
  if (value == null) return '';
  return `$${Number(value).toFixed(2)}`;
}

export function primaryVariant(product: ApiProduct): ApiProductVariant | undefined {
  if (!product || !product.variants || product.variants.length === 0) {
    return undefined;
  }
  return [...product.variants].sort((a, b) => Number(a.price) - Number(b.price))[0];
}

export function toCard(product: ApiProduct): ProductCardModel | null {
  // Guard against undefined/null product
  if (!product || !product.id) {
    return null;
  }

  const variant = primaryVariant(product);

  // Safely get category name
  const categoryName = product.category?.name ?? 'Uncategorized';

  // Safely get image
  const imageUrl = product.images?.[0]?.url ?? 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85';

  return {
    id: product.id,
    name: product.name ?? 'Unnamed Product',
    category: categoryName,
    price: variant?.price != null ? money(variant.price) : '$0.00',
    compareAt: variant?.compareAtPrice != null ? money(variant.compareAtPrice) : undefined,
    image: imageUrl,
  };
}

export function variantAttributes(product: ApiProduct, variant: ApiProductVariant) {
  // Guard against undefined/null
  if (!product || !variant) {
    return [];
  }

  const attributes = variant.attributes ?? {};
  return Object.entries(attributes).map(([key, value]) => `${key}:${String(value)}`);
}