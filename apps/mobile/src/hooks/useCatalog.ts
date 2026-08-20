import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
export function useProducts(params?: { q?: string; category?: string; page?: number }) { const query = new URLSearchParams(); Object.entries(params ?? {}).forEach(([key, value]) => value != null && query.set(key, String(value))); return useQuery({ queryKey: ['products', params], queryFn: () => api.get(`/products?${query.toString()}`) }); }
export function useProduct(id: string) { return useQuery({ queryKey: ['product', id], queryFn: () => api.get(`/products/${id}`), enabled: Boolean(id) }); }
export function useCategories() { return useQuery({ queryKey: ['categories'], queryFn: () => api.get('/categories') }); }
