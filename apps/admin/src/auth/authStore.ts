import { create } from 'zustand';

type AdminUser = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
    role: { name: string };
};

type State = {
    accessToken: string | null;
    refreshToken: string | null;
    user: AdminUser | null;
    setSession: (data: { accessToken: string; refreshToken: string; user: AdminUser }) => void;
    clear: () => void;
};

export const useAdminAuth = create<State>((set) => ({
    accessToken: localStorage.getItem('oryn_admin_access'),
    refreshToken: localStorage.getItem('oryn_admin_refresh'),
    user: null,

    setSession: (data) => {
        localStorage.setItem('oryn_admin_access', data.accessToken);
        localStorage.setItem('oryn_admin_refresh', data.refreshToken);
        set(data);
    },

    clear: () => {
        localStorage.removeItem('oryn_admin_access');
        localStorage.removeItem('oryn_admin_refresh');
        set({ accessToken: null, refreshToken: null, user: null });
    },
}));