# ORYN Admin Architecture

The admin application is a dedicated React/Vite operations workspace. It uses route-level pages, reusable shell/navigation primitives, domain resource pages, and a visual system intentionally distinct from the customer mobile experience while sharing ORYN brand principles.

## UI layers
- `layout/`: shell, sidebar, topbar and navigation
- `pages/`: route-level operational screens
- `components/`: reusable icons and future tables/forms/charts
- `data/`: temporary development fixtures; production data comes from the API
- `features/`: domain-specific modules as each workspace moves from mock data to live API data

## Operational areas
Dashboard, Products, Categories, Inventory, Orders, Customers, Reviews, Discounts, Returns, Payments, Shipping, Notifications, Administrators, Roles & Permissions, Audit Logs and Settings.

## Production transition
The current resource pages use realistic fixtures so UI/interaction can be developed independently of backend availability. Each page is deliberately structured around the final API shape: filters, pagination, status rendering, actions and empty/loading/error states can be connected to TanStack Query without replacing the visual architecture.
