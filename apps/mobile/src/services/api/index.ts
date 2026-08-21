export * from './client';
import { api } from './client';

export type Address = {
  id: string; label: string; firstName: string; lastName: string; line1: string; line2?: string | null;
  city: string; state?: string | null; postalCode: string; country: string; phone: string; isDefault: boolean;
};
export type ShippingMethod = { id: string; name: string; description?: string | null; price: string | number; active: boolean };
export type OrderResponse = { id: string; status: string; paymentStatus: string; subtotal: string | number; shippingTotal: string | number; total: string | number; currency: string };

export const addressApi = {
  list: () => api.get<Address[]>('/addresses'),
  create: (input: Omit<Address, 'id'>) => api.post<Address>('/addresses', input),
  update: (id: string, input: Partial<Address>) => api.patch<Address>(`/addresses/${id}`, input),
  remove: (id: string) => api.del(`/addresses/${id}`),
};
export const shippingApi = { list: () => api.get<ShippingMethod[]>('/orders/shipping-methods') };
export const orderApi = {
  create: (input: { addressId: string; shippingMethodId: string; currency?: string }) => api.post<OrderResponse>('/orders', input),
  mockPayment: (orderId: string, outcome: 'success' | 'failure' = 'success') => api.post(`/payments/${orderId}/mock`, { outcome }),
};
