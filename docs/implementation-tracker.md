# ORYN Implementation Tracker

## Foundation
- [✓] Root workspace manifest
- [✓] pnpm workspace definition
- [✓] Turborepo pipeline
- [✓] Environment template
- [✓] Architecture documentation
- [ ] Install dependencies
- [ ] Verify workspace with pnpm

## Mobile
- [~] Expo SDK 57 project bootstrap
- [~] Theme system
- [ ] App providers
- [ ] Navigation
- [~] Reusable UI
- [ ] Home
- [ ] Shop
- [ ] Search
- [ ] Product details
- [ ] Wishlist
- [ ] Cart
- [ ] Checkout
- [ ] Orders
- [ ] Profile

## API
- [x] Express bootstrap
- [x] Error handling
- [x] Validation
- [x] Auth
- [x] Products
- [x] Categories
- [x] Inventory validation
- [x] Cart
- [x] Wishlist
- [x] Checkout/order creation
- [x] Mock payments
- [x] Orders
- [x] Reviews
- [ ] Returns
- [x] Notifications
- [ ] Admin
- [ ] Audit logs
- [x] Addresses

## Database
- [x] Prisma schema
- [x] Seed
- [ ] Initial migration

## Admin
- [ ] Web bootstrap
- [ ] Authentication
- [ ] Dashboard
- [ ] Products
- [ ] Inventory
- [ ] Orders
- [ ] Customers
- [ ] Reviews
- [ ] Discounts
- [ ] Returns
- [ ] Payments
- [ ] Shipping
- [ ] Notifications
- [ ] Administrators
- [ ] Roles and permissions
- [ ] Audit logs
- [ ] Settings

## Phase 1 UI — Shop & Discovery
- [x] Catalog presentation data
- [x] Shop screen with category filtering
- [x] Search screen with popular searches and results
- [x] Product grid
- [x] Product detail gallery
- [x] Product variant selection
- [x] Product quantity selector
- [x] Related products rail

## Phase 2 UI — Cart & Checkout
- [x] Cart store with variant-aware line items
- [x] Add-to-bag product flow
- [x] Cart line item controls
- [x] Cart removal
- [x] Cart totals and shipping threshold
- [x] Empty cart state
- [x] Checkout shell
- [x] Delivery/payment sections
- [x] Order summary
- [x] Mock order confirmation
- [x] Orders landing screen

## Phase 5 — Reviews, Notifications & Account Polish
- [x] Product review data foundation
- [x] Product review section
- [x] Write review flow
- [x] Review submission state
- [x] Notification data foundation
- [x] Notification Zustand store
- [x] Notification center
- [x] Mark notification read
- [x] Mark all notifications read
- [x] Polished customer account screen
- [x] Notification unread indicator
- [x] Account navigation rows

## Phase 6 — Backend Integration Foundation
- [x] API client with access/refresh token handling
- [x] Auth Zustand store
- [x] TanStack Query provider
- [x] Catalog query hooks
- [x] Commerce query/mutation hooks
- [x] Address hooks
- [x] API architecture documentation
