# Design: Public Starter World

## Target Capability

Create `LC-002 World Bible Catalog` with two user paths:

### Story S1: Browse Available Worlds

As a signed-in account holder, I want to browse Worlds available to me, so that I can choose canon to inspect.

#### Requirement R1: Authenticated World Catalog

The system SHALL list public Worlds for every authenticated account and deny anonymous requests.

- **R1-S1:** WHEN either the author or another signed-in account opens `/worlds`, THEN `Stormbound Chapel` appears once with its name, description, visibility, and read-only status.
- **R1-S2:** WHEN an anonymous request calls the World catalog API, THEN it receives an authentication failure without World data.
- **R1-S3:** WHEN an authenticated account has no accessible Worlds, THEN the existing intentional empty state is shown.

### Story S2: Inspect Structured World Canon

As a signed-in account holder, I want to inspect a World's structured Locations and Characters, so that I can understand its established canon.

#### Requirement R1: Read-Only World Detail

The system SHALL return and render a selected accessible World with deterministic Location and Character collections.

- **R1-S1:** WHEN a signed-in account opens `/worlds/stormbound-chapel`, THEN it sees all seeded Locations and Characters with each character's stable fields and canonical location.
- **R1-S2:** WHEN a signed-in account requests an unknown or inaccessible World slug, THEN the system returns a not-found result without leaking ownership details.
- **R1-S3:** WHEN the seed command is run repeatedly for the same configured author, THEN exactly one starter World and one copy of each canonical Location and Character remain.

## Chosen Approach

Use normalized PostgreSQL tables for `worlds`, `locations`, and `characters`. `worlds.author_id` records ownership and `worlds.visibility` establishes the first access rule. Locations and Characters use stable keys unique within a World. Characters reference a canonical seed Location and store stable descriptive fields; a follow-up integrity migration enforces that each referenced Location belongs to the same World as its Character. No mutable Adventure state is introduced.

An application query service owns visibility filtering and intentional DTOs. Thin authenticated AdonisJS controllers expose `GET /api/v1/worlds` and `GET /api/v1/worlds/:slug`. The React client consumes the typed Tuyau contract through a World-specific API adapter. World query keys include the authenticated account identity and all account-owned cache entries share a removable prefix. A World API `401` ends the shared browser session and clears account-owned data; detail network failures expose an explicit retry state. `/worlds` renders the catalog and `/worlds/:slug` renders read-only detail. Storybook covers loaded, empty, and detail presentation without a live backend.

The explicit `db:seed` workflow reads `STARTER_WORLD_AUTHOR_EMAIL` from validated optional server configuration. The seeder fails clearly when the value is absent or does not match an account, and reconciles the starter graph transactionally so reruns are idempotent. Application startup never mutates World data.

## Alternatives Considered

- **One JSON World document:** simpler initially, but weakens relational integrity and makes stable Location/Character identity and future targeted authoring harder. Rejected.
- **Hard-coded frontend fixture:** useful for a prototype but does not prove persistence, authorization, typed API contracts, or author ownership. Rejected.
- **Startup seeding:** operationally convenient but couples normal server boot to production data mutation. Rejected.

## Security And Privacy

- Existing browser-session authentication protects both routes.
- Access filtering occurs in the backend query service; client-side routing is not an authorization boundary.
- Account-scoped query keys and session teardown prevent cached World data from crossing account boundaries in one browser.
- API DTOs omit author email and other account data.
- Character private knowledge is visible by explicit temporary product decision, not by accidental model serialization.

## Verification Plan

- Backend migration and functional tests cover authenticated visibility, anonymous denial, indistinguishable unknown/private not-found behavior, response minimization, same-World Character Location integrity, structured content, and exact seed reconciliation.
- Frontend behavior tests cover loading, loaded, empty, failure, navigation, detail rendering, account-switch cache isolation, expired-session handling, and detail retry recovery.
- Storybook tests cover representative catalog and detail states plus accessibility.
- Broad gates include migrations, generated Tuyau registry, lint, typecheck, tests, builds, and a manual browser walkthrough.

## ADR Assessment

No new ADR is required. The API-first backend, typed web contract, PostgreSQL persistence, and browser-session decisions are already governed by existing ADRs. This change applies those decisions to the first World capability.

## Implemented By

- `apps/backend/database/migrations/1784053200000_create_world_catalog_tables.ts`
- `apps/backend/database/migrations/1784060400000_enforce_character_location_world_integrity.ts`
- `apps/backend/app/services/world_catalog_service.ts`
- `apps/backend/app/services/stormbound_chapel_seed.ts`
- `apps/backend/app/controllers/worlds_controller.ts`
- `apps/frontend/src/workspace/WorkspacePage.tsx`
- `apps/frontend/src/worlds/WorldDetailPage.tsx`
- `apps/frontend/src/worlds/tuyauWorldApi.ts`
- `apps/frontend/src/auth/accountQueryKeys.ts`
- `apps/frontend/src/auth/AuthProvider.tsx`

## Verified By

- `apps/backend/tests/functional/world_catalog.spec.ts`
- `apps/backend/tests/database/character_location_world_integrity_migration.spec.ts`
- `apps/frontend/src/worlds/WorldRoutes.test.tsx`
- `apps/frontend/src/worlds/tuyauWorldApi.test.ts`
- `apps/frontend/src/workspace/WorkspacePage.stories.tsx`
- `apps/frontend/src/worlds/WorldDetailPage.stories.tsx`
- Automated Chromium walkthrough at desktop and mobile widths against the seeded development schema.
- User-confirmed review of `/worlds` and `/worlds/stormbound-chapel` at desktop and mobile widths on 2026-07-14.

## Verification Gaps

- None for this Change. The separately stacked Storybook Change retains its own review and manual-confirmation gates.
