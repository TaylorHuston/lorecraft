---
id: LC-002
status: implemented
created: 2026-07-14
modified: 2026-07-15
last_verified: 2026-07-15
stories:
  - S1
  - S2
---

# LC-002 World Bible Catalog

## Product Context

- Related changes:
  - `docs/changes/closed/2026-07-14-public-starter-world/`
  - `docs/changes/2026-07-14-ui-cleanup-and-reconciliation/`
- Related ADRs:
  - `docs/adrs/2026-07-12-adonisjs-api-first-backend.md`
  - `docs/adrs/2026-07-12-postgresql-on-neon.md`
  - `docs/adrs/2026-07-12-react-web-client-and-typed-api-contract.md`
  - `docs/adrs/2026-07-12-browser-session-authentication.md`
  - `docs/adrs/2026-07-14-relational-world-aggregate.md`
  - `docs/adrs/2026-07-14-disposable-database-automation.md`

Lorecraft's creator value begins with durable, structured World canon. This Epic establishes the first read path over that canon without yet introducing authoring, collaboration, or Adventure state.

## Outcome

An authenticated account can browse Worlds available to it and inspect a World's canonical Locations and Characters through a read-only creator-facing interface.

## Current Scope

- Authenticated public World discovery.
- Read-only World metadata, Locations, and stable Character information.
- Intentional authorship and visibility persisted at the backend authority layer.
- Explicit, repeatable installation of the shared `Stormbound Chapel` starter World.

## Deferred Scope

- World, Location, or Character authoring and deletion.
- Anonymous publishing, creator bylines, sharing controls, and collaboration.
- Time-aware canon history, custom entity types, provenance, and continuity analysis.
- Adventures and all mutable gameplay state.
- Policy that hides character knowledge from specific readers or clients.

## Candidate Stories

Candidate Stories are planning signals only. They are not accepted Epic/Story truth until promoted into `## Stories`, and they do not receive `S#` labels until promotion.

- None currently. Authoring and time-aware canon remain deferred capability areas rather than accepted Stories.

## Story Index

| Story | Status      | Capability                      | Last Verified | Notes                               |
| ----- | ----------- | ------------------------------- | ------------- | ----------------------------------- |
| S1    | implemented | Browse accessible Worlds.       | 2026-07-15    | Authenticated public catalog.       |
| S2    | implemented | Inspect structured World canon. | 2026-07-15    | Read-only Locations and Characters. |

## Stories

### Story S1: Browse Available Worlds

Status: implemented
Created: 2026-07-14
Modified: 2026-07-15
Last verified: 2026-07-15

As a signed-in account holder, I want to browse Worlds available to me, so that I can choose canon to inspect.

#### Requirements And Scenarios

##### Requirement R1: Authenticated World Catalog

The system SHALL list public Worlds for every authenticated account and deny anonymous access to the catalog.

###### Scenario R1-S1: Shared Public World

- WHEN the author or another signed-in account opens the World catalog
- THEN `Stormbound Chapel` appears exactly once
- AND the catalog identifies it as public and read-only.

###### Scenario R1-S2: Anonymous Catalog Request

- WHEN an anonymous request calls the World catalog API
- THEN the API returns an authentication failure
- AND no World data is returned.

###### Scenario R1-S3: No Accessible Worlds

- WHEN an authenticated account has no accessible Worlds
- THEN the catalog presents an intentional empty state
- AND no unavailable creation control is presented.

##### Requirement R2: Coherent World Catalog Presentation

The system SHALL present the World catalog and its loading, failure, empty, populated, retry, and sign-out states through one responsive Lorecraft interface.

###### Scenario R2-S1: Populated Catalog

- WHEN an authenticated account has accessible Worlds
- THEN each World's name, description, visibility, and read-only state remain scannable at desktop and mobile widths
- AND the World name remains the clear navigation action.

###### Scenario R2-S2: Empty Or Loading Catalog

- WHEN the catalog is loading or contains no accessible Worlds
- THEN the interface communicates that state without layout instability
- AND it does not present unavailable creation behavior.

###### Scenario R2-S3: Recoverable Catalog Or Sign-Out Failure

- WHEN catalog loading or sign-out fails recoverably
- THEN the interface presents an actionable error without hiding available context
- AND any retry action has visible focus and a touch-accessible target.

#### Implemented By

| Path                                                                                       | Role                                                                               | Recheck Trigger                                                 |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `apps/backend/app/services/world_catalog_service.ts`                                       | Enforces visibility and returns minimized catalog DTOs.                            | Recheck when visibility or catalog response rules change.       |
| `apps/backend/app/controllers/worlds_controller.ts` and `apps/backend/start/routes.ts`     | Expose authenticated catalog and detail reads.                                     | Recheck when route authentication or response contracts change. |
| `apps/frontend/src/workspace/WorkspacePage.tsx`                                            | Presents loading, failure, empty, and populated catalog states.                    | Recheck when catalog states or navigation change.               |
| `apps/frontend/src/workspace/WorkspacePage.module.css` and `WorkspacePage.stories.tsx`     | Define and expose the responsive catalog hierarchy and deterministic state matrix. | Recheck when catalog presentation changes.                      |
| `apps/frontend/src/worlds/worldApi.ts` and `apps/frontend/src/worlds/tuyauWorldApi.ts`     | Define and implement the validated typed client boundary.                          | Recheck when World DTO fields or API error semantics change.    |
| `apps/frontend/src/auth/accountQueryKeys.ts` and `apps/frontend/src/auth/AuthProvider.tsx` | Scope account-owned data and clear it when the session changes.                    | Recheck when session or account cache ownership changes.        |

#### Verified By

| Requirement / Scenario       | Evidence                                                                                                    | Proves                                                                                                      | Status               |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------- |
| S1/R1-S1, S1/R1-S2           | `apps/backend/tests/functional/world_catalog.spec.ts`                                                       | Public catalog visibility and anonymous denial.                                                             | Passing 2026-07-15   |
| S1/R1-S1, S1/R1-S3           | `apps/frontend/src/worlds/WorldRoutes.test.tsx` and `WorkspacePage.stories.tsx`                             | Populated and empty catalog states.                                                                         | Passing 2026-07-15   |
| S1/R1-S1                     | `apps/frontend/src/worlds/tuyauWorldApi.test.ts`                                                            | Catalog contract validation and API error mapping.                                                          | Passing 2026-07-15   |
| S1/R1-S1                     | `apps/frontend/e2e/starter-world.setup.ts` and `starter-world.spec.ts`                                      | Real seed command and populated catalog path at desktop and mobile sizes.                                   | Passing 2026-07-15   |
| S1/R1-S1                     | User-confirmed desktop/mobile catalog review                                                                | Visual acceptance of the populated catalog.                                                                 | Confirmed 2026-07-14 |
| S1/R2-S1, S1/R2-S2, S1/R2-S3 | `apps/frontend/src/worlds/WorldRoutes.test.tsx` and `apps/frontend/src/workspace/WorkspacePage.stories.tsx` | Populated, empty, loading, failure, retry, sign-out, responsive, and Storybook accessibility states.        | Passing 2026-07-15   |
| S1/R2-S1                     | `apps/frontend/e2e/starter-world.spec.ts` and `account-workspace.spec.ts`                                   | Catalog navigation, no horizontal overflow, and representative mobile touch targets.                        | Passing 2026-07-15   |
| S1/R2-S1, S1/R2-S2, S1/R2-S3 | User-confirmed desktop/mobile UI walkthrough                                                                | Current catalog hierarchy, loading, empty, recovery, sign-out, focus, and responsive behavior are accepted. | Confirmed 2026-07-15 |

#### Verification Gaps

- None.

#### Story Notes

- Public means visible to every authenticated account; anonymous access remains denied.
- Account-owned client cache keys include account identity and are cleared when the shared session changes.

### Story S2: Inspect Structured World Canon

Status: implemented
Created: 2026-07-14
Modified: 2026-07-15
Last verified: 2026-07-15

As a signed-in account holder, I want to inspect a World's structured Locations and Characters, so that I can understand its established canon.

#### Requirements And Scenarios

##### Requirement R1: Read-Only World Detail

The system SHALL return and render an accessible World with deterministic Location and Character collections without exposing author account data.

###### Scenario R1-S1: Structured Starter World

- WHEN a signed-in account opens `/worlds/stormbound-chapel`
- THEN the interface shows all canonical starter Locations
- AND it shows all canonical starter Characters with physical description, background, personality, voice, private knowledge, and canonical location.

###### Scenario R1-S2: Unknown Or Inaccessible World

- WHEN a signed-in account requests an unknown or inaccessible World slug
- THEN the system returns a not-found result
- AND it does not reveal ownership or account data.

###### Scenario R1-S3: Repeat Starter Installation

- WHEN the explicit starter-World seed is run repeatedly for the configured author
- THEN exactly one starter World remains
- AND each canonical Location and Character remains exactly once with the configured content.

##### Requirement R2: Readable Structured World Detail

The system SHALL present World metadata, Locations, Characters, navigation, and detail-state feedback in a readable responsive hierarchy.

###### Scenario R2-S1: Structured Detail At Supported Viewports

- WHEN a signed-in account opens an accessible World at desktop or mobile width
- THEN World identity, description, Locations, and all accepted Character fields remain readable without horizontal overflow
- AND the read-only state and return navigation remain clear.

###### Scenario R2-S2: Missing Or Unavailable World

- WHEN World detail is missing, loading, or temporarily unavailable
- THEN the state is clearly distinguished from loaded canon
- AND available retry or return navigation remains keyboard and touch accessible.

###### Scenario R2-S3: Empty Structured Collections

- WHEN an accessible World contains no Locations, no Characters, or neither collection
- THEN each empty collection is communicated explicitly without inventing canonical content
- AND the World identity and document hierarchy remain stable and readable.

#### Implemented By

| Path                                                                                                                  | Role                                                                                 | Recheck Trigger                                                           |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `apps/backend/database/migrations/1784053200000_create_world_catalog_tables.ts`                                       | Defines relational World, Location, and Character integrity.                         | Recheck when World aggregate persistence changes.                         |
| `apps/backend/database/migrations/1784060400000_enforce_character_location_world_integrity.ts`                        | Enforces same-World Character Location references.                                   | Recheck when Character location semantics change.                         |
| `apps/backend/database/migrations/1784146800000_add_world_seed_identity.ts`                                           | Adds unique immutable provenance for installed starter Worlds.                       | Recheck when seed identity or installation semantics change.              |
| `apps/backend/app/services/stormbound_chapel_seed.ts` and `apps/backend/database/seeders/stormbound_chapel_seeder.ts` | Reconcile an immutably identified starter World transactionally.                     | Recheck when seed identity, command wiring, or canonical content changes. |
| `apps/backend/app/services/world_catalog_service.ts`                                                                  | Loads deterministic structured detail without account data.                          | Recheck when detail fields or authorization rules change.                 |
| `apps/frontend/src/worlds/WorldDetailPage.tsx`                                                                        | Presents read-only Locations and all stable Character fields.                        | Recheck when detail presentation or states change.                        |
| `apps/frontend/src/worlds/WorldDetailPage.module.css` and `WorldDetailPage.stories.tsx`                               | Define and expose responsive loaded, empty-collection, missing, and recovery states. | Recheck when detail presentation changes.                                 |

#### Verified By

| Requirement / Scenario       | Evidence                                                                           | Proves                                                                                                                      | Status               |
| ---------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| S2/R1-S1, S2/R1-S2, S2/R1-S3 | `apps/backend/tests/functional/world_catalog.spec.ts`                              | Structured minimized detail, safe not-found behavior, immutable seed provenance, and exact reconciliation.                  | Passing 2026-07-15   |
| S2/R1-S3                     | `apps/backend/tests/database/world_seed_identity_migration.spec.ts`                | Existing rows survive upgrade and starter provenance remains unique.                                                        | Passing 2026-07-15   |
| S2/R1-S1                     | `apps/backend/tests/database/character_location_world_integrity_migration.spec.ts` | Same-World Character Location integrity and upgrade safety.                                                                 | Passing 2026-07-15   |
| S2/R1-S1, S2/R1-S2           | `apps/frontend/src/worlds/WorldRoutes.test.tsx` and `WorldDetailPage.stories.tsx`  | Detail, missing, error, and retry presentation states.                                                                      | Passing 2026-07-15   |
| S2/R1-S1                     | `apps/frontend/src/worlds/tuyauWorldApi.test.ts`                                   | Detail contract validation and API error mapping.                                                                           | Passing 2026-07-15   |
| S2/R1-S1, S2/R1-S3           | `apps/frontend/e2e/starter-world.setup.ts` and `starter-world.spec.ts`             | Real seed command, catalog navigation, and structured detail at desktop and mobile sizes.                                   | Passing 2026-07-15   |
| S2/R1-S1                     | User-confirmed desktop/mobile structured detail review                             | Visual acceptance of structured detail.                                                                                     | Confirmed 2026-07-14 |
| S2/R2-S1, S2/R2-S2, S2/R2-S3 | `apps/frontend/src/worlds/WorldRoutes.test.tsx` and `WorldDetailPage.stories.tsx`  | Responsive structured detail, independent empty collections, missing/unavailable/retry states, and Storybook accessibility. | Passing 2026-07-15   |
| S2/R2-S1                     | `apps/frontend/e2e/starter-world.spec.ts`                                          | Loaded detail and return navigation remain readable, overflow-free, and touch accessible at desktop and mobile sizes.       | Passing 2026-07-15   |
| S2/R2-S1, S2/R2-S2, S2/R2-S3 | User-confirmed desktop/mobile UI walkthrough                                       | Current structured detail hierarchy, empty collections, recovery states, focus, and responsive behavior are accepted.       | Confirmed 2026-07-15 |

#### Verification Gaps

- None.

#### Story Notes

- `private knowledge` remains visible to authenticated readers by explicit temporary product decision.
- Starter installation is an explicit operation and never runs during normal server startup.

## Cross-Story Concerns

- AdonisJS owns authentication, authorization, visibility filtering, persistence, and response minimization.
- React owns catalog/detail presentation and client-local loading, error, and navigation state.
- Account-owned client cache entries are scoped by account identity and cleared when the shared session ends or changes.
- The typed HTTP contract is reusable by future clients; no World rule lives only in the web UI.
- `private knowledge` is visible in this testing phase by explicit scope decision and must not be mistaken for a durable audience policy.
- Normal server startup never creates or rewrites canonical World data.

### Cross-Story Implementation And Evidence

| Path / Evidence                                                           | Role / Proof                                                                                                                     |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `apps/frontend/src/styles/fonts.css`, `styles/tokens.css`, and `main.tsx` | Load the bundled type system and shared semantic presentation foundation used by the World catalog and structured detail routes. |
| `apps/frontend/.storybook/preview.tsx`                                    | Applies the same shared foundation to catalog/detail state stories and their configured accessibility checks.                    |

## Open Decisions

- None block the implemented read-only catalog. Authoring, anonymous publishing, and audience-specific knowledge policy remain deferred product decisions.

## Completion Criteria

This Epic is healthy when:

- authenticated catalog and detail behavior remain mapped to deterministic backend, frontend, Storybook, and populated E2E evidence;
- seed reconciliation can operate only on a World with immutable starter provenance;
- World API responses are validated before reaching presentation code;
- anonymous and inaccessible requests remain non-disclosing; and
- authoring, Adventures, and reader-specific knowledge policy remain explicit gaps rather than accidental behavior.

## Notes

- `Stormbound Chapel` is shared testing canon and is read-only in the current web client.
- The relational World aggregate and disposable database automation decisions are recorded in the related ADRs above.
