export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  attributes: Record<string, string>;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  status: ProductStatus;
  imageUrl?: string;
  price: number;
  compareAtPrice?: number;
}
