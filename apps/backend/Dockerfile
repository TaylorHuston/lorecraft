# syntax=docker/dockerfile:1.7
FROM node:24-bookworm-slim AS dependencies
WORKDIR /workspace
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN npm ci

FROM dependencies AS build
COPY apps/backend apps/backend
RUN npm run build --workspace @lorecraft/backend

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /workspace
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN npm ci --omit=dev --workspace @lorecraft/backend --include-workspace-root
WORKDIR /workspace/apps/backend
COPY --from=build --chown=node:node /workspace/apps/backend/build ./
COPY --chown=node:node apps/backend/scripts ./scripts
USER node
EXPOSE 4311
CMD ["node", "bin/server.js"]
