import { create } from 'zustand';
import type { Product } from '@/data/catalog';

export type CartItem = {
  key: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
};

type CartState = {
  items: CartItem[];
  addItem: (product: Product, options: { color?: string; size?: string; quantity?: number }) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (product, options) => set((state) => {
    const key = [product.id, options.color ?? '', options.size ?? ''].join(':');
    const quantity = options.quantity ?? 1;
    const existing = state.items.find((item) => item.key === key);
    if (existing) {
      return { items: state.items.map((item) => item.key === key ? { ...item, quantity: item.quantity + quantity } : item) };
    }
    return { items: [...state.items, { key, productId: product.id, name: product.name, image: product.image, price: product.price, quantity, color: options.color, size: options.size }] };
  }),
  updateQuantity: (key, quantity) => set((state) => ({ items: quantity <= 0 ? state.items.filter((item) => item.key !== key) : state.items.map((item) => item.key === key ? { ...item, quantity } : item) })),
  removeItem: (key) => set((state) => ({ items: state.items.filter((item) => item.key !== key) })),
  clear: () => set({ items: [] }),
}));
