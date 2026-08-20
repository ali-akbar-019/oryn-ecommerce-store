# ORYN Phase 13 — Production Readiness

This phase is the final implementation/readiness pass before deployment.

## Production principles

- The API is authoritative for prices, inventory, discounts, payment state and order creation.
- Secrets are supplied through environment variables and are never committed.
- Production API instances must use shared state for rate limiting/idempotency (Redis or equivalent).
- Prisma migrations are applied with `prisma migrate deploy` in production.
- Database backups, payment provider configuration, object storage and email delivery are deployment concerns and must be configured with real provider credentials.

## Health endpoints

- `GET /health` — process health.
- `GET /ready` — dependency readiness; currently checks the Prisma/MySQL connection.

## Build flow

1. `pnpm install --frozen-lockfile` after a lockfile is generated/committed.
2. `pnpm --filter @oryn/database db:generate`.
3. `pnpm typecheck`.
4. `pnpm build`.
5. Apply migrations with `pnpm --filter @oryn/database db:migrate:deploy`.
6. Start the API with `pnpm --filter @oryn/api start`.

## Performance checklist

- Use pagination on large admin/customer/order collections.
- Keep product listing payloads small and request only fields needed by cards/lists.
- Keep image dimensions appropriate for the device; use an image CDN in production.
- Use TanStack Query caching/invalidation rather than duplicating server state in local stores.
- Keep DB indexes aligned with filters and sort patterns.
- Use connection pooling appropriate to the deployment platform.

## Final QA

Validate authentication, catalog browsing, product detail, wishlist, cart, checkout, order creation, inventory decrement, reviews, notifications, admin authorization, product management, inventory management, order management, customer management, audit logs, responsive layouts and failure/retry states.
