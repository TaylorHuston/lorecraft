---
schema: sdd-epic-v2
id: LC-002
status: in_progress
created: 2026-07-14
modified: 2026-07-20
last_verified: 2026-07-20
stories:
  - S1
  - S2
  - S3
---

# LC-002 World Bible Catalog

## Product Context

- Related changes:
  - `docs/changes/closed/2026-07-14-public-starter-world/`
  - `docs/changes/closed/2026-07-14-ui-cleanup-and-reconciliation/`
  - `docs/changes/closed/2026-07-16-private-adventure-foundation/`
  - `docs/changes/2026-07-19-character-authoring-and-npc-cards/`
- Related ADRs:
  - `docs/adrs/2026-07-12-adonisjs-api-first-backend.md`
  - `docs/adrs/2026-07-12-postgresql-on-neon.md`
  - `docs/adrs/2026-07-12-react-web-client-and-typed-api-contract.md`
  - `docs/adrs/2026-07-12-browser-session-authentication.md`
  - `docs/adrs/2026-07-14-relational-world-aggregate.md`
  - `docs/adrs/2026-07-14-disposable-database-automation.md`

Lorecraft's creator value begins with durable, structured World canon. This Epic owns World discovery, detail, and Character-canon authoring. `LC-003` consumes immutable WorldVersions for private Adventures without transferring canon authority from this Epic.

## Outcome

An authenticated account can browse accessible Worlds, inspect complete development/debug Character Cards, and—when they are the World author—maintain those cards. Character changes publish or reuse immutable source versions for future Adventures without changing frozen Adventures.

## Current Scope

- Authenticated discovery of public Worlds and Worlds privately owned by the current account.
- Read-only World metadata and Locations, plus complete Character Cards during the development/debug stage.
- Intentional authorship and visibility persisted at the backend authority layer.
- Explicit, repeatable installation of the shared `Stormbound Chapel` starter World.
- Owner-only complete Character create, edit, and delete through World detail, with transactionally coupled immutable WorldVersion publication.
- Development/debug disclosure of complete Character Cards, including private knowledge and initial Adventure state, to signed-in accounts with World access.

## Deferred Scope

- World and Location authoring and deletion.
- Anonymous publishing, creator bylines, sharing controls, and collaboration.
- Time-aware canon history, custom entity types, provenance, and continuity analysis.
- Player-safe disclosure, spoiler filtering, player-known facts, selective disclosure, and removal of the debug full-card view.
- Draft/publish workflows, WorldVersion management UI, bulk editing/import, and Character ordering controls.
- Adventure play and mutable gameplay state are owned by `LC-003 Adventure Play`.

## Candidate Stories

Candidate Stories are planning signals only. They are not accepted Epic/Story truth until promoted into `## Stories`, and they do not receive `S#` labels until promotion.

- None. Future World and Location authoring, time-aware canon, custom concepts, and selective Character disclosure remain deferred capability areas.

## Story Index

| Story | Implementation | Verification | Capability | Last Verified | Notes |
| --- | --- | --- | --- | --- | --- |
| S1 | implemented | verified | Browse accessible Worlds. | 2026-07-19 | Public and owner-private catalog. |
| S2 | implemented | partial | Inspect structured World canon and complete debug cards. | 2026-07-19 | Full-card API and rendered Storybook evidence exist; database and routed E2E proof remain pending. |
| S3 | implemented | partial | Manage World Characters. | 2026-07-20 | Guarded database and deterministic creator CRUD E2E evidence pass; recovery and owner manual confirmation remain pending. |

## Stories

### Story S1: Browse Available Worlds

Implementation: implemented
Verification: verified
Created: 2026-07-14
Modified: 2026-07-18
Last verified: 2026-07-19

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
- AND it does not present unavailable creation behavior.

###### Scenario R1-S4: Owner-Private World Visibility

- WHEN an author and another authenticated account browse a private World owned by the author
- THEN the author can see and open that World
- AND the other account receives neither catalog disclosure nor distinguishable detail about it.

###### Scenario R1-S5: Clean Production Starter Catalog

- WHEN a clean migrated production database receives the creator's account and the explicit starter-World seed
- THEN the deployed catalog shows exactly one `Stormbound Chapel` World owned by that creator
- AND no development accounts, Adventures, or other development Worlds appear.

##### Requirement R2: Coherent World Catalog Presentation

The system SHALL present the World catalog and its loading, failure, empty, populated, retry, and sign-out states through one responsive Lorecraft interface with predictable app-owned action and state grammar.

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

###### Scenario R2-S4: Preserve Catalog Context Across States And Actions

- WHEN the catalog transitions among loading, failure, empty, and populated states or the user invokes World navigation or retry
- THEN available World identity and page context remain stable
- AND controls expose distinct keyboard focus, pending, disabled, and pressed states where applicable
- AND the interface introduces no horizontal overflow at supported desktop or mobile widths.

##### Requirement R3: World Catalog Route Context

The system SHALL identify the World catalog destination through its document title and primary heading without moving focus during background catalog refresh.

###### Scenario R3-S1: Catalog Navigation

- WHEN an account holder navigates to the World catalog
- THEN the document title identifies the catalog
- AND focus begins at the catalog heading.

###### Scenario R3-S2: Catalog Refresh

- WHEN catalog data refreshes without a route change
- THEN the current title and user focus remain stable.

#### Implemented By

| Requirement / Scenario | Location / Anchor | Kind | Responsibility |
| --- | --- | --- | --- |
| S1/R1 | `apps/backend/app/services/world_catalog_service.ts#WorldCatalogService.listFor` | primary | Enforces World visibility and returns catalog DTOs. |
| S1/R1 | `apps/backend/app/controllers/worlds_controller.ts#WorldsController.index` and `apps/backend/start/routes.ts` | adapter | Expose authenticated catalog reads. |
| S1/R2 | `apps/frontend/src/workspace/WorkspacePage.tsx#WorkspacePage` | primary | Presents loading, failure, empty, and populated catalog states. |
| S1/R2 | `apps/frontend/src/workspace/WorkspacePage.module.css` and `apps/frontend/src/workspace/WorkspacePage.stories.tsx` | presentation | Define and expose the responsive catalog hierarchy and deterministic state matrix. |
| S1/R1, S1/R2 | `apps/frontend/src/worlds/worldApi.ts` and `apps/frontend/src/worlds/tuyauWorldApi.ts` | adapter | Define and implement the validated typed client boundary. |
| S1/R1, S1/R2 | `apps/frontend/src/auth/accountQueryKeys.ts` and `apps/frontend/src/auth/AuthProvider.tsx` | support | Scope account-owned data and clear it when the session changes. |
| S1/R3 | `apps/frontend/src/app/AppRoutes.tsx#RoutePresentation` | primary | Sets catalog title and destination focus while preserving background-refresh focus. |

#### Implementation Gaps

- None.

#### Verified By

| Requirement / Scenario | Evidence | Proves | Status |
| --- | --- | --- | --- |
| S1/R1-S1, S1/R1-S2, S1/R1-S4 | `apps/backend/tests/functional/world_catalog.spec.ts` | Public catalog visibility, anonymous denial, and owner-private visibility/non-disclosure. | Passing 2026-07-17 |
| S1/R1-S1, S1/R1-S3 | `apps/frontend/src/app/App.test.tsx`, `apps/frontend/src/worlds/WorldRoutes.test.tsx`, and `apps/frontend/src/workspace/WorkspacePage.stories.tsx` | Populated and empty catalog states, including the authenticated empty-catalog route. | Passing 2026-07-17 |
| S1/R1-S1 | `apps/frontend/src/worlds/tuyauWorldApi.test.ts` | Catalog contract validation and API error mapping. | Passing 2026-07-17 |
| S1/R1-S1 | `apps/frontend/e2e/starter-world.setup.ts` and `apps/frontend/e2e/starter-world.spec.ts` | Real seed command and populated catalog path at desktop and mobile sizes. | Passing 2026-07-17 |
| S1/R2-S1, S1/R2-S2, S1/R2-S3, S1/R2-S4 | `apps/frontend/src/worlds/WorldRoutes.test.tsx`, `apps/frontend/src/workspace/WorkspacePage.stories.tsx`, `apps/frontend/src/comparison/Workbench.stories.tsx`, and `apps/frontend/e2e/account-workspace.spec.ts` | Catalog states, retry, account context, responsive controls, comparison fixtures, touch targets, and overflow-free behavior. | Passing 2026-07-17 |
| S1/R3-S1, S1/R3-S2 | `apps/frontend/src/app/RoutePresentation.test.tsx` | Catalog navigation title/heading focus and refresh focus preservation. | Passing 2026-07-18 |
| S1/R1-S5 | Private production acceptance | A clean migrated target received one normal HTTPS-created account and one idempotently seeded starter World with no copied development accounts or Adventures. | Passing 2026-07-18 |

#### Verification Gaps

- None.

#### Story Notes

- Public means visible to every authenticated account; anonymous access remains denied.
- Private means visible only to the authoring account through this shared read path; other accounts receive the same not-found result as an unknown World.
- Account-owned client cache keys include account identity and are cleared when the shared session changes.

### Story S2: Inspect Structured World Canon

Implementation: implemented
Verification: partial
Created: 2026-07-14
Modified: 2026-07-19
Last verified: 2026-07-19

As a signed-in account holder, I want to inspect a World's structured Locations and Characters, so that I can understand its established canon.

#### Requirements And Scenarios

##### Requirement R1: World Detail And Complete Debug Character Cards

The system SHALL return and render an accessible World with deterministic Location and Character collections without exposing author account data.

###### Scenario R1-S1: Structured Starter World

- WHEN a signed-in account opens `/worlds/stormbound-chapel`
- THEN the interface shows all canonical starter Locations
- AND it shows every canonical starter Character's key, name, canonical Location, physical description, background, personality, voice, private knowledge, initial mood, initial status, and initial memory during the debug stage.

###### Scenario R1-S2: Unknown Or Inaccessible World

- WHEN a signed-in account requests an unknown or inaccessible World slug
- THEN the system returns a not-found result
- AND it does not reveal ownership or account data.

###### Scenario R1-S3: Repeat Starter Installation

- WHEN the explicit starter-World seed is run repeatedly for the configured author
- THEN exactly one starter World remains
- AND each canonical Location and Character remains exactly once with the configured content.

###### Scenario R1-S4: Restored Starter World

- WHEN the production database is restored into an isolated recovery target and the deployed application is connected to it
- THEN the creator can open the restored `Stormbound Chapel` World
- AND its canonical Locations and Characters match the production source without duplicate starter content.

##### Requirement R2: Readable Structured World Detail

The system SHALL present World metadata, Locations, complete debug Character Cards, navigation, and detail-state feedback in a readable responsive hierarchy using the same app-owned control and state grammar as the catalog.

###### Scenario R2-S1: Structured Detail At Supported Viewports

- WHEN a signed-in account opens an accessible World at desktop or mobile width
- THEN World identity, description, Locations, and all accepted Character fields remain readable without horizontal overflow
- AND debug disclosure and return navigation remain clear.

###### Scenario R2-S2: Missing Or Unavailable World

- WHEN World detail is missing, loading, or temporarily unavailable
- THEN the state is clearly distinguished from loaded canon
- AND available retry or return navigation is clearly named and remains keyboard and touch accessible
- AND pending or disabled behavior is exposed when applicable through the same app-owned control grammar as the catalog.

###### Scenario R2-S3: Empty Structured Collections

- WHEN an accessible World contains no Locations, no Characters, or neither collection
- THEN each empty collection is communicated explicitly without inventing canonical content
- AND the World identity and document hierarchy remain stable and readable.

##### Requirement R3: World Detail Route Context

The system SHALL identify an accessible World detail destination through its document title and primary heading without moving focus during background detail refresh.

###### Scenario R3-S1: World Detail Navigation

- WHEN an account holder opens an accessible World
- THEN the document title identifies the World detail destination
- AND focus begins at the World heading.

###### Scenario R3-S2: World Detail Refresh Or Unavailable State

- WHEN World detail refreshes in place, focus remains stable
- AND when navigation resolves to a missing or inaccessible World state, the title and primary heading identify that destination state.

#### Implemented By

| Requirement / Scenario | Location / Anchor | Kind | Responsibility |
| --- | --- | --- | --- |
| S2/R1, S2/R2 | `apps/backend/app/services/world_catalog_service.ts#WorldCatalogService.findFor` | primary | Authorized World-detail read and deterministic complete-card projection. |
| S2/R1-S2 | `apps/backend/app/controllers/worlds_controller.ts#WorldsController.show` and `apps/backend/start/routes.ts` | adapter | Expose authenticated detail reads and non-disclosing errors. |
| S2/R1, S2/R2 | `apps/frontend/src/worlds/WorldDetailPage.tsx#WorldDetailPage` | primary | Detail presentation, complete Character Cards, and explicit development/debug disclosure. |
| S2/R2 | `apps/frontend/src/worlds/WorldDetailPage.module.css` and `apps/frontend/src/worlds/WorldDetailPage.stories.tsx` | presentation | Responsive complete-card, authoring, empty-collection, missing, and recovery states. |
| S2/R3 | `apps/frontend/src/app/AppRoutes.tsx#RoutePresentation` | primary | Sets World-detail title and destination focus while preserving refresh focus. |
| S2/R1 | `apps/backend/database/migrations/1784416800000_add_character_initial_state.ts` and `apps/backend/app/models/character.ts#Character` | persistence | Persist complete initial-state card fields alongside relational Character and same-World Location integrity. |

#### Implementation Gaps

- None. Database-backed and end-to-end confirmation remain verification gaps, not missing behavior.

#### Verified By

| Requirement / Scenario | Evidence | Proves | Status |
| --- | --- | --- | --- |
| S2/R1-S2, S2/R1-S3 | `apps/backend/tests/functional/world_catalog.spec.ts` | Current structured detail authorization, safe not-found behavior, immutable seed provenance, and exact reconciliation. It does not prove the planned complete-card disclosure. | Passing 2026-07-17 |
| S2/R1-S3 | `apps/backend/tests/database/world_seed_identity_migration.spec.ts` | Existing rows survive upgrade and starter provenance remains unique. | Passing 2026-07-15 |
| S2/R1 | `apps/backend/tests/database/character_location_world_integrity_migration.spec.ts` | Same-World Character Location integrity and upgrade safety. | Passing 2026-07-15 |
| S2/R1-S1, S2/R2-S1, S2/R2-S2, S2/R2-S3 | `apps/frontend/src/worlds/WorldRoutes.test.tsx` and `apps/frontend/src/worlds/WorldDetailPage.stories.tsx` | Complete-card fields, debug disclosure, author/non-author visibility, and detail loading/error/empty/recovery states. | Passing 2026-07-19 |
| S2/R1-S1 | `apps/backend/tests/database/character_initial_state_migration.spec.ts` | Upgrade path for persisted initial mood, status, and memory. | Implemented; guarded database runner blocked before execution. |
| S2/R1-S1, S2/R2-S1 | Storybook `Application/Worlds/Detail/Authoring` at desktop and 390px mobile | Directly inspected complete-card authoring form and populated card with no horizontal overflow or browser errors. | Passing 2026-07-19 |
| S2/R3-S1, S2/R3-S2 | `apps/frontend/src/app/RoutePresentation.test.tsx` | World-detail and unavailable-destination title/heading focus without refresh focus theft. | Passing 2026-07-18 |
| S2/R2-S1, S2/R2-S2 | `apps/frontend/e2e/starter-world.spec.ts` | Current loaded detail, Adventure actions, return navigation, touch access, and overflow-free layout. It does not prove the planned full-card surface. | Passing 2026-07-17 |

#### Verification Gaps

- `S2/R1-S1`, `S2/R2-S1`: Database-backed API and deterministic E2E evidence for complete-card fields remain pending because guarded disposable database configuration is absent.
- `S2/R1-S1`, `S2/R2-S1`: Direct non-author rendered confirmation remains pending user/test-account access.
- `S2/R1-S4`: Fresh browser credential submission and restored structured-canon inspection remain an accepted prior closeout gap.

#### Story Notes

- During this development/debug stage, every signed-in account with World access may inspect complete Character Cards, including private knowledge and initial Adventure state; only the author may mutate canon under S3.
- Empty-collection combinations that relational integrity cannot produce are deterministic presentation fixtures rather than database-backed states.
- Starter installation is an explicit operation and never runs during normal server startup.

### Story S3: Manage World Characters

Implementation: implemented
Verification: partial
Created: 2026-07-19
Modified: 2026-07-19
Last verified: 2026-07-20

As a World creator, I want to create, edit, and delete complete Character Cards, so that my current canon and future Adventures use the Characters I intend.

#### Requirements And Scenarios

##### Requirement R1: Author-Only Character Mutation

The system SHALL allow only the authenticated World author to create, edit, or delete Character canon while preserving non-disclosing access behavior.

###### Scenario R1-S1: Author Mutates Character Canon

- WHEN the author performs a valid Character create, edit, or delete request
- THEN the backend applies the requested mutation through the authoritative World application boundary
- AND returns the updated World/Character contract without exposing persistence internals.

###### Scenario R1-S2: Non-Author Mutation

- WHEN another signed-in account or an anonymous request targets Character mutation
- THEN authentication or the existing non-disclosing not-found result applies
- AND no Character row or WorldVersion changes.

##### Requirement R2: Create A Complete Character Card

The system SHALL create one Character only when its immutable stable key, name, canonical Location, and every required card field is valid.

###### Scenario R2-S1: Valid Complete Character

- WHEN the author supplies a unique lowercase kebab-case key, name, same-World Location, physical description, background, personality, voice, private knowledge, initial mood, initial status, and initial memory within their limits
- THEN Lorecraft creates one Character whose complete card is immediately readable
- AND concise values are accepted without requiring artificial verbosity.

###### Scenario R2-S2: Invalid Or Conflicting Character

- WHEN a required value is blank, a field exceeds its limit, the key is invalid or already used in the World, or the Location belongs to another World
- THEN field-specific validation is returned
- AND neither Character canon nor the current WorldVersion changes.

##### Requirement R3: Edit A Complete Character Card

The system SHALL let the author change every card value except the stable key while keeping the complete card valid.

###### Scenario R3-S1: Valid Character Edit

- WHEN the author saves valid changes to display name, canonical Location, or any narrative/initial-state field
- THEN the updated complete card becomes current World canon
- AND the stable key remains unchanged.

###### Scenario R3-S2: Invalid Or Stale Edit

- WHEN an edit is invalid, targets a missing Character, or races with a state the server can no longer accept
- THEN the request fails without a partial card or WorldVersion
- AND the UI retains the author's entered values with actionable feedback when possible.

##### Requirement R4: Delete A Character

The system SHALL delete a selected Character only after explicit author confirmation and without mutating frozen Adventures.

###### Scenario R4-S1: Confirmed Delete

- WHEN the author confirms deletion of a current Character
- THEN the Character is removed from editable World canon and future WorldVersions
- AND existing Adventures and their frozen NPC Cards remain unchanged.

###### Scenario R4-S2: Cancelled Or Failed Delete

- WHEN the author cancels, the Character no longer exists, or publication fails
- THEN the destructive operation does not produce a partial mutation
- AND the current page retains or refreshes authoritative context with clear feedback.

##### Requirement R5: Atomic Current-Version Publication

The system SHALL publish or reuse the content-identical immutable WorldVersion in the same transaction as every accepted Character mutation.

###### Scenario R5-S1: Changed Character Content

- WHEN a Character create, edit, or delete changes serialized World content
- THEN one new immutable version becomes the World's current version
- AND a later Adventure uses that version while an existing Adventure remains on its original version.

###### Scenario R5-S2: No-Op Or Failed Publication

- WHEN saved content is identical to an existing version, Lorecraft reuses that immutable version
- AND WHEN serialization, validation, or persistence fails
- THEN the Character mutation and current-version pointer roll back together.

##### Requirement R6: Coherent Character Authoring Experience

The system SHALL integrate full cards, create/edit controls, validation, pending states, deletion confirmation, and read-only non-author state into the responsive World detail experience.

###### Scenario R6-S1: Authoring And Read-Only States

- WHEN the author opens a populated or empty Character section
- THEN create and relevant edit/delete actions are discoverable without obscuring the World or Adventure context
- AND a non-author sees the same complete debug cards without mutation controls.

###### Scenario R6-S2: Responsive, Keyboard, And Recovery Behavior

- WHEN Character authoring is used with keyboard, touch, zoom, long-but-valid content, loading, validation failure, request failure, pending save, or pending delete at supported desktop and mobile widths
- THEN labels, focus, pending/disabled state, error association, confirmation behavior, and card readability remain clear without horizontal overflow.

#### Implemented By

| Requirement / Scenario | Location / Anchor | Kind | Responsibility |
| --- | --- | --- | --- |
| S3/R1 | `apps/backend/app/services/world_character_service.ts#WorldCharacterService.create`, `#update`, and `#destroy` | primary | Owner-scoped Character mutation. |
| S3/R2 | `apps/backend/app/services/world_character_service.ts#WorldCharacterService.create` | primary | Creates validated complete Character Cards with stable keys and same-World Locations. |
| S3/R3 | `apps/backend/app/services/world_character_service.ts#WorldCharacterService.update` | primary | Updates every mutable card field while preserving its stable key. |
| S3/R4 | `apps/backend/app/services/world_character_service.ts#WorldCharacterService.destroy` | primary | Removes current canon after UI confirmation without touching frozen Adventure rows. |
| S3/R5 | `apps/backend/app/services/world_character_service.ts#WorldCharacterService.create`, `#update`, and `#destroy` | primary | Couples each mutation to immutable WorldVersion publication in one transaction. |
| S3/R1-R5 | `apps/backend/app/controllers/worlds_controller.ts#WorldsController.createCharacter`, `#updateCharacter`, and `#destroyCharacter` with `apps/backend/start/routes.ts` | adapter | Expose authenticated, typed Character mutation routes and error mapping. |
| S3/R2-R3 | `apps/backend/app/validators/character.ts#characterCreateValidator` and `#characterUpdateValidator` | support | Enforce required compact fields and immutable-key edit shape. |
| S3/R6 | `apps/frontend/src/worlds/WorldDetailPage.tsx#CharacterEditorForm` and `#WorldDetailPage` | primary | Provides author-only create/edit/delete controls, validation presentation, pending state, confirmation, and focus return. |
| S3/R6 | `apps/frontend/src/worlds/worldApi.ts#createTuyauWorldApi` and `apps/frontend/src/worlds/tuyauWorldApi.ts#createTuyauWorldApi` | adapter | Carries full-card typed contracts and mutations to the client. |

#### Implementation Gaps

- None.

#### Verified By

| Requirement / Scenario | Evidence | Proves | Status |
| --- | --- | --- | --- |
| S3/R1-S1, S3/R2-S1, S3/R3-S1, S3/R4-S1, S3/R6-S1 | `apps/frontend/src/worlds/WorldRoutes.test.tsx` | Author-only full-card creation flow, mutation payload, focus return, and non-author absence of mutation controls. | Passing 2026-07-19 |
| S3/R1-S1, S3/R1-S2, S3/R2-S1, S3/R2-S2, S3/R3-S1, S3/R3-S2, S3/R4-S1, S3/R4-S2, S3/R5-S1, S3/R5-S2 | `apps/backend/tests/functional/world_character_authoring.spec.ts` | Owner/non-author mutation, complete-card validation, immutable keys, delete isolation, publication, and rollback scenarios. | Passing 2026-07-20 against a guarded direct disposable schema. |
| S3/R1-S1, S3/R3-S1, S3/R4-S1, S3/R5-S1, S3/R6-S1 | `apps/frontend/e2e/starter-world.spec.ts` | Creator-visible complete-card create, edit, delete, and publication behavior, including an existing Adventure retaining its frozen NPC while a newly created Adventure uses the renamed published NPC. | Passing 2026-07-20 on desktop and mobile against a guarded isolated schema. |
| S3/R6-S1 | `apps/frontend/src/worlds/tuyauWorldApi.test.ts` | Typed create, update, and delete Character request/response adaptation. | Passing 2026-07-19 |
| S3/R6-S1, S3/R6-S2 | `apps/frontend/src/worlds/WorldDetailPage.stories.tsx` and direct Storybook inspection of `Authoring` desktop/mobile | Required fields, card hierarchy, delete confirmation fixture, responsive layout, and no horizontal overflow. | Passing 2026-07-19 |

#### Verification Gaps

- `S3/R6-S2`: Validation, failed-save, failed-delete, long-content, and live routed author/non-author confirmation remain pending.

#### Story Notes

- Character stable keys are created once, are lowercase kebab-case and World-scoped, and remain immutable when display names change.
- Character mutation and current-version publication must commit or roll back together; existing Adventures remain frozen on their original WorldVersion.

## Cross-Story Concerns

- AdonisJS owns authentication, authorization, visibility filtering, Character mutation, publication, persistence, and response minimization or debug disclosure.
- React owns catalog/detail presentation and client-local loading, error, navigation, draft, and dialog state.
- Account-owned client cache entries are scoped by account identity and cleared when the shared session ends or changes.
- The typed HTTP contract is reusable by future clients; no World rule lives only in the web UI.
- Complete debug disclosure is intentionally temporary product behavior for this development stage. Normal model evidence omits card contents, assembled prompts, and private knowledge; local-development Debug/raw capture defaults on, is explicitly disableable, and is never part of normal operational evidence.
- Character canon changes must publish a new or reused immutable WorldVersion without altering existing Adventures.
- Normal server startup never creates or rewrites canonical World data.

## Open Decisions

- None block the active Character-authoring implementation. Selective disclosure, World/Location authoring, draft publication, version-management UI, and custom concepts remain deferred.

## Completion Criteria

This Epic is healthy when:

- authenticated catalog and detail behavior remain mapped to deterministic backend, frontend, Storybook, and populated E2E evidence;
- seed reconciliation can operate only on a World with immutable starter provenance;
- World API responses are validated before reaching presentation code;
- anonymous and inaccessible requests remain non-disclosing;
- complete debug Character Cards and owner-only Character mutation have scenario-mapped evidence;
- Character mutations and immutable WorldVersion publication are transactionally coupled while existing Adventures remain frozen; and
- deferred World/Location authoring and selective disclosure are not represented as implemented.

## Notes

- `Stormbound Chapel` is shared testing canon. Its author can manage Characters; other signed-in accounts retain read-only access.
- The relational World aggregate and disposable database automation decisions are recorded in the related ADRs above.
