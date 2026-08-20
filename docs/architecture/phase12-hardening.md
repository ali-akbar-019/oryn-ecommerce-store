# Phase 12 — Production Hardening

This phase establishes the API security/reliability layer before final deployment work.

### Request pipeline
`request id → security headers/CORS → JSON limits → rate limit → idempotency → routes → error handler`

### Commerce invariants to preserve
1. Client never determines final price.
2. Client never determines inventory availability.
3. Coupon eligibility is server-side.
4. Order creation is transactional.
5. Inventory decrement is atomic.
6. Authenticated users can only access their own customer resources.
7. Admin mutations require explicit role/permission checks.
8. Duplicate checkout requests must not create duplicate orders.

### Deployment requirement
Use a shared Redis implementation for rate limits/idempotency when running more than one API instance.
