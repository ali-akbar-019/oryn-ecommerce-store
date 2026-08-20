# ORYN API Architecture

The API is the authoritative commerce layer. Mobile and admin clients must not calculate authoritative price, inventory, coupon, payment, or permission decisions.

## Route groups

- `/api/auth` — registration, login, refresh, current user
- `/api/products` — catalog and product detail
- `/api/categories` — category discovery
- `/api/cart` — authenticated cart operations
- `/api/wishlist` — authenticated wishlist operations
- `/api/addresses` — authenticated address management
- `/api/orders` — checkout and order history/detail
- `/api/payments` — mock payment confirmation/failure
- `/api/reviews` — eligible purchaser reviews
- `/api/notifications` — notification center/read state

## Layering

`route -> validation -> domain/service -> Prisma -> MySQL`

Authentication uses short-lived access tokens and refresh tokens. Passwords use Node's built-in scrypt KDF so the initial API does not depend on a native password package.

## Commerce invariants

- Cart quantity is checked against current inventory.
- Order totals are calculated on the server.
- Order items snapshot product/variant purchase information.
- Inventory is decremented inside the order transaction.
- Payment state is stored independently from order state.
- Reviews require a delivered purchase.
- Wishlist and cart endpoints are authenticated.
