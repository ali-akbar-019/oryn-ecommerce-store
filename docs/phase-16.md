# Phase 16 — Real Addresses & Checkout

- Added authenticated address creation/list/update/delete UI.
- Added active shipping-method API endpoint.
- Checkout now loads saved addresses and shipping methods from the API.
- Order creation uses the backend's authoritative cart, inventory, variant prices, address and shipping method.
- Mock payment is invoked only after the order is created.
- Confirmation receives the real order ID and shows a deterministic order reference.
- Local cart is re-hydrated after successful checkout.

Payments remain intentionally mocked as required by the current implementation plan.
