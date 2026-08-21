import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';

export type OrderHistoryEntry = {
  id: string;
  status: OrderStatus;
  note?: string | null;
  createdAt: string;
};

export type OrderListItem = {
  id: string;
  status: OrderStatus;
  paymentStatus: string;
  subtotal: string | number;
  shippingTotal: string | number;
  total: string | number;
  currency: string;
  createdAt: string;
  items: Array<{ id: string; productName: string; quantity: number; unitPrice: string | number; lineTotal: string | number; variantSnapshot: unknown }>;
  statusHistory: OrderHistoryEntry[];
};

export type OrderDetail = OrderListItem & {
  updatedAt: string;
  address?: {
    id: string;
    label: string;
    firstName: string;
    lastName: string;
    line1: string;
    line2?: string | null;
    city: string;
    state?: string | null;
    postalCode: string;
    country: string;
    phone: string;
  } | null;
  payment?: {
    id: string;
    provider: string;
    status: string;
    amount: string | number;
    currency: string;
    transactions: Array<{ id: string; status: string; providerReference?: string | null; createdAt: string }>;
  } | null;
  returns: Array<{ id: string; status: string; reason: string; createdAt: string }>;
};

export function useOrders() {
  return useQuery({ queryKey: ['orders'], queryFn: () => api.get<OrderListItem[]>('/orders') });
}

export function useOrder(id?: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => api.get<OrderDetail>(`/orders/${id}`),
    enabled: Boolean(id),
  });
}
