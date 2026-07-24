---
schema: sdd-epic-v2
id: LC-003
status: in_progress
created: 2026-07-16
modified: 2026-07-24
last_verified: 2026-07-24
stories:
  - S1
  - S2
  - S3
---

# LC-003 Adventure Play

## Product Context

- Related changes: `docs/changes/closed/2026-07-16-private-adventure-foundation/`, `docs/changes/closed/2026-07-19-character-authoring-and-npc-cards/`, and `docs/changes/closed/2026-07-22-ui-refinements/`
- Related ADRs:
  - `docs/adrs/2026-07-14-world-canon-and-adventure-isolation.md`
  - `docs/adrs/2026-07-16-immutable-world-version-snapshots.md`
  - `docs/adrs/2026-07-16-durable-asynchronous-adventure-work.md`
  - `docs/adrs/2026-07-17-immutable-adventure-revisions.md`
  - `docs/adrs/2026-07-17-provider-neutral-ai-boundary.md`
  - `docs/adrs/2026-07-18-revision-linked-adventure-state-mutations.md` (accepted)

Lorecraft's creator-owned Worlds are authoritative canon. Adventure play lets an account enter that canon through a private, non-canonical reality whose story remains stable when the creator later changes the World. The archived MVP is evidence for useful interactions, but the official application owns a new structured runtime built outward from this isolation boundary.

## Outcome

Accounts can enter an authorized World through private Adventures, receive and resume a durable Game Master opening grounded in frozen canon, and return without changing the source World or another account's Adventure. S2 adds Act, Pass, and Guide turn resolution with bounded Adventure-owned consequences and an owner-visible Guide transcript treatment. The closed Character-authoring Change extended frozen source, current-Scene prompt context, Debug diagnostics, and current-Scene NPC Cards. Historical guarded-schema, synthetic-smoke, deterministic-E2E, and live-provider evidence is retained in the scenario maps; current database/live-provider reruns and owner acceptance remain explicit verification gaps.

## Current Scope

- Start from one explicit immutable WorldVersion and one versioned default Starting Point.
- Create one private Adventure-owned player profile.
- Durably generate, persist, list, and resume an opening narration.
- Resolve one owner-only, idempotent Act, Pass, or Guide turn from a ready Adventure.
- Process turn narration and bounded Adventure-owned consequences through the durable worker, then publish a revision, narration, and current state atomically.
- Materialize mutable Player/NPC Adventure state while retaining revision-linked mutation outcomes.
- Reset to the original source version and delete only the selected Adventure.
- Keep authorization, source isolation, lifecycle, provider orchestration, and typed API behavior in the AdonisJS backend.
- Present World-contained Adventure discovery and a responsive story-first Adventure route in the React client.
- Project the owner's durable Act, Pass, and Guide events into the Story transcript without changing model context.
- Player-visible current-Scene NPC details, bounded context-size metadata, local development Debug diagnostics, and owner Debug inspection in Settings.
- Provide a developer-run synthetic opening smoke command that uses the same effective provider configuration as the workers and fails when a response is truncated.

## Deferred Scope

- Story inserts, `/look`, `/help`, and general command parsing.
- Dice, combat, health, inventory, equipment, stats, skills, quests, progression, and rules adjudication.
- Multiple Starting Points, selectable World dates, canonical protagonist templates, and WorldVersion management UI.
- Successful-turn Retry, rollback, branching, WorldVersion upgrades, and promotion of Adventure material into canon.
- Sharing, spectators, collaborative control, and multiplayer.
- Player-facing model controls, streaming, and push delivery.

## Candidate Stories

Candidate Stories are planning signals only. They are not accepted Epic/Story truth until promoted into `## Stories`, and they do not receive `S#` labels until promotion.

| Candidate                  | Status   | Story Shape                                                                                                                                       | Acceptance Signals                                                                                                                  |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `shape-and-inspect-story`  | proposed | As a player, I want Story, `/look`, `/help`, and persistent context views, so that I can shape and understand the Adventure before ending a turn. | Utility persistence/context exclusion and Player/Scene knowledge filtering are proven. NPC card inspection is owned by accepted S3. |
| `revise-adventure-history` | deferred | As a player, I want to Retry, roll back, or branch from completed turns, so that I can revise my story safely.                                    | Complete state restoration and immutable history semantics are defined and proven.                                                  |

## Story Index

| Story | Implementation | Verification | Capability                             | Last Verified | Notes                                                                                                                              |
| ----- | -------------- | ------------ | -------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| S1    | implemented    | partial      | Start and resume a private Adventure.  | 2026-07-24    | Scenario evidence is narrowed to current anchors; production/recovery and owner manual acceptance remain explicit gaps. |
| S2    | implemented    | partial      | Resolve a structured Game Master turn. | 2026-07-24    | Durable turn foundation, current-Scene card context, and local Debug capture are implemented; live-provider and owner manual proof remain explicit gaps. |
| S3    | implemented    | partial      | Inspect NPC details.                   | 2026-07-24    | Player-visible Scene details and Settings-only Debug editing have desktop/mobile E2E proof; rendered recovery and owner manual proof remain pending. |

## Stories

### Story S1: Start And Resume A Private Adventure

Implementation: implemented
Verification: partial
Created: 2026-07-16
Modified: 2026-07-24
Last verified: 2026-07-24

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

###### Scenario R1-S4: AI Processing Is Disclosed Before Creation

- WHEN an account holder reviews the Adventure creation form
- THEN the form explains before submission that the player profile and frozen World context are processed by Lorecraft's configured AI provider
- AND the explanation does not imply that generated output becomes World canon.

###### Scenario R1-S5: Portable Creation Request Identity

- WHEN the browser cannot use its native random-UUID convenience function
- THEN Adventure creation still sends a standards-compliant UUID request identity
- AND valid creation and idempotent replay behavior remain unchanged.

##### Requirement R2: Frozen World Source

The system SHALL bind every Adventure to one immutable WorldVersion and one Starting Point contained in that version.

###### Scenario R2-S1: Playable Published Version

- WHEN Adventure creation succeeds
- THEN its WorldVersion snapshot contains the source World metadata, Adventure guidance, Locations, complete Character Cards with initial mood, status, and memory, and default Starting Point used for creation
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
- THEN the Game Master receives non-editable platform instructions, frozen World guidance, the Starting Point premise, the player profile, and complete NPC Cards for all and only NPCs in the starting Scene
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

###### Scenario R3-S5: Account Generation Burst Limit

- WHEN one account exceeds the accepted burst budget across Adventure creation, opening retry, and reset requests on one API process
- THEN Lorecraft rejects further generation-queuing requests before creating or replacing work
- AND another account retains its own independent burst budget
- AND horizontal or paid untrusted deployment requires shared atomic enforcement before this guarantee can be described as deployment-wide.

###### Scenario R3-S6: Metadata-Only Model Evidence

- WHEN Lorecraft requests or receives an Adventure opening from the configured provider
- THEN persisted operational evidence contains only bounded diagnostic metadata
- AND assembled prompts, request messages, raw provider responses, credentials, and authorization material are absent from persistence and logs
- AND the accepted opening narration remains durable Adventure content.

###### Scenario R3-S7: Transient Provider Recovery

- WHEN the provider returns a retryable failure or bounded retry guidance
- THEN Lorecraft schedules a capped delayed retry instead of immediately consuming every attempt
- AND a terminal or exhausted failure still becomes owner-recoverable without publishing partial narration.

###### Scenario R3-S8: Worker Shutdown During Generation

- WHEN the opening worker receives a shutdown request while provider generation is in flight
- THEN it cancels the in-flight operation, publishes no partial result, and leaves the job safely recoverable
- AND the operational interruption is not charged as a provider failure attempt.

###### Scenario R3-S9: Private Production Opening

- WHEN the deployed API queues an opening in production
- THEN the separately supervised deployed worker claims it within the configured five-second idle-poll bound
- AND it reaches the configured private model provider without exposing provider credentials or an application listener on LAN or public interfaces
- AND exactly one opening is durably published through the production database.

###### Scenario R3-S10: Coordinated Production Restart

- WHEN a coordinated deployment stops the API and worker while durable opening work exists and later restarts them
- THEN shutdown does not consume a provider-failure attempt or publish partial narration
- AND the restarted worker safely reclaims or resumes eligible work without duplicate publication.

###### Scenario R3-S11: Local Provider Configuration Smoke

- WHEN a developer changes the local configured model, token cap, timeout, or provider endpoint and runs the opening smoke command
- THEN Lorecraft sends one bounded synthetic opening request using the same effective configuration as the opening and turn workers
- AND it exits non-zero when the provider returns truncated or otherwise invalid narration while logging only bounded model, configuration, and response metadata.

##### Requirement R4: Resume And Lifecycle

The system SHALL list and reopen the owner's Adventures under their source World and keep destructive lifecycle actions Adventure-scoped.

###### Scenario R4-S1: List And Resume

- WHEN an owner returns to the source World or opens `/adventures/<id>`
- THEN the World lists each owned Adventure with player identity, completed turn count, last-played time, and lifecycle state
- AND a ready Adventure renders its opening story, Player context, and complete current-Scene NPC Cards from its frozen source and Adventure-owned state.

###### Scenario R4-S2: Reset

- WHEN the owner confirms reset while no opening job is active
- THEN generated story and Adventure-owned runtime state, including each NPC's Location, mood, status, and memory, are replaced with initial state from the same WorldVersion and Starting Point
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

###### Scenario R5-S5: Route Context After Navigation

- WHEN the account holder navigates to an Adventure creation or detail route, including through a redirect
- THEN the document title identifies the destination
- AND focus begins at the destination page heading when navigation replaces the initiating context
- AND background data refresh does not steal focus.

###### Scenario R5-S6: Opening Completion Announcement

- WHEN a visible pending Adventure becomes ready while the account holder remains on the page
- THEN Lorecraft politely announces that the opening is ready
- AND the generated narration becomes readable without moving the account holder's current focus.

###### Scenario R5-S7: Local Player Debug State

- WHEN a ready Adventure owner uses Player Settings in development or test
- THEN they may update the existing Adventure-owned name, frozen Location key, physical description, backstory, and Status fields
- AND a rejected autosave preserves its unchanged draft, describes any rejected field, and permits an explicit recoverable retry
- AND production, non-owner, resolving, or invalid frozen-Location requests are refused without changing World canon, Adventure revisions, turns, or another owner's state.

#### Implemented By

| Requirement / Scenario | Location / Anchor | Kind | Responsibility |
| --- | --- | --- | --- |
| S1/R1 | `apps/backend/app/services/adventure_creation_service.ts#async create` | primary | Creates the owner-scoped Adventure, player, and opening job atomically. |
| S1/R2 | `apps/backend/app/services/adventure_creation_service.ts#async create` | primary | Selects the current playable WorldVersion and persists its immutable identifier and default Starting Point on the new Adventure. |
| S1/R2 | `apps/backend/app/services/world_version_publication_service.ts#publishWorldVersionInTransaction` | support | Publishes the immutable, playable source snapshot consumed by Adventure creation. |
| S1/R3 | `apps/backend/app/services/adventure_opening_worker.ts#async runOnce` | primary | Claims opening work and publishes only a complete opening. |
| S1/R3-S3, S1/R3-S7 | `apps/backend/app/services/adventure_opening_policy.ts#retryDisposition` and `apps/backend/app/services/adventure_opening_policy.ts#retryDelayMs` | primary | Own the retryability classification and bounded backoff for opening-provider failures. |
| S1/R3-S2, S1/R5-S6 | `apps/frontend/src/adventures/AdventurePage.tsx#AdventurePage` | primary | Loads and polls the authoritative opening state, surfaces recovery, and announces readiness without moving the owner's focus. |
| S1/R4 | `apps/backend/app/services/adventure_query_service.ts#async listForWorld` and `apps/backend/app/services/adventure_query_service.ts#async findForOwner` | primary | Lists and resumes only the owner's Adventures from their frozen source context. |
| S1/R4 | `apps/backend/app/services/adventure_lifecycle_service.ts#async reset` and `apps/backend/app/services/adventure_lifecycle_service.ts#async delete` | primary | Resets from the frozen source and deletes only the selected owner Adventure. |
| S1/R5 | `apps/frontend/src/adventures/AdventureWorkbench.tsx#export function AdventureWorkbench` and `apps/frontend/src/adventures/AdventurePage.tsx#AdventurePage` | primary | Renders the responsive story-first Adventure experience, including the pinned frozen-World Story heading, an accessible arrow-only return to the Worlds index, compact right-aligned Send/Pass composer actions, and wide Adventure Settings workspace with a local Player Debug editor. |
| S1/R5-S2, S1/R5-S4 | `apps/frontend/src/adventures/AdventurePage.tsx#AdventurePage` | support | Supplies the Player-pane Settings action while the full-height Workbench preserves the desktop Player / Story / Scene shell and narrow tabs. |
| S1/R5-S2, S1/R5-S4 | `apps/frontend/src/adventures/AdventureWorkbench.module.css#.storyContent:focus-visible` and `apps/frontend/src/adventures/AdventureWorkbench.module.css#.storyRegion:focus-visible` | presentation | Keeps keyboard and programmatic focus visible on both Story focus targets with the accepted neutral boundary rather than the decorative orange action focus token. |
| S1/R5-S7 | `apps/backend/app/services/adventure_player_debug_state_service.ts#async update` and `apps/backend/app/controllers/adventures_controller.ts#updatePlayerDebugState` | primary | Enforces the development/test, owner, ready, and frozen-Location boundary before persisting only Adventure-owned Player state. |
| S1/R5-S7 | `apps/backend/start/routes.ts#patch(':id/player/debug-state'` | adapter | Registers the authenticated CSRF-protected Player Debug mutation route. |
| S1/R5-S7 | `apps/frontend/src/adventures/AdventureWorkbench.tsx#AdventurePlayerEditor` | primary | Preserves Player Debug drafts, field guidance, and recoverable retry behavior in Settings. |
| S1/R5-S7 | `apps/frontend/src/adventures/adventureApi.ts#UpdateAdventurePlayerStateInput` and `apps/frontend/src/adventures/tuyauAdventureApi.ts#async updatePlayerState` | adapter | Carries the bounded Player Debug command through the generated client and maps typed validation, conflict, authorization, and network outcomes for the editor. |
| S1/R5 | `apps/frontend/src/adventures/AdventurePage.module.css#settingsContent`, `apps/frontend/src/components/Dialog/Dialog.tsx#Dialog`, and `apps/frontend/src/components/Dialog/Dialog.module.css#popup[data-size='wide']` | presentation | Owns the responsive full-height Settings workspace and the reusable wide-dialog presentation used by the Adventure route. |
| S1/R5-S7 | `apps/backend/app/validators/adventure.ts#updateAdventurePlayerStateValidator` | support | Bounds the five Player Debug fields before the service boundary. |

#### Implementation Gaps

- None.

#### Verified By

| Requirement / Scenario | Evidence | Proves | Status |
| --- | --- | --- | --- |
| S1/R1-S1 | Automated test `apps/backend/tests/functional/adventure_creation_service.spec.ts#LC-003/S1/R1-S1 + R2-S1 + R4-S2: creates one pending Adventure aggregate` | Creates the owner Adventure, player, opening job, frozen source, and initial card state. | Passing 2026-07-24 against the acknowledged disposable test database |
| S1/R1-S1 | Automated test `apps/backend/tests/functional/adventure_creation_service.spec.ts#LC-003/S1/R1-S1: a failed creation rolls back` | A forced job failure leaves no Adventure, player, or job. | Passing 2026-07-24 against the acknowledged disposable test database |
| S1/R1-S2 | Automated test `apps/backend/tests/functional/adventure_creation_service.spec.ts#LC-003/S1/R1-S2: owner-scoped idempotency` | Replays one owner request and separates another owner's request. | Passing 2026-07-24 against the acknowledged disposable test database |
| S1/R1-S2 | Automated test `apps/backend/tests/functional/adventure_creation_service.spec.ts#LC-003/S1/R1-S2: invalid profile fields` | Fielded validation creates no Adventure, player, or job. | Passing 2026-07-24 against the acknowledged disposable test database |
| S1/R1-S3 | Automated test `apps/backend/tests/functional/adventure_creation_service.spec.ts#LC-003/S1/R1-S3: public and owner-private Worlds` | An inaccessible private World is indistinguishable from absent and creates nothing. | Passing 2026-07-24 against the acknowledged disposable test database |
| S1/R1-S4 | Automated test `apps/frontend/src/adventures/AdventureRoutes.test.tsx#LC-003/S1/R1-S2 + R1-S4 presents creation validation, provider disclosure, and preserves World navigation` | Shows the provider disclosure before submission. | Passing 2026-07-22 |
| S1/R1-S5 | Automated test `apps/frontend/src/adventures/creationRequestId.test.ts#LC-003/S1/R1-S5 creates a valid UUID v4` | The fallback request ID has UUID-v4 shape. | Passing 2026-07-22 |
| S1/R2-S1 | Automated test `apps/backend/tests/functional/adventure_creation_service.spec.ts#LC-003/S1/R1-S1 + R2-S1 + R4-S2: creates one pending Adventure aggregate` | Binds current playable source, Starting Point, player, and initial NPC card state. | Passing 2026-07-24 against the acknowledged disposable test database |
| S1/R2-S2 | Automated tests `apps/backend/tests/functional/world_version_publication.spec.ts#LC-003/S1/R2-S2: changed content creates the next ordinal`, `apps/backend/tests/database/frozen_world_source_migration.spec.ts#LC-002/S3/R5-S2 + LC-003/S1/R2-S1: concurrent publication reuses one immutable version`, and `apps/backend/tests/functional/adventure_query_service.spec.ts#LC-003/S1/R2-S2 + R4-S1` | Published snapshots remain immutable; current-schema concurrent publication reuses one version; resumed Adventures read their frozen projection. | Passing 2026-07-22 against a guarded disposable schema |
| S1/R2-S3 | Automated test `apps/backend/tests/functional/adventure_creation_service.spec.ts#LC-003/S1/R2-S3: missing current version` | An unavailable current source returns conflict and writes no Adventure. | Passing 2026-07-24 against the acknowledged disposable test database |
| S1/R3-S1, S1/R3-S2 | Automated test `apps/backend/tests/functional/adventure_opening_worker.spec.ts#LC-003/S1/R3-S1 + R3-S2: one worker publishes` | A single worker claims contextual opening work and atomically writes one root revision and story entry. | Passing 2026-07-24 against the acknowledged disposable test database |
| S1/R3-S2 | Automated tests `apps/backend/tests/functional/adventure_opening_worker.spec.ts#expired processing lease is reclaimed` and `apps/frontend/src/adventures/AdventureRoutes.test.tsx#LC-003/S1/R3-S2 + R5-S6 polls pending work until the ready opening is authoritative` | Reclaims an expired lease; UI polls the authoritative ready state without moving focus. | Passing 2026-07-24 against the acknowledged disposable test database |
| S1/R3-S3, S1/R3-S4 | Automated test `apps/backend/tests/functional/adventure_opening_worker.spec.ts#transient generation retries then terminal invalid prose fails` | Retries transient work, then fails terminally without publishing partial prose. | Passing 2026-07-24 against the acknowledged disposable test database |
| S1/R3-S3 | Automated test `apps/backend/tests/functional/adventure_lifecycle_service.spec.ts#owner can retry a terminal opening failure` | Retry keeps the frozen source and queues a new opening job. | Passing 2026-07-24 against the acknowledged disposable test database |
| S1/R3-S5 | Automated test `apps/backend/tests/functional/adventure_api.spec.ts#LC-003/S1/R3-S5: generation-queuing mutations share an account burst limit` | With the ten-request in-process cap, an over-quota account receives 429 before a further generation mutation; another account retains its own budget. | Passing 2026-07-22 against a guarded disposable schema |
| S1/R3-S6 | Automated test `apps/backend/tests/unit/story_generation/openai_compatible_story_generator.spec.ts#returns bounded metadata without retaining private request or provider prose` | Keeps stored evidence bounded and omits provider request/prose. | Passing 2026-07-20 |
| S1/R3-S7 | Automated tests `apps/backend/tests/unit/adventure_opening_policy.spec.ts#LC-003/S1/R3: retries only transient provider failures` and `apps/backend/tests/unit/adventure_opening_policy.spec.ts#LC-003/S1/R3: applies deterministic capped backoff and bounded provider guidance` | Retry eligibility and capped backoff are deterministic. | Passing 2026-07-20 |
| S1/R3-S8 | Automated test `apps/backend/tests/functional/adventure_opening_worker.spec.ts#LC-003/S1/R3: shutdown reschedules` | Shutdown returns work to pending without a model-call record. | Passing 2026-07-24 against the acknowledged disposable test database |
| S1/R3-S11 | Automated test `apps/backend/tests/unit/story_generation/opening_smoke.spec.ts#fails the acceptance check when the configured provider truncates the opening` | Rejects a truncated provider opening. | Passing 2026-07-20 |
| S1/R4-S1 | Automated tests `apps/backend/tests/functional/adventure_query_service.spec.ts#LC-003/S1/R4-S1: lists only the owner Adventures` and `apps/frontend/src/worlds/WorldRoutes.test.tsx#LC-003/S1/R4-S1 presents playable Adventure discovery` | Lists only the owner Adventures and exposes Resume/New Adventure from the World. | Passing 2026-07-24 against the acknowledged disposable test database |
| S1/R4-S2 | Automated tests `apps/backend/tests/functional/adventure_lifecycle_service.spec.ts#LC-003/S1/R4-S2 + S2/R4-S6: reset restores` and `apps/frontend/src/adventures/AdventureRoutes.test.tsx#confirms reset` | Restores frozen player/NPC state and removes turn lineage; UI confirms reset. | Passing 2026-07-24 against the acknowledged disposable test database |
| S1/R4-S3 | Automated tests `apps/backend/tests/functional/adventure_lifecycle_service.spec.ts#LC-003/S1/R1-S3 + R4-S3: delete removes` and `apps/frontend/src/worlds/WorldRoutes.test.tsx#deletes only the confirmed Adventure` | Deletes only the selected owner aggregate without changing its World or siblings. | Passing 2026-07-24 against the acknowledged disposable test database |
| S1/R5-S1 | Automated tests `apps/frontend/src/adventures/AdventureWorkbench.test.tsx#LC-003/S1/R5-S1 keeps Player and Scene context available while the opening is pending` and `apps/frontend/src/adventures/AdventureRoutes.test.tsx#preserves input and one idempotency key` | Pending context remains visible and retry preserves the draft/request key. | Passing 2026-07-20 |
| S1/R5-S2 | Automated test `apps/frontend/src/adventures/AdventureWorkbench.test.tsx#LC-003/S1/R5-S2 renders the ready opening as primary content with filtered context` | Ready Story, Player, and Scene rendering is story-first; the ready composer has Send/Pass actions without a repeated provider disclosure. | Passing 2026-07-22 |
| S1/R5-S4 | Automated test `apps/frontend/src/adventures/AdventureWorkbench.test.tsx#LC-003/S1/R5-S4 uses Story-first keyboard-operable tabs on mobile` | Mobile tab interaction remains keyboard-operable. | Passing 2026-07-22 |
| S1/R5-S2, S1/R5-S4 | Component stories `apps/frontend/src/adventures/AdventurePage.stories.tsx#ReadyDesktop` and `apps/frontend/src/adventures/AdventurePage.stories.tsx#ReadyMobile` | The ready fixture has no separate top header; its Player pane retains an accessible arrow-only return to `/worlds` and Settings, the frozen World name is the pinned Story heading, Story remains the widest desktop region, narrow tabs retain both actions without horizontal overflow, and programmatic outer-Story focus computes to the neutral boundary color. | Passing 2026-07-24 |
| S1/R5-S3 | Automated tests `apps/frontend/src/adventures/AdventureRoutes.test.tsx#LC-003/S1/R5-S3` reset-unavailable, duplicate-confirmation, and conflict cases | Reset and delete controls disclose recovery/conflict states safely. | Passing 2026-07-20 |
| S1/R5-S3 | Automated test `apps/frontend/src/adventures/AdventureRoutes.test.tsx#LC-003/S1/R4-S2 confirms reset, restores cancelled focus, and restarts the same Adventure` | The wide Adventure Settings workspace keeps Reset on its initial tab and provides keyboard-operable Player/NPC/Location section navigation. | Passing 2026-07-22 |
| S1/R5-S6 | Automated test `apps/frontend/src/adventures/AdventureRoutes.test.tsx#LC-003/S1/R3-S2 + R5-S6 polls pending work until the ready opening is authoritative` | Announces readiness while preserving current focus. | Passing 2026-07-22 |
| S1/R5-S7 | Automated tests `apps/frontend/src/adventures/AdventureWorkbench.test.tsx#LC-003/S1/R5-S7 identifies the rejected Player Debug field after an autosave validation failure`, `apps/frontend/src/adventures/AdventureWorkbench.test.tsx#LC-003/S1/R5-S7 retries an unchanged Player Debug draft after a recoverable autosave failure`, `apps/backend/tests/unit/adventure_validation.spec.ts#LC-003/S1/R5-S7`, and `apps/backend/tests/unit/adventure_npc_debug_state_service.spec.ts#LC-003/S1/R5-S7` | Fielded validation links errors to Player inputs; an unchanged recoverable draft can be retried; bounded fields and the production boundary are explicit. | Frontend passing 2026-07-23; backend unit evidence remains supporting proof. |
| S1/R5-S7 | Automated tests `apps/backend/tests/functional/adventure_player_debug_state.spec.ts#LC-003/S1/R5-S7: autosaves owner Player state without changing frozen canon, revisions, or turns`, `apps/backend/tests/functional/adventure_player_debug_state.spec.ts#LC-003/S1/R5-S7: rejects missing CSRF without changing Adventure Player state`, `apps/backend/tests/functional/adventure_player_debug_state.spec.ts#LC-003/S1/R5-S7: hides Player Debug editing from another Adventure owner`, `apps/backend/tests/functional/adventure_player_debug_state.spec.ts#LC-003/S1/R5-S7: rejects Player Debug editing before an Adventure is ready`, and `apps/backend/tests/functional/adventure_player_debug_state.spec.ts#LC-003/S1/R5-S7: rejects invalid frozen Locations and edits while a turn is active` | The owner receives the public Player projection after a valid save; missing CSRF, a non-owner, non-ready Adventure, invalid frozen Location, and active turn refuse without changing Player or Adventure lifecycle state, and the busy refusal leaves its active turn unchanged; the valid save preserves the exact frozen snapshot, revisions, and turn count. | Passing 2026-07-24 against the acknowledged disposable test database. |
| S1/R5-S7 | Rendered Storybook `Application/Adventures/Workbench/Ready Desktop` Player Settings | Settings exposes the five Adventure Player fields with no browser console error. | Passing 2026-07-23 |

#### Verification Gaps

- `S1/R3-S9`, `S1/R3-S10`: Production worker/restart acceptance is historical only and was not reproducibly rerun; explicit operational verification is required before claiming current proof.
- `S1/R5-S5`: No current Adventure-route title/focus test directly proves this navigation behavior.
- All S1: Owner manual desktop/mobile acceptance remains pending.

#### Story Notes

- The opening root revision has zero completed player turns.
- Player name is the initial Adventure identity; a separate Adventure title is deferred.
- Reset preserves the creation profile and original frozen source while clearing generated runtime state.
- A later World-authoring UI may add a routed E2E for `S1/R2-S2`; World publication is currently verified at database, service, and API boundaries.

### Story S2: Resolve A Structured Game Master Turn

Implementation: implemented
Verification: partial
Created: 2026-07-19
Modified: 2026-07-24
Last verified: 2026-07-24

As a player, I want Act, Pass, or Guide to resolve a durable Game Master turn, so that my private Adventure can progress through narration and bounded persistent consequences.

#### Requirements And Scenarios

##### Requirement R1: Explicit Resolving Actions

The system SHALL let the owner of a ready Adventure submit exactly one valid Act, Pass, or Guide action as an idempotent turn request.

###### Scenario R1-S1: Act With Player Intent

- WHEN the owner submits a non-empty Act within the accepted length
- THEN Lorecraft creates one pending turn containing that current intent
- AND returns the authoritative pending turn and Adventure route without waiting for model completion.

###### Scenario R1-S2: Pass Without Player Intent

- WHEN the owner selects Pass
- THEN Lorecraft creates one pending turn without requiring invented player intent
- AND the Game Master may advance the scene while preserving player agency.

###### Scenario R1-S3: Private One-Turn Guide

- WHEN the owner submits a non-empty Guide within the accepted length
- THEN Lorecraft creates one pending turn using that text as private direction for this resolution
- AND Guide text appears only in the authenticated owner's italicized transcript message and never enters later normal story context.

###### Scenario R1-S4: Invalid Action Input

- WHEN an Act or Guide is blank or too long, a Pass carries text, or the action type is unsupported
- THEN the request is rejected with field-specific validation feedback
- AND no turn, job, narration, or mutation is created.

###### Scenario R1-S5: Repeated Submission Identity

- WHEN the same owner retries a submission with the same portable request identifier
- THEN Lorecraft returns the same turn rather than creating duplicate work
- AND a conflicting reuse is rejected without exposing private data.

###### Scenario R1-S6: Inaccessible Adventure

- WHEN an unauthenticated account or non-owner targets an Adventure
- THEN authentication or the existing non-disclosing not-found response applies
- AND no turn state is revealed or changed.

##### Requirement R2: Durable Serialized Resolution

The system SHALL process resolving turns asynchronously with one authoritative active turn per Adventure and publish no partial outcome.

###### Scenario R2-S1: Pending Turn

- WHEN a valid turn is accepted
- THEN the existing story and context remain readable while the composer becomes unavailable
- AND the Adventure detail reports one pending or processing turn suitable for bounded polling.

###### Scenario R2-S2: Reload Or Worker Restart

- WHEN the browser reloads or a worker stops while the turn is pending or processing
- THEN persisted lifecycle state allows the player or a replacement worker to resume safely
- AND successful finalization still occurs at most once.

###### Scenario R2-S3: Concurrent Submission

- WHEN another tab or client submits while one resolving turn is active
- THEN the backend returns a conflict describing that the Adventure is busy
- AND it does not create parallel narration, extraction, or revisions.

###### Scenario R2-S4: Atomic Completion

- WHEN narration, extraction, and validation succeed
- THEN one transaction appends the completed turn revision and narration, records accepted/rejected structured proposals, applies accepted state, advances the head, and increments the turn count
- AND readers never observe narration paired with old or partially applied state.

###### Scenario R2-S5: Failed Uncommitted Turn

- WHEN generation or extraction remains unsuccessful after its bounded retry policy
- THEN the turn becomes failed without publishing staged narration, advancing the head, incrementing the count, or applying state
- AND the owner may retry the same input or discard it and return to a ready composer.

###### Scenario R2-S6: Stale Or Expired Worker

- WHEN a lease expires, reset/delete changes the Adventure, or an earlier worker later attempts to finalize
- THEN the active claim may be safely recovered according to policy
- AND stale work cannot publish over the current Adventure generation or head.

##### Requirement R3: Grounded Generation And Extraction

The system SHALL build each turn from current authoritative context and keep story generation separate from structured state extraction.

###### Scenario R3-S1: Current Turn Context

- WHEN a turn is processed
- THEN narration receives platform instructions, frozen World guidance and relevant canon, the current Act/Pass/Guide trigger, current Adventure state, and a bounded ordered window of story-visible history
- AND the Game Master does not decide unsubmitted player actions, speech, thoughts, feelings, or goals.

###### Scenario R3-S2: Context Exclusions

- WHEN later turns are processed
- THEN prior raw Act inputs, prior Guide text, Pass markers, model evidence, rejected mutations, and operational records are excluded from the Game Master's normal story context
- AND accepted prior narration plus current structured state carry durable context forward.
- AND the owner-visible Adventure transcript may separately project completed Act and Guide text plus Pass markers from durable turns, without feeding those events back into generation.

###### Scenario R3-S3: Separate Model Contracts

- WHEN narration generation succeeds
- THEN a separately validated extraction operation reads the staged narration and current structured state
- AND extraction can fail or retry without converting provider output directly into database writes.

###### Scenario R3-S4: Metadata-Only Evidence

- WHEN either model operation succeeds or fails
- THEN Lorecraft records bounded provider/model/settings/timing/status/token/hash/count and normalized failure metadata as available
- AND it does not persist or log assembled prompts, request messages, raw provider responses, credentials, or authorization material.

###### Scenario R3-S6: Development Debug Trace

- WHEN a local development opening, narration, or extraction operation runs without an explicit Debug override
- THEN Lorecraft writes correlated JSONL diagnostics beneath the protected, ignored backend temporary directory with normal metadata, prompt summaries, accepted/ignored extraction outcomes, and timings
- AND sanitized raw provider requests and responses are captured by default, each capture mode can be explicitly disabled, sensitive fields are redacted, files are owner-only, traces older than seven days are purged, and no Debug content is copied to model-call rows, standard logs, browser APIs, or production environments.

###### Scenario R3-S5: Complete Current-Scene NPC Context

- WHEN narration or extraction context is assembled
- THEN it contains the complete frozen-and-current card for every NPC whose Adventure-owned Location matches the current Scene
- AND it contains no off-scene NPC card, no raw prompt persistence, and only bounded count/character-size metadata.
- AND player-visible opening or turn narration that directly reflects a current-Scene card's private knowledge is rejected before publication; normalized private values shorter than three characters and semantic paraphrase remain live-provider evaluation limitations rather than implied deterministic guarantees.

##### Requirement R4: Bounded Adventure Consequences

The system SHALL apply only allowlisted, validated Adventure-owned mutations and preserve their immutable revision provenance.

###### Scenario R4-S1: Player Movement

- WHEN extraction proposes moving the player to an existing frozen Location
- THEN Lorecraft may update the Adventure player's current Location
- AND the resulting Player and Scene projection uses that accepted state.

###### Scenario R4-S2: NPC Movement And Mutable State

- WHEN extraction proposes an existing frozen Character's Location, mood, current status, or summarized memory change within field bounds
- THEN Lorecraft may update only that Adventure-owned Character state, seeded at Adventure creation and reset from the frozen initial card values
- AND stable identity, description, background, personality, voice, and private knowledge remain frozen source material.

###### Scenario R4-S3: Unsupported Or Invalid Proposal

- WHEN extraction proposes an unknown actor/location, out-of-bounds content, a forbidden field, a new entity, source-canon mutation, or another Adventure's state
- THEN Lorecraft rejects that proposal with a bounded structured reason
- AND may still commit coherent narration and other valid proposals without applying the rejected change.

###### Scenario R4-S4: Revision-Linked Mutation Provenance

- WHEN a turn completes
- THEN each accepted mutation is recorded against the resulting immutable revision with its prior and resulting bounded value or equivalent deterministic operation
- AND current materialized state can be reconciled to the active revision lineage without requiring full state snapshots in this Change.

###### Scenario R4-S5: Source And Adventure Isolation

- WHEN a turn commits one or more mutations
- THEN the source WorldVersion, canonical World rows, and every other Adventure remain unchanged.

###### Scenario R4-S6: Reset After Interactive Play

- WHEN the owner resets an Adventure after completed turns
- THEN the existing reset contract restores opening story, player start state, and all Adventure-owned NPC state from the same frozen WorldVersion
- AND prior completed turns are no longer part of the active generation.

##### Requirement R5: Coherent Turn Experience

The system SHALL integrate resolving actions and lifecycle feedback into the accepted responsive Adventure workbench.

###### Scenario R5-S1: Ready Composer

- WHEN an Adventure is ready with no active turn
- THEN the Story region presents explicit Act and Guide input modes plus a deliberate Pass action
- AND it does not render Story, `/look`, `/help`, model settings, or debug controls.

###### Scenario R5-S2: Pending And Processing Feedback

- WHEN a turn is pending or processing
- THEN the composer is replaced or disabled with one restrained Game Master progress state
- AND repeated polling does not repeatedly announce or steal focus.

###### Scenario R5-S3: Completion

- WHEN the turn completes
- THEN the new narration appears in chronological Story order, Player/Scene context refreshes, and the ready composer returns
- AND assistive technology receives one completion announcement.

###### Scenario R5-S4: Failure Recovery

- WHEN a turn fails without committing
- THEN the prior story and context remain intact with clear Retry and Discard actions
- AND cancellation or completion restores focus to a meaningful Story status or composer target.

###### Scenario R5-S5: Responsive And Keyboard Behavior

- WHEN the Adventure is used at desktop, tablet, or mobile widths with keyboard, touch, reduced motion, or zoom
- THEN the existing Player / Story / Scene composition remains usable without horizontal overflow
- AND action modes, submission, immediate Pass behavior, pending state, and recovery controls have unambiguous labels, visible focus, and appropriate touch targets.

###### Scenario R5-S6: Owner Chat Transcript

- WHEN an owner views a ready Adventure with completed or active turns
- THEN Game Master narration renders as chronological left-aligned messages and completed/active Act, Pass, or Guide events render as chronological right-aligned Player messages
- AND Guide messages are italicized, the transcript follows active revision lineage then per-revision entry sequence even when timestamps tie, survives reload from durable turn and revision data, and exposes Guide text only in the authenticated owner's Adventure detail response.

#### Implemented By

| Requirement / Scenario | Location / Anchor | Kind | Responsibility |
| --- | --- | --- | --- |
| S2/R1 | `apps/backend/app/services/adventure_turn_submission_service.ts#async submit` | primary | Validates owner-scoped idempotent Act, Pass, and Guide submission. |
| S2/R1-S3, S2/R3-S5 | `apps/backend/app/services/story_generation/turn_prompt.ts#assertNarrationSafeForPublication` | primary | Rejects direct meaningful current-Guide or private-card reflection before extraction or publication without rejecting punctuation-only/common-token Guidance. |
| S2/R2 | `apps/backend/app/services/adventure_turn_worker.ts#async runOnce` | primary | Claims serialized turn work and prevents stale or partial publication. |
| S2/R2-S5, S2/R2-S6 | `apps/backend/app/services/adventure_turn_lifecycle_service.ts#async retry` and `apps/backend/app/services/adventure_turn_lifecycle_service.ts#async discard` | primary | Own retry/discard recovery for uncommitted or exhausted turn work without publishing a partial result. |
| S2/R3 | `apps/backend/app/services/adventure_turn_production_completion_port.ts#AdventureTurnProductionCompletionPort` | primary | Stages grounded generation and extraction before publication. |
| S2/R3-S1, S2/R3-S2, S2/R3-S5 | `apps/backend/app/services/story_generation/adventure_turn_context.ts#assembleAdventureTurnContext` | primary | Builds grounded current-turn context while excluding private and prohibited historical values. |
| S2/R3-S2, S2/R5-S6 | `apps/backend/app/services/adventure_query_service.ts#async findForOwner` | primary | Derives the owner-visible Act/Pass/Guide transcript from durable turn/revision lineage, ordering entries by active-lineage position then entry sequence while retaining the owner-scoped detail boundary. |
| S2/R3-S2, S2/R5-S6 | `apps/frontend/src/adventures/adventureApi.ts#AdventureDetail` and `apps/frontend/src/adventures/tuyauAdventureApi.ts#isAdventureDetail` | adapter | Preserves the closed transcript kind/content contract across generated transport validation before presentation. |
| S2/R3-S3 | `apps/backend/app/services/story_generation/runtime_configuration.ts#resolveStoryGenerationRuntimeConfiguration` | primary | Resolves the provider-neutral runtime configuration and bounded generation settings used for a turn. |
| S2/R3-S6 | `apps/backend/app/services/story_generation/development_debug_trace.ts#createDevelopmentDebugTrace` | primary | Creates the local-only, explicitly disableable development trace and refuses production capture. |
| S2/R4 | `apps/backend/app/services/adventure_mutation_policy.ts#resolveAdventureMutations` | primary | Applies only allowlisted Adventure-owned changes with provenance. |
| S2/R5 | `apps/frontend/src/adventures/AdventureWorkbench.tsx#export function AdventureWorkbench` | primary | Presents resolving actions, recovery, polling, responsive composition, and concise right-aligned Send/Pass controls. |
| S2/R5-S6 | `apps/frontend/src/adventures/AdventureWorkbench.tsx#function StoryRegion` | primary | Renders labelled Game Master and Player message entries, including active Act/Pass/Guide recovery bubbles and italicized Guide messages. |
| S2/R5-S2, S2/R5-S3, S2/R5-S4 | `apps/frontend/src/adventures/AdventurePage.tsx#AdventurePage` | primary | Owns routed Adventure reload, active-turn polling, unauthorized recovery, and the authoritative post-resolution refresh. |

#### Implementation Gaps

- None.
- Successful-turn Retry, rollback, branching, Story utilities, streaming, model controls, and multiplayer remain deferred rather than gaps in S2.

#### Verified By

| Requirement / Scenario | Evidence | Proves | Status |
| --- | --- | --- | --- |
| S2/R1-S1, S2/R1-S2, S2/R1-S3, S2/R1-S5 | Automated test `apps/backend/tests/functional/adventure_turn_api.spec.ts#LC-003/S2/R1-S1..R1-S5: authenticated owners submit and replay` | Act, Pass, and Guide return pending; replay is identical; Guide is stored privately. | Passing 2026-07-24 against the acknowledged disposable test database |
| S2/R1-S4, S2/R1-S6 | Automated test `apps/backend/tests/functional/adventure_turn_api.spec.ts#LC-003/S2/R1-S4 + R1-S6: validation, CSRF, and owner boundaries` | Fielded validation/no writes, CSRF 403, non-disclosing owner boundary, and anonymous 401. | Passing 2026-07-24 against the acknowledged disposable test database |
| S2/R1-S4, S2/R1-S5 | Automated test `apps/backend/tests/functional/adventure_turn_submission_service.spec.ts#LC-003/S2/R1-S4 + R1-S5: rejects invalid or conflicting` | Invalid input makes no write; a conflicting request ID is rejected. | Passing 2026-07-24 against the acknowledged disposable test database |
| S2/R2-S1, S2/R2-S2, S2/R2-S4 | Automated test `apps/backend/tests/functional/adventure_turn_worker.spec.ts#LC-003/S2/R2-S1 + R2-S2 + R2-S4: claims` | A persisted turn is claimed and published exactly once with revision/head/count updates. | Passing 2026-07-24 against the acknowledged disposable test database |
| S2/R2-S2, S2/R2-S5 | Automated test `apps/backend/tests/functional/adventure_turn_worker.spec.ts#expired claim is reclaimed` | An expired turn is reclaimable; discard removes only uncommitted work. | Passing 2026-07-24 against the acknowledged disposable test database |
| S2/R1-S5, S2/R1-S6, S2/R2-S3 | Automated test `apps/backend/tests/functional/adventure_turn_submission_service.spec.ts#only the owner can create one active turn` | A busy owner receives `ADVENTURE_BUSY`; non-owners receive non-disclosing not-found. | Passing 2026-07-24 against the acknowledged disposable test database |
| S2/R2-S6 | Automated tests `apps/backend/tests/functional/adventure_turn_worker.spec.ts#LC-003/S2/R2-S6: an expired final attempt becomes recoverably failed without publication` and `apps/backend/tests/functional/adventure_turn_worker.spec.ts#LC-003/S2/R2-S4 + R2-S5 + R2-S6: a stale head terminally fails its exact claim, and a throwing staged commit cannot publish a partial result` | Expired final leases and stale/throwing commits fail without partial publication; stale source claims are terminal and discardable rather than retryable. | Passing 2026-07-22 against a guarded disposable schema |
| S2/R1-S3, S2/R3-S4 | Automated tests `apps/backend/tests/functional/adventure_turn_worker.spec.ts#LC-003/S2/R1-S3 + R3-S4: rejects even short reflected Guide text before narration publication` and `apps/backend/tests/functional/adventure_turn_worker.spec.ts#LC-003/S2/R1-S3 + R3-S4: publishes ordinary narration containing a concise Guide as a larger word`, plus unit tests `apps/backend/tests/unit/story_generation/adventure_turn_context.spec.ts#LC-003/S2/R1-S3: rejects even concise current Guide text before publication`, `apps/backend/tests/unit/story_generation/adventure_turn_context.spec.ts#LC-003/S2/R1-S3: does not treat a concise Guide as a substring within ordinary narration`, and `apps/backend/tests/unit/story_generation/adventure_turn_context.spec.ts#LC-003/S2/R1-S3: permits ordinary narration for punctuation-only and common-token Guides` | Direct meaningful current-Guide reflection is rejected before extraction or publication, while punctuation-only, common-token, and larger-word cases preserve ordinary narration. | Passing 2026-07-22 against a guarded disposable schema |
| S2/R3-S1, S2/R3-S3, S2/R3-S4, S2/R4-S1, S2/R4-S4 | Automated test `apps/backend/tests/functional/adventure_turn_worker.spec.ts#LC-003/S2/R3-S1 + R3-S3 + R4-S1 + R4-S4` | Generator/extractor receive staged context; metadata-only records and accepted movement/revision mutation persist. | Passing 2026-07-24 against the acknowledged disposable test database |
| S2/R3-S2 | Automated test `apps/backend/tests/unit/story_generation/adventure_turn_context.spec.ts#LC-003/S2/R3-S2 excludes prior raw actions, Guide text, Pass markers, and operational records from turn context` | Prompt context includes accepted narration/current state but omits prohibited historical values. | Passing 2026-07-22 |
| S2/R3-S5 | Automated test `apps/backend/tests/unit/story_generation/adventure_turn_context.spec.ts#LC-003/S2/R3-S5: rejects direct reflection` | Direct card-private-knowledge reflection is rejected before publication. | Passing 2026-07-20 |
| S2/R3-S6 | Automated test `apps/backend/tests/unit/story_generation/development_debug_trace.spec.ts#LC-003/S2/R3-S6: defaults local capture on, permits explicit disablement, and refuses production capture` | Covers local defaults, opt-out, and production refusal. | Passing 2026-07-20 |
| S2/R4-S1, S2/R4-S2 | Automated test `apps/backend/tests/unit/adventure_mutation_policy.spec.ts#LC-003/S2/R4-S1 + R4-S2` | Only allowlisted player/NPC changes are accepted and source input remains unchanged. | Passing 2026-07-20 |
| S2/R4-S3 | Automated test `apps/backend/tests/unit/adventure_mutation_policy.spec.ts#LC-003/S2/R4-S3` | Unknown, forbidden, or out-of-bounds proposals preserve state and produce bounded rejection. | Passing 2026-07-20 |
| S2/R4-S4 | Automated test `apps/backend/tests/unit/adventure_mutation_policy.spec.ts#LC-003/S2/R4-S4` | Ordered proposal application keeps deterministic prior/result values. | Passing 2026-07-20 |
| S2/R5-S1 | Automated tests `apps/frontend/src/adventures/AdventureWorkbench.test.tsx#LC-003/S2/R5-S1 submits Act and provides a Guide composer mode`, `apps/frontend/src/adventures/AdventureWorkbench.test.tsx#LC-003/S2/R5-S1 submits a typed turn with Enter and keeps Shift+Enter for a line break`, and `apps/frontend/src/adventures/AdventureWorkbench.test.tsx#LC-003/S2/R5-S1 submits Pass immediately as an empty turn` | Act, Guide, Send, and immediate Pass interaction semantics. | Passing 2026-07-22 |
| S2/R5-S2, S2/R5-S3 | Automated test `apps/frontend/src/adventures/AdventureRoutes.test.tsx#LC-003/S2/R5-S2 + R5-S3 polls one active turn` | Polls to completed narration, announces once, and preserves focus. | Passing 2026-07-20 |
| S2/R5-S2, S2/R5-S4 | Automated test `apps/frontend/src/adventures/AdventureWorkbench.test.tsx#LC-003/S2/R5-S2 + R5-S4 preserves story during progress and offers failed-turn recovery` | Pending state retains Story/replaces the composer; failure supports Retry/Discard. | Passing 2026-07-22 |
| S2/R5-S4 | Automated test `apps/frontend/src/adventures/AdventureRoutes.test.tsx#LC-003/S2/R5-S4 renders a concurrent-turn conflict` | UI reports an actionable conflict rather than a transport code. | Passing 2026-07-20 |
| S2/R5-S6 | Automated tests `apps/frontend/src/adventures/AdventureWorkbench.test.tsx#LC-003/S2/R5-S6 renders Guide input as an italicized player message beside the left/right transcript`, `apps/frontend/src/adventures/AdventureRoutes.test.tsx#LC-003/S2/R5-S6 projects a submitted Guide as an italicized active player message`, and `apps/frontend/src/adventures/tuyauAdventureApi.test.ts#reads the owner-safe Adventure projection including Guide transcript input` | Renders durable and active Guide input as an italicized Player-labelled entry, accepts the owner detail's `guide` contract, and preserves right-aligned Act/Pass plus left-aligned narration. | Passing 2026-07-22 |
| S2/R5-S6 | Automated test `apps/backend/tests/functional/adventure_query_service.spec.ts#LC-003/S2/R3-S2 + R5-S6: orders tied-timestamp owner chat history by head revision lineage` | An adversarial fixture inserts equal-timestamp, equal-sequence entries in reverse lineage and still returns owner Act/Pass/Guide events and narration in head-lineage then entry-sequence order. | Passing 2026-07-24 against the acknowledged disposable test database. |
| S2/R5-S6 | Component story `apps/frontend/src/adventures/AdventurePage.stories.tsx#ReadyDesktop` | The ready desktop fixture directly proves left/right author labels and an italicized owner Guide entry; direct browser inspection found meaningful content with no Vite overlay or console errors. | Passing 2026-07-22 |
| S2/R1-S3, S2/R5-S6 | Automated E2E `apps/frontend/e2e/adventure-foundation.spec.ts#LC-003 creates, opens, resumes, resets, and deletes an isolated Adventure` | The authenticated owner submits Guide input, receives the provider-controlled narration, and sees the durable Guide event as an italicized Player message on desktop and mobile. | Passing 2026-07-24 against an acknowledged guarded isolated schema |

#### Verification Gaps

- `S2/R3-S5`: Direct literal reflection is covered. Short private values are intentionally prompt-only because a deterministic substring guard would reject ordinary prose; semantic paraphrase remains a live-provider evaluation limitation.
- `S2/R3-S6`: Development trace inspection passes, but the compatible provider omitted usage counters; API-model cost remains an estimate rather than measured usage.
- `S2/R4-S5`, `S2/R4-S6`: Source/Adventure isolation and post-turn reset lack current scenario-specific repeatable evidence in the narrowed table.
- `S2/R5-S5`: No direct responsive/touch/reduced-motion/zoom proof is retained in the cited automated anchors; rendered/manual confirmation remains pending.
- All S2: Owner manual desktop/mobile confirmation remains pending; no raw prompt, Guide, or provider body will be retained as normal operational evidence.

#### Story Notes

- Failed, uncommitted turns may be retried with the same input or discarded; successful-turn Retry, rollback, and branching remain deferred.
- Raw Guide and prior action input remain authoritative turn data; normal story context contains accepted narration and current structured state only. The authenticated owner's transcript separately shows completed/active Act and Guide text plus Pass markers, with Guide messages italicized.

### Story S3: Inspect NPC Details

Implementation: implemented
Verification: partial
Created: 2026-07-19
Modified: 2026-07-24
Last verified: 2026-07-24

As an Adventure player, I want to inspect only visible details for NPCs in my current Scene, while keeping complete Debug editing in Settings, so that the Scene pane reflects what the player can see.

#### Requirements And Scenarios

##### Requirement R1: Player-Visible Current-Scene NPC Details

The system SHALL list every NPC in the current Scene and expose only that NPC's player-visible read-only details in the Scene pane.

###### Scenario R1-S1: Open A Present NPC Card

- WHEN one or more NPCs are present and the owner selects one
- THEN the Scene region shows the NPC's name, physical description, and current Status (what the NPC is doing)
- AND it does not render the key, current Location, background, personality, voice, private knowledge, mood, memory, Debug labels, or edit controls.

###### Scenario R1-S2: Empty Scene

- WHEN no NPC shares the player's current Location
- THEN the Scene retains Location context and communicates that no one else is present
- AND no off-scene card is exposed through the list.

###### Scenario R1-S3: State Or Location Changes

- WHEN a completed turn or reset changes NPC state or presence
- THEN the list and any selected card refresh from authoritative Adventure state
- AND an NPC that leaves the Scene is no longer selectable there.

##### Requirement R2: Coherent NPC Card Interaction

The system SHALL adapt the spike's list-to-card drill-down to the accepted Player/Story/Scene workbench without copying its prototype architecture or styling.

###### Scenario R2-S1: Desktop And Mobile Drill-Down

- WHEN the owner opens and closes an NPC card at supported desktop or mobile widths
- THEN Scene context, selection, back navigation, scroll position, labels, and focus remain understandable and keyboard/touch operable
- AND the Story remains the dominant reading surface.

###### Scenario R2-S2: Long Sparse Cards And Refresh Recovery

- WHEN required fields contain concise or long-but-valid values, data refreshes, or the request fails recoverably
- THEN the card remains readable without horizontal overflow or clipped content
- AND loading/error/retry behavior does not reveal another Adventure's data.

##### Requirement R3: Settings Debug NPC State Editing

The system SHALL allow local Debug mode in Adventure Settings to autosave every bounded, displayable Adventure-owned NPC card field except its stable key: name, Location, physical description, background, personality, voice, private knowledge, mood, status, and memory.

###### Scenario R3-S1: Autosave Adventure-Owned State

- WHEN the owner changes a valid editable NPC card field while the Adventure is ready and no turn is pending or processing
- THEN Lorecraft saves the full bounded card overrides and mutable state to that Adventure's `adventure_character_states` row, uses those local values in the next turn's current-Scene context, and refreshes the authoritative Scene projection
- AND the frozen WorldVersion, World Character canon, starter seed, story history, and turn count remain unchanged.

###### Scenario R3-S2: Debug, Ownership, And Concurrency Boundary

- WHEN production, a non-owner, an unknown NPC, an invalid frozen Location or field value, or an Adventure with a pending or processing turn targets the Debug edit route
- THEN Lorecraft refuses the mutation without disclosing another Adventure or changing any persisted state.

###### Scenario R3-S3: Settings-Only Debug Editing

- WHEN the owner needs complete frozen and mutable NPC fields or to edit them in local Debug mode
- THEN those controls are available from the Adventure Settings NPC section, not the Scene pane
- AND an authoritative Scene refresh removes an NPC that leaves the current Scene from the player-visible selection.

#### Implemented By

| Requirement / Scenario | Location / Anchor                                                                                                                                                                                          | Kind         | Responsibility                                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| S3/R1                  | `apps/backend/app/services/adventure_query_service.ts#findForOwner`                                                                                                                                        | primary      | Projects only NPCs whose current Adventure-owned Location matches the player's Scene, with frozen identity and mutable state. |
| S3/R3                  | `apps/backend/app/services/adventure_npc_debug_state_service.ts#async update` and `apps/backend/app/controllers/adventures_controller.ts#updateNpcDebugState` | primary      | Refuses production, non-owner, invalid, and active-turn edits; persists only bounded Adventure NPC state.                     |
| S3/R3                  | `apps/backend/app/services/character_field_limits.ts#characterFieldLimits`, `apps/backend/app/validators/adventure.ts#updateAdventureNpcStateValidator`, and `apps/backend/app/services/adventure_mutation_policy.ts#adventureMutationFieldLimits` | support | Governs shared 100/120/320/500 limits and rejects blank or oversize Debug/extracted mutable state before persistence. |
| S3/R1, S3/R1-S3, S3/R2 | `apps/frontend/src/adventures/AdventureWorkbench.tsx#function SceneRegion` | primary | Renders the current Scene list and player-visible read-only name, physical description, and Status, clearing stale selection after an authoritative refresh. |
| S3/R1-S3, S3/R3-S1, S3/R3-S2 | `apps/frontend/src/adventures/AdventurePage.tsx#AdventurePage` | primary | Reloads authoritative Scene state after a completed turn or Debug autosave, handles page-level recovery, and ends the shared session on unauthorized Adventure access. |
| S3/R3                  | `apps/frontend/src/adventures/AdventureWorkbench.tsx#AdventureNpcEditor` and `apps/frontend/src/adventures/AdventurePage.tsx#AdventurePage` | presentation | Exposes local-development-only debounced autosave controls in Adventure Settings and refreshes Adventure detail. |
| S3/R3                  | `apps/frontend/src/adventures/adventureApi.ts#UpdateAdventureNpcStateInput` and `apps/frontend/src/adventures/tuyauAdventureApi.ts#async updateNpcState` | adapter | Carries complete bounded NPC Debug state through the generated client and preserves fielded validation and recovery results. |
| S3/R2                  | `apps/frontend/src/adventures/AdventureWorkbench.module.css#sceneNpcs` and `apps/frontend/src/adventures/AdventurePage.stories.tsx#ReadyMobile`                                                            | presentation | Defines desktop/mobile Scene composition, empty state, and Storybook fixtures.                                                |
| S3/R3-S3               | `apps/frontend/src/adventures/AdventurePage.tsx#AdventurePage`, `apps/frontend/src/adventures/AdventurePage.module.css#settingsNpcGrid`, `apps/frontend/src/components/Dialog/Dialog.tsx#Dialog`, and `apps/frontend/src/components/Dialog/Dialog.module.css#popup[data-size='wide']` | presentation | Presents current-Scene NPCs as responsive Settings avatar cards and opens the complete editor in the full-height wide workspace without broadening the query or save boundary. |

#### Implementation Gaps

- None.

#### Verified By

| Requirement / Scenario                 | Evidence                                                                                                                               | Proves                                                                                                                                                                                  | Status                                            |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| S3/R1-S1, S3/R2-S1 | `apps/frontend/src/adventures/AdventureWorkbench.test.tsx#LC-003/S3/R1-S1 opens player-visible NPC details and restores list focus on Back` | A present NPC opens a labelled read-only detail view containing only name, physical description, and Status; Back restores focus to its Scene-list entry. | Passing 2026-07-22 |
| S3/R3-S3, S3/R3-S1 | Automated test `apps/frontend/src/adventures/AdventureRoutes.test.tsx#LC-003/S3/R1-S1 + R2-S1 opens every current-Scene NPC card in Settings` | The Settings NPC section lists the authoritative current-Scene projection, opens one complete field editor, and returns to its card without creating a broader NPC query or save path. | Passing 2026-07-22 |
| S3/R1-S2, S3/R1-S3 | `apps/frontend/src/adventures/AdventureWorkbench.test.tsx#LC-003/S3/R1-S3 clears a selected NPC when authoritative Scene state removes it` | An authoritative Scene refresh with no present NPCs shows the empty-state message and removes the stale selected card. | Passing 2026-07-20 |
| S3/R2-S1 | Storybook `Application/Adventures/Workbench/ReadyDesktop`, `ReadyMobile`, and `DebugNpcEditor` | Directly inspected desktop NPC list and selected complete editor plus mobile Story-first Scene-to-card selection; all bounded editable fields render without horizontal overflow. | Passing 2026-07-20 |
| S3/R3-S1 | `apps/frontend/src/adventures/AdventureWorkbench.test.tsx#LC-003/S3/R3-S1 autosaves every editable Adventure-owned NPC card field` and `apps/backend/tests/functional/adventure_npc_debug_state.spec.ts#LC-003/S3/R3-S1: autosaves bounded NPC card overrides without changing frozen canon or seed Character` | Every editable card field is sent as a bounded Adventure-owned override; the persisted update leaves frozen canon, seed Character, story revision, and turn count unchanged. | Passing 2026-07-20 against a guarded direct disposable schema |
| S3/R3-S2 | `apps/backend/tests/unit/adventure_validation.spec.ts#LC-003/S3/R3-S2: accepts only complete bounded Debug NPC state` and `apps/backend/tests/database/character_state_bounds_migration.spec.ts#LC-003/S1/R4-S2 + S3/R3-S2: preserves authored values, backfills legacy blanks, and enforces complete bounded state` | Invalid or legacy Debug state is subject to whitespace-aware nonblank bounds, while reconciliation preserves nonblank authored values. | Passing 2026-07-20 against a guarded isolated schema |
| S3/R3-S2 | `apps/backend/tests/unit/adventure_npc_debug_state_service.spec.ts#LC-003/S3/R3-S2: production refuses the NPC Debug editor boundary`, `apps/backend/tests/functional/adventure_npc_debug_state.spec.ts#LC-003/S3/R3-S2: hides Debug editing from a different Adventure owner`, and `apps/backend/tests/functional/adventure_npc_debug_state.spec.ts#LC-003/S3/R3-S2: rejects invalid frozen Locations and edits while a turn is active` | Production disables the editor boundary; another owner receives non-disclosing not-found, and invalid frozen Locations or active turns are refused. | Passing 2026-07-24 against the acknowledged disposable test database |
| S3/R3-S2 | `apps/frontend/src/adventures/AdventureWorkbench.test.tsx#LC-003/S3/R3-S2 identifies the rejected Debug NPC field after an autosave validation failure` and `apps/frontend/src/adventures/AdventureWorkbench.test.tsx#LC-003/S3/R3-S2 retries an unchanged NPC draft after a recoverable autosave failure` | Validation marks the rejected field with actionable guidance; a recoverable failure preserves the unchanged draft for an explicit retry. | Passing 2026-07-20 |
| S3/R1-S1, S3/R1-S3, S3/R3-S3 | Automated E2E `apps/frontend/e2e/adventure-foundation.spec.ts#LC-003 creates, opens, resumes, resets, and deletes an isolated Adventure` | A fixture-controlled completed Act refreshes the selected current-Scene NPC's public Status without exposing Mood or Memory there; the Settings-only complete editor exposes the authoritative Mood, Status, and Memory values on desktop and mobile. | Passing 2026-07-24 against an acknowledged guarded isolated schema |

#### Verification Gaps

- `S3/R2-S2`, `S3/R3-S2`: Owner manual confirmation of long sparse player-visible details and rendered Settings save/delete/recovery remains pending. Deterministic post-turn refresh, database-backed Debug-edit/owner-isolation, and retryable failed autosave behavior now pass.

#### Story Notes

- The Scene pane renders only player-visible details. Complete cards are intentionally confined to the owner-only Settings Debug workflow; no raw prompt or model evidence is exposed.
- A selected NPC that leaves the Scene after an authoritative refresh is no longer selectable or displayed in the player-visible Scene pane.

## Cross-Story Concerns

- World canon remains authoritative and immutable from Adventure runtime paths.
- Adventure data is private to its owner even when the source World is public.
- The AdonisJS backend owns authorization, lifecycle, source/state projection, prompt assembly, jobs, and provider adapters for every client.
- Completed narration and state transitions use immutable revision links so later Retry and rollback can be introduced coherently.
- S2 enforces one pending or processing resolving turn per Adventure in PostgreSQL while current story and state remain readable during resolution.
- S2 keeps accepted Player/NPC changes Adventure-owned, allowlisted, and recorded with immutable revision-linked outcomes; frozen WorldVersion canon remains unchanged.
- Raw prompt/model bodies are not retained as operational evidence; bounded metadata remains backend-owned and never part of the normal player API. Default-on local development Debug capture is a protected, explicitly disableable exception governed by the provider-boundary ADR.
- S2 treats raw Act/Guide input and Pass markers as durable turn records, not normal story history. The authenticated owner may read them in the derived transcript; Guide remains distinct through italic presentation and is never fed back into normal generation context.
- The closed Character-authoring Change keeps complete current-Scene card contents out of model-call evidence while recording only bounded count and serialized-character-size metadata; Debug trace content stays local, default-on for development, explicitly disableable, redacted, and outside the model-call store.
- Complete debug-card disclosure is intentionally owner-only on Adventure surfaces; it does not change source-canon or cross-Adventure isolation.

## Open Decisions

- The active UI Refinements Change has completed focused database, desktop/mobile E2E, replacement aggregate, and fresh independent review proof. Owner manual confirmation found one orange outer-Story focus regression; its neutral-focus remediation now passes automated and independent rendered verification, while owner reconfirmation remains pending. S3 remains partially verified; Story, `/look`, and `/help` remain candidate scope until their own promoted Change.

## Completion Criteria

This Epic is healthy when:

- embedded Stories describe only accepted Adventure behavior;
- private Adventure ownership and WorldVersion isolation are enforced by backend and database evidence;
- opening and resolving-turn work survives reloads and stale workers without duplicate publication;
- one successful resolving turn atomically advances narration, revision lineage, current state, and turn count while rejected/failed work publishes none of them;
- World discovery, creation, recovery, ready, reset, delete, and turn states have deterministic and manual evidence;
- complete frozen-and-current NPC Cards are initialized/reset from their immutable WorldVersion, selected only for the current Scene, and inspected through owner-only debug UI with scenario-mapped evidence;
- `Implemented By`, `Implementation Gaps`, `Verified By`, and `Verification Gaps` remain current; and
- deferred Story/utilities and history revision controls are not represented as implemented.

## Notes

- The archived Lorecraft MVP remains reference material and does not own official Epic truth.
- Version-management UI is not required for the first immutable WorldVersion implementation.
