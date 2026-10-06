# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---- dev: source bind-mounted. Webpack dev server: its watcher can poll (WATCHPACK_POLLING),
# which bind mounts from Windows/macOS hosts need; Turbopack cannot poll. ----
FROM base AS dev
CMD ["sh", "-c", "[ -d node_modules/.bin ] || npm ci; npm run dev:docker"]

# ---- deps ----
FROM base AS deps
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# ---- build ----
FROM base AS build
ARG API_INTERNAL_URL=http://nginx
ARG NEXT_PUBLIC_SITE_URL=https://climatisationmaroc.com
ENV API_INTERNAL_URL=$API_INTERNAL_URL NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ ./
COPY design/uploads /design-uploads
RUN npm run build

# ---- prod: standalone server ----
FROM node:22-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S next && adduser -S next -G next
COPY --from=build --chown=next:next /app/.next/standalone ./
COPY --from=build --chown=next:next /app/.next/static ./.next/static
COPY --from=build --chown=next:next /app/public ./public
USER next
EXPOSE 3000
CMD ["node", "server.js"]
