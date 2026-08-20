# ORYN

Premium, production-minded multi-category ecommerce platform.

## Monorepo

- `apps/mobile` — Expo / React Native customer application
- `apps/admin` — React / Vite commerce operations workspace
- `apps/api` — Express / TypeScript API
- `packages/database` — Prisma + MySQL
- `packages/shared-types` — shared domain contracts
- `packages/validation` — shared validation contracts

## Phase 6: Backend Integration Foundation

Implemented:

- Express API bootstrap with Helmet, CORS and centralized errors
- Short-lived access tokens + refresh tokens
- Registration, login, refresh and current-user endpoint
- Product listing/search/detail endpoints
- Category endpoint
- Authenticated cart endpoints with inventory validation
- Authenticated wishlist endpoints
- Address CRUD
- Server-authoritative order creation
- Transactional inventory decrement
- Mock payment success/failure endpoint
- Order history/detail
- Purchaser-eligible reviews
- Notification center and read state
- Mobile API client with refresh-token retry
- Auth Zustand store
- TanStack Query provider and commerce hooks
- Prisma seed foundation with customer/admin roles, categories, products and shipping methods

## Local setup

1. Install Node.js and pnpm.
2. Start MySQL (XAMPP is suitable for local development).
3. Create a database named `oryn`.
4. Copy `.env.example` to `.env` and set the database/auth values.
5. Run `pnpm install`.
6. Run `pnpm --filter @oryn/database db:generate`.
7. Create/apply the initial Prisma migration with `pnpm --filter @oryn/database db:migrate`.
8. Seed with `pnpm --filter @oryn/database db:seed`.
9. Start the API with `pnpm --filter @oryn/api dev`.
10. Start the mobile app with `pnpm --filter @oryn/mobile dev`.

## Important

The API is authoritative for pricing, inventory, checkout totals, payment state and order creation. The mobile UI should never be treated as a source of truth for commerce decisions.

## Admin UI
The ORYN admin is a dedicated React/Vite application with a premium operations interface. Phase 7 establishes the complete operational navigation and screen system; data fixtures are intentionally isolated from UI components so they can be replaced with API queries during integration.
