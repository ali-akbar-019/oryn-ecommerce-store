export type NotificationKind = 'order' | 'delivery' | 'promotion' | 'wishlist' | 'security';

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  time: string;
  read: boolean;
  orderId?: string;
  productId?: string;
};

export const initialNotifications: AppNotification[] = [
  { id: 'n1', kind: 'delivery', title: 'Your order is on the way', body: 'Order ORY-10482 has been handed to the carrier.', time: '12 min ago', read: false, orderId: 'ORY-10482' },
  { id: 'n2', kind: 'wishlist', title: 'A saved piece is moving fast', body: 'The Atelier Wool Coat in Sand has limited availability.', time: '2 hours ago', read: false, productId: 'atelier-coat' },
  { id: 'n3', kind: 'promotion', title: 'The new season edit', body: 'Explore the latest pieces selected for the autumn collection.', time: 'Yesterday', read: true },
  { id: 'n4', kind: 'order', title: 'Order confirmed', body: 'Your order ORY-10479 has been confirmed.', time: 'Yesterday', read: true, orderId: 'ORY-10479' },
  { id: 'n5', kind: 'security', title: 'Security settings updated', body: 'Your account security preferences were updated successfully.', time: '3 days ago', read: true },
];
