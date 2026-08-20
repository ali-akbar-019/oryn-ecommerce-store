export type ApiPage<T> = { items: T[]; page: number; limit: number; total: number; pages: number };
export type CartResponse = { id: string | null; items: Array<{ id: string; quantity: number; product: unknown; variant: unknown }> };
export type NotificationResponse = { items: unknown[]; unread: number };
