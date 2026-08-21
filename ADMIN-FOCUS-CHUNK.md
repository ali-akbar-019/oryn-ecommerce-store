# ORYN Admin Focus Chunk

This chunk uses the uploaded project as the source of truth and focuses only on completing the admin panel.

## Included

- Added `/analytics` route and real `/api/admin/analytics` data.
- Added persisted store settings with `/api/admin/settings`.
- Added StoreSetting Prisma model and migration.
- Reworked admin shell interactions: search, notifications, profile/account menu, sign out, and desktop sidebar collapse.
- Fixed sidebar hover contrast for collapse and overflow-menu icons.
- Added custom admin scrollbars.
- Reworked operations dialogs so shipping, roles, notifications, administrators and other operational actions use the same centered dialog system.
- Added shipping edit/delete flows with confirmation.
- Added administrator delete flow with confirmation and Platform Owner protection.
- Added role management dialog and delete confirmation.
- Added notification deletion and confirmation.
- Added real notification read/mark-all-read support in the admin shell.
- Replaced mock settings with persisted settings backed by Prisma.
- Removed obsolete ResourcePage/mock admin resources.
- Added responsive analytics/settings/operations styling.

## Database

After pulling the chunk:

```bash
pnpm --filter @oryn/database db:generate
pnpm --filter @oryn/database db:migrate:deploy
```

For local development, the existing migration workflow can also be used after generation.

## Important

Payments remain intentionally mocked. The admin panel changes in this chunk are otherwise designed around the real API/database already present in the uploaded project.

Because this environment does not have pnpm installed, I did not claim a local TypeScript/Vite/Prisma build pass. Run the project's normal install/typecheck/build commands on the machine where dependencies are available.
