import { create } from 'zustand';
import type { ApiProduct } from '@/services/catalog/types';
import { api } from '@/services/api';

export type CartItem = {
  key: string;
  cartItemId: string;
  productId: string;
  variantId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
  attributes: Record<string, unknown>;
  availableQuantity: number;
};

type ApiCart = {
  id: string | null;
  items: Array<{
    id: string;
    productId: string;
    variantId: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      images: { url: string; sortOrder: number }[];
    };
    variant: {
      id: string;
      price: string | number;
      stockQuantity: number;
      attributes: Record<string, unknown>;
      inventory?: { quantity: number } | null;
    };
  }>;
};

type CartState = {
  items: CartItem[];
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  addVariant: (product: ApiProduct, variantId: string, quantity: number) => Promise<void>;
  updateQuantity: (key: string, quantity: number) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => void;
};

function attributesToDisplay(attributes: Record<string, unknown>) {
  const color = Object.entries(attributes)
    .find(([key]) => key.toLowerCase() === 'color')?.[1];
  const size = Object.entries(attributes)
    .find(([key]) => key.toLowerCase() === 'size')?.[1];

  return {
    color: color == null ? undefined : String(color),
    size: size == null ? undefined : String(size)
  };
}

function mapCart(cart: ApiCart): CartItem[] {
  return cart.items.map((item) => {
    const attributes = item.variant.attributes ?? {};
    const display = attributesToDisplay(attributes);
    const availableQuantity = item.variant.inventory?.quantity ?? item.variant.stockQuantity;

    return {
      key: item.id,
      cartItemId: item.id,
      productId: item.productId,
      variantId: item.variantId,
      name: item.product.name,
      image: [...item.product.images]
        .sort((a, b) => a.sortOrder - b.sortOrder)[0]?.url ?? '',
      price: Number(item.variant.price),
      quantity: item.quantity,
      color: display.color,
      size: display.size,
      attributes,
      availableQuantity,
    };
  });
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  hydrated: false,
  loading: false,
  error: null,

  hydrate: async () => {
    set({ loading: true, error: null });

    try {
      const cart = await api.get<ApiCart>('/cart');
      set({ items: mapCart(cart), hydrated: true });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unable to load your cart.',
        hydrated: true
      });
    } finally {
      set({ loading: false });
    }
  },

  addVariant: async (product, variantId, quantity) => {
    set({ loading: true, error: null });

    try {
      await api.post('/cart/items', { variantId, quantity });
      const cart = await api.get<ApiCart>('/cart');
      set({ items: mapCart(cart) });
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Unable to add this item to your bag.';
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateQuantity: async (key, quantity) => {
    if (quantity <= 0) return get().removeItem(key);

    const item = get().items.find((entry) => entry.key === key);
    if (!item) return;

    set({ loading: true, error: null });

    try {
      await api.patch(`/cart/items/${item.cartItemId}`, { quantity });
      const cart = await api.get<ApiCart>('/cart');
      set({ items: mapCart(cart) });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unable to update your bag.'
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  removeItem: async (key) => {
    const item = get().items.find((entry) => entry.key === key);
    if (!item) return;

    set({ loading: true, error: null });

    try {
      await api.del(`/cart/items/${item.cartItemId}`);
      set((state) => ({
        items: state.items.filter((entry) => entry.key !== key)
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unable to remove this item.'
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  clear: () => set({ items: [], error: null }),
}));