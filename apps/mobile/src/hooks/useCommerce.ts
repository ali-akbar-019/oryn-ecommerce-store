import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; import { api } from '../services/api';
export function useWishlist() { return useQuery({ queryKey: ['wishlist'], queryFn: () => api.get('/wishlist') }); }
export function useAddWishlist() { const qc = useQueryClient(); return useMutation({ mutationFn: (productId: string) => api.post('/wishlist/items', { productId }), onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }) }); }
export function useRemoveWishlist() { const qc = useQueryClient(); return useMutation({ mutationFn: (productId: string) => api.del(`/wishlist/items/${productId}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }) }); }
export function useCart() { return useQuery({ queryKey: ['cart'], queryFn: () => api.get('/cart') }); }
export function useOrders() { return useQuery({ queryKey: ['orders'], queryFn: () => api.get('/orders') }); }
