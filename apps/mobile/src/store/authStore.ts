import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

type User = { id: string; name: string; email: string };

type AuthState = {
  user: User | null;
  hydrated: boolean;
  loading: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const STORAGE_KEY = 'oryn_session';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  hydrated: false,
  loading: false,
  hydrate: async () => {
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      set({ user: raw ? JSON.parse(raw) : null, hydrated: true });
    } catch {
      set({ user: null, hydrated: true });
    }
  },
  login: async (email) => {
    set({ loading: true });
    const user = { id: 'usr_demo', name: email.split('@')[0] || 'ORYN customer', email: email.trim().toLowerCase() };
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(user));
    set({ user, loading: false });
  },
  register: async (name, email) => {
    set({ loading: true });
    const user = { id: `usr_${Date.now()}`, name: name.trim(), email: email.trim().toLowerCase() };
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(user));
    set({ user, loading: false });
  },
  logout: async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    set({ user: null });
  },
}));
