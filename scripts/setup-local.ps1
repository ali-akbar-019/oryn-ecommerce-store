$ErrorActionPreference = "Stop"

corepack enable
pnpm install
pnpm --filter @oryn/database db:generate
pnpm --filter @oryn/database db:migrate
pnpm --filter @oryn/database db:seed

Write-Host "ORYN local database setup complete."
