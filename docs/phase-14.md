# ORYN Phase 14 — Real Customer Data & Authentication Integration

This phase replaces the static customer catalog/authentication presentation with the existing Express + Prisma API for authentication, categories, products, search, product detail, wishlist, and customer identity.

## Completed
- Protected Expo Router navigation based on authenticated state.
- Login and registration now use the backend and surface API errors.
- Registration collects first and last name to match the backend contract.
- Product discovery uses `/api/products` and `/api/categories`.
- Product detail uses `/api/products/:id` including variants, inventory and approved reviews.
- Wishlist uses the authenticated `/api/wishlist` endpoints.
- Profile displays the authenticated user and provides working account navigation/sign out.
- Admin dashboard reads live persisted metrics from `/api/admin/dashboard`.

## Deliberately not completed in this phase
Cart, checkout, order history/tracking and admin operational mutation UX remain separate implementation batches. Payment remains mock as required.

## Validation note
The repository was inspected and modified directly, but this environment does not have `pnpm` installed, so dependency installation and TypeScript/Expo compilation could not be executed here. Run `pnpm install` in the project root before local verification.

## Phase 15 — Real Cart Integration

- Connected mobile cart state to authenticated backend cart APIs.
- Added server-side stock validation for add/update operations.
- Cart item quantities now persist in Prisma instead of local-only state.
- Product detail add-to-bag now sends the selected variant to the API.
- Cart hydrates after authentication and refreshes after mutations.
- Cart UI now surfaces backend errors and mutation state.
- Backend cart mutations return the current cart snapshot for reliable client synchronization.
