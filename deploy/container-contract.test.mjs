import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('production images use separate non-root gateway and shared backend runtime', async () => {
  const [frontend, backend] = await Promise.all([
    read('apps/frontend/Dockerfile'),
    read('apps/backend/Dockerfile'),
  ])

  assert.match(frontend, /nginx-unprivileged/)
  assert.match(frontend, /USER nginx/)
  assert.match(backend, /USER node/)
  assert.match(backend, /CMD \["node", "bin\/server\.js"\]/)
})

test('gateway serves SPA routes, proxies same-origin API, and exposes health', async () => {
  const nginx = await read('deploy/nginx.conf')

  assert.match(nginx, /location \/api\//)
  assert.match(nginx, /proxy_pass http:\/\/api:4311/)
  assert.match(nginx, /proxy_set_header X-Forwarded-Proto https/)
  assert.doesNotMatch(nginx, /proxy_set_header X-Forwarded-Proto \$http_x_forwarded_proto/)
  assert.match(nginx, /try_files \$uri \$uri\/ \/index\.html/)
  assert.match(nginx, /location = \/healthz/)
})

test('Compose publishes only the gateway on host loopback', async () => {
  const compose = await read('deploy/compose.yaml')

  assert.match(compose, /127\.0\.0\.1:\$\{GATEWAY_PORT:-8080\}:8080/)
  assert.doesNotMatch(compose, /api:[\s\S]*?ports:/)
  assert.match(compose, /ADVENTURE_WORKER_POLL_INTERVAL_MS: 5000/)
  assert.match(compose, /command: \[['"]node['"], ['"]ace\.js['"], ['"]adventures:openings:work['"]\]/)
  assert.match(compose, /api\/health\/live/)
  assert.doesNotMatch(compose, /api\/health\/ready/)
  assert.match(compose, /max-size: ['"]10m['"]/)
  assert.match(compose, /max-file: ['"]3['"]/)
})

test('Compose exposes a one-shot guarded migration service', async () => {
  const [compose, backend] = await Promise.all([
    read('deploy/compose.yaml'),
    read('apps/backend/Dockerfile'),
  ])

  assert.match(compose, /migrate:/)
  assert.match(compose, /MIGRATION_DATABASE_URL: \$\{MIGRATION_DATABASE_URL:-\}/)
  assert.match(compose, /ALLOW_PRODUCTION_DATABASE_MIGRATION: ['"]1['"]/)
  assert.match(compose, /command: \[['"]node['"], ['"]scripts\/run-production-migrations\.mjs['"]\]/)
  assert.match(compose, /x-runtime-environment: &runtime-environment/)
  assert.doesNotMatch(compose, /env_file:/)
  assert.match(backend, /apps\/backend\/scripts \.\/scripts/)
})

test('environment template contains placeholders, never deployable secrets', async () => {
  const environment = await read('deploy/.env.production.example')

  assert.match(environment, /IMAGE_REPOSITORY=ghcr\.io\/owner\/lorecraft/)
  assert.match(environment, /DATABASE_URL=postgresql:\/\/<pooled-runtime-connection>/)
  assert.match(environment, /MIGRATION_DATABASE_URL=postgresql:\/\/<direct-migration-connection>/)
  assert.doesNotMatch(environment, /192\.168\.|100\.[0-9]+\.|ts\.net/)
})

test('API separates dependency-free liveness from database readiness', async () => {
  const [routes, controller] = await Promise.all([
    read('apps/backend/start/routes.ts'),
    read('apps/backend/app/controllers/health_checks_controller.ts'),
  ])

  assert.match(routes, /api\/health\/live/)
  assert.match(routes, /api\/health\/ready/)
  assert.match(controller, /async live/)
  assert.match(controller, /db\.rawQuery\(['"]select 1['"]\)/)
  assert.match(controller, /serviceUnavailable/)
})
