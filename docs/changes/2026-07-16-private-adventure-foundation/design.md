# Design: Private Adventure Foundation

## Context

The official Lorecraft application has an AdonisJS API, PostgreSQL persistence, browser-session authentication, a React/Vite client, typed Tuyau contracts, and a read-only relational World catalog. Stormbound Chapel currently contains Locations and Characters but no version, Starting Point, Adventure guidance, or playable runtime. A Storybook-only Adventure workbench prototype provides visual direction but has no production behavior.

The accepted World/Adventure isolation ADR requires each Adventure to begin from explicit frozen canon and keep all later state separate. The resolved Adventure exploration also requires slow model work to survive reloads, preserve provider-neutral orchestration, and leave room for immutable turn revisions. Implementing the complete Act/Pass/Story/Guide and mutation loop at once would mix several user paths and make failures difficult to isolate. This Change therefore ends at the first stable decision point: a generated opening is committed, the Adventure is resumable, and future turn controls have a reliable source and root revision.

## Goals / Non-Goals

**Goals:**

- Let an authenticated account start a private Adventure from an accessible playable World.
- Require a player name and accept optional physical description and backstory.
- Bind the Adventure to an immutable WorldVersion and versioned default Starting Point.
- Generate and atomically publish one opening narration from creator-authored guidance and premise.
- Make pending work recoverable across reloads and worker restarts.
- List, resume, reset, and delete only the current account's Adventures under the source World.
- Render opening story, Player context, and initial Scene context at a durable Adventure URL.
- Establish a root Adventure revision and durable model-call evidence for later turns and rollback work.

**Non-Goals:**

- Resolving player turns or exposing Act, Pass, Story, Guide, `/look`, or `/help` controls.
- State extraction or Game Master mutation of player, NPC, or Location state.
- Multiple Starting Points, dates, model selection, streaming, sharing, or multiplayer.
- World authoring or version-management UI.
- Retry of successful narration, rollback, branching, or WorldVersion upgrades.
- Recreating the archived MVP UI exactly.

## Planning Interview / Story Refinement

- Scope boundary reviewed: the resolved core Adventure exploration is intentionally split into staged user paths; this Change owns start, opening, resume, reset, and delete only.
- User decisions: private frozen copies, explicit WorldVersion, default Starting Point, Adventure-owned player, creator-authored premise, Game Master-rendered opening, durable async work, provider-neutral backend, and no transcript-only mode.
- Assumptions: player name is the initial list identity; reset preserves the creation profile; one automatic opening retry is sufficient before exposing manual retry.
- Deferred scope: all resolving turn controls, utilities, extraction, mutation, and history editing.
- Story boundaries challenged: versioning, jobs, model calls, and UI are enabling parts of one start/resume path, not separate Stories. Turn controls are a different user path and remain candidates.
- Requirements refined: creation, source isolation, opening lifecycle, ownership, reset/delete, UI state, and recovery are observable independently.
- Scenario gaps considered: inaccessible World, unplayable World, duplicate submission, anonymous/other-account access, pending reload, stale worker lease, provider failure, reset during pending work, and source updates after creation.
- Open questions that block implementation: none.

## Epic Changes

### Create Epic: LC-003 Adventure Play

- Proposed directory: `docs/epics/lc-003-adventure-play/`
- Proposed file: `docs/epics/lc-003-adventure-play/epic.md`

#### Epic

Lorecraft accounts can enter an authorized World's canon through private, isolated Adventures, shape a narrative with the Game Master, and return later without their story changing source canon or another player's reality.

#### Candidate Stories

| Candidate | Status | Story Shape | Acceptance Signals |
|---|---|---|---|
| `resolve-structured-turns` | proposed | As a player, I want Act, Pass, and Guide to resolve durable Game Master turns, so that I can advance my Adventure. | Atomic async generation and extraction, one active turn, revision links, and context rules are proven. |
| `shape-and-inspect-story` | proposed | As a player, I want Story, `/look`, `/help`, and persistent context panels, so that I can shape and understand the Adventure before ending a turn. | Utility visibility/context exclusion and Player/Scene knowledge filtering are proven. |
| `revise-adventure-history` | deferred | As a player, I want to Retry, roll back, or branch from a completed turn, so that I can revise my story safely. | Complete state restoration and immutable history semantics are defined and proven. |

#### Story S1: Start And Resume A Private Adventure

As a signed-in account holder, I want to start and resume a private Adventure from an accessible World, so that I can enter stable canon as my own player character.

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

The system SHALL present creation, pending, failure, ready, reset, delete, and resume states through an accessible responsive interface.

###### Scenario R5-S1: Create And Pending States

- WHEN the account starts an Adventure at desktop or mobile width
- THEN required and optional player fields, submission progress, and pending Game Master status remain readable and keyboard operable
- AND repeated submission is prevented without relying only on client state.

###### Scenario R5-S2: Ready Adventure

- WHEN opening generation completes
- THEN the Adventure route clearly distinguishes story, Player context, and Scene context without horizontal overflow
- AND the generated opening is the primary reading focus.

###### Scenario R5-S3: Recoverable And Destructive Actions

- WHEN an opening fails, reset is unavailable during active work, or delete/reset requires confirmation
- THEN the UI presents the correct retry, conflict, or confirmation behavior
- AND focus and status announcements remain coherent after the action.

##### Implemented By

Not implemented yet. Expected ownership starts in backend World/Adventure models and services, authenticated v1 routes/controllers/validators, provider and worker services, frontend World/Adventure feature modules, and deterministic test support.

##### Verified By

Not verified yet. The implementing Change must replace this section with scenario-mapped backend, frontend, Storybook, E2E, live-provider, and manual UI evidence.

##### Verification Gaps

- All implementation and verification are pending.

### Update Epic: LC-002 World Bible Catalog

- Target Epic: `docs/epics/lc-002-world-bible-catalog/epic.md`
- Change Type: modified deferred-scope ownership only

#### Story Changes

- Added: none.
- Modified: none.
- Removed: none.

#### Supersedes / Reconciles

- Replace the broad deferred phrase `Adventures and all mutable gameplay state` with a link to `LC-003 Adventure Play`; leave World catalog Requirements and evidence unchanged.
- No prior `Verified By`, `Verification Gaps`, closed Change, or manual confirmation claims require reclassification.

## Technical Options

### Option 1: Immutable JSONB WorldVersion Snapshot With Relational Adventure State

- Summary: Compile the validated relational World aggregate into one immutable version snapshot; let Adventures reference it and store mutable state relationally.
- User impact: Stable Adventures with exact reset semantics and no visible version-management burden.
- Implementation complexity: Moderate; requires snapshot schema/version validation and explicit publication.
- Reversibility: High; snapshots can later be projected into normalized version tables without changing Adventure identity semantics.
- Client surfaces: World playability, creation, list, Adventure lifecycle, and opening states.
- API / contract shape: Typed HTTP DTOs expose identifiers and filtered views, never raw snapshot JSON.
- Frontend/backend boundary: Backend owns publication, authorization, job lifecycle, prompt assembly, and source/state projection.
- Data / schema impact: Adds Starting Points, WorldVersions, Adventures, players, jobs, calls, root revisions, and story entries.
- Auth / security impact: Adventure reads and writes are owner-only; prompts and private Character knowledge remain server-side.
- Testability: Snapshot fixtures and fake provider adapters make isolation and async behavior deterministic.
- Operational risk: Snapshot schema evolution and job leasing require explicit handling.
- Fit with project conventions: Preserves the accepted relational authoring aggregate while using JSONB only as an immutable boundary document.

### Option 2: Fully Normalized Versioned World Tables

- Summary: Duplicate each World-owned table into version-specific Location, Character, and Starting Point tables.
- User impact: Same frozen behavior.
- Implementation complexity: High; every new canonical concept requires parallel authoring and version schemas, publication logic, relations, and queries.
- Reversibility: Moderate; migrations are explicit but broad.
- Client surfaces: Same as Option 1.
- API / contract shape: Same external API with more internal joins.
- Frontend/backend boundary: Same ownership split.
- Data / schema impact: Several parallel version tables immediately.
- Auth / security impact: Comparable to Option 1.
- Testability: Strong relational constraints but a much larger fixture matrix.
- Operational risk: Schema drift between mutable and versioned aggregates.
- Fit with project conventions: Relationally pure, but models more structure than current product behavior justifies.

### Option 3: Full World Copy Per Adventure

- Summary: Copy all source World rows into Adventure-owned tables at creation.
- User impact: Frozen behavior is intuitive, but large Worlds make creation and storage expensive.
- Implementation complexity: Initially direct, then high as every concept and relationship needs copy logic.
- Reversibility: Low; shared source identity and explicit version provenance are harder to recover.
- Client surfaces: Same visible workflow.
- API / contract shape: Adventure reads can be simple but canon provenance becomes diffuse.
- Frontend/backend boundary: Same ownership split.
- Data / schema impact: Duplicates stable canon for every Adventure.
- Auth / security impact: Larger private data footprint.
- Testability: Copy completeness becomes a broad recurring burden.
- Operational risk: Storage growth and incomplete copies as the World model evolves.
- Fit with project conventions: Conflicts with the accepted immutable-source-reference direction.

## Selected Approach

Use Option 1. The current relational World remains authoring truth. A publication service serializes a schema-versioned, validated snapshot with a deterministic content hash into an immutable `world_versions` record and marks it as the World's current playable version. The Stormbound Chapel seed owns its initial Adventure guidance and Starting Point and invokes publication after canonical reconciliation. Identical content reuses the existing version; changed content creates a new one. Normal application startup never seeds or publishes canon.

Adventure creation is one transaction that validates World access and playability, enforces an owner-scoped creation request identifier, inserts the private Adventure and player profile, initializes the starting Location, and queues one opening job. It returns promptly and the client navigates to the durable Adventure route. A separately runnable worker claims jobs with PostgreSQL row locking plus an expiring lease, calls a provider-neutral `StoryGenerator`, records redacted model-call evidence, and atomically creates the root revision and opening story entry before marking the Adventure ready. One transient retry is automatic; terminal failure remains resumable through an owner-only retry action.

The first root revision has no parent and represents the generated opening. Later Changes append immutable turn revisions rather than redesigning this foundation. Adventure reads project frozen snapshot data plus Adventure-owned player state; raw snapshots and private prompt evidence never cross the normal player API.

## Data And Lifecycle Design

### Canonical Source

- Add creator-authored `adventureGuidance` to the World aggregate.
- Add relational `world_starting_points` with stable key, name, Location, opening premise, ordering, and default status.
- Add `world_versions` with UUID, World ownership, ordinal, snapshot schema version, deterministic content hash, immutable JSONB snapshot, and creation timestamp.
- Add a current-version reference from World to WorldVersion and enforce that the referenced version belongs to the same World.
- Snapshot content includes only canonical World fields required by Adventure play: World metadata and guidance, ordered Locations, ordered Characters including private knowledge, and ordered Starting Points.
- Treat published snapshots as insert-only. Corrections create a new version; no normal update/delete path is exposed.

### Adventure Aggregate

- `adventures`: UUID, owner, source World, WorldVersion, Starting Point key, lifecycle status, owner-scoped creation request ID, turn count, last-played timestamp, current revision, and timestamps.
- `adventure_players`: one-to-one player profile with name, physical description, backstory, current status, and current Location stable key.
- `adventure_revisions`: immutable sequence, optional parent revision, revision kind, and timestamp. Opening creates sequence zero.
- `adventure_story_entries`: immutable revision-linked visible prose with stable ordering and entry kind.
- `adventure_jobs`: durable job type, status, attempt count, availability, lease owner/expiry, error classification, and timestamps.
- `model_calls`: operation, redacted request, raw response, provider identity, model, settings, status, timing, retry relationship, and failure metadata. API keys and authorization headers are never persisted.
- Enforce World/WorldVersion ownership and owner/idempotency invariants in PostgreSQL where practical; validate snapshot stable-key references in backend services.

### Status Transitions

```text
creation transaction -> opening_pending
opening_pending -> opening_processing -> ready
opening_processing -> opening_pending      (transient retry or expired lease)
opening_processing -> opening_failed       (terminal failure)
opening_failed -> opening_pending           (owner retry)
ready/opening_failed -> opening_pending     (owner reset)
any owned state -> deleted                  (owner delete)
```

- Reset returns conflict while opening work is active.
- Worker finalization checks the claimed job and Adventure status so stale workers cannot publish after retry, reset, or deletion.
- `lastPlayedAt` changes when the owner opens a ready Adventure and later when a turn commits; polling pending status does not continually rewrite it.
- `turnCount` remains zero for the opening root revision.

## API Contract

- Extend `GET /api/v1/worlds/:slug` with playability and only the current account's Adventure summaries.
- Add `POST /api/v1/worlds/:slug/adventures` with Vine validation for creation request ID and player profile; return the Adventure summary and durable URL.
- Add `GET /api/v1/adventures/:id` for owner-filtered lifecycle, frozen source identity, player, scene, and visible story projection.
- Add `POST /api/v1/adventures/:id/opening/retry` for terminal opening failure.
- Add `POST /api/v1/adventures/:id/reset` for ready or failed Adventures with no active work.
- Add `DELETE /api/v1/adventures/:id` for owner-confirmed deletion.
- Protect every mutation with existing cookie-session, CSRF, authentication, and request-boundary middleware.
- Return `404` for inaccessible World/Adventure resources, `409` for unplayable or busy lifecycle conflicts, and `422` for invalid profile input.
- Extend the existing Tuyau typed alternative rather than introducing a parallel client contract. Validate runtime response shapes before presentation.

## Game Master Boundary

- Define a backend-owned `StoryGenerator` interface whose input is a structured opening request and whose result is non-empty narration plus provider metadata.
- Implement one OpenAI-compatible adapter configured by server environment (`LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`, timeout, and bounded generation settings).
- Build the opening request from platform instructions, frozen World guidance, Starting Point premise, player profile, starting Location, and Characters initially present.
- Do not ask the model to infer state or return JSON in this Change.
- Use dependency injection so tests can supply deterministic success, delay, invalid-output, and failure adapters.
- Run the worker as an explicit process in development, test, and deployment. The root development command must start frontend, API, and worker together so normal local startup cannot silently omit Adventure processing.

## Experience Design

- Applicability: required and design-ready.
- Confirmed direction: adapt the checked-in Adventure workbench into a production three-region Player / Story / Scene shell on desktop and a Story-first tabbed shell on mobile. Add World-contained discovery, a dedicated creation route, and explicit pending, failure, ready, reset, and delete behavior without exposing deferred turn controls.
- User confirmation: Taylor confirmed the experience direction one decision at a time on 2026-07-16. Final implementation appearance remains subject to manual UI confirmation.
- Reference artifacts:
  - `apps/frontend/src/prototypes/adventure/AdventureWorkbenchPrototype.tsx`
  - `apps/frontend/src/prototypes/adventure/AdventureWorkbenchPrototype.module.css`
  - Storybook IDs `prototypes-adventure-workbench--desktop-center-anchored`, `--desktop-generating`, `--mobile-story`, `--mobile-player`, and `--mobile-scene`
  - `apps/frontend/src/worlds/WorldDetailPage.tsx` and `WorldDetailPage.module.css`
  - `docs/style-guide.md`
- Prototype exclusions: the current composer, Act/Story/Guide/Pass controls, Director observation, change badges, editable Player data, and spoiler-bearing NPC personality/memory fields are not production requirements for this Change.

### User Flow And Information Architecture

1. The account opens a World detail page and sees a compact `Adventures` section before canonical Locations and Characters.
2. Each Adventure row uses player name as its primary label and shows lifecycle status, `0 turns`, and last-played time. The row resumes the Adventure; a separate delete icon opens confirmation.
3. `New Adventure` is the section action and opens `/worlds/:slug/adventures/new` rather than a modal.
4. The creation page preserves World identity and presents required player name, optional physical description, optional backstory, `Start Adventure`, and `Cancel`.
5. Accepted submission immediately navigates to `/adventures/<id>`. The real Player and Scene regions are already populated while the Story region shows a restrained Game Master preparation state.
6. A ready Adventure replaces only the Story loading state with the generated opening. This Change renders no composer, disabled action controls, or future-feature explanation.
7. Terminal generation failure preserves Player and Scene context while the Story region presents a clear failure, `Try Again`, and `Return to World`. No partial narration appears.
8. Delete remains in the World Adventure list. Reset remains in the selected Adventure's compact header menu and is never combined with source-World controls.

### Responsive Composition

- Desktop keeps persistent Player, Story, and Scene regions, with Story visibly wider and primary. Each region may scroll independently so long content does not move navigation or obscure the opening.
- Mobile uses a persistent top tab bar ordered Story, Player, Scene. Story is selected by default; arrow-key behavior follows the existing tab prototype. No Scene change badge appears until context can mutate.
- The same pending, failure, and ready states occupy the Story region on both layouts; Player and Scene remain available throughout.
- Narrow desktop and tablet widths must not squeeze three unreadable columns. They may adopt the mobile tab composition at the implementation's tested breakpoint.
- Loading, error, confirmation, and long-content states must not cause horizontal overflow or incoherent layout shifts.

### Component And State Contract

- World detail owns Adventure discovery, resume, creation navigation, and confirmed deletion, not Adventure runtime logic.
- The dedicated creation page owns form validation, cancellation, and one idempotent submission. It does not offer model or Starting Point controls.
- The Adventure shell owns a compact top navigation with Lorecraft/World identity, `Return to World`, and an Adventure menu containing `Reset Adventure`. Exact top-navigation polish may receive another design pass without changing this contract.
- Player is read-only after creation and shows name, optional physical description, optional backstory, current status when meaningful, and starting Location.
- Scene is read-only and shows the starting Location name, player-visible description, and NPCs present by name and physical description only. It excludes background, personality, voice, private knowledge, memory, and NPC detail interaction.
- Story renders authoritative `opening_pending`, `opening_processing`, `opening_failed`, or `ready` state. Pending and failure never reveal partial narration.
- No inactive composer, disabled turn controls, `/look`, or NPC inspection affordance is rendered before those behaviors are accepted by a later Change.
- React Query keys remain account-scoped and are invalidated after creation, retry, reset, and delete.
- Polling runs only for pending/processing Adventures and stops on ready, failed, missing, unauthorized, or unmount.

### Accessibility And Interaction

- Labels distinguish required and optional fields; validation associates errors with inputs and preserves entered values after rejected submission.
- Submission, pending, completion, and terminal failure use restrained live-region announcements without repeatedly announcing each poll.
- Desktop regions and mobile tab panels use meaningful landmarks and headings; mobile tabs support click/touch plus Left, Right, Home, and End keyboard behavior.
- Retry restores focus to the Story status region when work restarts. Reset/delete confirmations return focus to their trigger when cancelled and choose a safe destination after completion.
- Row navigation and the adjacent delete icon remain separate keyboard targets with unambiguous accessible names.
- Destructive buttons are explicit and visually distinct without relying on color alone.
- Keyboard, visible focus, reduced motion, contrast, and touch targets follow the app's existing accessibility and responsive gates.

### Visual Direction

- Follow `docs/style-guide.md`: Zinc foundation, Burnished Orange identity/action/focus, and Deep Steel Blue only for semantic information.
- Preserve the prototype's story-first reading hierarchy and restrained game-workbench character. The generated opening uses the narrative type treatment; supporting UI remains compact Geist/Geist Mono.
- Keep panels structurally clear without decorative card stacking, oversized rounding, or marketing composition.
- Treat the prototype as selected composition evidence, not production code to copy wholesale. Production components must use real state and remove prototype-only behavior.

### Open Design Questions

- No design blocker remains.
- Accepted deferral: exact top-navigation visual cleanup may receive a later `/sdd-design` refinement. Implementation must still provide the confirmed identity, return navigation, Adventure menu, responsive behavior, and accessibility semantics now.

## Client And API Boundary

- Current clients: React/Vite web client.
- Plausible future clients: native mobile, creator tools, and external integrations.
- Reusable product capabilities: create/list/read/reset/delete Adventure, publish/select WorldVersion, inspect lifecycle, and process opening work.
- API or typed contract: authenticated `/api/v1` JSON routes with Vine validators and Tuyau-generated types plus runtime response validation.
- OpenAPI plan, if HTTP-facing: continue the accepted typed Tuyau alternative for this Change; reassess OpenAPI when external/non-TypeScript clients become active.
- Backend platform exposed directly to clients?: no; React calls only Lorecraft's Adonis API.
- Client-specific presentation or local state: form draft, selected responsive pane, confirmation visibility, polling cadence, and focus restoration.
- Rationale: ownership, frozen-source semantics, prompt assembly, async lifecycle, and reset/delete rules must be shared across future clients.

## Alternatives Considered

- Implement the entire core Adventure loop now:
  - Rejected for this Change because async turns, extraction, mutation, utilities, and history would obscure whether frozen creation and opening recovery work correctly.
- Display the creator-authored premise directly without a model call:
  - Rejected because the accepted experience makes the Game Master render the premise for the specific player character.
- Hold the creation request open until narration returns:
  - Rejected because slow local and remote models make reloads, timeouts, and process restarts normal conditions.
- Queue an in-memory promise:
  - Rejected because work would be lost on restart and could not be serialized or inspected safely.
- Copy all World rows into each Adventure:
  - Rejected because it scales poorly and weakens explicit source-version provenance.

## Why This Approach

This is the smallest staged Change that proves the official product's defining Adventure guarantees rather than merely adding database tables. A user can enter canon, receive generated story, leave, and return. At the same time, the immutable source, root revision, async job, provider adapter, and owner boundary prevent the next Change from rebuilding the foundation under live turn behavior.

## ADRs

- Required: yes
- ADR path: `docs/adrs/2026-07-16-immutable-world-version-snapshots.md`
- Decision summary: preserve relational World authoring while publishing schema-versioned immutable JSONB snapshots for Adventure source semantics.
- Reconsider when: snapshots become too large to validate/load efficiently or targeted historical queries require normalized version projections.
- ADR path: `docs/adrs/2026-07-16-durable-asynchronous-adventure-work.md`
- Decision summary: persist model work and process it through a separately runnable leased worker; polling is the first delivery mechanism.
- Reconsider when: a managed queue materially improves operations without weakening database-authoritative Adventure status or local-model support.
- Existing ADR update: add this Change and implementation evidence to `2026-07-14-world-canon-and-adventure-isolation.md` without changing its accepted decision.

## Implementation Constraints

- Promotion documentation is complete on `develop`; create a clean `change/private-adventure-foundation` branch before editing application code.
- Do not mutate, replace, or delete an existing WorldVersion through normal application or seed paths.
- Do not expose snapshot JSON, private Character knowledge, raw prompts, raw model output, provider credentials, or another account's Adventure through normal APIs.
- Do not run World seeding or publication automatically during server startup.
- Keep provider-specific HTTP and response parsing behind the `StoryGenerator` adapter.
- Keep lifecycle state authoritative in PostgreSQL; browser state and worker memory are never the lock authority.
- Ensure normal `npm run dev` starts the Adventure worker and normal test/CI commands use deterministic provider behavior.
- Preserve existing account-scoped query cache and CSRF/authentication conventions.

## Verification Strategy

- Focused automated tests:
  - Migration and database invariants for immutable version provenance, same-World references, owner/idempotency uniqueness, cascade boundaries, and safe upgrade/downgrade.
  - Seed/publication tests for stable content hashes, repeat reconciliation, changed-content version creation, default Starting Point, and no Adventure mutation.
  - Service tests for creation atomicity, snapshot isolation, reset/delete, job claiming, lease expiry, retry, stale-worker rejection, and atomic opening commit.
  - Provider adapter tests for request construction, timeout, invalid/empty output, redaction, and normalized failures.
  - Functional API tests for authentication, CSRF, owner-only access, non-disclosing errors, validation, conflicts, and minimized DTOs.
  - Frontend API and component tests for runtime validation, account-scoped caching, form errors, polling stop conditions, retry/reset/delete, and focus/status behavior.
- Broad supporting gates:
  - Repository CI/CD commands for lint, typecheck, unit/functional tests, build, Storybook build/test, and database safety.
- Deterministic E2E:
  - Start from a disposable database and deterministic fake OpenAI-compatible endpoint; create an Adventure, reload while pending, observe one opening, resume it, reset it to the same version, delete it, and verify cross-account isolation at desktop and mobile widths.
  - Ensure E2E cleanup removes created Adventures and does not leave test records in the shared development database.
- Live-provider or external-service playtests:
  - With local or configured compatible model, confirm the opening uses the premise, player profile, Location, and present Characters without leaking raw instructions or inventing a different starting setup.
- Manual UI confirmation:
  - User confirms World-contained discovery, creation form, pending/recovery states, ready story hierarchy, Player/Scene readability, reset/delete placement, desktop/mobile behavior, and no overflow.
- Debug/log inspection:
  - Confirm one correlated opening unit records redacted request, raw response, model/settings, retries, timing, and final outcome; confirm API keys/base authorization are absent.

## Decisions

- Use a validated immutable JSONB snapshot for each WorldVersion while keeping canonical authoring relational.
- Treat the default Starting Point as versioned canon and the opening narration as Adventure-owned generated story.
- Use UUID Adventure identifiers in external URLs.
- Use owner-scoped idempotency for Adventure creation.
- Establish a root revision for the opening even though completed player turns are deferred.
- Use durable PostgreSQL jobs with leases and one automatic retry; expose owner retry only after terminal failure.
- Use polling first and no streaming in this Change.
- Keep the player profile as a distinct one-to-one Adventure-owned record.
- Preserve the player's creation profile across reset while resetting generated story, current status, and Location to the same frozen start.
- Continue using the existing Tuyau typed API approach.

## Risks / Trade-Offs

- Snapshot JSONB weakens database-level foreign keys inside frozen content; publication-time validation and schema versioning must compensate.
- A durable worker adds a required process to development and deployment; startup and health documentation must make omissions obvious.
- Storing raw model content improves diagnosis but creates sensitive private data; owner APIs must not expose it and retention policy remains future work.
- The first Change ends before the player can submit a turn. This is intentional staging, but the next Adventure Change should implement the complete Act/Pass/Guide turn path rather than fragmenting controls into separate technical batches.
- Polling is operationally simple but less responsive than push delivery; persisted status keeps a later transport change reversible.
