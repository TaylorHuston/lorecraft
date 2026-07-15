# Design: Public Starter World

## Context

Create `LC-002 World Bible Catalog` with two user paths:

## Goals / Non-Goals

**Goals:**

- Prove a persisted, authenticated World catalog and structured read-only detail path.
- Install one shared starter World safely through an explicit repeatable command.
- Keep backend authorization and DTOs reusable by clients beyond the current React web UI.

**Non-Goals:**

- World authoring, Adventures, mutable gameplay state, anonymous publishing, collaboration, or automatic startup seeding.

## Planning Interview / Story Refinement

- Scope boundary reviewed: read-only World discovery and inspection only.
- User decisions: public means all authenticated accounts; private knowledge is temporarily visible; the configured account is the author.
- Assumptions: the seed author account exists before installation and normal server startup never mutates canon.
- Deferred scope: authoring, audience-specific knowledge policy, bylines, sharing controls, and Adventures.
- Story boundaries challenged: catalog discovery and structured detail remain separate user paths; empty-catalog behavior belongs to LC-002 rather than account access.
- Requirements refined: authenticated visibility, non-disclosing not-found behavior, immutable seed provenance, and exact repeat reconciliation are explicit.
- Scenario gaps considered: anonymous access, no accessible Worlds, inaccessible slug, malformed successful API output, legacy seed upgrade, and repeat command execution.
- Open questions that block implementation: none.

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

## Epic Changes

### Create Epic: LC-002 World Bible Catalog

- Proposed directory: `docs/epics/lc-002-world-bible-catalog/`
- Proposed file: `docs/epics/lc-002-world-bible-catalog/epic.md`
- Adds `LC-002/S1` and `LC-002/S2` with the Requirements and Scenarios above.

### Update Epic: LC-001 Account Identity And Workspace Access

- Target Epic: `docs/epics/lc-001-account-identity-and-workspace-access/epic.md`
- Change Type: modified scope
- Modified: `LC-001/S3` no longer owns World-catalog empty-state behavior.
- Supersedes / reconciles: the former `LC-001/S3/R3` boundary and its duplicate verification references move to `LC-002/S1/R1-S3`.

## Technical Options

### Option 1: Normalized Relational World Aggregate

- User impact: supports deterministic structured browsing and future targeted authoring.
- Implementation complexity: moderate migrations, integrity constraints, DTOs, and seed reconciliation.
- Reversibility: additive schema; seed-identity rollback refuses destructive provenance loss.
- Client surfaces: React web now, reusable HTTP clients later.
- API / contract shape: authenticated catalog and detail DTOs through Tuyau.
- Frontend/backend boundary: backend owns visibility and response minimization; React owns presentation state.
- Data / schema impact: `worlds`, `locations`, `characters`, same-World location integrity, and immutable seed identity.
- Auth / security impact: session-protected routes and non-disclosing inaccessible results.
- Testability: database, API, adapter, component, Storybook, and E2E layers.
- Operational risk: explicit seed command can reconcile destructively only after provenance validation.
- Fit with project conventions: matches the AdonisJS API-first and PostgreSQL decisions.

### Option 2: One JSON World Document

- User impact: similar initial read surface but weaker stable entity identity.
- Implementation complexity: lower initially, higher for targeted authoring and integrity later.
- Reversibility: easy initial storage, expensive later normalization.
- Client surfaces: same HTTP clients but less intentional structure.
- API / contract shape: one nested document.
- Frontend/backend boundary: unchanged in principle.
- Data / schema impact: weak relational constraints.
- Auth / security impact: similar route filtering.
- Testability: simpler persistence, weaker invariant proof.
- Operational risk: document drift and coarse destructive updates.
- Fit with project conventions: weaker than the selected relational aggregate.

## Selected Approach

Use normalized PostgreSQL tables for `worlds`, `locations`, and `characters`. `worlds.author_id` records ownership and `worlds.visibility` establishes the first access rule. Locations and Characters use stable keys unique within a World. Characters reference a canonical seed Location and store stable descriptive fields; a follow-up integrity migration enforces that each referenced Location belongs to the same World as its Character. No mutable Adventure state is introduced.

An application query service owns visibility filtering and intentional DTOs. Thin authenticated AdonisJS controllers expose `GET /api/v1/worlds` and `GET /api/v1/worlds/:slug`. The React client consumes the typed Tuyau contract through a World-specific API adapter. World query keys include the authenticated account identity and all account-owned cache entries share a removable prefix. A World API `401` ends the shared browser session and clears account-owned data; detail network failures expose an explicit retry state. `/worlds` renders the catalog and `/worlds/:slug` renders read-only detail. Storybook covers loaded, empty, and detail presentation without a live backend.

The explicit `db:seed` workflow reads `STARTER_WORLD_AUTHOR_EMAIL` from validated optional server configuration. The seeder fails clearly when the value is absent or does not match an account, and reconciles the starter graph transactionally so reruns are idempotent. Application startup never mutates World data.

## Experience Design

- Applicability: required; this Change introduces the first populated creator workspace and World detail view.
- Confirmed direction: extend the existing Lorecraft visual language with a sparse catalog and readable structured detail, preserving established auth/workspace navigation.
- User confirmation: user confirmed desktop and mobile catalog/detail behavior on 2026-07-14.
- Reference artifacts: production components and their Storybook stories are the stable references.

### User Flow And Information Architecture

Sign in, browse `/worlds`, choose `Stormbound Chapel`, inspect Locations and Characters, and return to Worlds.

### Responsive Composition

Catalog rows and detail entries remain readable at desktop and mobile widths without horizontal overflow.

### Component And State Contract

Catalog and detail expose loading, loaded, empty or missing, network failure, retry, and expired-session states.

### Accessibility And Interaction

Semantic headings, links for navigation, buttons for retry/logout, visible focus, status/alert semantics, and keyboard-operable flows are required.

### Visual Direction

Use the established Zinc-based Lorecraft tokens, restrained borders, readable measure, and creator-tool density.

### Open Design Questions

None block this accepted read-only slice.

## Client And API Boundary

- Current clients: React web client and explicit seed CLI adapter.
- Plausible future clients: mobile, administrative, and creator automation clients.
- Reusable product capabilities: list accessible Worlds and inspect structured canon.
- API or typed contract: authenticated JSON endpoints consumed through generated Tuyau types plus runtime response validation.
- OpenAPI plan, if HTTP-facing: Tuyau is the intentional framework-native typed contract for this early application; reassess OpenAPI before external clients ship.
- Backend platform exposed directly to clients?: only through authenticated AdonisJS routes and minimized DTOs.
- Client-specific presentation or local state: React Query loading/error/cache state and route presentation.
- Rationale: authorization, visibility, and canon reads remain backend-owned and reusable.

## Alternatives Considered

- **One JSON World document:** simpler initially, but weakens relational integrity and makes stable Location/Character identity and future targeted authoring harder. Rejected.
- **Hard-coded frontend fixture:** useful for a prototype but does not prove persistence, authorization, typed API contracts, or author ownership. Rejected.
- **Startup seeding:** operationally convenient but couples normal server boot to production data mutation. Rejected.

## Why This Approach

It proves the smallest creator-facing structured canon path while preserving stable entity identity, backend authority, future-client reuse, and a safe operational boundary around destructive seed reconciliation.

## Risks / Trade-Offs

- The explicit seed reconciles canonical rows destructively, so it must rely on immutable seed provenance rather than mutable World metadata before deleting stale children.
- Runtime validation at the typed client boundary duplicates a small amount of contract shape, but prevents malformed successful responses from reaching React as trusted data.
- The shared starter is intentionally public to authenticated accounts during testing; anonymous publishing and reader-specific private-knowledge policy remain deferred.

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

## ADRs

- Required: yes.
- ADR paths: `docs/adrs/2026-07-14-relational-world-aggregate.md`, `docs/adrs/2026-07-14-disposable-database-automation.md`, and `docs/adrs/2026-07-14-world-canon-and-adventure-isolation.md`.
- Decision summary: normalized relational canon, guarded disposable database automation, and strict World/Adventure isolation.
- Reconsider when: custom concept schemas, external clients, or Adventure snapshots require a broader aggregate boundary.

## Implementation Constraints

- Do not expose author account identity in World DTOs.
- Do not seed during server startup.
- Do not mutate an unmarked reserved-slug World unless its complete aggregate exactly matches the legacy canonical seed.
- Preserve unrelated account and Storybook behavior.

## Verification Strategy

- Focused automated tests: migrations, seed invariants, visibility/minimization, runtime DTO validation, cache/session behavior, and presentation states.
- Broad supporting gates: lint, typecheck, builds, formatting, dependency audit, and deterministic SDD validation.
- Deterministic E2E: real signup/sign-in, real seed command twice, populated catalog/detail at desktop and mobile sizes, and rerun safety.
- Live-provider or external-service playtests: not applicable.
- Manual UI confirmation: user-confirmed catalog and detail walkthrough at desktop and mobile widths.
- Debug/log inspection: not required for this deterministic read-only slice.

## Decisions

- Public visibility is authenticated-only during testing.
- Private Character knowledge remains visible temporarily.
- LC-002 owns catalog empty-state behavior; LC-001 owns protected workspace access.

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
