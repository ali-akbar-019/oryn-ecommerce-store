import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { authRouter } from './modules/auth/auth.routes';
import { productsRouter } from './modules/products/products.routes';
import { categoriesRouter } from './modules/categories/categories.routes';
import { cartRouter } from './modules/cart/cart.routes';
import { wishlistRouter } from './modules/wishlist/wishlist.routes';
import { ordersRouter } from './modules/orders/orders.routes';
import { reviewsRouter } from './modules/reviews/reviews.routes';
import { notificationsRouter } from './modules/notifications/notifications.routes';
import { addressesRouter } from './modules/addresses/addresses.routes';
import { paymentsRouter } from './modules/payments/payments.routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express(); app.disable('x-powered-by'); app.use(helmet()); app.use(cors({ origin: true, credentials: true })); app.use(express.json({ limit: '1mb' }));
  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'oryn-api' }));
  app.use('/api/auth', authRouter); app.use('/api/products', productsRouter); app.use('/api/categories', categoriesRouter); app.use('/api/cart', cartRouter); app.use('/api/wishlist', wishlistRouter); app.use('/api/orders', ordersRouter); app.use('/api/reviews', reviewsRouter); app.use('/api/notifications', notificationsRouter); app.use('/api/addresses', addressesRouter); app.use('/api/payments', paymentsRouter);
  app.use((_req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } })); app.use(errorHandler); return app;
}
