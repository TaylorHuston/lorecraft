# Lorecraft

Lorecraft is a creator-first world bible for building and maintaining coherent fictional universes across novels, games, animation, and other media.

The initial product is a private workspace for individual worldbuilders. It treats the World as an authoritative, time-aware body of canon rather than a loose collection of notes. Future capabilities may use that foundation for source-backed AI assistance, continuity analysis, selective publishing, and non-canonical playable Adventures.

## Product Principles

- The creator decides what becomes canon.
- The World is the authoritative source for objective fictional truth.
- Canon is time-aware so facts can change across stories, generations, and eras.
- Common worldbuilding concepts should work well by default without imposing a genre or medium.
- AI may analyze and propose, but it must not silently redefine canon.
- Canonical works may contribute creator-approved changes to the World.
- Playable Adventures may consume canon later, but their events remain separate from it by default.
- The world bible should remain useful without AI.

## Status

This repository is the production-oriented successor to the experimental `lorecraft-mvp` prototype. Users can create an account, sign in, browse Worlds available to them, and inspect structured read-only World canon. World creation and editing have not been implemented yet.

The current product boundary is the creator-facing world bible. A complete writing environment, collaboration, public publishing, source ingestion, AI assistance, and playable Adventures are not part of the initial implementation unless introduced through later planned changes.

## Architecture

Lorecraft is an API-first TypeScript monorepo:

```text
apps/
  backend/   AdonisJS API and authoritative application backend
  frontend/  Vite and React creator-facing web client
docs/        Architecture and product implementation documentation
```

The backend is designed as a stable product API so future web, mobile, administrative, automation, and game clients can share the same authoritative behavior. Domain and application logic should remain independent of HTTP controllers, persistence libraries, UI frameworks, and AI provider SDKs.

Shared packages will be added under `packages/` only when a concrete cross-application contract requires one.

## Requirements

- Node.js 24 or newer
- npm 11 or newer
- A PostgreSQL database. Neon is the selected hosted provider, but the application uses the standard PostgreSQL driver.

## Development

Install dependencies:

```bash
npm install
```

Create local environment files:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

Set `DATABASE_URL` in `apps/backend/.env` to a development database, set `APP_KEY` with `node ace generate:key` from `apps/backend/`, and keep `CORS_ORIGIN` aligned with the frontend URL. Set `API_SERVER_URL` in `apps/frontend/.env` to the AdonisJS server used by Vite's development-only `/api` proxy. Browser code always calls same-origin `/api` routes; deployments must provide the equivalent reverse proxy. Never commit either environment file.

Apply migrations and run the workspace:

```bash
npm run migrate --workspace @lorecraft/backend
npm run dev
```

To install the shared `Stormbound Chapel` starter World for local testing, set `STARTER_WORLD_AUTHOR_EMAIL` to an existing account in the ignored backend environment, then run:

```bash
npm run seed:starter-world --workspace @lorecraft/backend
```

The seed is explicit and idempotent. Normal application startup does not create or modify World content.

Run verification:

```bash
npm run lint
npm run test
npm run typecheck
npm run build
```

Backend migrations and functional tests refuse to run unless a disposable PostgreSQL database is supplied separately from the development database, explicitly acknowledged, and identifiable by a test-oriented database or schema name:

```bash
DATABASE_URL='postgresql://.../lorecraft' \
TEST_DATABASE_URL='postgresql://.../lorecraft_test' \
ALLOW_TEST_DATABASE_WRITES=1 \
npm run migrate:ci --workspace @lorecraft/backend

DATABASE_URL='postgresql://.../lorecraft' \
TEST_DATABASE_URL='postgresql://.../lorecraft_test' \
ALLOW_TEST_DATABASE_WRITES=1 \
npm run test
```

The Playwright account journey has the same safety boundary through separate variables:

```bash
DATABASE_URL='postgresql://.../lorecraft' \
E2E_DATABASE_URL='postgresql://.../lorecraft_e2e' \
ALLOW_E2E_DATABASE_WRITES=1 \
npm run test:e2e
```

The guarded commands require `DATABASE_URL` so they can reject a target that resolves to the application database, require a disposable identifier such as `test`, `e2e`, `ci`, or `preview` in the database or effective schema name, and do not bypass Lucid's production migration protection. Schema-isolated Neon runs must use the direct endpoint with PostgreSQL `options=-csearch_path=...`; the pooled endpoint does not accept that startup option. Do not point these commands at production or shared development data. CI provisions an isolated PostgreSQL service for migrations, backend tests, and desktop/mobile Playwright verification. A separate Neon smoke check remains required before accepting hosted-database behavior.
