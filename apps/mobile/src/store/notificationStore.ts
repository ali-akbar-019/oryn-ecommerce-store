import { create } from 'zustand';
import { AppNotification, initialNotifications } from '@/data/notifications';

type NotificationState = {
  items: AppNotification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  unreadCount: () => number;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: initialNotifications,
  markRead: (id) => set((state) => ({ items: state.items.map((item) => item.id === id ? { ...item, read: true } : item) })),
  markAllRead: () => set((state) => ({ items: state.items.map((item) => ({ ...item, read: true })) })),
  remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  unreadCount: () => get().items.filter((item) => !item.read).length,
}));
