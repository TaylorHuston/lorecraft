# Design: Interactive Adventure Turns

## Context

The production application currently creates an owner-only Adventure from an immutable WorldVersion, generates one opening through a durable leased PostgreSQL job, records a root revision, and renders a responsive Player / Story / Scene workbench. `LC-003/S1` intentionally stops before player interaction.

The archived MVP demonstrated Act, Pass, Guide, Story, utilities, context assembly, movement, NPC state extraction, and debugging. Its behavior is reference evidence rather than code to port: the production app uses AdonisJS, PostgreSQL/Neon, immutable revisions, metadata-only AI evidence, and durable asynchronous workers. The resolved Adventure exploration and current LC-003 candidate split identify Act/Pass/Guide plus bounded state mutation as the next coherent user path.

## Goals / Non-Goals

**Goals:**

- Give a ready Adventure one complete Act, Pass, or Guide resolving-turn path.
- Preserve a linear, owner-only, reload-safe turn history with one active resolving turn per Adventure.
- Separate creative narration from structured extraction and application-owned mutation validation.
- Commit narration, accepted consequences, turn count, and head revision atomically.
- Keep current Player/Scene reads efficient while retaining immutable mutation provenance.
- Preserve metadata-only provider evidence and avoid exposing hidden Guide input or private frozen canon.
- Reuse the accepted responsive Adventure workbench and make pending, failure, recovery, and completion accessible.

**Non-Goals:**

- Story inserts, `/look`, `/help`, or general command parsing.
- Successful-turn Retry, rollback, branching, or full per-revision state snapshots.
- Streaming or push transport, player model controls, or a debug viewer containing raw prompts/responses.
- New World entities, source-canon mutation, player-authored canon, or cross-Adventure effects.
- Rules systems, dice, combat, inventory, statistics, quests, progression, multiplayer, or sharing.

## Planning Interview / Story Refinement

- Scope boundary reviewed: the immediate next phase is the resolving-turn core, not the full spike interaction set.
- User decisions: Taylor approved Act, Pass, and Guide now, with Story inserts and utilities following later.
- Assumptions: failed turns can be retried or discarded; the configured provider may serve both model operations through distinct interfaces; polling remains acceptable.
- Deferred scope: Story, `/look`, `/help`, history revision controls, streaming, debug UI, rules, and multiplayer.
- Story boundaries challenged: `LC-003/S2` has more Scenarios than a typical Story, but they all govern one primary player path from submitting an action through receiving one committed turn. Splitting generation, extraction, mutation, or pending UI into separate Stories would create technical slices that are not independently valuable and would permit partial play behavior.
- Requirements refined: resolving actions, durable serialized lifecycle, context/provider separation, bounded consequences, and coherent workbench states.
- Scenario gaps considered: invalid input, authorization, idempotency, concurrent tabs, reload/restart, provider and extraction failure, retry/discard, stale workers, optional NPC absence, invalid mutation proposals, source isolation, reset, responsive behavior, focus, and assistive announcements.
- Open questions that block implementation: none.

## Epic Changes

### Update Epic: Adventure Play

- Target Epic: `docs/epics/lc-003-adventure-play/epic.md`
- Change Type: added scope

#### Story Changes

- Added: `LC-003/S2`, Resolve A Structured Game Master Turn.
- Modified: `LC-003/S1` only where reset and Adventure-detail projections must include the new mutable state while preserving its accepted behavior.
- Removed: none.

#### Story S2: Resolve A Structured Game Master Turn

As a player, I want Act, Pass, or Guide to resolve a durable Game Master turn, so that my private Adventure can progress through narration and bounded persistent consequences.

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

##### Implemented By

Not implemented yet.

##### Implementation Gaps

Not implemented yet.

##### Verified By

Not verified yet.

##### Verification Gaps

- Implementation and verification are pending.
- Live-provider narrative quality and production-path turn completion require manual acceptance after deterministic behavior passes.

#### Supersedes / Reconciles

- Promote the `resolve-structured-turns` candidate into `LC-003/S2`; remove Act, Pass, Guide, state extraction, and Game Master mutation from LC-003 Deferred Scope.
- Keep Story, `/look`, and `/help` under the `shape-and-inspect-story` candidate.
- Update `LC-003/S1` implementation/evidence maps only for reset and detail-projection behavior touched by the new state model; do not rewrite its accepted opening behavior.
- Preserve the 2026-07-18 metadata-only evidence and production acceptance decisions from the closed audit-hardening Change.
- Manual confirmation status expected: pending user until the completed turn workbench is reviewed at desktop and mobile widths.

## Technical Options

### Option 1: Immutable Mutations Plus Materialized Current State

- Summary: append revision-linked accepted/rejected mutation records while updating normalized current player/NPC state atomically.
- User impact: fast current Player/Scene reads, durable linear history, and no visible partial result.
- Implementation complexity: moderate; requires turn, NPC-state, and mutation persistence plus transactional reconciliation.
- Reversibility: high at the application layer; future snapshots can be added without replacing the mutation history.
- Client surfaces: existing React Adventure route through typed AdonisJS endpoints.
- API / contract shape: create/retry/discard turn mutations plus Adventure detail active-turn projection.
- Frontend/backend boundary: backend owns action validation, context, orchestration, mutation policy, and state; frontend owns input draft/mode, polling, confirmation, and focus.
- Data / schema impact: new turn, Adventure Character state, and revision mutation records; extend durable job type/linkage and constraints.
- Auth / security impact: owner-filtered non-disclosing access; hidden Guide and private canon stay server-side; metadata-only model evidence remains enforced.
- Testability: strong through pure mutation policy tests, transactional service tests, fake provider operations, and deterministic E2E.
- Operational risk: expands worker duration and model calls per turn; existing leases, cancellation, retry, and monitoring patterns remain applicable.
- Fit with project conventions: best fit with accepted immutable revision, PostgreSQL authority, and API-first boundaries.

### Option 2: Full State Snapshot Per Completed Revision

- Summary: store a complete Adventure state JSON snapshot for every successful turn and make that snapshot the read authority.
- User impact: similar immediate behavior and easier future rollback reads.
- Implementation complexity: moderate initially, but snapshot schema evolution and validation expand quickly.
- Reversibility: lower once snapshots become the primary runtime contract.
- Client surfaces: unchanged.
- API / contract shape: unchanged externally.
- Frontend/backend boundary: unchanged.
- Data / schema impact: repeated JSONB state plus versioning and validation requirements.
- Auth / security impact: duplicates private state and increases retention surface.
- Testability: snapshot comparison is simple, but schema migration and mixed-version evidence become mandatory.
- Operational risk: storage duplication and harder partial projections.
- Fit with project conventions: compatible with WorldVersion snapshots but premature for mutable Adventure state; the accepted revision ADR explicitly leaves snapshots for later restoration acceleration.

### Option 3: Mutable State Without Revision-Linked Mutations

- Summary: update current Player/NPC rows and store only completed narration.
- User impact: supports immediate turns but makes future Retry/rollback/branching and diagnosis unreliable.
- Implementation complexity: lowest now.
- Reversibility: poor after history exists because missing mutation provenance cannot be reconstructed safely.
- Client surfaces: unchanged.
- API / contract shape: unchanged externally.
- Frontend/backend boundary: unchanged.
- Data / schema impact: fewest new tables.
- Auth / security impact: smaller storage surface, but weaker auditability.
- Testability: current state is testable; historical correctness is not.
- Operational risk: partial updates and unknown lineage drift are harder to detect.
- Fit with project conventions: conflicts with the accepted immutable Adventure revision decision.

## Selected Approach

Use Option 1. Add an Adventure-owned turn record with portable request identity, trigger, bounded input, lifecycle, source revision, and resulting revision. Extend the durable job system with explicit turn work linked to that turn and enforce one pending/processing resolving turn per Adventure in PostgreSQL. Keep prior story and state readable while work proceeds.

Add Adventure-owned mutable state for frozen Characters, initialized from the WorldVersion on Adventure creation/reset. Stable Character and Location material remains in the WorldVersion snapshot; current Location, mood, status, and summarized memory live in normalized Adventure state. Keep the existing Adventure player record for player state. Record each accepted or rejected structured proposal as bounded revision-linked application data. A successful transaction validates the claim and source head, appends the turn revision and narration, stores proposal outcomes, updates current state, advances the head, increments `turn_count`, and completes the turn/job together.

Define separate backend `TurnStoryGenerator` and `AdventureStateExtractor` contracts. They may share the existing OpenAI-compatible transport/configuration but use independent prompts, response validation, evidence operations, and retry classification. Extraction returns an allowlisted schema; pure application policy resolves proposals against the current frozen and Adventure-owned state before persistence. Provider bodies never become database or log evidence.

Expose typed owner-only routes to submit, retry, and discard a turn. Extend Adventure detail with active/most-recent failed turn state and the chronological active-lineage story projection. The React client uses account-scoped TanStack Query mutation/polling patterns already established for openings.

## Experience Design

- Applicability: required and implementation-ready from accepted references.
- Confirmed direction: extend the accepted Story-first workbench with a compact bottom composer that makes Act the normal mode, Guide an explicit hidden-direction mode, and Pass a deliberate action. Preserve readable prior story during pending and failure states.
- User confirmation: Taylor approved the Act/Pass/Guide phase boundary on 2026-07-18. Final appearance and interaction remain subject to manual UI confirmation.
- Reference artifacts:
  - `apps/frontend/src/adventures/AdventureWorkbench.tsx` and `AdventureWorkbench.module.css`
  - `apps/frontend/src/prototypes/adventure/AdventureWorkbenchPrototype.tsx` and its Act/Guide/Pass composition
  - archived MVP `src/features/play/world-client.tsx` behavior as interaction evidence only
  - `docs/style-guide.md`

### User Flow And Information Architecture

1. A ready Adventure shows its existing story and context with Act selected in the Story composer.
2. The player types intent and submits Act, chooses Guide to submit hidden one-turn direction, or confirms Pass without entering intent.
3. The accepted request immediately shows one Game Master progress state while keeping prior Story, Player, and Scene readable.
4. Reload or navigation back to the durable route restores the authoritative pending/processing state.
5. Success appends one Game Master narration, refreshes context, and restores the composer.
6. Failure leaves the prior Adventure unchanged and offers Retry or Discard.

### Responsive Composition

- Desktop keeps the existing persistent Player / Story / Scene regions; the composer stays anchored to the Story region without covering narration.
- Mobile keeps Story as the default peer tab. The composer, progress, and recovery states fit the Story panel and do not make Player/Scene inaccessible.
- Long intent, generated prose, zoom, virtual keyboards, and error text must not introduce horizontal overflow or obscure submission/recovery controls.

### Component And State Contract

- The Adventure route remains the owner of authoritative Adventure detail polling and account-scoped cache updates.
- The composer owns only draft input, selected Act/Guide mode, Pass confirmation, and submission focus. It never decides whether a turn is allowed.
- Story renders chronological committed entries plus one separate active/failed lifecycle region. Staged narration is never rendered.
- Player and Scene remain read-only projections of current accepted state in this Change.

#### Component Strategy

| Component Or Pattern | Strategy | Initial Owner Or Reference | Required Preview States | Follow-Up |
|---|---|---|---|---|
| Adventure workbench shell | existing application component | `apps/frontend/src/adventures/AdventureWorkbench.tsx` | ready, pending, failed, completed desktop/mobile | extend without changing accepted region hierarchy |
| Act/Guide composer | adopted reference | checked-in `AdventureWorkbenchPrototype` | empty, typed, validation, submitting, disabled | productionize with real contracts and accessibility |
| Pass action/confirmation | application-specific | prototype behavior plus current confirmation conventions | ready, confirm, cancel, submitting | do not encode Pass as blank Act |
| Turn lifecycle status | existing application component | current persistent Story status boundary | pending, processing, failed, completion announcement | generalize opening-only wording |
| Player/Scene mutation projection | existing application component | current Player and Scene regions | player move, NPC move, mood/status/memory-hidden projection, no-NPC scene | keep private fields out of player DTOs |

### Accessibility And Interaction

- Act and Guide have persistent labels and help text that explains visibility/authority; mode selection is keyboard and touch operable.
- Pass requires an explicit labeled action and confirmation so it is not triggered accidentally.
- Validation associates errors with the active input and preserves the draft.
- Pending state announces once, does not repeatedly steal focus during polling, and keeps navigation/context available.
- Completion announces once and returns focus only when the user has not moved it elsewhere; Retry/Discard follow existing safe focus-restoration patterns.
- Disabled/busy state, error, and action meaning do not rely on color alone.

### Visual Direction

- Preserve the accepted dark Zinc workbench, Burnished Orange action/focus language, prose-first center pane, compact controls, and narrative typography.
- Keep the composer utilitarian and integrated with the reading surface; avoid chat bubbles, floating AI gradients, oversized pills, or decorative card stacks.
- Use restrained status language such as `Game Master is resolving your turn` rather than exposing worker/model implementation details.

### Open Design Questions

- None block implementation. Exact compact control spacing and Pass confirmation presentation can converge during Storybook/manual review without changing behavior.

## Client And API Boundary

- Current clients: React/Vite web client.
- Plausible future clients: native mobile, creator playtest tools, and external game clients.
- Reusable product capabilities: submit/retry/discard a resolving turn, inspect lifecycle, read committed history/current state, and process durable turn work.
- API or typed contract: authenticated `/api/v1/adventures/:id/turns` JSON routes with Vine validation, Tuyau-generated TypeScript types, and runtime response validation.
- OpenAPI plan, if HTTP-facing: continue the accepted Tuyau typed alternative for this Change; reassess when a non-TypeScript or external client becomes active.
- Backend platform exposed directly to clients?: no; the client calls only Lorecraft's Adonis API through same-origin `/api`.
- Client-specific presentation or local state: draft input, selected mode, Pass confirmation, polling cadence, and focus restoration.
- Rationale: authorization, idempotency, serialization, context selection, provider orchestration, mutation allowlisting, revision lineage, and atomic commits must remain reusable backend behavior.

## Alternatives Considered

- Implement all spike interactions together:
  - Rejected because Story inserts and utilities have distinct non-turn persistence/context semantics and would make the first resolving-turn acceptance surface unnecessarily broad.
- Implement synchronous turns:
  - Rejected because the accepted durable-work ADR and real provider latency require reload/restart-safe processing.
- Stream narration before extraction:
  - Rejected because the accepted player-visible atomicity rule forbids exposing narration that may not receive a valid state result.
- Port archived MVP code:
  - Rejected because its Next.js/Convex architecture, debug retention, and mutable-state contracts are reference evidence rather than production boundaries.

## Why This Approach

This is the smallest phase that makes Lorecraft genuinely playable while preserving the production foundation already proven. The user receives one complete action-to-consequence loop, and future Story/utilities or history revision features can build on a stable turn, revision, state, and worker contract rather than reopening it.

## ADRs

- Required: yes
- ADR path: `docs/adrs/2026-07-18-revision-linked-adventure-state-mutations.md`
- Status: Proposed during planning; accept only with implementation and verification.
- Decision summary: keep efficient materialized current Adventure state while appending immutable revision-linked structured mutation records; defer full revision snapshots.
- Reconsider when: mutation replay cannot reconstruct state reliably, histories become too expensive to replay/audit, or rollback/branching requirements justify periodic/full snapshots.
- Existing ADR updates during implementation:
  - `2026-07-16-durable-asynchronous-adventure-work.md`
  - `2026-07-17-immutable-adventure-revisions.md`
  - `2026-07-17-provider-neutral-ai-boundary.md`
  - `2026-07-14-world-canon-and-adventure-isolation.md`

## Implementation Constraints

- Promote the private plan before application or Epic edits, then branch `change/interactive-adventure-turns` from current `develop`.
- Preserve `.neon` and unrelated local/parent repository state.
- Apply schema work first to disposable Neon validation; production migration/deployment remains separately authorized release work.
- Do not persist or log raw prompt messages, Guide/Act bodies as operational evidence, raw model responses, provider credentials, or authorization data. Turn input may be stored only as private authoritative turn data required for retry/audit and must not enter later normal context.
- Do not expose frozen private Character fields, hidden Guide text, mutation diagnostics, or other accounts' state through normal APIs.
- Enforce turn serialization and finalization in PostgreSQL transactions, not React state or worker memory.
- Keep extraction output untrusted until schema, referential, field-bound, source-isolation, and head/generation checks pass.
- Update reset/delete behavior and migration rollback safety for new turn/state tables.
- Keep the normal development/deployment worker capable of both opening and turn jobs; do not introduce a second unsupervised process.
- Preserve existing generation burst-limit truth; expand its coverage to turn submissions without claiming distributed enforcement.

## Verification Strategy

- Focused automated tests:
  - migration tests for turn request uniqueness, one active turn, job/turn ownership, revision mutation ownership/immutability, current-state constraints, safe up/down/up, and data-bearing rollback refusal;
  - pure policy tests for action validation, context inclusion/exclusion, extraction schema, allowlisted mutations, partial rejection, retry/backoff, stale finalization, and metadata minimization;
  - service/transaction tests for creation, idempotency, serialization, atomic completion, retry/discard, reset/delete, lineage, and cross-Adventure/source isolation;
  - provider adapter tests for narration/extraction request construction, malformed output, abort, timeout, bounded retry, and absence of raw bodies from evidence/logs;
  - functional API tests for auth, CSRF, non-disclosing owner access, validation, conflict, DTO minimization, and generated contract behavior;
  - frontend component/API tests for mode selection, draft preservation, Pass confirmation, pending polling, retry/discard, chronological story, context refresh, announcements, focus, and responsive state.
- Broad supporting gates: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run verify:contracts`, `npm run build`, `npm run build:storybook`, `npm run test:storybook`, and relevant container/deployment tests if worker health/configuration changes.
- Deterministic E2E: on a disposable database and fake OpenAI-compatible provider, create/resume an Adventure; complete Act, Pass, and Guide turns; reload pending work; reject a concurrent tab; observe player/NPC state changes; prove hidden Guide/context exclusions; retry/discard a failure; reset; and verify cross-account/source isolation at desktop and mobile widths.
- Live-provider or external-service playtests: use the configured private provider to complete at least one Act and one Guide turn, confirm grounded narration/player agency and coherent state updates, and record only user-visible results plus bounded metadata.
- Manual UI confirmation: user reviews ready/pending/completed/failed flows, Story chronology, Player/Scene refresh, Act/Guide clarity, Pass safety, focus/announcements, desktop/mobile composition, and overflow.
- Debug/log inspection: verify lifecycle logs contain only identifiers/status/timing and database evidence contains only bounded metadata plus structured application mutations, never raw prompts or model responses.
- Production acceptance after release: authenticated private Tailscale flow completes one turn across API/worker restart boundaries and preserves it after reload; this is release evidence, not a prerequisite for local `/sdd-apply` completion.

## Decisions

- Implement Act, Pass, and Guide together as the complete resolving-turn phase.
- Keep Story inserts and `/look`/`/help` for the following phase.
- Use durable database-authoritative turn lifecycle and polling first.
- Use separate narration and extraction contracts with one configured provider allowed initially.
- Use immutable revision-linked mutations plus normalized current state; do not add full state snapshots yet.
- Allow failed uncommitted turns to be retried or discarded.
- Keep narration and accepted structured consequences atomic from the player's perspective.
- Retain metadata-only model evidence and existing private Adventure authorization.

## Risks / Trade-Offs

- Two model operations increase latency and provider cost; durable pending state and bounded retry make that visible and recoverable but do not remove it.
- Materialized state plus mutation history can drift if transactions or future repair tools bypass policy; reconciliation invariants and tests are required.
- Excluding raw provider content limits post-hoc debugging; structured mutation outcomes, bounded metadata, deterministic fakes, and live reproduction remain the supported path.
- One Story contains many Scenarios because asynchronous generation, extraction, mutation, and UI atomicity are inseparable for the first useful player outcome.
- Polling is less immediate than push delivery, but it preserves the existing portable deployment and can be replaced without changing turn authority.
