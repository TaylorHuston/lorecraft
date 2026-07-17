---
id: LC-002
status: implemented
created: 2026-07-14
modified: 2026-07-17
last_verified: 2026-07-17
stories:
  - S1
  - S2
---

# LC-002 World Bible Catalog

## Product Context

- Related changes:
  - `docs/changes/closed/2026-07-14-public-starter-world/`
  - `docs/changes/closed/2026-07-14-ui-cleanup-and-reconciliation/`
  - `docs/changes/closed/2026-07-16-private-adventure-foundation/`
- Related ADRs:
  - `docs/adrs/2026-07-12-adonisjs-api-first-backend.md`
  - `docs/adrs/2026-07-12-postgresql-on-neon.md`
  - `docs/adrs/2026-07-12-react-web-client-and-typed-api-contract.md`
  - `docs/adrs/2026-07-12-browser-session-authentication.md`
  - `docs/adrs/2026-07-14-relational-world-aggregate.md`
  - `docs/adrs/2026-07-14-disposable-database-automation.md`

Lorecraft's creator value begins with durable, structured World canon. This Epic owns the read-only catalog and detail paths over that canon; `LC-003` layers Adventure discovery and lifecycle actions onto the same surfaces without transferring their ownership here.

## Outcome

An authenticated account can browse Worlds available to it and inspect a World's canonical Locations and Characters through a read-only creator-facing interface.

## Current Scope

- Authenticated discovery of public Worlds and Worlds privately owned by the current account.
- Read-only World metadata, Locations, and stable Character information.
- Intentional authorship and visibility persisted at the backend authority layer.
- Explicit, repeatable installation of the shared `Stormbound Chapel` starter World.

## Deferred Scope

- World, Location, or Character authoring and deletion.
- Anonymous publishing, creator bylines, sharing controls, and collaboration.
- Time-aware canon history, custom entity types, provenance, and continuity analysis.
- Adventure play and mutable gameplay state are owned by `LC-003 Adventure Play`.
- Creator-only private Character knowledge authoring and inspection.

## Candidate Stories

Candidate Stories are planning signals only. They are not accepted Epic/Story truth until promoted into `## Stories`, and they do not receive `S#` labels until promotion.

- None currently. Authoring and time-aware canon remain deferred capability areas rather than accepted Stories.

## Story Index

| Story | Status      | Capability                      | Last Verified | Notes                               |
| ----- | ----------- | ------------------------------- | ------------- | ----------------------------------- |
| S1    | implemented | Browse accessible Worlds.       | 2026-07-17    | Public and owner-private catalog.    |
| S2    | implemented | Inspect structured World canon. | 2026-07-17    | Minimized Locations and Characters.  |

## Stories

### Story S1: Browse Available Worlds

Status: implemented
Created: 2026-07-14
Modified: 2026-07-17
Last verified: 2026-07-17

As a signed-in account holder, I want to browse Worlds available to me, so that I can choose canon to inspect.

#### Requirements And Scenarios

##### Requirement R1: Authenticated World Catalog

The system SHALL list public Worlds and Worlds privately owned by the current account while denying anonymous access and withholding another account's private Worlds.

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

###### Scenario R1-S4: Owner-Private World Visibility

- WHEN an author and another authenticated account browse a private World owned by the author
- THEN the author can see and open that World
- AND the other account receives neither catalog disclosure nor distinguishable detail about it.

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
| `apps/frontend/src/workspace/WorkspacePage.module.css` and `apps/frontend/src/workspace/WorkspacePage.stories.tsx` | Define and expose the responsive catalog hierarchy and deterministic state matrix. | Recheck when catalog presentation changes. |
| `apps/frontend/src/worlds/worldApi.ts` and `apps/frontend/src/worlds/tuyauWorldApi.ts`     | Define and implement the validated typed client boundary.                          | Recheck when World DTO fields or API error semantics change.    |
| `apps/frontend/src/auth/accountQueryKeys.ts` and `apps/frontend/src/auth/AuthProvider.tsx` | Scope account-owned data and clear it when the session changes.                    | Recheck when session or account cache ownership changes.        |
| `apps/frontend/src/adventures/NewAdventurePage.tsx` and `apps/frontend/src/adventures/adventureApi.ts` | Add LC-003-owned Adventure creation behavior to the shared World workflow. | Recheck when Adventure launch or World playability changes. |

#### Verified By

| Requirement / Scenario       | Evidence                                                                                                    | Proves                                                                                                      | Status               |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------- |
| S1/R1-S1, S1/R1-S2, S1/R1-S4 | `apps/backend/tests/functional/world_catalog.spec.ts`                                                       | Public catalog visibility, anonymous denial, and owner-private visibility/non-disclosure.                    | Passing 2026-07-17   |
| S1/R1-S1, S1/R1-S3           | `apps/frontend/src/app/App.test.tsx`, `apps/frontend/src/worlds/WorldRoutes.test.tsx`, and `apps/frontend/src/workspace/WorkspacePage.stories.tsx` | Populated and empty catalog states, including the authenticated empty-catalog route. | Passing 2026-07-17 |
| S1/R1-S1                     | `apps/frontend/src/worlds/tuyauWorldApi.test.ts`                                                            | Catalog contract validation and API error mapping.                                                          | Passing 2026-07-17   |
| S1/R1-S1                     | `apps/frontend/e2e/starter-world.setup.ts` and `apps/frontend/e2e/starter-world.spec.ts`                   | Real seed command and populated catalog path at desktop and mobile sizes.                                   | Passing 2026-07-17   |
| S1/R1-S1                     | User-confirmed desktop/mobile catalog review                                                                | Visual acceptance of the populated catalog.                                                                 | User confirmed 2026-07-14 |
| S1/R2-S1, S1/R2-S2, S1/R2-S3 | `apps/frontend/src/worlds/WorldRoutes.test.tsx` and `apps/frontend/src/workspace/WorkspacePage.stories.tsx` | Populated, empty, loading, failure, retry, sign-out, responsive, and Storybook accessibility states.        | Passing 2026-07-17   |
| S1/R2-S1                     | `apps/frontend/e2e/starter-world.spec.ts` and `apps/frontend/e2e/account-workspace.spec.ts`                | Catalog navigation, Adventure summaries/actions, no horizontal overflow, and representative mobile touch targets. | Passing 2026-07-17 |
| S1/R2-S1, S1/R2-S2, S1/R2-S3 | User-confirmed desktop/mobile UI walkthrough                                                                | Current catalog hierarchy, loading, empty, recovery, sign-out, focus, and responsive behavior are accepted. | User confirmed 2026-07-15 |

#### Verification Gaps

- None.

#### Story Notes

- Public means visible to every authenticated account; anonymous access remains denied.
- Private means visible only to the authoring account through this shared read path; other accounts receive the same not-found result as an unknown World.
- Account-owned client cache keys include account identity and are cleared when the shared session changes.

### Story S2: Inspect Structured World Canon

Status: implemented
Created: 2026-07-14
Modified: 2026-07-17
Last verified: 2026-07-17

As a signed-in account holder, I want to inspect a World's structured Locations and Characters, so that I can understand its established canon.

#### Requirements And Scenarios

##### Requirement R1: Read-Only World Detail

The system SHALL return and render an accessible World with deterministic Location and Character collections without exposing author account data.

###### Scenario R1-S1: Structured Starter World

- WHEN a signed-in account opens `/worlds/stormbound-chapel`
- THEN the interface shows all canonical starter Locations
- AND it shows all canonical starter Characters with physical description, background, personality, voice, and canonical location
- AND it withholds private Character knowledge from the shared reader/player response.

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
| `apps/frontend/src/worlds/WorldDetailPage.tsx`                                                                        | Presents minimized read-only Locations and Character fields plus LC-003-owned Adventure actions and summaries. | Recheck when detail presentation, disclosure, or shared Adventure integration changes. |
| `apps/frontend/src/worlds/WorldDetailPage.module.css` and `apps/frontend/src/worlds/WorldDetailPage.stories.tsx` | Define and expose responsive loaded, empty-collection, missing, and recovery states. | Recheck when detail presentation changes. |

#### Verified By

| Requirement / Scenario       | Evidence                                                                           | Proves                                                                                                                      | Status               |
| ---------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| S2/R1-S1, S2/R1-S2, S2/R1-S3 | `apps/backend/tests/functional/world_catalog.spec.ts`                              | Structured minimized detail, private-knowledge omission, safe not-found behavior, immutable seed provenance, and exact reconciliation. | Passing 2026-07-17 |
| S2/R1-S3                     | `apps/backend/tests/database/world_seed_identity_migration.spec.ts`                | Existing rows survive upgrade and starter provenance remains unique.                                                        | Passing 2026-07-15   |
| S2/R1-S1                     | `apps/backend/tests/database/character_location_world_integrity_migration.spec.ts` | Same-World Character Location integrity and upgrade safety.                                                                 | Passing 2026-07-15   |
| S2/R1-S1, S2/R1-S2           | `apps/frontend/src/worlds/WorldRoutes.test.tsx` and `apps/frontend/src/worlds/WorldDetailPage.stories.tsx` | Detail, disclosure, missing, error, retry, and Adventure-summary presentation states. | Passing 2026-07-17 |
| S2/R1-S1                     | `apps/frontend/src/worlds/tuyauWorldApi.test.ts`                                   | Minimized detail contract validation and API error mapping.                                                                 | Passing 2026-07-17 |
| S2/R1-S1, S2/R1-S3           | `apps/frontend/e2e/starter-world.setup.ts` and `apps/frontend/e2e/starter-world.spec.ts` | Real seed command, catalog navigation, minimized structured detail, and private-knowledge omission at desktop/mobile sizes. | Passing 2026-07-17 |
| S2/R1-S1                     | User-confirmed desktop/mobile structured detail review                             | Visual acceptance of structured detail.                                                                                     | User confirmed 2026-07-14 |
| S2/R2-S1, S2/R2-S2, S2/R2-S3 | `apps/frontend/src/worlds/WorldRoutes.test.tsx` and `apps/frontend/src/worlds/WorldDetailPage.stories.tsx` | Responsive structured detail, fixture-based empty collections, missing/unavailable/retry states, Adventure summaries, and accessibility. | Passing 2026-07-17 |
| S2/R2-S1                     | `apps/frontend/e2e/starter-world.spec.ts`                                          | Loaded detail, Adventure actions, and return navigation remain readable, overflow-free, and touch accessible.                | Passing 2026-07-17 |
| S2/R2-S1, S2/R2-S2, S2/R2-S3 | User-confirmed desktop/mobile UI walkthrough                                       | Current structured detail hierarchy, empty collections, recovery states, focus, and responsive behavior are accepted.       | User confirmed 2026-07-15 |

#### Verification Gaps

- None.

#### Story Notes

- Private Character knowledge remains canonical backend data but is intentionally omitted from the shared reader/player World response; creator-only access awaits authoring design.
- Empty-collection combinations that relational integrity cannot produce are deterministic presentation fixtures rather than database-backed states.
- Starter installation is an explicit operation and never runs during normal server startup.

## Cross-Story Concerns

- AdonisJS owns authentication, authorization, visibility filtering, persistence, and response minimization.
- React owns catalog/detail presentation and client-local loading, error, and navigation state.
- Account-owned client cache entries are scoped by account identity and cleared when the shared session ends or changes.
- The typed HTTP contract is reusable by future clients; no World rule lives only in the web UI.
- Private Character knowledge is withheld from shared reader/player responses and requires a future creator-only authoring boundary.
- Normal server startup never creates or rewrites canonical World data.

### Cross-Story Implementation And Evidence

| Path / Evidence                                                           | Role / Proof                                                                                                                     |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `apps/frontend/src/styles/fonts.css`, `styles/tokens.css`, and `main.tsx` | Load the bundled type system and shared semantic presentation foundation used by the World catalog and structured detail routes. |
| `apps/frontend/.storybook/preview.tsx`                                    | Applies the same shared foundation to catalog/detail state stories and their configured accessibility checks.                    |

## Open Decisions

- None block the implemented read-only catalog. Authoring, anonymous publishing, and creator-only private-knowledge access remain deferred product decisions.

## Completion Criteria

This Epic is healthy when:

- authenticated catalog and detail behavior remain mapped to deterministic backend, frontend, Storybook, and populated E2E evidence;
- seed reconciliation can operate only on a World with immutable starter provenance;
- World API responses are validated before reaching presentation code;
- anonymous and inaccessible requests remain non-disclosing; and
- authoring and creator-only private-knowledge access remain explicit gaps, while Adventure behavior stays owned by `LC-003`.

## Notes

- `Stormbound Chapel` is shared testing canon and is read-only in the current web client.
- The relational World aggregate and disposable database automation decisions are recorded in the related ADRs above.
