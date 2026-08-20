import { create } from 'zustand';
import { products } from '@/data/catalog';

type WishlistState = {
  ids: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: [],
  toggle: (id) => set((state) => ({ ids: state.ids.includes(id) ? state.ids.filter((item) => item !== id) : [...state.ids, id] })),
  remove: (id) => set((state) => ({ ids: state.ids.filter((item) => item !== id) })),
  has: (id) => get().ids.includes(id),
}));

export function getWishlistProducts(ids: string[]) {
  return ids.map((id) => products.find((product) => product.id === id)).filter(Boolean);
}
