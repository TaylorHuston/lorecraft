---
schema: sdd-epic-v2
id: LC-003
status: in_progress
created: 2026-07-16
modified: 2026-07-19
last_verified: 2026-07-19
stories:
  - S1
  - S2
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
  - `docs/adrs/2026-07-18-revision-linked-adventure-state-mutations.md` (accepted)

Lorecraft's creator-owned Worlds are authoritative canon. Adventure play lets an account enter that canon through a private, non-canonical reality whose story remains stable when the creator later changes the World. The archived MVP is evidence for useful interactions, but the official application owns a new structured runtime built outward from this isolation boundary.

## Outcome

Accounts can enter an authorized World through private Adventures, receive and resume a durable Game Master opening grounded in frozen canon, and return without changing the source World or another account's Adventure. S2 adds Act, Pass, and private Guide turn resolution with bounded Adventure-owned consequences.

## Current Scope

- Start from one explicit immutable WorldVersion and one versioned default Starting Point.
- Create one private Adventure-owned player profile.
- Durably generate, persist, list, and resume an opening narration.
- Resolve one owner-only, idempotent Act, Pass, or private Guide turn from a ready Adventure.
- Process turn narration and bounded Adventure-owned consequences through the durable worker, then publish a revision, narration, and current state atomically.
- Materialize mutable Player/NPC Adventure state while retaining revision-linked mutation outcomes.
- Reset to the original source version and delete only the selected Adventure.
- Keep authorization, source isolation, lifecycle, provider orchestration, and typed API behavior in the AdonisJS backend.
- Present World-contained Adventure discovery and a responsive story-first Adventure route in the React client.

## Deferred Scope

- Story inserts, `/look`, `/help`, and general command parsing.
- Dice, combat, health, inventory, equipment, stats, skills, quests, progression, and rules adjudication.
- Multiple Starting Points, selectable World dates, canonical protagonist templates, and WorldVersion management UI.
- Successful-turn Retry, rollback, branching, WorldVersion upgrades, and promotion of Adventure material into canon.
- Sharing, spectators, collaborative control, and multiplayer.
- Player-facing model controls, streaming, and push delivery.

## Candidate Stories

Candidate Stories are planning signals only. They are not accepted Epic/Story truth until promoted into `## Stories`, and they do not receive `S#` labels until promotion.

| Candidate                  | Status   | Story Shape                                                                                                                                       | Acceptance Signals                                                                     |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `shape-and-inspect-story`  | proposed | As a player, I want Story, `/look`, `/help`, and persistent context views, so that I can shape and understand the Adventure before ending a turn. | Utility persistence/context exclusion and Player/Scene knowledge filtering are proven. |
| `revise-adventure-history` | deferred | As a player, I want to Retry, roll back, or branch from completed turns, so that I can revise my story safely.                                    | Complete state restoration and immutable history semantics are defined and proven.     |

## Story Index

| Story | Implementation | Verification | Capability                             | Last Verified | Notes                                                                                                                                                   |
| ----- | -------------- | ------------ | -------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1    | implemented    | verified     | Start and resume a private Adventure.  | 2026-07-18    | Opening, privacy, recovery, lifecycle, and responsive workbench foundation.                                                                             |
| S2    | implemented    | partial      | Resolve a structured Game Master turn. | 2026-07-19    | Act, Pass, Guide, durable lifecycle, bounded consequences, and responsive turn workbench; browser recovery/concurrency, live-provider, and manual confirmation gaps remain explicit. |

## Stories

### Story S1: Start And Resume A Private Adventure

Implementation: implemented
Verification: verified
Created: 2026-07-16
Modified: 2026-07-18
Last verified: 2026-07-18

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

###### Scenario R5-S5: Route Context After Navigation

- WHEN the account holder navigates to an Adventure creation or detail route, including through a redirect
- THEN the document title identifies the destination
- AND focus begins at the destination page heading when navigation replaces the initiating context
- AND background data refresh does not steal focus.

###### Scenario R5-S6: Opening Completion Announcement

- WHEN a visible pending Adventure becomes ready while the account holder remains on the page
- THEN Lorecraft politely announces that the opening is ready
- AND the generated narration becomes readable without moving the account holder's current focus.

#### Implemented By

| Requirement / Scenario                 | Location / Anchor                                                                                                                                                                                                         | Kind          | Responsibility                                                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| S1/R1                                  | `apps/backend/app/services/adventure_creation_service.ts#AdventureCreationService.create`                                                                                                                                 | primary       | Validates source access and request identity, then creates exactly one owner-scoped Adventure, player, and opening job atomically. |
| S1/R1-S1, S1/R1-S2, S1/R1-S3           | `apps/backend/app/controllers/adventures_controller.ts#AdventuresController.store` and `apps/backend/app/validators/adventure.ts#createAdventureValidator`                                                                | adapter       | Applies authenticated, CSRF-protected creation validation and non-disclosing HTTP errors.                                          |
| S1/R1-S4, S1/R1-S5                     | `apps/frontend/src/adventures/NewAdventurePage.tsx#NewAdventurePage` and `apps/frontend/src/adventures/creationRequestId.ts#createAdventureRequestId`                                                                     | presentation  | Discloses provider processing before submission and supplies portable UUID request identities.                                     |
| S1/R2                                  | `apps/backend/app/services/world_version_publication_service.ts#publishWorldVersionInTransaction`                                                                                                                         | primary       | Publishes or reuses a complete immutable WorldVersion with a valid default Starting Point.                                         |
| S1/R2-S1, S1/R2-S2, S1/R2-S3           | `apps/backend/database/migrations/1784233200000_add_frozen_world_source_foundation.ts` and `apps/backend/app/services/stormbound_chapel_seed.ts#seedStormboundChapel`                                                     | persistence   | Enforces frozen-source/default constraints and provides the repeatable playable starter World.                                     |
| S1/R3                                  | `apps/backend/app/services/adventure_opening_worker.ts#AdventureOpeningWorker.runOnce`                                                                                                                                    | primary       | Claims durable opening work and atomically publishes the root revision, narration, sanitized evidence, and ready state.            |
| S1/R3-S1, S1/R3-S3, S1/R3-S4           | `apps/backend/app/services/story_generation/opening_prompt.ts#assembleOpeningPrompt` and `apps/backend/app/services/story_generation/openai_compatible_story_generator.ts#OpenAICompatibleStoryGenerator.generateOpening` | adapter       | Builds bounded frozen context, validates provider prose, and normalizes sanitized failures.                                        |
| S1/R3-S5, S1/R3-S6, S1/R3-S7, S1/R3-S8 | `apps/backend/app/services/adventure_opening_policy.ts#retryDisposition` and `apps/backend/database/migrations/1784323200000_minimize_model_call_evidence.ts`                                                             | support       | Enforces retry policy and metadata-only model evidence.                                                                            |
| S1/R3-S9, S1/R3-S10                    | `apps/backend/commands/work_adventure_openings.ts`, `deploy/compose.yaml`, and `deploy/release-command.mjs`                                                                                                               | configuration | Runs the worker separately and coordinates safe deployment/restart behavior.                                                       |
| S1/R4                                  | `apps/backend/app/services/adventure_lifecycle_service.ts#AdventureLifecycleService.reset`                                                                                                                                | primary       | Owns owner-filtered recovery, reset to the frozen source, and aggregate-scoped deletion.                                           |
| S1/R4-S1                               | `apps/backend/app/services/adventure_query_service.ts#AdventureQueryService.findForOwner`                                                                                                                                 | adapter       | Projects owner-scoped Adventure summaries and detail without source snapshots or provider evidence.                                |
| S1/R4-S1, S1/R4-S2, S1/R4-S3           | `apps/frontend/src/worlds/WorldDetailPage.tsx#WorldDetailPage` and `apps/frontend/src/adventures/AdventurePage.tsx#AdventurePage`                                                                                         | presentation  | Presents create, resume, retry, reset, delete, and lifecycle feedback.                                                             |
| S1/R5                                  | `apps/frontend/src/adventures/AdventureWorkbench.tsx#AdventureWorkbench`                                                                                                                                                  | primary       | Owns the story-first Player/Story/Scene workbench, status presentation, responsive regions, and accessible navigation.             |
| S1/R5-S1, S1/R5-S2, S1/R5-S3, S1/R5-S4 | `apps/frontend/src/adventures/AdventurePage.tsx#AdventurePage`, `apps/frontend/src/components/Dialog/Dialog.tsx#Dialog`, and `apps/frontend/src/components/Dialog/ConfirmDialog.tsx#ConfirmDialog`                        | presentation  | Connects lifecycle actions and accessible destructive confirmations to the workbench.                                              |
| S1/R5-S5, S1/R5-S6                     | `apps/frontend/src/app/AppRoutes.tsx#AppRoutes`                                                                                                                                                                           | presentation  | Sets route title and destination focus while preserving focus during background completion.                                        |

#### Implementation Gaps

- None.

#### Verified By

| Requirement / Scenario                                               | Evidence                                                                                                                                                                                                                                                                                   | Proves                                                                                                                                                                | Status                                |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| S1/R1-S1, S1/R1-S2, S1/R1-S3                                         | `apps/backend/tests/functional/adventure_creation_service.spec.ts` and `apps/backend/tests/functional/adventure_api.spec.ts`                                                                                                                                                               | Valid creation, owner idempotency, field validation, source access, authentication, CSRF, and non-disclosing errors.                                                  | Passing 2026-07-18                    |
| S1/R1-S4, S1/R1-S5                                                   | `apps/frontend/src/adventures/AdventureRoutes.test.tsx` and `apps/frontend/src/adventures/creationRequestId.test.ts`                                                                                                                                                                       | Provider-processing disclosure appears before creation, and native/fallback request identity remains UUID v4 compliant.                                               | Passing 2026-07-18                    |
| S1/R2-S1, S1/R2-S2, S1/R2-S3                                         | `apps/backend/tests/database/frozen_world_source_migration.spec.ts`, `apps/backend/tests/functional/world_version_publication.spec.ts`, `apps/backend/tests/functional/adventure_creation_service.spec.ts`, and `apps/backend/tests/functional/adventure_query_service.spec.ts`            | Immutable source/default constraints, stable snapshot publication, initial binding, playability conflicts, and existing-Adventure isolation from later canon.         | Passing 2026-07-18                    |
| S1/R3-S1, S1/R3-S4                                                   | `apps/backend/tests/unit/story_generation/opening_prompt.spec.ts`, `apps/backend/tests/unit/story_generation/openai_compatible_story_generator.spec.ts`, and `apps/backend/tests/functional/adventure_opening_worker.spec.ts`                                                              | Frozen context, provider result validation, atomic root narration publication, and no partial prose after invalid generation.                                         | Passing 2026-07-18                    |
| S1/R3-S2, S1/R3-S3, S1/R3-S7, S1/R3-S8                               | `apps/backend/tests/functional/adventure_opening_worker.spec.ts`, `apps/backend/tests/unit/adventure_opening_policy.spec.ts`, and `apps/backend/tests/unit/adventure_opening_worker_port.spec.ts`                                                                                          | Lease recovery, one bounded retry, delayed retry policy, interruption handling, and stale-work rejection.                                                             | Passing 2026-07-18                    |
| S1/R3-S5                                                             | `apps/backend/tests/functional/adventure_api.spec.ts`                                                                                                                                                                                                                                      | Account-scoped creation, retry, and reset burst limiting rejects excess work before lifecycle mutation.                                                               | Passing 2026-07-18                    |
| S1/R3-S6                                                             | `apps/backend/tests/unit/story_generation/openai_compatible_story_generator.spec.ts`, `apps/backend/tests/functional/adventure_opening_worker.spec.ts`, and `apps/backend/tests/database/adventure_aggregate_migration.spec.ts`                                                            | Model-call persistence and logs retain only bounded metadata; provider bodies, prompts, and credentials are absent.                                                   | Passing 2026-07-18                    |
| S1/R3-S9, S1/R3-S10                                                  | `deploy/container-contract.test.mjs`, `deploy/release-command.test.mjs`, `scripts/image-workflow.test.mjs`, and the 2026-07-18 private-production acceptance                                                                                                                               | Separate worker supervision, five-second polling, tailnet-only ingress, restart recovery, one real opening, and deterministic application rollback.                   | Passing and user confirmed 2026-07-18 |
| S1/R4-S1, S1/R4-S2, S1/R4-S3                                         | `apps/backend/tests/functional/adventure_query_service.spec.ts`, `apps/backend/tests/functional/adventure_lifecycle_service.spec.ts`, `apps/backend/tests/functional/adventure_api.spec.ts`, and `apps/frontend/e2e/adventure-foundation.spec.ts`                                          | Owner-only list/detail, frozen-source reset, aggregate-only deletion, and desktop/mobile lifecycle journeys.                                                          | Passing 2026-07-18                    |
| S1/R5-S1, S1/R5-S2, S1/R5-S3, S1/R5-S4                               | `apps/frontend/src/adventures/AdventureRoutes.test.tsx`, `apps/frontend/src/adventures/AdventureWorkbench.test.tsx`, `apps/frontend/src/adventures/AdventurePage.stories.tsx`, `apps/frontend/src/components/Dialog/Dialog.test.tsx`, and `apps/frontend/e2e/adventure-foundation.spec.ts` | Creation, pending, failure, ready, reset/delete confirmation, accessible dialogs, responsive Player/Story/Scene composition, and overflow-free desktop/mobile states. | Passing 2026-07-18                    |
| S1/R5-S5, S1/R5-S6                                                   | `apps/frontend/src/app/RoutePresentation.test.tsx` and `apps/frontend/src/adventures/AdventureRoutes.test.tsx`                                                                                                                                                                             | Adventure destinations receive title/heading focus; background completion is announced without stealing focus.                                                        | Passing 2026-07-18                    |
| S1/R1-S4, S1/R3-S1, S1/R3-S3, S1/R5-S1, S1/R5-S2, S1/R5-S3, S1/R5-S4 | Taylor's desktop/mobile Adventure walkthrough and provider-backed opening review                                                                                                                                                                                                           | The provider notice, pending-to-ready transition, story-first presentation, lifecycle controls, and responsive workbench are understandable and accepted.             | User confirmed 2026-07-18             |

#### Verification Gaps

- None.

#### Story Notes

- The opening root revision has zero completed player turns.
- Player name is the initial Adventure identity; a separate Adventure title is deferred.
- Reset preserves the creation profile and original frozen source while clearing generated runtime state.
- A later World-authoring UI may add a routed E2E for `S1/R2-S2`; World publication is currently verified at database, service, and API boundaries.

### Story S2: Resolve A Structured Game Master Turn

Implementation: implemented
Verification: partial
Created: 2026-07-19
Modified: 2026-07-19
Last verified: 2026-07-19

As a player, I want Act, Pass, or Guide to resolve a durable Game Master turn, so that my private Adventure can progress through narration and bounded persistent consequences.

#### Requirements And Scenarios

##### Requirement R1: Explicit Resolving Actions

The system SHALL let the owner of a ready Adventure submit exactly one valid Act, Pass, or Guide action as an idempotent turn request.

###### Scenario R1-S1: Act With Player Intent

- WHEN the owner submits a non-empty Act within the accepted length
- THEN Lorecraft creates one pending turn containing that current intent
- AND returns the authoritative pending turn and Adventure route without waiting for model completion.

###### Scenario R1-S2: Pass Without Player Intent

- WHEN the owner selects Pass and confirms the action
- THEN Lorecraft creates one pending turn without requiring invented player intent
- AND the Game Master may advance the scene while preserving player agency.

###### Scenario R1-S3: Private One-Turn Guide

- WHEN the owner submits a non-empty Guide within the accepted length
- THEN Lorecraft creates one pending turn using that text only as hidden direction for this resolution
- AND the raw Guide text never appears in the visible story or later normal story context.

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
- THEN prior raw Act inputs, prior Guide text, Pass markers, model evidence, rejected mutations, and operational records are excluded from normal story history
- AND accepted prior narration plus current structured state carry durable context forward.

###### Scenario R3-S3: Separate Model Contracts

- WHEN narration generation succeeds
- THEN a separately validated extraction operation reads the staged narration and current structured state
- AND extraction can fail or retry without converting provider output directly into database writes.

###### Scenario R3-S4: Metadata-Only Evidence

- WHEN either model operation succeeds or fails
- THEN Lorecraft records bounded provider/model/settings/timing/status/token/hash/count and normalized failure metadata as available
- AND it does not persist or log assembled prompts, request messages, raw provider responses, credentials, or authorization material.

##### Requirement R4: Bounded Adventure Consequences

The system SHALL apply only allowlisted, validated Adventure-owned mutations and preserve their immutable revision provenance.

###### Scenario R4-S1: Player Movement

- WHEN extraction proposes moving the player to an existing frozen Location
- THEN Lorecraft may update the Adventure player's current Location
- AND the resulting Player and Scene projection uses that accepted state.

###### Scenario R4-S2: NPC Movement And Mutable State

- WHEN extraction proposes an existing frozen Character's Location, mood, current status, or summarized memory change within field bounds
- THEN Lorecraft may update only that Adventure-owned Character state
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
- AND action modes, submission, Pass confirmation, pending state, and recovery controls have unambiguous labels, visible focus, and appropriate touch targets.

#### Implemented By

| Requirement / Scenario | Location / Anchor                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Kind         | Responsibility                                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| S2/R1                  | `apps/backend/app/services/adventure_turn_submission_service.ts#AdventureTurnSubmissionService.submit`, `apps/backend/app/controllers/adventures_controller.ts#submitTurn`, and `apps/backend/app/validators/adventure.ts#submitAdventureTurnValidator`                                                                                                                                                                                                                                                                                       | primary      | Applies owner-scoped, idempotent Act/Pass/Guide validation and durable submission.                                     |
| S2/R2                  | `apps/backend/app/services/adventure_turn_worker.ts#AdventureTurnWorker`, `apps/backend/app/services/adventure_turn_lifecycle_service.ts#AdventureTurnLifecycleService`, and `apps/backend/commands/work_adventure_turns.ts#WorkAdventureTurns`                                                                                                                                                                                                                                                                                               | primary      | Claims leased turn work, rejects stale publication, applies bounded recovery, and exposes owner retry/discard.         |
| S2/R3                  | `apps/backend/app/services/adventure_turn_production_completion_port.ts#AdventureTurnProductionCompletionPort`, `apps/backend/app/services/story_generation/adventure_turn_context.ts#assembleAdventureTurnContext`, and the narrow turn/extraction adapters                                                                                                                                                                                                                                                                                  | primary      | Stages bounded context, narration, and separate structured extraction with metadata-only evidence.                     |
| S2/R4                  | `apps/backend/app/services/adventure_mutation_policy.ts#resolveAdventureMutations`, `apps/backend/app/models/adventure_character_state.ts#AdventureCharacterState`, and `apps/backend/app/models/adventure_revision_mutation.ts#AdventureRevisionMutation`                                                                                                                                                                                                                                                                                    | primary      | Allows bounded Adventure-owned mutations and records immutable revision-linked outcomes.                               |
| S2/R5                  | `apps/frontend/src/adventures/AdventureWorkbench.tsx#AdventureWorkbench`, `apps/frontend/src/adventures/AdventurePage.tsx#AdventurePage`, and `apps/frontend/src/adventures/tuyauAdventureApi.ts#createTuyauAdventureApi`                                                                                                                                                                                                                                                                                                                     | primary      | Presents resolving actions, recovery states, polling, announcements, and the responsive workbench.                     |
| S2/R2                  | `apps/backend/app/models/adventure.ts#Adventure`, `apps/backend/app/models/adventure_job.ts#AdventureJob`, `apps/backend/app/models/adventure_turn.ts#AdventureTurn`, and `apps/backend/database/migrations/1784409600000_add_durable_adventure_turns.ts`                                                                                                                                                                                                                                                                                     | persistence  | Defines Adventure/turn/job relations, one-active-turn constraints, and durable turn-job ownership.                     |
| S2/R3                  | `apps/backend/app/services/story_generation/turn_prompt.ts#assembleTurnPrompt`, `apps/backend/app/services/story_generation/adventure_state_extraction_prompt.ts#assembleAdventureStateExtractionPrompt`, `apps/backend/app/services/story_generation/turn_story_generator.ts#TurnStoryGenerator`, `apps/backend/app/services/story_generation/adventure_state_extractor.ts#AdventureStateExtractor`, and `apps/backend/app/services/story_generation/openai_compatible_adventure_state_extractor.ts#OpenAICompatibleAdventureStateExtractor` | adapter      | Defines the distinct narration/extraction contracts and bounded provider translation.                                  |
| S2/R4                  | `apps/backend/database/migrations/1784413200000_add_adventure_mutation_state.ts`, `apps/backend/app/services/adventure_creation_service.ts#AdventureCreationService.create`, `apps/backend/app/services/adventure_lifecycle_service.ts#AdventureLifecycleService.reset`, and `apps/backend/app/services/adventure_query_service.ts#AdventureQueryService.findForOwner`                                                                                                                                                                        | persistence  | Initializes, resets, and projects Adventure-owned state without exposing internal NPC mutation fields.                 |
| S2/R5                  | `apps/frontend/src/adventures/adventureApi.ts`, `apps/frontend/src/adventures/AdventureWorkbench.module.css`, and `apps/frontend/src/app/App.tsx`                                                                                                                                                                                                                                                                                                                                                                                             | presentation | Defines client API types, responsive turn presentation, and the injected API boundary used by application and stories. |
| S2/R5                  | `apps/frontend/src/adventures/AdventurePage.stories.tsx`, `apps/frontend/src/adventures/NewAdventurePage.stories.tsx`, `apps/frontend/src/comparison/Workbench.stories.tsx`, `apps/frontend/src/workspace/WorkspacePage.stories.tsx`, and `apps/frontend/src/worlds/WorldDetailPage.stories.tsx`                                                                                                                                                                                                                                              | support      | Supplies shared Storybook states and mock API surfaces for the interactive workbench.                                  |

#### Implementation Gaps

- None. Successful-turn Retry, rollback, branching, Story utilities, streaming, model controls, and multiplayer remain deferred rather than gaps in S2.

#### Verified By

| Requirement / Scenario                                                                                                                                                                                 | Evidence                                                                                                                                                                                                                                                                           | Proves                                                                                                                                                          | Status                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| S2/R1-S4, S2/R3-S1, S2/R3-S2, S2/R3-S3, S2/R3-S4, S2/R4-S1, S2/R4-S2, S2/R4-S3                                                                                                                         | `apps/backend/tests/unit/adventure_mutation_policy.spec.ts`, `apps/backend/tests/unit/story_generation/adventure_state_extractor.spec.ts`, and `apps/backend/tests/unit/story_generation/adventure_turn_context.spec.ts`                                                           | Allowlist/rejection behavior, bounded private context, Pass semantics, staged extraction, and metadata-safe malformed-output handling.                          | Passing 2026-07-19 (10 tests)                             |
| S2/R5-S1, S2/R5-S2, S2/R5-S3, S2/R5-S4, S2/R5-S5                                                                                                                                                       | `apps/frontend/src/adventures/AdventureRoutes.test.tsx`, `apps/frontend/src/adventures/AdventureWorkbench.test.tsx`, `apps/frontend/src/adventures/tuyauAdventureApi.test.ts`, and `apps/frontend/src/test/renderTestApp.tsx`                                                      | Composer, Pass confirmation, private Guide messaging, polling, lifecycle states, completion announcement, responsive presentation, and typed client validation. | Passing 2026-07-19 (38 tests)                             |
| S2/R5-S1, S2/R5-S2                                                                                                                                                                                     | Local development browser smoke at `/` plus frontend/backend lint and typechecks                                                                                                                                                                                                   | The normal API, both workers, and web client start together; the sign-in surface renders meaningful content with no framework overlay or console errors.        | Passing 2026-07-19                                        |
| S2/R1-S1, S2/R1-S2, S2/R1-S3, S2/R1-S4, S2/R1-S5, S2/R1-S6, S2/R2-S1, S2/R2-S2, S2/R2-S3, S2/R2-S4, S2/R2-S5, S2/R2-S6, S2/R3-S3, S2/R3-S4, S2/R4-S1, S2/R4-S2, S2/R4-S3, S2/R4-S4, S2/R4-S5, S2/R4-S6 | `apps/backend/tests/functional/adventure_turn_api.spec.ts`, `apps/backend/tests/functional/adventure_turn_submission_service.spec.ts`, `apps/backend/tests/functional/adventure_turn_worker.spec.ts`, `apps/backend/tests/functional/adventure_lifecycle_service.spec.ts`, `apps/backend/tests/database/adventure_aggregate_migration.spec.ts`, and `apps/backend/tests/database/adventure_mutation_state_migration.spec.ts` | API authorization/idempotency and retry/discard, worker lifecycle/finalization and non-publication on reflected Guide text, reset of player and every Adventure-owned NPC state after a completed turn, transactional state isolation, data-bearing rollback refusal, and migration invariants against a guarded disposable Neon schema. | Passing 2026-07-19 |
| S2/R1-S1, S2/R1-S2, S2/R1-S3, S2/R2-S1, S2/R2-S2, S2/R2-S3, S2/R2-S5, S2/R3-S3, S2/R4-S1, S2/R4-S2, S2/R4-S4, S2/R5-S1, S2/R5-S2, S2/R5-S3, S2/R5-S4 | `apps/frontend/e2e/adventure-foundation.spec.ts` and `apps/frontend/e2e/fake-story-provider.mjs` | The seeded Adventure resolves Act, private Guide, and confirmed Pass through the real worker; reload while resolving and a same-owner concurrent tab preserve the one-active-turn invariant; failed turns retry or discard without changing Player/Scene; committed state updates, reset, owner isolation, and desktop/mobile layouts remain coherent. | Passing 2026-07-19 (3 projects) |

#### Verification Gaps

- All S2: live-provider Act/Guide quality and owner manual desktop/mobile confirmation remain intentionally pending; no raw prompt, Guide, or provider body will be retained as evidence.

#### Story Notes

- Failed, uncommitted turns may be retried with the same input or discarded; successful-turn Retry, rollback, and branching remain deferred.
- Raw Guide and prior action input remain private authoritative turn data; normal story context contains accepted narration and current structured state only.

## Cross-Story Concerns

- World canon remains authoritative and immutable from Adventure runtime paths.
- Adventure data is private to its owner even when the source World is public.
- The AdonisJS backend owns authorization, lifecycle, source/state projection, prompt assembly, jobs, and provider adapters for every client.
- Completed narration and state transitions use immutable revision links so later Retry and rollback can be introduced coherently.
- S2 enforces one pending or processing resolving turn per Adventure in PostgreSQL while current story and state remain readable during resolution.
- S2 keeps accepted Player/NPC changes Adventure-owned, allowlisted, and recorded with immutable revision-linked outcomes; frozen WorldVersion canon remains unchanged.
- Raw prompt/model bodies are not retained as operational evidence; bounded metadata remains backend-owned and never part of the normal player API.
- S2 treats raw Act/Guide input and Pass markers as private turn records, not normal story history or player-visible metadata.

## Open Decisions

- None block `S1` or `S2`. Candidate Stories require their own promoted Changes before they become accepted Epic truth.

## Completion Criteria

This Epic is healthy when:

- embedded Stories describe only accepted Adventure behavior;
- private Adventure ownership and WorldVersion isolation are enforced by backend and database evidence;
- opening and resolving-turn work survives reloads and stale workers without duplicate publication;
- one successful resolving turn atomically advances narration, revision lineage, current state, and turn count while rejected/failed work publishes none of them;
- World discovery, creation, recovery, ready, reset, delete, and turn states have deterministic and manual evidence;
- `Implemented By`, `Implementation Gaps`, `Verified By`, and `Verification Gaps` remain current; and
- deferred Story/utilities and history revision controls are not represented as implemented.

## Notes

- The archived Lorecraft MVP remains reference material and does not own official Epic truth.
- Version-management UI is not required for the first immutable WorldVersion implementation.
