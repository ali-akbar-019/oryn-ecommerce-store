#!/usr/bin/env bash
set -euo pipefail

corepack enable
pnpm install
pnpm --filter @oryn/database db:generate
pnpm --filter @oryn/database db:migrate
pnpm --filter @oryn/database db:seed

echo "ORYN local database setup complete."
