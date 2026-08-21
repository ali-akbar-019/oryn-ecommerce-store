import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function useProducts(params?: {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value != null) query.set(key, String(value));
  });

  return useQuery({
    queryKey: ['products', params],
    queryFn: () => api.get<{
      items: import('../services/catalog/types').ApiProduct[];
      page: number;
      limit: number;
      total: number;
      pages: number;
    }>(`/products?${query.toString()}`),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get<import('../services/catalog/types').ApiProduct>(`/products/${id}`),
    enabled: Boolean(id)
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<{
      id: string;
      name: string;
      slug: string;
    }[]>('/categories')
  });
}