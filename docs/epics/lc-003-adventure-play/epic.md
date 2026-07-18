---
id: LC-003
status: implemented
created: 2026-07-16
modified: 2026-07-17
last_verified: 2026-07-17
stories:
  - S1
---

# LC-003 Adventure Play

## Product Context

- Related change: `docs/changes/closed/2026-07-16-private-adventure-foundation/`
- Related ADRs:
  - `docs/adrs/2026-07-14-world-canon-and-adventure-isolation.md`
  - `docs/adrs/2026-07-16-immutable-world-version-snapshots.md`
  - `docs/adrs/2026-07-16-durable-asynchronous-adventure-work.md`
  - `docs/adrs/2026-07-17-immutable-adventure-revisions.md`
  - `docs/adrs/2026-07-17-provider-neutral-ai-boundary.md`

Lorecraft's creator-owned Worlds are authoritative canon. Adventure play lets an account enter that canon through a private, non-canonical reality whose story remains stable when the creator later changes the World. The archived MVP is evidence for useful interactions, but the official application owns a new structured runtime built outward from this isolation boundary.

## Outcome

Accounts can enter an authorized World through private Adventures, receive and resume a durable Game Master opening grounded in frozen canon, and return later without changing the source World or another account's Adventure.

## Current Scope

- Start from one explicit immutable WorldVersion and one versioned default Starting Point.
- Create one private Adventure-owned player profile.
- Durably generate, persist, list, and resume an opening narration.
- Reset to the original source version and delete only the selected Adventure.
- Keep authorization, source isolation, lifecycle, provider orchestration, and typed API behavior in the AdonisJS backend.
- Present World-contained Adventure discovery and a responsive story-first Adventure route in the React client.

## Deferred Scope

- Act, Pass, Story, Guide, `/look`, `/help`, state extraction, and Game Master mutation.
- Dice, combat, health, inventory, equipment, stats, skills, quests, progression, and rules adjudication.
- Multiple Starting Points, selectable World dates, canonical protagonist templates, and WorldVersion management UI.
- Successful-turn Retry, rollback, branching, WorldVersion upgrades, and promotion of Adventure material into canon.
- Sharing, spectators, collaborative control, and multiplayer.
- Player-facing model controls, streaming, and push delivery.

## Candidate Stories

Candidate Stories are planning signals only. They are not accepted Epic/Story truth until promoted into `## Stories`, and they do not receive `S#` labels until promotion.

| Candidate                  | Status   | Story Shape                                                                                                                                       | Acceptance Signals                                                                                                                |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `resolve-structured-turns` | proposed | As a player, I want Act, Pass, and Guide to resolve durable Game Master turns, so that I can advance my Adventure.                                | Atomic asynchronous generation and extraction, one active turn, context rules, accepted mutations, and revision links are proven. |
| `shape-and-inspect-story`  | proposed | As a player, I want Story, `/look`, `/help`, and persistent context views, so that I can shape and understand the Adventure before ending a turn. | Utility persistence/context exclusion and Player/Scene knowledge filtering are proven.                                            |
| `revise-adventure-history` | deferred | As a player, I want to Retry, roll back, or branch from completed turns, so that I can revise my story safely.                                    | Complete state restoration and immutable history semantics are defined and proven.                                                |

## Story Index

| Story | Status      | Capability                            | Last Verified | Notes                                                   |
| ----- | ----------- | ------------------------------------- | ------------- | ------------------------------------------------------- |
| S1    | implemented | Start and resume a private Adventure. | 2026-07-17    | Implemented by the Private Adventure Foundation Change. |

## Stories

### Story S1: Start And Resume A Private Adventure

Status: implemented
Created: 2026-07-16
Modified: 2026-07-17
Last verified: 2026-07-17

As a signed-in account holder, I want to start and resume a private Adventure from an accessible World, so that I can enter stable canon as my own player character.

#### Requirements And Scenarios

##### Requirement R1: Account-Owned Adventure Creation

The system SHALL create at most one account-owned Adventure for one accepted creation request and expose it only to its owner.

###### Scenario R1-S1: Valid Player Profile

- WHEN a signed-in account starts an Adventure from a playable accessible World with a non-empty player name and optional profile text
- THEN Lorecraft creates one private Adventure and one Adventure-owned player profile
- AND returns a durable `/adventures/<id>` route in a pending opening state.

###### Scenario R1-S2: Invalid Or Duplicate Submission

- WHEN required input is invalid
- THEN no Adventure or job is created and field-level validation is returned
- AND WHEN the same owner repeats an accepted request with the same creation request identifier
- THEN Lorecraft returns the original Adventure instead of creating a duplicate.

###### Scenario R1-S3: Unauthorized Source Or Adventure

- WHEN an anonymous account, a signed-in account without World access, or a non-owner requests Adventure data or mutation
- THEN Lorecraft returns an authentication or non-disclosing not-found result as appropriate
- AND no private Adventure, player, prompt, or story data is exposed.

##### Requirement R2: Frozen World Source

The system SHALL bind every Adventure to one immutable WorldVersion and one Starting Point contained in that version.

###### Scenario R2-S1: Playable Published Version

- WHEN Adventure creation succeeds
- THEN its WorldVersion snapshot contains the source World metadata, Adventure guidance, Locations, Characters, and default Starting Point used for creation
- AND the Adventure's initial player and Scene location are derived from that Starting Point.

###### Scenario R2-S2: Later Canon Change

- WHEN source World data is changed and a newer WorldVersion becomes current after an Adventure exists
- THEN the existing Adventure continues reading its original snapshot
- AND a newly created Adventure uses the newer current WorldVersion.

###### Scenario R2-S3: World Is Not Playable

- WHEN an accessible World has no current immutable version, no Location, or no default Starting Point with an opening premise
- THEN Adventure creation is unavailable with a clear conflict result
- AND World inspection remains available.

##### Requirement R3: Durable Opening Generation

The system SHALL durably generate and atomically publish one opening narration before marking an Adventure ready.

###### Scenario R3-S1: Successful Opening

- WHEN a worker claims the pending opening job
- THEN the Game Master receives non-editable platform instructions, frozen World guidance, the Starting Point premise, relevant starting canon, and the player profile
- AND successful prose is committed as the root story entry and root revision before the Adventure becomes ready.

###### Scenario R3-S2: Reload Or Worker Restart

- WHEN the browser reloads while the opening is pending or a worker loses its lease
- THEN the persisted Adventure remains pending and the client resumes polling authoritative status
- AND another worker can reclaim stale work without publishing duplicate openings.

###### Scenario R3-S3: Provider Failure And Retry

- WHEN opening generation fails transiently
- THEN Lorecraft retries it once without creating another Adventure or exposing partial prose
- AND after terminal failure the Adventure shows a recoverable failed state whose owner can retry against the same frozen source.

###### Scenario R3-S4: Atomic Publication

- WHEN generation does not produce valid non-empty narration or persistence fails
- THEN no opening story entry or root revision becomes visible
- AND the Adventure does not report ready.

##### Requirement R4: Resume And Lifecycle

The system SHALL list and reopen the owner's Adventures under their source World and keep destructive lifecycle actions Adventure-scoped.

###### Scenario R4-S1: List And Resume

- WHEN an owner returns to the source World or opens `/adventures/<id>`
- THEN the World lists each owned Adventure with player identity, completed turn count, last-played time, and lifecycle state
- AND a ready Adventure renders its opening story, Player context, and initial Scene context from its frozen source.

###### Scenario R4-S2: Reset

- WHEN the owner confirms reset while no opening job is active
- THEN generated story and Adventure-owned runtime state are replaced with initial state from the same WorldVersion and Starting Point
- AND a new opening is queued using the original player profile without changing source canon.

###### Scenario R4-S3: Delete

- WHEN the owner confirms deletion from the source World's Adventure list
- THEN the Adventure and its owned jobs, calls, revisions, story, and player state are removed
- AND the World, WorldVersion, and every other Adventure remain unchanged.

##### Requirement R5: Coherent Adventure Experience

The system SHALL present creation, pending, failure, ready, reset, delete, resume, and settings states through an accessible story-first responsive interface that preserves Lorecraft's Player/Story/Scene composition.

###### Scenario R5-S1: Create And Pending States

- WHEN the account starts an Adventure at desktop or mobile width
- THEN required and optional player fields, submission progress, and pending Game Master status remain readable and keyboard operable
- AND repeated submission is prevented without relying only on client state.

###### Scenario R5-S2: Ready Adventure

- WHEN opening generation completes
- THEN the Adventure route clearly distinguishes story, Player context, and Scene context without horizontal overflow
- AND the generated opening is the primary reading focus.

###### Scenario R5-S3: Recoverable And Destructive Actions

- WHEN an opening fails, reset is unavailable during active work, or settings, delete, or reset opens a dialog
- THEN the UI presents the correct retry, conflict, or confirmation behavior
- AND focus enters the appropriate dialog control, remains contained while open, and returns to the invoking control after close
- AND Escape or cancel dismisses the dialog when dismissal is allowed
- WHEN confirmation is pending or fails
- THEN duplicate or conflicting destructive actions are prevented and status or error feedback is announced.

###### Scenario R5-S4: Preserve Desktop And Mobile Adventure Composition

- WHEN a ready, pending, or failed Adventure is viewed at a supported desktop width
- THEN Player, Story, and Scene remain distinct regions with Story dominant in the center
- WHEN the same Adventure is viewed at a supported narrow width
- THEN Story is the first view and Story, Player, and Scene are available through keyboard-operable tabs
- AND no region introduces horizontal overflow or hides required actions.

#### Implemented By

| Path                                                                                                                                         | Role                                                                                                                                                          | Recheck Trigger                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `apps/backend/database/migrations/1784233200000_add_frozen_world_source_foundation.ts`                                                       | Adds relational Starting Points and immutable WorldVersion storage plus ownership/default/immutability constraints.                                           | Recheck when World authoring, version identity, or frozen-source ownership changes.                       |
| `apps/backend/app/models/world.ts`, `apps/backend/app/models/starting_point.ts`, and `apps/backend/app/models/world_version.ts` | Maps the relational authoring aggregate and immutable version metadata. | Recheck when snapshot schema or World relationships change. |
| `apps/backend/app/services/world_version_publication_service.ts`                                                                             | Validates stable-key references and deterministically publishes or reuses immutable schema-v1 snapshots.                                                      | Recheck when canonical World fields or publication concurrency semantics change.                          |
| `apps/backend/app/services/stormbound_chapel_seed.ts`                                                                                        | Reconciles the first playable World, default Starting Point, guidance, premise, and current version in one transaction.                                       | Recheck when starter canon or explicit installation behavior changes.                                     |
| `apps/backend/database/migrations/1784236800000_create_adventure_aggregate.ts`, `apps/backend/app/models/adventure*.ts`, and `apps/backend/app/models/model_call.ts` | Defines the private Adventure aggregate, one player, durable jobs/calls, and immutable revision/story ownership boundaries. | Recheck when Adventure ownership, lifecycle persistence, or cascade semantics change. |
| `apps/backend/app/services/adventure_creation_service.ts`                                                                                    | Validates and atomically creates an owner-idempotent Adventure from the accessible current WorldVersion and its frozen default Starting Point.                | Recheck when creation input, source access, idempotency, or initial-state semantics change.               |
| `apps/backend/app/services/adventure_query_service.ts`                                                                                       | Projects owner-filtered Adventure summaries and visible Player/Scene/story state from the frozen source without raw snapshot or prompt evidence.              | Recheck when Adventure disclosure, read projection, or story history semantics change.                    |
| `apps/backend/app/services/adventure_lifecycle_service.ts`                                                                                   | Resets an owned Adventure to its same frozen source and deletes only the selected private aggregate.                                                          | Recheck when reset generations, active-work conflicts, or deletion boundaries change.                     |
| `apps/backend/app/services/story_generation/*.ts` | Defines deterministic frozen-context prompt assembly and a provider-neutral OpenAI-compatible prose boundary with sanitized evidence and normalized failures. | Recheck when opening context, provider protocol, generation settings, or evidence redaction changes. |
| `apps/backend/app/services/adventure_opening_worker.ts`                                                                                      | Claims durable opening jobs with expiring leases and atomically publishes sanitized call evidence, the root revision, opening narration, and ready state.     | Recheck when job topology, retry limits, lease recovery, or opening publication changes.                  |
| `apps/backend/app/controllers/adventures_controller.ts`, `apps/backend/app/validators/adventure.ts`, and `apps/backend/start/routes.ts` | Exposes authenticated, CSRF-protected create/read/retry/reset/delete contracts over backend-owned Adventure services. | Recheck when Adventure HTTP shape, validation, authentication, or lifecycle errors change. |
| `apps/backend/app/controllers/worlds_controller.ts` and `apps/backend/app/services/world_catalog_service.ts` | Adds playability and current-owner Adventure summaries while withholding raw version data, author identity, and private Character knowledge. | Recheck when World discovery, playability, or disclosure policy changes. |
| `apps/frontend/src/adventures/adventureApi.ts` and `apps/frontend/src/adventures/tuyauAdventureApi.ts` | Defines reusable lifecycle contracts, generated Tuyau routing, runtime response validation, account-scoped query identity, and stable client errors. | Recheck when Adventure DTOs, generated routes, or client error semantics change. |
| `apps/frontend/src/adventures/AdventurePage.tsx`, `apps/frontend/src/adventures/AdventureWorkbench.tsx`, and `apps/frontend/src/adventures/NewAdventurePage.tsx` | Present creation, pending, failure, ready, retry, gear-triggered reset settings, and responsive Player/Story/Scene states without owning domain rules. | Recheck when Adventure navigation, disclosure, lifecycle presentation, or responsive composition changes. |
| `apps/frontend/src/adventures/AdventurePage.module.css`, `apps/frontend/src/adventures/AdventureWorkbench.module.css`, `apps/frontend/src/adventures/NewAdventurePage.module.css`, and `apps/frontend/src/adventures/AdventurePage.stories.tsx` | Define and expose Adventure shell, form, state, responsive pane, and dialog presentation. | Recheck when Adventure styling or preview states change. |
| `apps/frontend/src/components/Dialog/Dialog.tsx` and `apps/frontend/src/components/Dialog/ConfirmDialog.tsx` | Provide Base UI-backed focus containment, dismissal, restoration, pending, error, and destructive confirmation behavior. | Recheck when dialog accessibility or confirmation behavior changes. |
| `apps/frontend/src/components/Dialog/Dialog.module.css` and `apps/frontend/src/components/Dialog/ConfirmDialog.module.css` | Define shared dialog layering, spacing, error, pending, and action presentation. | Recheck when shared dialog styling changes. |
| `apps/frontend/src/components/Button/Button.tsx`, `apps/frontend/src/components/TextField/TextField.tsx`, and `apps/frontend/src/components/Textarea/Textarea.tsx` | Provide app-owned action and player-creation field grammar across Adventure states. | Recheck when shared control behavior changes. |
| `apps/frontend/src/comparison/Workbench.stories.tsx` and `apps/frontend/src/comparison/Workbench.stories.module.css` | Expose deterministic production-height desktop, mobile, World-navigation analogue, empty, and error comparison fixtures. | Recheck when the comparison protocol or Adventure composition changes. |
| `apps/frontend/src/workspace/WorkspacePage.tsx` and `apps/frontend/src/worlds/WorldDetailPage.tsx`                                           | Present direct creation, owner Adventure summaries, explicit Resume/delete actions, and matching button-styled back navigation across catalog and World detail. | Recheck when Adventure discovery, launch, navigation, or lifecycle-management placement changes.           |
| `apps/backend/commands/work_adventure_openings.ts`, `apps/backend/scripts/run-development.mjs`, and `apps/frontend/playwright.config.ts` | Runs the durable worker independently in production and alongside the API in development and deterministic browser verification. | Recheck when worker deployment, process supervision, polling, or test topology changes. |

#### Verified By

| Requirement / Scenario                                                    | Evidence                                                                                                                                            | Proves                                                                                                                                                                                                                                                            | Status             |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| S1/R2 foundation                                                          | `apps/backend/tests/database/frozen_world_source_migration.spec.ts`                                                                                 | Same-World Starting Points, one default, immutable UUID version identity, same-World current-version ownership, and serialized concurrent publication.                                                                                                            | Passing 2026-07-16 |
| S1/R2-S1 publication portion                                              | `apps/backend/tests/functional/world_version_publication.spec.ts` and `apps/backend/tests/functional/world_catalog.spec.ts`                        | Deterministic complete snapshots, stable-key validation, content identity, playable Stormbound guidance/default Starting Point, and same-transaction publication.                                                                                                 | Passing 2026-07-16 |
| S1/R2-S2 publication portion                                              | `apps/backend/tests/functional/world_version_publication.spec.ts`                                                                                   | Changed canon creates a new ordinal while the earlier snapshot remains unchanged; identical canon reuses the prior version.                                                                                                                                       | Passing 2026-07-16 |
| S1/R1-S1 and R1-S2 service boundary                                       | `apps/backend/tests/functional/adventure_creation_service.spec.ts`                                                                                  | Valid player creation, durable pending route, owner-idempotent replay, field validation, and atomic rollback.                                                                                                                                                     | Passing 2026-07-16 |
| S1/R1-S3 source-access portion                                            | `apps/backend/tests/functional/adventure_creation_service.spec.ts`                                                                                  | Public and owner-private sources are accepted while another owner's private source is indistinguishable from missing and creates no Adventure.                                                                                                                    | Passing 2026-07-16 |
| S1/R2-S1 creation binding                                                 | `apps/backend/tests/functional/adventure_creation_service.spec.ts`                                                                                  | Creation binds the Adventure and initial player Location to the selected current snapshot's frozen default Starting Point.                                                                                                                                        | Passing 2026-07-16 |
| S1/R2-S3 creation conflict                                                | `apps/backend/tests/functional/adventure_creation_service.spec.ts`                                                                                  | Missing current version or valid frozen default Starting Point creates no Adventure and returns a playability conflict.                                                                                                                                           | Passing 2026-07-16 |
| S1/R2-S2 Adventure isolation and R4-S1 service boundary                   | `apps/backend/tests/functional/adventure_query_service.spec.ts`                                                                                     | Owner-only list/read projections continue using the original frozen version after newer canon is published and omit private model/prompt evidence.                                                                                                                | Passing 2026-07-16 |
| S1/R1-S3 lifecycle portion and R4-S2..R4-S3 service boundary              | `apps/backend/tests/functional/adventure_lifecycle_service.spec.ts`                                                                                 | Cross-owner lifecycle calls are non-disclosing; reset uses the same frozen source and clears prior work; delete preserves source and sibling Adventures.                                                                                                          | Passing 2026-07-16 |
| S1/R3-S1 prompt/provider boundary and R3-S3/R3-S4 provider-error portions | `apps/backend/tests/unit/story_generation/opening_prompt.spec.ts` and `apps/backend/tests/unit/story_generation/openai_compatible_story_generator.spec.ts` | Frozen opening context is assembled deterministically; prose, timeout, provider failure, malformed/empty output, exact evidence, and credential redaction are normalized.                                                                                     | Passing 2026-07-16 |
| S1/R3-S3 owner-retry service portion                                      | `apps/backend/tests/functional/adventure_lifecycle_service.spec.ts`                                                                                 | An owner can queue new opening work after terminal failure against the same source/generation; another account receives the same not-found result as a missing Adventure.                                                                                         | Passing 2026-07-16 |
| S1/R1-S2 creation pending and R3-S3 unavailable-retry client behavior      | `apps/frontend/src/adventures/AdventureRoutes.test.tsx`                                                                                              | Creation exposes pending semantics through the submitted fields, and an unavailable Adventure keeps retry context visible while preventing duplicate refetch activation.                                                                                         | Passing 2026-07-17 |
| S1/R3-S1..R3-S4 durable worker behavior                                   | `apps/backend/tests/functional/adventure_opening_worker.spec.ts`                                                                                    | One worker claims work; expired leases recover or terminate within the retry bound; successful opening state publishes atomically; failed/empty output exposes no prose; reset/delete invalidate stale finalization; evidence and logs omit credentials.          | Passing 2026-07-16 |
| S1/R1-S1..R1-S3, R2-S3, and R4 HTTP boundary                              | `apps/backend/tests/functional/adventure_api.spec.ts`                                                                                               | Authenticated creation/read/lifecycle routes, owner isolation, anonymous denial, CSRF, bounded validation, idempotency, malformed identity, stable conflicts, playability, and owner-only World summaries.                                                        | Passing 2026-07-16 |
| S1/R2-S1 disclosure boundary                                              | `apps/backend/tests/functional/adventure_api.spec.ts` and `apps/backend/tests/functional/world_catalog.spec.ts`                                    | Player-facing World and Adventure projections omit raw snapshots, author identity, prompt evidence, and private Character knowledge.                                                                                                                              | Passing 2026-07-16 |
| S1/R4 and R5 client behavior                                              | `apps/frontend/src/adventures/AdventureRoutes.test.tsx`, `apps/frontend/src/adventures/AdventureWorkbench.test.tsx`, `apps/frontend/src/worlds/WorldRoutes.test.tsx`, and `apps/frontend/src/adventures/AdventurePage.stories.tsx` | Typed creation/lifecycle behavior, explicit Resume, gear-triggered settings, confirmed reset/delete, pending polling, retry/reset conflicts, filtered responsive context, keyboard/focus, and automated accessibility checks.                       | Passing 2026-07-17 |
| S1/R1, R3, R4, and R5 routed journey                                      | `apps/frontend/e2e/adventure-foundation.spec.ts` with `apps/frontend/e2e/fake-story-provider.mjs`                                                   | Desktop/mobile creation, populated pending state, reload-safe deterministic opening, resume with zero turns, same-Adventure reset, anonymous/cross-owner denial, responsive tabs, overflow checks, and cleanup deletion through production API/worker boundaries. | Passing 2026-07-16 |
| S1/R1-R5 full regression gates                                            | `apps/backend/tests/functional/adventure_api.spec.ts`, `apps/frontend/src/adventures/AdventureRoutes.test.tsx`, `apps/frontend/e2e/adventure-foundation.spec.ts`, and root `package.json` scripts                  | Backend, frontend, Storybook, build, typecheck, lint, and desktop/mobile Playwright gates keep the complete deterministic Adventure foundation green together without embedding volatile suite counts in durable Epic evidence.                                                                                 | Passing 2026-07-17 |
| S1/R3-S1 and R3-S3 configured-provider behavior                           | Live `gemma4:31b` opening against Stormbound Chapel                                                                                                  | With hidden reasoning disabled, the provider completes in one attempt without token truncation and persists narration grounded in the frozen player, Location, present Characters, storm, and unexplained bell.                                                    | Passing 2026-07-17 |
| S1/R5-S1..R5-S3 manual presentation                                       | Taylor's desktop and mobile Adventure walkthrough                                                                                                    | World-contained lifecycle controls, the Adventure shell, settings, responsive tabs, and matching back-navigation remain understandable and usable.                                                                                                               | User confirmed 2026-07-17 |
| S1/R5-S3                                                                  | `apps/frontend/src/components/Dialog/Dialog.test.tsx`, `apps/frontend/src/adventures/AdventureRoutes.test.tsx`, and `apps/frontend/src/adventures/AdventurePage.stories.tsx` | Dialog entry, containment, permitted dismissal, trigger restoration, pending duplicate prevention, and announced status/error behavior. | Passing 2026-07-17 |
| S1/R5-S4                                                                  | `apps/frontend/src/adventures/AdventureWorkbench.test.tsx`, `apps/frontend/src/comparison/Workbench.stories.tsx`, and `apps/frontend/e2e/adventure-foundation.spec.ts` | Desktop Player/Story/Scene composition, Story-first keyboard tabs, lifecycle states, touch access, and overflow-free desktop/mobile rendering. | Passing 2026-07-17 |
| S1/R5-S1..R5-S4                                                         | `apps/frontend/src/components/Button/Button.test.tsx`, `apps/frontend/src/components/IconButton/IconButton.test.tsx`, and `apps/frontend/src/components/Textarea/Textarea.test.tsx` | Adventure actions and creation fields retain accessible names plus pending, disabled, and validation semantics. | Passing 2026-07-17 |

#### Verification Gaps

- The strengthened `S1/R5-S3` and new `S1/R5-S4` app-owned evidence and cross-application UI Foundations comparison capture are complete. User confirmation remains Change-level closeout work.
- The old-versus-new WorldVersion behavior is proven at database/service/API boundaries because no World-authoring browser route exists yet; add a routed E2E when authoring/version publication becomes user-accessible.

#### Story Notes

- The opening root revision has zero completed player turns.
- Player name is the initial Adventure identity; a separate Adventure title is deferred.
- Reset preserves the creation profile and original frozen source while clearing generated runtime state.

## Cross-Story Concerns

- World canon remains authoritative and immutable from Adventure runtime paths.
- Adventure data is private to its owner even when the source World is public.
- The AdonisJS backend owns authorization, lifecycle, source/state projection, prompt assembly, jobs, and provider adapters for every client.
- Completed narration and state transitions use immutable revision links so later Retry and rollback can be introduced coherently.
- Raw prompt/model evidence is sensitive operational data and never part of the normal player API.

## Open Decisions

- None block `S1`. Candidate Stories require their own promoted Changes before they become accepted Epic truth.

## Completion Criteria

This Epic is healthy when:

- embedded Stories describe only accepted Adventure behavior;
- private Adventure ownership and WorldVersion isolation are enforced by backend and database evidence;
- opening generation survives reloads and stale workers without duplicate publication;
- World discovery, creation, recovery, ready, reset, and delete states have deterministic and manual evidence;
- `Implemented By`, `Verified By`, and `Verification Gaps` remain current; and
- deferred turn controls and history revision are not represented as implemented.

## Notes

- The archived Lorecraft MVP remains reference material and does not own official Epic truth.
- Version-management UI is not required for the first immutable WorldVersion implementation.
