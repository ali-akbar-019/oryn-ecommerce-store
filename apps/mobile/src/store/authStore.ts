import { create } from 'zustand';
import { api, clearTokens, setTokens } from '../services/api';

type User = { id: string; email: string; firstName: string; lastName: string; status: string; role: { name: string } };
type RegisterInput = { firstName: string; lastName: string; email: string; password: string };
type AuthState = {
  user: User | null;
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  hydrated: false,
  loading: false,
  error: null,
  hydrate: async () => {
    try {
      const user = await api.get<User>('/auth/me');
      set({ user, error: null });
    } catch {
      await clearTokens();
      set({ user: null });
    } finally {
      set({ hydrated: true });
    }
  },
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const result = await api.post<{ accessToken: string; refreshToken: string }>('/auth/login', { email: email.trim().toLowerCase(), password });
      await setTokens(result.accessToken, result.refreshToken);
      set({ user: await api.get<User>('/auth/me') });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to sign in.' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  register: async (input) => {
    set({ loading: true, error: null });
    try {
      const result = await api.post<{ accessToken: string; refreshToken: string }>('/auth/register', { ...input, email: input.email.trim().toLowerCase() });
      await setTokens(result.accessToken, result.refreshToken);
      set({ user: await api.get<User>('/auth/me') });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to create your account.' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  logout: async () => {
    await clearTokens();
    set({ user: null, error: null });
  },
  clearError: () => set({ error: null }),
}));
