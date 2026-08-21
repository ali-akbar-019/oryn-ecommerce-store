# Phase 18 — Verified Reviews, Notifications & Account Security

## Completed
- Review creation now uses the real product API and backend eligibility check.
- Reviews require a delivered order and are held for moderation.
- Customers can edit/delete their own reviews; edits return to moderation.
- Added a database uniqueness constraint for one review per customer/product.
- Notification store now hydrates from the backend and persists read/read-all state.
- Notification preferences are persisted through the authenticated API.
- Notification deep links can route to backend-provided destinations.
- Customer profile editing now updates the authenticated backend user.
- Password changes validate the current password server-side and securely re-hash the new password.
- Account deletion endpoint is protected by authentication.
- Added Phase 18 Prisma migration.

## Intentionally deferred
- Review image uploads: schema/storage contract is not yet present, so no fake image upload was added.
- Expo push token registration: notification architecture remains ready for Expo Notifications, but push delivery should be implemented when a production push provider is configured.
