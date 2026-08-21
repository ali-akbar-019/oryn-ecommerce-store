export type ProductCardData = {
    id: string;
    name: string;
    slug: string;
    brand?: string | null;
    status: string;
    categoryId: string;
    images: Array<{
        url: string;
        altText?: string | null;
    }>;
    variants: Array<{
        id: string;
        price: string | number;
        compareAtPrice?: string | number | null;
        stockQuantity: number;
        attributes: unknown;
    }>;
};