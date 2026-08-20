# ORYN Production Hardening — Phase 12

## Implemented foundation
- Helmet security headers
- Explicit credentialed CORS allowlist
- Request IDs for tracing
- Global request rate limiting foundation
- Idempotency-Key support for POST/PATCH requests
- Strict environment parsing through Zod
- JSON body size limit

## Production notes
The in-memory rate limiter and idempotency cache are intentionally small-runtime fallbacks for local development. Production deployments should replace them with a shared Redis-backed implementation so multiple API instances share state.

Checkout/order creation must always execute pricing, coupon, inventory and order writes in one database transaction. The Idempotency-Key should be persisted with the resulting order/payment intent for durable duplicate-request protection.

Never expose JWT secrets, database credentials, payment credentials or provider keys to mobile/admin bundles.
