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
  - S3
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

Accounts can enter an authorized World through private Adventures, receive and resume a durable Game Master opening grounded in frozen canon, and return without changing the source World or another account's Adventure. S2 adds Act, Pass, and private Guide turn resolution with bounded Adventure-owned consequences. The active Character-authoring Change extends frozen source, current-Scene prompt context, Debug diagnostics, and current-Scene NPC Cards; database-backed and live-provider verification remain pending.

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
- Complete frozen-and-current NPC Cards for all and only NPCs in the current Scene, bounded context-size metadata, local development Debug diagnostics, and owner debug inspection.
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
| S1    | implemented    | partial      | Start and resume a private Adventure.  | 2026-07-20    | Complete NPC-card source/init/query code and prompt tests exist; direct database and live-opening evidence pass, while broader manual acceptance remains pending. |
| S2    | implemented    | partial      | Resolve a structured Game Master turn. | 2026-07-19    | Durable turn foundation, current-Scene card context, and local Debug capture are implemented; database/live proof remains pending. |
| S3    | implemented    | partial      | Inspect complete NPC Cards.            | 2026-07-20    | Current-Scene projection, Debug boundary database proof, and interactive UI exist; post-turn refresh/manual proof remains pending. |

## Stories

### Story S1: Start And Resume A Private Adventure

Implementation: implemented
Verification: partial
Created: 2026-07-16
Modified: 2026-07-19
Last verified: 2026-07-20

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

#### Implemented By

| Requirement / Scenario                 | Location / Anchor                                                                                                                                                                                                         | Kind          | Responsibility                                                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| S1/R1                                  | `apps/backend/app/services/adventure_creation_service.ts#AdventureCreationService.create`                                                                                                                                 | primary       | Validates source access and request identity, then creates exactly one owner-scoped Adventure, player, and opening job atomically. |
| S1/R1-S1, S1/R1-S2, S1/R1-S3           | `apps/backend/app/controllers/adventures_controller.ts#AdventuresController.store` and `apps/backend/app/validators/adventure.ts#createAdventureValidator`                                                                | adapter       | Applies authenticated, CSRF-protected creation validation and non-disclosing HTTP errors.                                          |
| S1/R1-S4, S1/R1-S5                     | `apps/frontend/src/adventures/NewAdventurePage.tsx#NewAdventurePage` and `apps/frontend/src/adventures/creationRequestId.ts#createAdventureRequestId`                                                                     | presentation  | Discloses provider processing before submission and supplies portable UUID request identities.                                     |
| S1/R2                                  | `apps/backend/app/services/world_version_publication_service.ts#publishWorldVersionInTransaction`                                                                                                                         | primary       | Publishes or reuses a complete immutable WorldVersion with initial NPC card state and a valid default Starting Point.              |
| S1/R2-S1, S1/R2-S2, S1/R2-S3           | `apps/backend/database/migrations/1784233200000_add_frozen_world_source_foundation.ts` and `apps/backend/app/services/stormbound_chapel_seed.ts#seedStormboundChapel`                                                     | persistence   | Enforces frozen-source/default constraints and provides the repeatable playable starter World.                                     |
| S1/R3                                  | `apps/backend/app/services/adventure_opening_worker.ts#AdventureOpeningWorker.runOnce`                                                                                                                                    | primary       | Claims durable opening work and atomically publishes the root revision, narration, sanitized evidence, and ready state.            |
| S1/R3-S1, S1/R3-S3, S1/R3-S4           | `apps/backend/app/services/story_generation/opening_prompt.ts#assembleOpeningPrompt` and `apps/backend/app/services/story_generation/openai_compatible_story_generator.ts#OpenAICompatibleStoryGenerator.generateOpening` | adapter       | Builds bounded frozen starting-Scene card context, validates provider prose, and normalizes sanitized failures.                    |
| S1/R3-S5, S1/R3-S6, S1/R3-S7, S1/R3-S8 | `apps/backend/app/services/adventure_opening_policy.ts#retryDisposition` and `apps/backend/database/migrations/1784323200000_minimize_model_call_evidence.ts`                                                             | support       | Enforces retry policy and metadata-only model evidence.                                                                            |
| S1/R3-S9, S1/R3-S10                    | `apps/backend/commands/work_adventure_openings.ts`, `deploy/compose.yaml`, and `deploy/release-command.mjs`                                                                                                               | configuration | Runs the worker separately and coordinates safe deployment/restart behavior.                                                       |
| S1/R3-S11                               | `apps/backend/commands/smoke_adventure_opening.ts#SmokeAdventureOpening`, `apps/backend/app/services/story_generation/runtime_configuration.ts#resolveStoryGenerationRuntimeConfiguration`, and `apps/backend/app/services/story_generation/opening_smoke.ts#generateOpeningSmoke` | configuration | Reuses worker provider configuration for one bounded synthetic local acceptance request and fails safely on invalid narration. |
| S1/R4                                  | `apps/backend/app/services/adventure_lifecycle_service.ts#AdventureLifecycleService.reset`                                                                                                                                | primary       | Owns owner-filtered recovery, reset to the frozen source, and aggregate-scoped deletion.                                           |
| S1/R4-S1                               | `apps/backend/app/services/adventure_query_service.ts#AdventureQueryService.findForOwner`                                                                                                                                 | adapter       | Projects owner-scoped current-Scene complete NPC Cards without source snapshots or provider evidence.                              |
| S1/R4-S1, S1/R4-S2, S1/R4-S3           | `apps/frontend/src/worlds/WorldDetailPage.tsx#WorldDetailPage` and `apps/frontend/src/adventures/AdventurePage.tsx#AdventurePage`                                                                                         | presentation  | Presents create, resume, retry, reset, delete, and lifecycle feedback.                                                             |
| S1/R5                                  | `apps/frontend/src/adventures/AdventureWorkbench.tsx#AdventureWorkbench`                                                                                                                                                  | primary       | Owns the story-first Player/Story/Scene workbench, status presentation, responsive regions, and accessible navigation.             |
| S1/R5-S1, S1/R5-S2, S1/R5-S3, S1/R5-S4 | `apps/frontend/src/adventures/AdventurePage.tsx#AdventurePage`, `apps/frontend/src/components/Dialog/Dialog.tsx#Dialog`, and `apps/frontend/src/components/Dialog/ConfirmDialog.tsx#ConfirmDialog`                        | presentation  | Connects lifecycle actions and accessible destructive confirmations to the workbench.                                              |
| S1/R5-S5, S1/R5-S6                     | `apps/frontend/src/app/AppRoutes.tsx#AppRoutes`                                                                                                                                                                           | presentation  | Sets route title and destination focus while preserving focus during background completion.                                        |

#### Implementation Gaps

- None. Guarded database migration/create/reset/query evidence remains a verification gap.

#### Verified By

| Requirement / Scenario                                               | Evidence                                                                                                                                                                                                                                                                                   | Proves                                                                                                                                                                | Status                                |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| S1/R1-S1, S1/R1-S2, S1/R1-S3                                         | `apps/backend/tests/functional/adventure_creation_service.spec.ts` and `apps/backend/tests/functional/adventure_api.spec.ts`                                                                                                                                                               | Valid creation, owner idempotency, field validation, source access, authentication, CSRF, and non-disclosing errors.                                                  | Passing 2026-07-18                    |
| S1/R1-S4, S1/R1-S5                                                   | `apps/frontend/src/adventures/AdventureRoutes.test.tsx` and `apps/frontend/src/adventures/creationRequestId.test.ts`                                                                                                                                                                       | Provider-processing disclosure appears before creation, and native/fallback request identity remains UUID v4 compliant.                                               | Passing 2026-07-18                    |
| S1/R2-S1, S1/R2-S2, S1/R2-S3                                         | `apps/backend/tests/database/frozen_world_source_migration.spec.ts`, `apps/backend/tests/functional/world_version_publication.spec.ts`, `apps/backend/tests/functional/adventure_creation_service.spec.ts`, and `apps/backend/tests/functional/adventure_query_service.spec.ts`            | Immutable source/default constraints, stable snapshot publication, initial binding, playability conflicts, and existing-Adventure isolation from later canon.         | Passing 2026-07-18                    |
| S1/R3-S1, S1/R3-S4                                                   | `apps/backend/tests/unit/story_generation/opening_prompt.spec.ts` and `apps/backend/tests/unit/story_generation/openai_compatible_story_generator.spec.ts`                                                                                                                                 | Frozen complete starting-Scene cards, initial mood/status/memory formatting, and provider request debug-context routing.                                              | Passing 2026-07-19                    |
| S1/R3-S2, S1/R3-S3, S1/R3-S7, S1/R3-S8                               | `apps/backend/tests/functional/adventure_opening_worker.spec.ts`, `apps/backend/tests/unit/adventure_opening_policy.spec.ts`, and `apps/backend/tests/unit/adventure_opening_worker_port.spec.ts`                                                                                          | Lease recovery, one bounded retry, delayed retry policy, interruption handling, and stale-work rejection.                                                             | Passing 2026-07-18                    |
| S1/R3-S5                                                             | `apps/backend/tests/functional/adventure_api.spec.ts`                                                                                                                                                                                                                                      | Account-scoped creation, retry, and reset burst limiting rejects excess work before lifecycle mutation.                                                               | Passing 2026-07-18                    |
| S1/R3-S6                                                             | `apps/backend/tests/unit/story_generation/openai_compatible_story_generator.spec.ts`, `apps/backend/tests/functional/adventure_opening_worker.spec.ts`, and `apps/backend/tests/database/adventure_aggregate_migration.spec.ts`                                                            | Model-call persistence and logs retain only bounded metadata; provider bodies, prompts, and credentials are absent.                                                   | Passing 2026-07-18                    |
| S1/R3-S9, S1/R3-S10                                                  | `deploy/container-contract.test.mjs`, `deploy/release-command.test.mjs`, `scripts/image-workflow.test.mjs`, and the 2026-07-18 private-production acceptance                                                                                                                               | Separate worker supervision, five-second polling, tailnet-only ingress, restart recovery, one real opening, and deterministic application rollback.                   | Passing and user confirmed 2026-07-18 |
| S1/R3-S11                                                           | `apps/backend/tests/unit/story_generation/runtime_configuration.spec.ts`, `apps/backend/tests/unit/story_generation/opening_smoke.spec.ts`, and `npm run smoke:opening --workspace @lorecraft/backend`                                                                                         | The smoke check shares the worker token-cap defaults, uses bounded synthetic Scene context, rejects a provider-truncated response, and completed one configured local-provider request without truncation. | Passing 2026-07-20 |
| S1/R3-S1                                                            | Protected local Debug trace for the owner retry after the 500-token cap update                                                                                                                                                                                            | One real opening used complete current-Scene context, returned a complete provider response in about 5.5 seconds, and atomically made the Adventure ready without publishing a prior truncated response. | Passing 2026-07-20 |
| S1/R4-S1, S1/R4-S2, S1/R4-S3                                         | `apps/backend/tests/functional/adventure_query_service.spec.ts`, `apps/backend/tests/functional/adventure_lifecycle_service.spec.ts`, `apps/backend/tests/functional/adventure_api.spec.ts`, and `apps/frontend/e2e/adventure-foundation.spec.ts`                                          | Owner-only list/detail, frozen-source reset, aggregate-only deletion, and desktop/mobile lifecycle journeys.                                                          | Passing 2026-07-18                    |
| S1/R5-S1, S1/R5-S2, S1/R5-S3, S1/R5-S4                               | `apps/frontend/src/adventures/AdventureRoutes.test.tsx`, `apps/frontend/src/adventures/AdventureWorkbench.test.tsx`, `apps/frontend/src/adventures/AdventurePage.stories.tsx`, `apps/frontend/src/components/Dialog/Dialog.test.tsx`, and `apps/frontend/e2e/adventure-foundation.spec.ts` | Creation, pending, failure, ready, reset/delete confirmation, accessible dialogs, responsive Player/Story/Scene composition, and overflow-free desktop/mobile states. | Passing 2026-07-18                    |
| S1/R5-S5, S1/R5-S6                                                   | `apps/frontend/src/app/RoutePresentation.test.tsx` and `apps/frontend/src/adventures/AdventureRoutes.test.tsx`                                                                                                                                                                             | Adventure destinations receive title/heading focus; background completion is announced without stealing focus.                                                        | Passing 2026-07-18                    |
| S1/R1-S4, S1/R3-S1, S1/R3-S3, S1/R5-S1, S1/R5-S2, S1/R5-S3, S1/R5-S4 | Taylor's desktop/mobile Adventure walkthrough and provider-backed opening review                                                                                                                                                                                                           | The provider notice, pending-to-ready transition, story-first presentation, lifecycle controls, and responsive workbench are understandable and accepted.             | User confirmed 2026-07-18             |

#### Verification Gaps

- `S1/R2-S1`, `S1/R4-S1`, `S1/R4-S2`: Guarded database migration/create/reset/query evidence is pending because disposable database configuration is absent.
- `S1/R3-S1`: One live opening and protected Debug trace now pass at the 500-token cap; broader grounding/quality remains owner manual acceptance evidence.

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
- AND action modes, submission, Pass confirmation, pending state, and recovery controls have unambiguous labels, visible focus, and appropriate touch targets.

#### Implemented By

| Requirement / Scenario | Location / Anchor                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Kind         | Responsibility                                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| S2/R1                  | `apps/backend/app/services/adventure_turn_submission_service.ts#AdventureTurnSubmissionService.submit`, `apps/backend/app/controllers/adventures_controller.ts#submitTurn`, and `apps/backend/app/validators/adventure.ts#submitAdventureTurnValidator`                                                                                                                                                                                                                                                                                                                                                                                            | primary      | Applies owner-scoped, idempotent Act/Pass/Guide validation and durable submission.                                                |
| S2/R2                  | `apps/backend/app/services/adventure_turn_worker.ts#AdventureTurnWorker`, `apps/backend/app/services/adventure_turn_lifecycle_service.ts#AdventureTurnLifecycleService`, and `apps/backend/commands/work_adventure_turns.ts#WorkAdventureTurns`                                                                                                                                                                                                                                                                                                                                                                                                    | primary      | Claims leased turn work, rejects stale publication, applies bounded recovery, and exposes owner retry/discard.                    |
| S2/R3                  | `apps/backend/app/services/adventure_turn_production_completion_port.ts#AdventureTurnProductionCompletionPort`, `apps/backend/app/services/adventure_opening_worker.ts#AdventureOpeningWorker`, `apps/backend/app/services/story_generation/adventure_turn_context.ts#assembleAdventureTurnContext`, and the narrow turn/extraction adapters                                                                                                                                                                                                                                                                                                                                                                                       | primary      | Stages complete current-Scene cards, rejects direct private-card reflection before player-visible opening/turn publication, and retains metadata-only normal evidence. |
| S2/R4                  | `apps/backend/app/services/adventure_mutation_policy.ts#resolveAdventureMutations`, `apps/backend/app/models/adventure_character_state.ts#AdventureCharacterState`, and `apps/backend/app/models/adventure_revision_mutation.ts#AdventureRevisionMutation`                                                                                                                                                                                                                                                                                                                                                                                         | primary      | Allows bounded Adventure-owned mutations and records immutable revision-linked outcomes.                                          |
| S2/R5                  | `apps/frontend/src/adventures/AdventureWorkbench.tsx#AdventureWorkbench`, `apps/frontend/src/adventures/AdventurePage.tsx#AdventurePage`, and `apps/frontend/src/adventures/tuyauAdventureApi.ts#createTuyauAdventureApi`                                                                                                                                                                                                                                                                                                                                                                                                                          | primary      | Presents resolving actions, recovery states, polling, announcements, and the responsive workbench.                                |
| S2/R2                  | `apps/backend/app/models/adventure.ts#Adventure`, `apps/backend/app/models/adventure_job.ts#AdventureJob`, `apps/backend/app/models/adventure_turn.ts#AdventureTurn`, and `apps/backend/database/migrations/1784409600000_add_durable_adventure_turns.ts`                                                                                                                                                                                                                                                                                                                                                                                          | persistence  | Defines Adventure/turn/job relations, one-active-turn constraints, and durable turn-job ownership.                                |
| S2/R3                  | `apps/backend/app/services/story_generation/turn_prompt.ts#assertNarrationDoesNotReflectPrivateValues`, `apps/backend/app/services/story_generation/opening_prompt.ts#assembleOpeningPrompt`, `apps/backend/app/services/story_generation/adventure_state_extraction_prompt.ts#assembleAdventureStateExtractionPrompt`, `apps/backend/app/services/story_generation/development_debug_trace.ts#createDevelopmentDebugTrace`, `apps/backend/app/services/story_generation/turn_story_generator.ts#TurnStoryGenerator`, `apps/backend/app/services/story_generation/adventure_state_extractor.ts#AdventureStateExtractor`, and `apps/backend/app/services/story_generation/openai_compatible_adventure_state_extractor.ts#OpenAICompatibleAdventureStateExtractor` | adapter      | Defines opening/narration private-material safety, extraction contracts, local Debug capture, and bounded provider translation.                                    |
| S2/R4                  | `apps/backend/database/migrations/1784413200000_add_adventure_mutation_state.ts`, `apps/backend/app/services/adventure_creation_service.ts#AdventureCreationService.create`, `apps/backend/app/services/adventure_lifecycle_service.ts#AdventureLifecycleService.reset`, and `apps/backend/app/services/adventure_query_service.ts#AdventureQueryService.findForOwner`                                                                                                                                                                                                                                                                             | persistence  | Initializes and resets Adventure-owned state from frozen initial cards and projects current-Scene cards.                          |
| S2/R5                  | `apps/frontend/src/adventures/adventureApi.ts`, `apps/frontend/src/adventures/AdventureWorkbench.module.css`, and `apps/frontend/src/app/App.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | presentation | Defines client API types, responsive turn presentation, and the injected API boundary used by application and stories.            |
| S2/R5                  | `apps/frontend/src/adventures/AdventurePage.stories.tsx`, `apps/frontend/src/adventures/NewAdventurePage.stories.tsx`, `apps/frontend/src/comparison/Workbench.stories.tsx`, `apps/frontend/src/workspace/WorkspacePage.stories.tsx`, and `apps/frontend/src/worlds/WorldDetailPage.stories.tsx`                                                                                                                                                                                                                                                                                                                                                   | support      | Supplies shared Storybook states and mock API surfaces for the interactive workbench.                                             |

#### Implementation Gaps

- None. Database-backed turn/reset, live-provider, and Debug trace inspection remain verification gaps.
- Successful-turn Retry, rollback, branching, Story utilities, streaming, model controls, and multiplayer remain deferred rather than gaps in S2.

#### Verified By

| Requirement / Scenario                                                                                                                                                                                 | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                     | Proves                                                                                                                                                                                                                                                                                                                                                 | Status                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| S2/R1-S4, S2/R3-S1, S2/R3-S2, S2/R3-S3, S2/R3-S4, S2/R3-S5, S2/R4-S1, S2/R4-S2, S2/R4-S3                                                                                                               | `apps/backend/tests/unit/adventure_mutation_policy.spec.ts`, `apps/backend/tests/unit/story_generation/adventure_state_extractor.spec.ts`, `apps/backend/tests/unit/story_generation/adventure_turn_context.spec.ts`, and `apps/backend/tests/unit/adventure_opening_worker_port.spec.ts`                                                                                                                                                                                                     | Allowlist/rejection behavior, all-and-only current-Scene cards, off-scene exclusion, mutable card values, staged extraction, metadata-safe malformed output, and direct private-card reflection rejection before opening/turn publication.                                                                                                                                                                                       | Passing 2026-07-20                                                          |
| S2/R3-S6                                                                                                                                                                                               | `apps/backend/tests/unit/story_generation/development_debug_trace.spec.ts` and `apps/backend/tests/unit/story_generation/openai_compatible_story_generator.spec.ts`                                                                                                                                                                                                                                                          | Development-default capture, explicit disablement, production refusal, raw-toggle separation, redaction, owner-only permissions, expiry purge, and provider debug-context routing.                                                                                                                                                                                                        | Passing 2026-07-20 |
| S2/R5-S1, S2/R5-S2, S2/R5-S3, S2/R5-S4, S2/R5-S5                                                                                                                                                       | `apps/frontend/src/adventures/AdventureRoutes.test.tsx`, `apps/frontend/src/adventures/AdventureWorkbench.test.tsx`, `apps/frontend/src/adventures/tuyauAdventureApi.test.ts`, and `apps/frontend/src/test/renderTestApp.tsx`                                                                                                                                                                                                | Composer, Pass confirmation, private Guide messaging, polling, lifecycle states, completion announcement, responsive presentation, and typed client validation.                                                                                                                                                                                        | Passing 2026-07-19 (38 tests)                                               |
| S2/R5-S1, S2/R5-S2                                                                                                                                                                                     | Local development browser smoke at `/` plus frontend/backend lint and typechecks                                                                                                                                                                                                                                                                                                                                             | The normal API, both workers, and web client start together; the sign-in surface renders meaningful content with no framework overlay or console errors.                                                                                                                                                                                               | Passing 2026-07-19                                                          |
| S2/R1-S1, S2/R1-S2, S2/R1-S3, S2/R1-S4, S2/R1-S5, S2/R1-S6, S2/R2-S1, S2/R2-S2, S2/R2-S3, S2/R2-S4, S2/R2-S5, S2/R2-S6, S2/R3-S3, S2/R3-S4, S2/R4-S1, S2/R4-S2, S2/R4-S3, S2/R4-S4, S2/R4-S5, S2/R4-S6 | `apps/backend/tests/functional/adventure_turn_api.spec.ts`, `apps/backend/tests/functional/adventure_turn_submission_service.spec.ts`, `apps/backend/tests/functional/adventure_turn_worker.spec.ts`, `apps/backend/tests/functional/adventure_lifecycle_service.spec.ts`, `apps/backend/tests/database/adventure_aggregate_migration.spec.ts`, and `apps/backend/tests/database/adventure_mutation_state_migration.spec.ts` | API authorization/idempotency and retry/discard, worker lifecycle/finalization and non-publication on reflected Guide text, reset of player and every Adventure-owned NPC state after a completed turn, transactional state isolation, data-bearing rollback refusal, and migration invariants against a guarded disposable Neon schema.               | Passing 2026-07-19                                                          |
| S2/R1-S1, S2/R1-S2, S2/R1-S3, S2/R2-S1, S2/R2-S2, S2/R2-S3, S2/R2-S5, S2/R3-S3, S2/R4-S1, S2/R4-S2, S2/R4-S4, S2/R5-S1, S2/R5-S2, S2/R5-S3, S2/R5-S4                                                   | `apps/frontend/e2e/adventure-foundation.spec.ts` and `apps/frontend/e2e/fake-story-provider.mjs`                                                                                                                                                                                                                                                                                                                             | The seeded Adventure resolves Act, private Guide, and confirmed Pass through the real worker; reload while resolving and a same-owner concurrent tab preserve the one-active-turn invariant; failed turns retry or discard without changing Player/Scene; committed state updates, reset, owner isolation, and desktop/mobile layouts remain coherent. | Passing 2026-07-19 (3 projects)                                             |

#### Verification Gaps

- `S2/R3-S5`, `S2/R4-S2`: Guarded database-backed turn/reset proof is pending because disposable database configuration is absent; direct literal reflection is covered, but semantic paraphrase remains a live-provider evaluation limitation.
- `S2/R3-S6`: Live trace inspection is pending provider configuration; the local trace unit suite passes directly, while the safe aggregate backend wrapper remains blocked by missing disposable-database acknowledgement.
- All S2: live-provider Act/Guide quality and owner manual desktop/mobile confirmation remain intentionally pending; no raw prompt, Guide, or provider body will be retained as normal operational evidence.

#### Story Notes

- Failed, uncommitted turns may be retried with the same input or discarded; successful-turn Retry, rollback, and branching remain deferred.
- Raw Guide and prior action input remain private authoritative turn data; normal story context contains accepted narration and current structured state only.

### Story S3: Inspect Complete NPC Cards

Implementation: implemented
Verification: partial
Created: 2026-07-19
Modified: 2026-07-19
Last verified: 2026-07-20

As an Adventure owner, I want to open complete cards for NPCs in my current Scene, so that I can inspect the exact canon and mutable state guiding the story during development.

#### Requirements And Scenarios

##### Requirement R1: Complete Current-Scene NPC Cards

The system SHALL list every NPC in the current Scene and expose that NPC's complete frozen identity plus current Adventure-owned state.

###### Scenario R1-S1: Open A Present NPC Card

- WHEN one or more NPCs are present and the owner selects one
- THEN the Scene region shows key, name, physical description, background, personality, voice, private knowledge, current Location, mood, status, and memory
- AND clearly identifies the surface as development/debug information.

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

##### Requirement R3: Debug NPC State Editing

The system SHALL allow local Debug mode to autosave every bounded, displayable Adventure-owned NPC card field except its stable key: name, Location, physical description, background, personality, voice, private knowledge, mood, status, and memory.

###### Scenario R3-S1: Autosave Adventure-Owned State

- WHEN the owner changes a valid editable NPC card field while the Adventure is ready and no turn is pending or processing
- THEN Lorecraft saves the full bounded card overrides and mutable state to that Adventure's `adventure_character_states` row, uses those local values in the next turn's current-Scene context, and refreshes the authoritative Scene projection
- AND the frozen WorldVersion, World Character canon, starter seed, story history, and turn count remain unchanged.

###### Scenario R3-S2: Debug, Ownership, And Concurrency Boundary

- WHEN production, a non-owner, an unknown NPC, an invalid frozen Location or field value, or an Adventure with a pending or processing turn targets the Debug edit route
- THEN Lorecraft refuses the mutation without disclosing another Adventure or changing any persisted state.

###### Scenario R3-S3: Selected Editor Continuity After Location Move

- WHEN the owner autosaves an already selected Debug NPC card to a different valid frozen Location
- THEN that NPC is removed from fresh current-Scene selection but the existing editor remains usable to inspect, correct, or save its remaining card fields
- AND Back returns to the current Scene list with focus on the original entry when it remains present, otherwise on the Scene region.

#### Implemented By

| Requirement / Scenario | Location / Anchor                                                                                                                                                                                          | Kind         | Responsibility                                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| S3/R1                  | `apps/backend/app/services/adventure_query_service.ts#AdventureQueryService.findForOwner`                                                                                                                  | primary      | Projects only NPCs whose current Adventure-owned Location matches the player's Scene, with frozen identity and mutable state. |
| S3/R3                  | `apps/backend/app/services/adventure_npc_debug_state_service.ts#AdventureNpcDebugStateService.update` and `apps/backend/app/controllers/adventures_controller.ts#AdventuresController.updateNpcDebugState` | primary      | Refuses production, non-owner, invalid, and active-turn edits; persists only bounded Adventure NPC state.                     |
| S3/R1-R2, S3/R3-S3     | `apps/frontend/src/adventures/AdventureWorkbench.tsx#SceneRegion`                                                                                                                                          | primary      | Lists present NPCs, preserves an already selected Debug editor across its Location move without creating off-scene selection, and returns appropriate Scene focus.                   |
| S3/R3                  | `apps/frontend/src/adventures/AdventureWorkbench.tsx#NpcDebugEditor` and `apps/frontend/src/adventures/AdventurePage.tsx#AdventurePage`                                                                    | presentation | Exposes local-development-only debounced autosave controls and refreshes the authoritative Adventure detail.                  |
| S3/R2                  | `apps/frontend/src/adventures/AdventureWorkbench.tsx#SceneRegion`                                                                                                                                          | primary      | Keeps Scene drill-down, back navigation, focus return, and Story-first responsive interaction coherent.                       |
| S3/R2                  | `apps/frontend/src/adventures/AdventureWorkbench.module.css#sceneNpcs` and `apps/frontend/src/adventures/AdventurePage.stories.tsx#ReadyMobile`                                                            | presentation | Defines desktop/mobile Scene composition, empty state, and Storybook fixtures.                                                |

#### Implementation Gaps

- None. Authoritative post-turn refresh and deterministic E2E evidence remain verification gaps.

#### Verified By

| Requirement / Scenario                 | Evidence                                                                                                                               | Proves                                                                                                                                                                                  | Status                                            |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| S3/R1-S1, S3/R1-S2, S3/R2-S1, S3/R3-S1, S3/R3-S3 | `apps/frontend/src/adventures/AdventureWorkbench.test.tsx` and `apps/frontend/src/adventures/AdventurePage.stories.tsx#DebugNpcEditor` | Present-NPC list, complete-card selection/back behavior, local Debug autosave draft, selected-editor continuity after a Location move, editable-state disclosure, keyboard/mobile layout fixtures, and no horizontal overflow assertions. | Passing 2026-07-20                                |
| S3/R3-S1, S3/R3-S2                     | `apps/backend/tests/functional/adventure_npc_debug_state.spec.ts`                                                                      | Owner-only bounded Adventure-state persistence, frozen World/seed isolation, unchanged story revision/turn count, invalid-location refusal, and active-turn conflict.                   | Passing 2026-07-20 against a guarded direct disposable schema |
| S3/R1-S1, S3/R2-S1                     | Storybook `Application/Adventures/Workbench/ReadyDesktop` and `ReadyMobile`                                                            | Directly inspected desktop list and complete-card interaction in the rendered fixture; mobile Story-first tabs render without horizontal overflow.                                      | Partial 2026-07-19                                |

#### Verification Gaps

- `S3/R1-S3`, `S3/R2-S2`, `S3/R3-S1`, `S3/R3-S2`: Deterministic post-turn/reset refresh, long sparse card, and recovery confirmation remain pending; database-backed Debug-edit and owner-isolation evidence now passes.
- `S3/R1-S1`, `S3/R2-S1`: Storybook remounting prevented a stable screenshot after selecting the card; its full selected-card content was confirmed through the rendered accessibility tree, but a static rendered capture remains a verification limitation.

#### Story Notes

- Complete cards are intentionally exposed only to the Adventure owner during this development/debug stage; no raw prompt or model evidence is exposed.
- A selected NPC that leaves the Scene after an authoritative refresh is no longer selectable through the current-Scene list; its already open Debug editor remains available so the owner can correct or continue that local edit.

## Cross-Story Concerns

- World canon remains authoritative and immutable from Adventure runtime paths.
- Adventure data is private to its owner even when the source World is public.
- The AdonisJS backend owns authorization, lifecycle, source/state projection, prompt assembly, jobs, and provider adapters for every client.
- Completed narration and state transitions use immutable revision links so later Retry and rollback can be introduced coherently.
- S2 enforces one pending or processing resolving turn per Adventure in PostgreSQL while current story and state remain readable during resolution.
- S2 keeps accepted Player/NPC changes Adventure-owned, allowlisted, and recorded with immutable revision-linked outcomes; frozen WorldVersion canon remains unchanged.
- Raw prompt/model bodies are not retained as operational evidence; bounded metadata remains backend-owned and never part of the normal player API. Default-on local development Debug capture is a protected, explicitly disableable exception governed by the provider-boundary ADR.
- S2 treats raw Act/Guide input and Pass markers as private turn records, not normal story history or player-visible metadata.
- The active Character-authoring Change keeps complete current-Scene card contents out of model-call evidence while recording only bounded count and serialized-character-size metadata; Debug trace content stays local, default-on for development, explicitly disableable, redacted, and outside the model-call store.
- Complete debug-card disclosure is intentionally owner-only on Adventure surfaces; it does not change source-canon or cross-Adventure isolation.

## Open Decisions

- None block the active implementation. S3 remains partially verified; Story, `/look`, and `/help` remain candidate scope until their own promoted Change.

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
