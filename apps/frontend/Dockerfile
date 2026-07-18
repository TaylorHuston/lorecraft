# syntax=docker/dockerfile:1.7
FROM node:24-bookworm-slim AS dependencies
WORKDIR /workspace
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN npm ci

FROM dependencies AS build
COPY apps/backend/.adonisjs/client apps/backend/.adonisjs/client
COPY apps/frontend apps/frontend
RUN npm run build --workspace @lorecraft/frontend

FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime
COPY --from=build /workspace/apps/frontend/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
USER nginx
EXPOSE 8080

