# Phase 17 — Real Orders, Detail & Tracking

The customer order experience is now backed by persisted order data instead of a placeholder order card.

## Mobile
- `/orders` loads authenticated orders from `GET /orders`.
- `/orders/[id]` loads the complete order from `GET /orders/:id`.
- Order detail includes status, payment state, timeline, items, delivery address, totals, and refresh behavior.
- The confirmation screen continues to route to the real order list using the created order id.

## API
- Orders list/detail now includes `statusHistory`.
- Checkout creates the initial `PENDING` history entry.
- Mock payment success transitions the order to `CONFIRMED` and records history.
- Admin status changes record status history and create an order notification for the customer.
- Status history is only visible for the authenticated owner on customer routes.

## Database
Added `OrderStatusHistory` with an indexed `(orderId, createdAt)` lookup and cascading relation to `Order`.

## Verification
Run Prisma generation/migration from the repository root before typechecking because the schema adds a new model.
