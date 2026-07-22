# Lorecraft

Lorecraft is a creator-first application for building and maintaining coherent fictional Worlds across novels, games, animation, and other media. It treats each World as an authoritative, time-aware body of canon rather than a loose collection of notes.

The initial product is a private workspace for individual worldbuilders. It supports private, non-canonical Adventures with a generated opening and resolving Act, Pass, and private Guide turns; source-backed AI assistance, continuity analysis, and selective publishing remain future capabilities.

## Status

This repository is the production-oriented successor to the experimental `lorecraft-mvp` prototype.

Implemented now:

- Account creation, sign-in, session restoration, protected workspace access, and sign-out.
- An authenticated catalog of Worlds available to the current account.
- Inspection of structured World metadata, Locations, and complete development/debug Character Cards; World authors can create, edit, and delete Characters for future Adventures.
- Explicit, repeatable installation of the shared `Stormbound Chapel` starter World for local testing.
- Private Adventures created from a frozen version of an accessible World, with a durable generated opening, resume, retry, reset, and delete flows.
- Owner-only Act, Pass, and private Guide turns with durable resolution, bounded Adventure-owned state changes, and retry or discard recovery.

World creation and broad World/Location editing are not implemented. The current product boundary also excludes a complete writing environment, collaboration, anonymous or reader-facing publishing, automated source ingestion, AI-assisted canon mutation, Story utilities, history revision, streaming, combat, inventory, character statistics, rulesets, multiplayer, and marketplace mechanics.

The [Epics](#documentation) are the canonical source for detailed implemented behavior, scenarios, and verification evidence. This section is only a current summary.

## Product Principles

- The creator decides what becomes canon.
- The World is the authoritative source for objective fictional truth.
- Canon is time-aware so facts can change across stories, generations, and eras.
- Common worldbuilding concepts should work well by default without imposing a genre or medium.
- AI may analyze and propose, but it must not silently redefine canon.
- Canonical works may contribute creator-approved changes to the World.
- Playable Adventures consume frozen canon without changing it; their events remain separate from the authoritative World by default.
- The world bible should remain useful without AI.

## Architecture

Lorecraft is an API-first TypeScript monorepo:

```text
apps/
  backend/   AdonisJS API and authoritative application backend
  frontend/  Vite and React creator-facing web client
docs/
  adrs/      Accepted architecture decisions
  changes/   Active and closed implementation change records
  epics/     Canonical product behavior and verification evidence
```

The backend owns product rules, validation, authorization, persistence, and use-case orchestration. The React client owns presentation, routing, and client-local state and consumes the backend through Tuyau-generated TypeScript contracts and TanStack Query. Browser authentication uses server-side sessions in HTTP-only cookies; browser requests stay on the web origin and reach AdonisJS through a same-origin `/api` proxy.

This boundary is intended to support future web, mobile, administrative, automation, and game clients without moving authoritative behavior into any one client. Domain and application logic should remain independent of HTTP controllers, persistence libraries, UI frameworks, and AI provider SDKs. Shared packages will be added under `packages/` only when a concrete cross-application contract requires one.

## Requirements

- Node.js 24 or newer.
- npm 11. The workspace currently pins npm 11.12.1.
- A PostgreSQL database. Neon is the selected hosted provider, but Lorecraft connects through the standard PostgreSQL driver.

## Getting Started

Install dependencies and create ignored local environment files:

```bash
npm install
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

Configure the environment values described below. Then generate the AdonisJS application key, apply development migrations, and start the web client, API, and Adventure worker:

```bash
cd apps/backend
node ace generate:key
cd ../..
npm run migrate --workspace @lorecraft/backend
npm run dev
```

Lorecraft reserves a dedicated local port block:

| Surface                        | URL                     |
| ------------------------------ | ----------------------- |
| Web client                     | `http://localhost:4310` |
| API server                     | `http://localhost:4311` |
| Storybook                      | `http://localhost:4312` |
| Playwright web                 | `http://localhost:4313` |
| Playwright API                 | `http://localhost:4314` |
| Playwright fake story provider | `http://localhost:4315` |

Vite and Storybook fail when their reserved port is unavailable rather than silently selecting another port.

Create an account through the web client. A new account may initially see an empty World catalog until the optional starter World is installed.

## Configuration

Backend configuration lives in `apps/backend/.env`:

- `DATABASE_URL` is the normal runtime database. Production API and worker processes use Neon's pooled connection string.
- `MIGRATION_DATABASE_URL` is the matching direct connection string used only by the guarded one-shot production migration command.
- `APP_KEY` is generated by `node ace generate:key`.
- `HOST` and `PORT` default to `localhost` and `4311` in the example file.
- `CORS_ORIGIN` must match the frontend origin, normally `http://localhost:4310`.
- `STARTER_WORLD_AUTHOR_EMAIL` is optional and is used only by the explicit starter-World seed.
- `LLM_BASE_URL`, `LLM_MODEL`, and the optional `LLM_API_KEY` configure the OpenAI-compatible provider used by the Adventure worker.
- `LLM_TIMEOUT_MS`, `LLM_MAX_TOKENS`, `LLM_TEMPERATURE`, optional `LLM_REASONING_EFFORT`, and `ADVENTURE_WORKER_POLL_INTERVAL_MS` tune bounded Adventure generation and queue polling. Set reasoning effort to `none` for compatible local models that otherwise spend the narration budget on hidden reasoning.

Adventure opening and turn generation send the applicable player profile, frozen World context, current Adventure state, and current Act or private Guide input to the configured AI provider. Lorecraft retains accepted narration and bounded operational metadata, but not assembled prompts, provider request messages, raw provider responses, or private Guide text as operational evidence.

Local development defaults to protected JSONL diagnostics and sanitized raw provider request/response capture under ignored `apps/backend/tmp/debug/`. Set `LORECRAFT_DEBUG_TRACE=0`, `LORECRAFT_DEBUG_TRACE_RAW_REQUEST=0`, or `LORECRAFT_DEBUG_TRACE_RAW_RESPONSE=0` to explicitly disable the corresponding local capture mode. This feature refuses production, redacts sensitive values, makes directories/files owner-only, and purges traces older than seven days. It never writes Debug content to normal logs, model-call records, or browser APIs.

Frontend configuration lives in `apps/frontend/.env`:

- `API_SERVER_URL` identifies the AdonisJS server used by Vite's development-only `/api` proxy. It defaults to `http://localhost:4311` in the example file.

Browser code always calls same-origin `/api` routes. A deployment must provide the equivalent reverse proxy rather than exposing a different browser API origin. Never commit either environment file, database credentials, application keys, or provider secrets.

Production migrations fail closed unless the runtime and migration URLs identify the same database, the migration URL is direct rather than a Neon `-pooler` endpoint, `NODE_ENV=production`, and the operator explicitly acknowledges the write:

```bash
NODE_ENV=production \
DATABASE_URL='postgresql://...-pooler.../lorecraft' \
MIGRATION_DATABASE_URL='postgresql://......../lorecraft' \
ALLOW_PRODUCTION_DATABASE_MIGRATION=1 \
npm run migrate:production --workspace @lorecraft/backend
```

Keep `MIGRATION_DATABASE_URL` out of API and worker runtime environments when it is not needed. The production release workflow must still stop the API and worker, establish its recovery point, and receive explicit deployment authorization before running this command.

## Private production deployment

The production host uses `deploy/compose.yaml` and a root-owned mode-`0600` environment file copied from `deploy/.env.production.example`. `IMAGE_REPOSITORY` is the lowercase GHCR prefix without a service suffix or tag; the release command derives both service images from one reviewed 40-character `main` commit SHA.

Preview the fail-closed release plan before execution:

```bash
node deploy/release-command.mjs deploy \
  --sha <reviewed-main-commit-sha> \
  --recovery-ref <confirmed-neon-recovery-branch> \
  --env-file /etc/lorecraft/production.env
```

Add `--execute` only after a fresh recovery reference for that release, the environment file, and selected images are confirmed. The command validates Compose, pulls immutable images, stops API and worker writers, runs one guarded migration container, starts the stack, verifies gateway and database readiness, and records the current and previous image SHAs in a mode-`0600` local state file. If the new stack fails health verification, it restores and rechecks the previously recorded application SHA; on a first deployment with no prior SHA, it stops the unhealthy stack. Authenticated production smoke testing remains a separate post-deployment acceptance step.

Application rollback does not reverse migrations or restore the database:

```bash
node deploy/release-command.mjs rollback \
  --env-file /etc/lorecraft/production.env \
  --execute
```

Rollback starts the previously recorded application SHA and reruns health checks. It is available only after a successful deployment has recorded a prior SHA. If that image is incompatible with the migrated schema, use a forward fix or a separately authorized Neon restore; the command never performs database recovery implicitly. Expose only the loopback gateway through Tailscale Serve. API and worker services remain unpublished on the host.

See the [backend environment example](apps/backend/.env.example) and [frontend environment example](apps/frontend/.env.example) for the checked-in defaults.

## Development

Root commands use npm workspaces and Turborepo:

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run verify:contracts
```

`npm run dev` starts the frontend, API, opening worker, and turn worker together. It exits visibly when required worker provider configuration is absent instead of leaving Adventures permanently pending.

Before relying on a changed local provider model or token limit, run one synthetic opening acceptance check:

```bash
npm run smoke:opening --workspace @lorecraft/backend
```

The command makes one configured-provider request using bounded synthetic World, player, and two-NPC context. It exits non-zero if the provider truncates the opening, and logs only the effective model, token cap, timeout, and bounded response metadata—not narration, prompts, or creator data.

`npm run verify:contracts` regenerates the tracked Tuyau client and fails when `apps/backend/.adonisjs/client` differs from the committed contract. CI runs the same scoped cleanliness check immediately after the application build.

Use a workspace selector when only one application is relevant. For example:

```bash
npm run dev --workspace @lorecraft/backend
npm run dev --workspace @lorecraft/frontend
npm run dev:api --workspace @lorecraft/backend
npm run dev:worker --workspace @lorecraft/backend
npm run dev:turn-worker --workspace @lorecraft/backend
```

The backend workspace's normal `dev` command supervises the API and both Adventure workers, and stops its sibling processes if any one exits. Use `dev:api` or the specific worker commands only when intentionally running a process in isolation.

The worker is a separately deployable process. From a production backend build, run:

```bash
cd apps/backend/build
node bin/console.js adventures:openings:work
node bin/console.js adventures:turns:work
```

Schema changes to Adventure work, revisions, or model-call evidence require a coordinated maintenance deployment: stop the API and Adventure workers, apply migrations, deploy the matching API and worker build, and then restart them. Do not run old and new processes concurrently across those schema migrations.

Healthy startup emits `adventure_opening.worker_started` or `adventure_turn.worker_started`; graceful shutdown emits the corresponding stopped event. Claimed jobs emit correlated lifecycle records containing only Adventure/job/generation/attempt/status/timing identifiers. Missing startup logs, repeated process exits, or processing leases that remain expired indicate an unhealthy worker. Credentials, authorization headers, prompt text, private Guide text, and model prose are excluded from lifecycle logs.

The current account generation-burst limit is enforced per API process. Before horizontal API deployment or paid provider-backed access for an untrusted audience, configure shared atomic ingress or distributed enforcement so restarts and additional instances cannot multiply the budget.

### Starter World

`Stormbound Chapel` is shared, read-only starter canon for authenticated local accounts. It is not created during normal application startup.

To install it, first create the intended author account, set `STARTER_WORLD_AUTHOR_EMAIL` to that account's email in the ignored backend environment, and run:

```bash
npm run seed:starter-world --workspace @lorecraft/backend
```

The command reconciles the starter World transactionally and is idempotent for the configured author. Repeated runs preserve exactly one starter World and one copy of each canonical Location and Character. It fails when the author is missing and refuses to overwrite an unrelated World that already uses the reserved starter slug. The API does not expose the author's account data.

## Verification

Run the non-database quality gates from the repository root:

```bash
npm run lint
npm run typecheck
npm run build
npm run build:storybook
```

The full test commands are:

```bash
npm run test
npm run test:storybook
npm run test:e2e
```

For an implementation-review or release candidate, run the required fresh aggregate gate from a committed tree:

```bash
# .env.local is ignored and must provide acknowledged disposable DATABASE_URL,
# TEST_DATABASE_URL, E2E_DATABASE_URL, ALLOW_TEST_DATABASE_WRITES=1, and
# ALLOW_E2E_DATABASE_WRITES=1. Do not use an application or production target.
set -a
. ./.env.local
set +a
NODE_ENV=test APP_KEY='<test-only-key>' npm run ci:required
```

The command requires caller-supplied acknowledged disposable-database settings; it does not construct or source an environment itself. It bypasses Turborepo caches while building the applications, checking generated contracts, applying guarded test migrations, running lint/typecheck and the full test suite, then running Storybook and deterministic E2E. Run focused tests while implementing, then run this aggregate gate after the final implementation commit and before moving a Change to `in_review`. Before `/sdd-release`, rerun it against the fully accumulated `develop` candidate. A pushed-branch CI run corroborates this local proof; it does not replace it.

`npm run test` includes PostgreSQL-backed backend tests, and `npm run test:e2e` starts isolated frontend and backend services for desktop and mobile Playwright projects. Both require the guarded database configuration below. A successful command should be interpreted together with the suites it actually executed.

For a quick browser-level smoke check of a running local app, use the root development dependency:

```bash
npm exec agent-browser -- open http://localhost:4310
npm exec agent-browser -- wait --load networkidle
npm exec agent-browser -- snapshot -i
npm exec agent-browser -- close
```

## Storybook

Storybook is the local isolated UI workbench for production components, responsive states, interactions, and accessibility checks:

```bash
npm run storybook
```

Open `http://localhost:4312`. The catalog includes current authentication and World-workspace surfaces as well as explicitly future-facing prototypes. Prototype stories are not application routes, persisted behavior, or accepted Epic scope. Storybook complements frontend tests and routed Playwright journeys; it does not replace them.

Use these supporting commands:

```bash
npm run test:storybook
npm run build:storybook
```

## Database And E2E Safety

Backend migrations and functional tests refuse to run unless a disposable PostgreSQL target is supplied separately from the development database, explicitly acknowledged, and identifiable by a test-oriented database or schema name:

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

The Playwright account journey has the same boundary through separate variables:

```bash
DATABASE_URL='postgresql://.../lorecraft' \
E2E_DATABASE_URL='postgresql://.../lorecraft_e2e' \
ALLOW_E2E_DATABASE_WRITES=1 \
npm run test:e2e
```

The guarded commands require `DATABASE_URL` so they can reject a target that resolves to the application database. The disposable target must include an identifier such as `test`, `e2e`, `ci`, or `preview` in the effective database or schema name. These safeguards do not bypass Lucid's production migration protection.

Do not point guarded commands at production or shared development data. Schema-isolated Neon runs must use the direct endpoint with PostgreSQL `options=-csearch_path=...`; the pooled endpoint does not accept that startup option. CI provisions an isolated PostgreSQL service for migrations, backend tests, and desktop/mobile Playwright verification. A separate smoke check against an isolated Lorecraft Neon test branch remains required before production deployment.

## Documentation

Epics define canonical implemented behavior, scenario evidence, and explicit gaps:

- [LC-001 Account Identity And Workspace Access](docs/epics/lc-001-account-identity-and-workspace-access/epic.md)
- [LC-002 World Bible Catalog](docs/epics/lc-002-world-bible-catalog/epic.md)
- [LC-003 Adventure Play](docs/epics/lc-003-adventure-play/epic.md)

Accepted architecture decisions:

- [AdonisJS API-First Backend](docs/adrs/2026-07-12-adonisjs-api-first-backend.md)
- [Browser Session Authentication](docs/adrs/2026-07-12-browser-session-authentication.md)
- [PostgreSQL On Neon](docs/adrs/2026-07-12-postgresql-on-neon.md)
- [React Web Client And Typed API Contract](docs/adrs/2026-07-12-react-web-client-and-typed-api-contract.md)
- [World Canon And Adventure Isolation](docs/adrs/2026-07-14-world-canon-and-adventure-isolation.md)
- [Relational World Aggregate](docs/adrs/2026-07-14-relational-world-aggregate.md)
- [Disposable Database Targets For Automation](docs/adrs/2026-07-14-disposable-database-automation.md)
- [Immutable World Version Snapshots](docs/adrs/2026-07-16-immutable-world-version-snapshots.md)
- [Durable Asynchronous Adventure Work](docs/adrs/2026-07-16-durable-asynchronous-adventure-work.md)
- [Immutable Adventure Revisions](docs/adrs/2026-07-17-immutable-adventure-revisions.md)
- [Provider-Neutral AI Boundary](docs/adrs/2026-07-17-provider-neutral-ai-boundary.md)

Application-specific workflow details are available in the [backend README](apps/backend/README.md) and [frontend README](apps/frontend/README.md). See the [changelog](CHANGELOG.md) for user-facing changes.
