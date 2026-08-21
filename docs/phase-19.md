# Phase 19 — Real Admin Operations

Phase 19 hardens the admin application around real backend data and real management actions.

## Customer-facing admin operations
- Dashboard metrics now include pending orders, low-stock variants, recent orders, and top products from persisted data.
- Products/categories/inventory/orders/customers use connected management screens.
- Product and customer/order rows open their dedicated workspaces.
- Product archive and category delete use confirmation dialogs and server-side guards.
- Inventory adjustments persist through the admin API and create inventory transactions.
- Order status changes persist through the API and create order status history/notifications.
- Review moderation supports publish/unpublish.
- Return status can be updated directly from the operations workspace.
- Discounts, shipping methods, notifications, administrators and roles retain connected create flows.
- Loading, error, empty, retry, and responsive states are preserved.

## Backend
- Admin dashboard aggregates real operational metrics and recent records.
- Low-stock and top-product indicators are calculated from database records.

## Important
- Payments remain intentionally mocked according to the project scope.
- Image uploads/storage and full role-permission mutation require a real storage/permission provider contract and are not fabricated.
- The project still requires local dependency installation and runtime verification before production deployment.
