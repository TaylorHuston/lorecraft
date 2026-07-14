---
id: LC-002
status: implemented
created: 2026-07-14
modified: 2026-07-14
last_verified: 2026-07-14
stories:
  - S1
  - S2
---

# LC-002 World Bible Catalog

## Product Context

- Related change: `docs/changes/2026-07-14-public-starter-world/`
- Related ADRs:
  - `docs/adrs/2026-07-12-adonisjs-api-first-backend.md`
  - `docs/adrs/2026-07-12-postgresql-on-neon.md`
  - `docs/adrs/2026-07-12-react-web-client-and-typed-api-contract.md`
  - `docs/adrs/2026-07-12-browser-session-authentication.md`

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

## Story Index

| Story | Status      | Capability                      | Last Verified | Notes                               |
| ----- | ----------- | ------------------------------- | ------------- | ----------------------------------- |
| S1    | implemented | Browse accessible Worlds.       | 2026-07-14    | Authenticated public catalog.       |
| S2    | implemented | Inspect structured World canon. | 2026-07-14    | Read-only Locations and Characters. |

## Stories

### Story S1: Browse Available Worlds

Status: implemented
Created: 2026-07-14
Modified: 2026-07-14
Last verified: 2026-07-14

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

#### Implemented By

| Path                                                                                   | Role                                                            |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `apps/backend/app/services/world_catalog_service.ts`                                   | Enforces visibility and returns minimized catalog DTOs.         |
| `apps/backend/app/controllers/worlds_controller.ts` and `apps/backend/start/routes.ts` | Expose authenticated catalog and detail reads.                  |
| `apps/frontend/src/workspace/WorkspacePage.tsx`                                        | Presents loading, failure, empty, and populated catalog states. |
| `apps/frontend/src/worlds/worldApi.ts` and `apps/frontend/src/worlds/tuyauWorldApi.ts` | Define and implement the typed client boundary.                 |

#### Verified By

| Scenario                  | Evidence                                                                        | Status             |
| ------------------------- | ------------------------------------------------------------------------------- | ------------------ |
| S1/R1-S1, S1/R1-S2        | `apps/backend/tests/functional/world_catalog.spec.ts`                           | Passing 2026-07-14 |
| S1/R1-S1, S1/R1-S3        | `apps/frontend/src/worlds/WorldRoutes.test.tsx` and `WorkspacePage.stories.tsx` | Passing 2026-07-14 |
| S1/R1-S1 through S1/R1-S3 | Automated desktop/mobile browser walkthrough                                    | Passing 2026-07-14 |

#### Verification Gaps

- Manual user confirmation remains pending.

### Story S2: Inspect Structured World Canon

Status: implemented
Created: 2026-07-14
Modified: 2026-07-14
Last verified: 2026-07-14

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

#### Implemented By

| Path                                                                                                     | Role                                                          |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `apps/backend/database/migrations/1784053200000_create_world_catalog_tables.ts`                          | Defines relational World, Location, and Character integrity.  |
| `apps/backend/app/services/stormbound_chapel_seed.ts` and `database/seeders/stormbound_chapel_seeder.ts` | Reconcile the explicit starter World transactionally.         |
| `apps/backend/app/services/world_catalog_service.ts`                                                     | Loads deterministic structured detail without account data.   |
| `apps/frontend/src/worlds/WorldDetailPage.tsx`                                                           | Presents read-only Locations and all stable Character fields. |

#### Verified By

| Scenario                     | Evidence                                                                           | Status             |
| ---------------------------- | ---------------------------------------------------------------------------------- | ------------------ |
| S2/R1-S1, S2/R1-S2, S2/R1-S3 | `apps/backend/tests/functional/world_catalog.spec.ts`                              | Passing 2026-07-14 |
| S2/R1-S1, S2/R1-S2           | `apps/frontend/src/worlds/WorldRoutes.test.tsx` and `WorldDetailPage.stories.tsx`  | Passing 2026-07-14 |
| S2/R1-S1                     | Automated desktop/mobile browser walkthrough against the seeded development schema | Passing 2026-07-14 |

#### Verification Gaps

- Manual user confirmation remains pending.

## Cross-Story Concerns

- AdonisJS owns authentication, authorization, visibility filtering, persistence, and response minimization.
- React owns catalog/detail presentation and client-local loading, error, and navigation state.
- The typed HTTP contract is reusable by future clients; no World rule lives only in the web UI.
- `private knowledge` is visible in this testing phase by explicit scope decision and must not be mistaken for a durable audience policy.
- Normal server startup never creates or rewrites canonical World data.
