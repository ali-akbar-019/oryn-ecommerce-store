import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { ApiProduct } from '../services/catalog/types';

export type ApiWishlist = {
    items: {
        id: string;
        productId: string;
        product: ApiProduct;
    }[]
};

export function useWishlist() {
    return useQuery({
        queryKey: ['wishlist'],
        queryFn: () => api.get<ApiWishlist>('/wishlist')
    });
}

export function useAddWishlist() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (productId: string) =>
            api.post('/wishlist/items', { productId }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] })
    });
}

export function useRemoveWishlist() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (productId: string) =>
            api.del(`/wishlist/items/${productId}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] })
    });
}

export function useCart() {
    return useQuery({
        queryKey: ['cart'],
        queryFn: () => api.get('/cart')
    });
}