# ORYN Final QA / Handoff

This package is the final implementation/audit pass on the Phase 19 codebase.

## Final audit actions

- Removed the obsolete admin mock-data resource page and mock data source.
- Removed the obsolete local-only mobile wishlist store that was no longer used by the real wishlist hooks.
- Removed the now-unused admin mock resource route dependency.
- Made the product share action functional with the native React Native share sheet.
- Removed the non-functional delivery-method header action from checkout; the actual shipping choices remain directly interactive.
- Kept mock payment explicitly isolated because the project requirement allows payments to remain mocked for this build.
- Kept reset/forgot-password UI separate from claiming an email delivery service exists; a real email provider/token workflow should be added before production if password recovery is required.

## Source-of-truth policy

Normal customer commerce data must come from the API/database. The only intentional mock commerce operation is payment.

## Local verification

From the repository root:

```powershell
pnpm install
pnpm --filter @oryn/database db:generate
pnpm --filter @oryn/database db:migrate
pnpm --filter @oryn/database db:seed
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Then run the API, admin, and Expo mobile app separately and verify the physical Android flow.

## Physical Android smoke test

1. Start MySQL/XAMPP.
2. Start the API on the host machine.
3. Set `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` to the host LAN IP, not `localhost`.
4. Start Expo.
5. Scan the QR code with Expo Go on Android.
6. Verify login, catalog, product detail, wishlist, cart, addresses, checkout, mock payment, orders, tracking, reviews, notifications, and profile/security.

## Admin smoke test

Verify login, dashboard, products, product editor, categories, inventory, orders, customers, reviews, discounts, returns, payments, shipping, notifications, administrators, roles, audit logs, and settings against the API.

## Environment limitation

This package was audited statically in the provided execution environment. The environment did not provide the package registry/runtime required to honestly claim a fresh dependency install, Prisma/MySQL execution, Expo runtime, or browser build passed here. Those checks should be run on the developer machine using the commands above.
