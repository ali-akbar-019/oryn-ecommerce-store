import { create } from 'zustand';
import { api, clearTokens, setTokens } from '../services/api';

type User = { id: string; email: string; firstName: string; lastName: string; status: string; role: { name: string } };
type AuthState = { user: User | null; hydrated: boolean; loading: boolean; hydrate: () => Promise<void>; login: (email: string, password: string) => Promise<void>; register: (input: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>; logout: () => Promise<void> };

export const useAuthStore = create<AuthState>((set) => ({
  user: null, hydrated: false, loading: false,
  hydrate: async () => { try { const user = await api.get<User>('/auth/me'); set({ user }); } catch { set({ user: null }); } finally { set({ hydrated: true }); } },
  login: async (email, password) => { set({ loading: true }); try { const result = await api.post<{ accessToken: string; refreshToken: string }>('/auth/login', { email, password }); await setTokens(result.accessToken, result.refreshToken); set({ user: await api.get<User>('/auth/me') }); } finally { set({ loading: false }); } },
  register: async (input) => { set({ loading: true }); try { const result = await api.post<{ accessToken: string; refreshToken: string }>('/auth/register', input); await setTokens(result.accessToken, result.refreshToken); set({ user: await api.get<User>('/auth/me') }); } finally { set({ loading: false }); } },
  logout: async () => { await clearTokens(); set({ user: null }); },
}));
