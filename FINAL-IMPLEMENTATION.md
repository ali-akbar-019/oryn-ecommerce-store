# ORYN Final Implementation Package

This archive is the final implementation package prepared for local setup and deployment.

## Included applications

- `apps/mobile` — Expo / React Native customer app
- `apps/admin` — React / Vite commerce operations app
- `apps/api` — Express / TypeScript API
- `packages/database` — Prisma 7 + MySQL
- `packages/shared-types` — shared domain contracts
- `packages/validation` — shared validation

## Deployment-time configuration still required

The codebase intentionally does not contain real secrets or provider credentials. Before public deployment configure:

- production MySQL credentials
- JWT secrets
- production CORS origins
- real payment provider
- email provider
- image/object storage
- Redis/shared rate-limit and idempotency store
- production domain URLs

## Important validation note

This package was assembled in an environment where npm package installation/network access was unavailable, so dependency installation, Prisma generation, TypeScript compilation and native Expo builds were not executed here. Run the supplied setup and verification commands locally before deployment and use the resulting terminal output as the source of truth.
