FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/admin/package.json apps/admin/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY packages/validation/package.json packages/validation/package.json
RUN pnpm install --no-frozen-lockfile
COPY . .
RUN pnpm --filter @oryn/admin build

FROM nginx:1.29-alpine
COPY --from=build /app/apps/admin/dist /usr/share/nginx/html
EXPOSE 80
