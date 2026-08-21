import express, { type Express } from 'express';
import { authRouter } from './modules/auth/auth.routes.js';
import { productsRouter } from './modules/products/products.routes.js';
import { categoriesRouter } from './modules/categories/categories.routes.js';
import { cartRouter } from './modules/cart/cart.routes.js';
import { wishlistRouter } from './modules/wishlist/wishlist.routes.js';
import { ordersRouter } from './modules/orders/orders.routes.js';
import { reviewsRouter } from './modules/reviews/reviews.routes.js';
import { notificationsRouter } from './modules/notifications/notifications.routes.js';
import { addressesRouter } from './modules/addresses/addresses.routes.js';
import { paymentsRouter } from './modules/payments/payments.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestId } from './middleware/requestId.js';
import { rateLimit } from './middleware/rateLimit.js';
import { idempotency } from './middleware/idempotency.js';
import { applySecurity } from './common/security.js';
import { healthRouter } from './routes/health.routes.js';

export function createApp(): Express {
  const app = express();

  applySecurity(app);
  app.use(requestId);
  app.use(express.json({ limit: '1mb' }));
  app.use(rateLimit({ windowMs: 60_000, max: 240 }));
  app.use(idempotency());

  app.use(healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/wishlist', wishlistRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/addresses', addressesRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/admin', adminRouter);

  app.use((_req, res) =>
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Route not found' }
    })
  );

  app.use(errorHandler);

  return app;
}