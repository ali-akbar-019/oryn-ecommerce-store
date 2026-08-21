import { create } from 'zustand';
import { api } from '@/services/api';

export type AppNotification = {
    id: string;
    type: string;
    title: string;
    body: string;
    deepLink?: string | null;
    readAt?: string | null;
    createdAt: string;
};

type Preferences = {
    orderUpdates: boolean;
    promotions: boolean;
    productAlerts: boolean;
};

type State = {
    items: AppNotification[];
    unread: number;
    preferences: Preferences | null;
    loading: boolean;
    hydrate: () => Promise<void>;
    markRead: (id: string) => Promise<void>;
    markAllRead: () => Promise<void>;
    savePreferences: (input: Preferences) => Promise<void>;
};

export const useNotificationStore = create<State>((set) => ({
    items: [],
    unread: 0,
    preferences: null,
    loading: false,

    hydrate: async () => {
        set({ loading: true });
        try {
            const data = await api.get<{
                items: AppNotification[];
                unread: number;
                preferences: Preferences | null;
            }>('/notifications');

            set({
                items: data.items,
                unread: data.unread,
                preferences: data.preferences,
            });
        } finally {
            set({ loading: false });
        }
    },

    markRead: async (id) => {
        await api.patch(`/notifications/${id}/read`, {});

        set((state) => ({
            items: state.items.map((item) =>
                item.id === id
                    ? { ...item, readAt: new Date().toISOString() }
                    : item
            ),
            unread: Math.max(
                0,
                state.unread - (state.items.find((item) => item.id === id)?.readAt ? 0 : 1)
            ),
        }));
    },

    markAllRead: async () => {
        await api.post('/notifications/read-all', {});

        set((state) => ({
            items: state.items.map((item) => ({
                ...item,
                readAt: item.readAt ?? new Date().toISOString(),
            })),
            unread: 0,
        }));
    },

    savePreferences: async (input) => {
        const preferences = await api.patch<Preferences>('/auth/preferences', input);
        set({ preferences });
    },
}));