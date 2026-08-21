export type ApiProductVariant = {
  id: string;
  sku: string;
  price: string | number;
  compareAtPrice?: string | number | null;
  stockQuantity: number;
  attributes: Record<string, unknown>;
  inventory?: { quantity: number } | null;
};

export type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  brand?: string | null;
  description?: string | null;
  status: string;
  category: {
    id: string;
    name: string;
    slug: string
  };
  images: {
    id: string;
    url: string;
    altText?: string | null;
    sortOrder: number
  }[];
  variants: ApiProductVariant[];
  attributes?: {
    id: string;
    name: string;
    values: {
      id: string;
      value: string
    }[]
  }[];
  reviews?: {
    id: string;
    rating: number;
    title: string;
    body: string;
    user: {
      firstName: string;
      lastName: string
    }
  }[];
};

export type ProductCardModel = {
  id: string;
  name: string;
  category: string;
  price: string;
  compareAt?: string;
  image: string;
  tone?: string;
};