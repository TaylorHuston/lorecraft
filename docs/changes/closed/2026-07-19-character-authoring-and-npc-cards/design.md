# Design: Character Authoring And NPC Cards

## Context

Historical planning baseline: Lorecraft had a normalized relational World aggregate with Characters containing stable key, name, canonical Location, physical description, background, personality, voice, and private knowledge. The authenticated World detail route omitted private knowledge and was read-only. WorldVersion publication already serialized the stable fields into an immutable JSONB snapshot and used content identity to publish or reuse a version.

The preceding Interactive Adventure Turns Change added Adventure-owned NPC location, mood, status, and summarized memory. Before this Change, Adventure creation initialized those mutable values without authored source content, the Scene API exposed only name and physical description, and prompt assembly had no contract requiring complete current-Scene cards or measurable card size.

The archived MVP is useful interaction evidence. It showed a current-room NPC list with drill-down cards, full developer editing cards, stable background/personality/voice/private knowledge, mutable mood/status/memory/location, and a separate post-narration mutation extractor. Its generic facts, local debug permissions, and Next.js/Convex architecture are not implementation targets.

This Change makes the existing official Character model authorable, adds the minimal authored initial state needed for complete Adventure NPC Cards, and exposes the full card as an intentionally permanent debug surface during the current development stage. Cost discipline comes from compact required fields, current-Scene-only selection, fixed bounds, and measurement before introducing retrieval complexity.

## Goals / Non-Goals

**Goals:**

- Let a World author create, edit, and delete complete Character Cards from the World detail experience.
- Require deliberate non-empty values for the complete minimal field set while allowing concise phrases and sentences.
- Publish Character mutations atomically into a new or reused immutable WorldVersion for future Adventures.
- Seed and reset complete Adventure-owned NPC state from the frozen WorldVersion.
- Show the entire Character/NPC card in World and Adventure UI during the permanent-debug development phase.
- Give narration and extraction complete cards for every current-Scene NPC and no off-scene NPCs.
- Keep normal model-call evidence metadata-only while providing a deliberately enabled, local-only Debug trace to inspect prompting and refine NPC-card grounding.
- Preserve owner-only World mutation, Adventure ownership, frozen-source isolation, provider neutrality, and bounded mutation authority.

**Non-Goals:**

- World or Location authoring beyond the Location selector needed by Character authoring.
- Optional/custom fields, generic facts, relationships, factions, schedules, goals, behavior packages, multiple memories, or autonomous NPC action.
- Player-safe disclosure, spoiler controls, known-versus-hidden facts, or removing the full debug card.
- Dynamic prompt targeting, relevance ranking, retrieval, summarization, or truncation.
- Draft/publish workflows, bulk import/editing, WorldVersion management UI, or Adventure upgrades.
- NPC creation during Adventures, source-canon mutation from play, combat, inventory, health, statistics, or rules.

## Planning Interview / Story Refinement

- Scope boundary reviewed: one coordinated phase owns Character CRUD, complete card presentation, initial Adventure state, and current-Scene prompt use; it does not become a universal Character schema or simulation system.
- User decisions: use the spike for inspiration; expose complete cards as permanent debug; keep existing semantic fields; fold enduring motivations into background and immediate goals into status; require every field but allow sparse content; support full CRUD; auto-publish on save; include every current-Scene card and optimize later from playtesting.
- Historical assumptions: Character stable keys remain explicit and immutable after creation; the interactive-turn Change landed first; World detail remains the authoring entry point.
- Deferred scope: custom fields, relationships, visibility filtering, retrieval, version UI, offscreen behavior, and broader World authoring.
- Story boundaries challenged: `LC-002/S3` keeps create/edit/delete together because they form one creator management path over the same validation, authorization, publication, and UI. `LC-003/S3` remains separate because inspecting an NPC card is independently useful and is not merely a turn-submission detail.
- Requirements refined: complete required cards, owner-only mutation, stable keys, same-World Location integrity, transactional publication, frozen Adventure behavior, current-Scene context, metadata-only normal evidence, local Debug capture, full debug disclosure, responsive drill-down, validation/recovery, and destructive confirmation.
- Scenario gaps considered: duplicate/invalid keys, blank/overlong fields, cross-World Location references, non-owner mutation, inaccessible Worlds/Adventures, publication rollback, no-op updates, deletion, empty Scene, NPC movement, reset, long sparse cards, mobile drill-down, prompt selection, and Debug capture privacy.
- Open questions that block implementation: none. Exact editor composition is an experience-design convergence task rather than an unresolved behavioral contract.

## Epic Changes

### Update Epic: LC-002 World Bible Catalog

- Target Epic: `docs/epics/lc-002-world-bible-catalog/epic.md`
- Change Type: modified and added scope; complete file normalization to `sdd-epic-v2`

#### Story Changes

- Modified: `LC-002/S2`, Inspect Structured World Canon.
- Added: `LC-002/S3`, Manage World Characters.
- Removed: none.

#### Modify Story S2: Inspect Structured World Canon

- `S2/R1-S1` now exposes key, name, canonical Location, physical description, background, personality, voice, private knowledge, initial mood, initial status, and initial memory for every accessible Character during the debug stage.
- `S2/R2` now presents complete cards and explicit debug disclosure without losing loaded, missing, error, empty, responsive, or route-context behavior.
- Existing verification for minimized disclosure remains historical evidence but must no longer claim private-knowledge omission proves current behavior.

#### Add Story S3: Manage World Characters

As a World creator, I want to create, edit, and delete complete Character Cards, so that my current canon and future Adventures use the Characters I intend.

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

##### Implemented By

- `apps/backend/app/services/world_character_service.ts#WorldCharacterService` owns authoritative owner-only CRUD and version publication.
- `apps/frontend/src/worlds/WorldDetailPage.tsx#CharacterEditorForm` owns the authoring interaction and recovery UI.

##### Implementation Gaps

- None.

##### Verified By

- Frontend routed tests, Storybook tests, and direct desktop/mobile Storybook inspection pass; backend static gates pass.

##### Verification Gaps

- Manual author/non-author confirmation and rendered recovery coverage remain pending.

#### Supersedes / Reconciles

- Replace LC-002's read-only outcome and deferred Character authoring/private-knowledge boundary with the accepted debug-stage authoring/disclosure contract.
- Normalize all of LC-002 from its legacy combined `Status` shape to independent implementation and verification state derived from current evidence.
- Preserve S1 behavior while converting its implementation and verification maps to the v2 format.
- S2 evidence that had treated private-knowledge omission as proof is superseded historical behavior after implementation.
- No closed Change needs rewriting unless it makes a non-historical current-state claim that conflicts with the new Epic truth.

### Update Epic: LC-003 Adventure Play

- Target Epic: `docs/epics/lc-003-adventure-play/epic.md`
- Change Type: modified and added scope

#### Story Changes

- Modified: `LC-003/S1`, Start And Resume A Private Adventure.
- Modified: `LC-003/S2`, Resolve A Structured Game Master Turn.
- Added: `LC-003/S3`, Inspect Complete NPC Cards.
- Removed: NPC inspection from the `shape-and-inspect-story` candidate; Story, `/look`, and `/help` remain proposed there.

#### Modify Story S1: Start And Resume A Private Adventure

- `S1/R2-S1` requires WorldVersion Characters to contain the complete stable card plus initial mood, status, and memory.
- `S1/R4-S1` projects complete current-Scene cards through the owner-only Adventure detail API.
- `S1/R4-S2` restores NPC location, mood, status, and memory from the same frozen WorldVersion on reset.
- `S1/R3-S1` sends complete starting-Scene NPC Cards to opening generation and excludes off-scene Characters.

#### Modify Story S2: Resolve A Structured Game Master Turn

- Refine `S2/R3-S4`, Metadata-Only Evidence, so its no-content rule applies to normal persistence and lifecycle logging; the separately constrained development Debug exception is defined by `S2/R3-S6` and the provider-boundary ADR.
- Add `S2/R3-S5`, Complete Current-Scene NPC Context:
  - WHEN narration or extraction context is assembled
  - THEN it contains the complete frozen-and-current card for every NPC whose Adventure-owned Location matches the current Scene
  - AND it contains no off-scene NPC card and retains only bounded count/character-size metadata in normal model-call evidence.
- Add `S2/R3-S6`, Development Debug Trace:
  - WHEN a local development opening, narration, or extraction operation runs without an explicit Debug override
  - THEN Lorecraft writes a correlated JSONL diagnostic unit with input, prompt summary/size, parsed output, narration or mutation outcome, status, and timings
  - AND sanitized raw provider request and response payloads are captured by default in that local profile, can each be explicitly disabled, never contain credentials or authorization material, and never appear in normal persistence, lifecycle logs, browser responses, or production execution.
- Refine `S2/R3` private-card safety so a provider response that directly reflects protected NPC private knowledge is rejected before it becomes durable player-visible narration; any remaining semantic-leak limitation is explicit rather than implied safe by prompt wording.
- Refine `S2/R4-S2` so mood, status, and memory use the initial frozen values at Adventure creation/reset and remain the only mutable card text fields.
- Preserve normal metadata-only evidence, revision provenance, invalid-proposal handling, source isolation, and the accepted local-only Debug privacy boundary.

#### Add Story S3: Inspect Complete NPC Cards

As an Adventure owner, I want to open complete cards for NPCs in my current Scene, so that I can inspect the exact canon and mutable state guiding the story during development.

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

###### Scenario R3-S3: Location-Move Editing Continuity

- WHEN the owner autosaves a valid Location change from a selected Debug NPC card
- THEN the authoritative Scene list refreshes and no longer offers that NPC as a fresh current-Scene selection
- AND the selected editor remains usable long enough to show the saved state, report an error, or let the owner continue the current card edit without exposing it as a new off-scene card.

##### Implemented By

- `apps/backend/app/services/adventure_query_service.ts#AdventureQueryService.findForOwner` owns current-Scene card projection.
- `apps/backend/app/services/adventure_npc_debug_state_service.ts#AdventureNpcDebugStateService.update` owns local Debug state validation, owner isolation, and current-state persistence.
- `apps/frontend/src/adventures/AdventureWorkbench.tsx#SceneRegion` owns list-to-card selection and return focus.
- `apps/frontend/src/adventures/AdventureWorkbench.tsx#NpcDebugEditor` owns debounced autosave draft state and recovery feedback.

##### Implementation Gaps

- None.

##### Verified By

- Workbench tests and Storybook fixtures pass; desktop list and selected-card accessibility-tree content were directly inspected.

##### Verification Gaps

- Long-card/recovery/manual confirmation remains pending; Storybook remounting prevented a stable selected-card raster capture.

#### Supersedes / Reconciles

- Replace the current minimized `scene.npcs` projection and the S2 implementation note saying internal NPC mutation fields are intentionally hidden.
- Preserve Adventure owner-only access even though the card intentionally exposes private knowledge to that owner during the debug stage.
- S1/S2 implementation/evidence maps were reconciled after the Interactive Adventure Turns Change integrated; no planning relied on uncommitted intermediate symbols.
- Remove NPC inspection from the `shape-and-inspect-story` candidate without promoting Story inserts or utilities.

## Epic File Rules

- Stories live inside the Epic `epic.md` file.
- `LC-002` must be completely normalized to `sdd-epic-v2` during implementation because this Change materially changes behavior, gaps, ownership, and evidence.
- Preserve `LC-002/S1`, `LC-002/S2`, `LC-003/S1`, and `LC-003/S2` labels; add only `LC-002/S3` and `LC-003/S3`.
- Restart Requirement IDs within each new Story and keep Scenario IDs scoped to their Requirement.
- Planned locations and evidence stay in this design/tasks pair until implementation supplies real symbols and passing tests.

## Technical Options

### Option 1: Extend First-Class Character Records And Current Typed APIs

- Summary: Add initial mood/status/memory to relational Characters and WorldVersion snapshots; implement dedicated owner-scoped Character CRUD services/routes; publish in the same transaction; extend World and Adventure DTOs; adapt current prompt builders and React surfaces.
- User impact: Complete authoring and inspectable cards with no new schema abstraction or publish workflow.
- Implementation complexity: Moderate and concentrated in established World, Adventure, API, and UI seams.
- Reversibility: High. Field semantics and presentation can evolve without replacing Character identity or snapshot isolation.
- Client surfaces: Current React World detail and Adventure workbench; future clients can reuse backend capabilities.
- API / contract shape: CSRF-protected authenticated `POST /api/worlds/:slug/characters`, `PATCH /api/worlds/:slug/characters/:key`, and `DELETE /api/worlds/:slug/characters/:key`, plus expanded World/Adventure reads through generated Tuyau types.
- Frontend/backend boundary: Backend owns validation, ownership, transactions, keys, persistence, publication, projections, and prompt selection; frontend owns forms, disclosure, selection, responsive layout, and client-local draft state.
- Data / schema impact: Three required initial-state Character fields and snapshot schema evolution; no generic entity/fact tables.
- Auth / security impact: Full debug disclosure is intentional; mutation remains author-only and Adventures remain owner-only; sensitive card text remains out of logs/model evidence.
- Testability: Strong through service, database, API, prompt, component, Storybook, E2E, and live-provider boundaries.
- Operational risk: Transactional publication increases write cost per save but avoids stale playable state; bounded metadata supports measurement.
- Fit with project conventions: Best fit with accepted ADRs and current typed API-first structure.

### Option 2: Introduce Generic Character Facts Or Custom Fields

- Summary: Replace or supplement first-class fields with user-defined key/value facts and generic editing/rendering.
- User impact: More flexibility immediately, but weaker guidance, harder validation, and unpredictable prompt size.
- Implementation complexity: High because visibility, types, ordering, validation, schema/version serialization, and prompt policies become generic systems.
- Reversibility: Medium; early generic contracts become difficult to remove once user data depends on them.
- Client surfaces: Requires a generic field builder and renderer rather than a focused Character workflow.
- API / contract shape: Generic fact mutation and schema metadata rather than explicit Character contracts.
- Frontend/backend boundary: More policy leaks into configuration and client rendering.
- Data / schema impact: New fact/schema structures and versioning rules.
- Auth / security impact: Field visibility and sensitive-data handling become more complex.
- Testability: Larger combinatorial surface with less semantic certainty.
- Operational risk: Unbounded prompt growth and inconsistent model behavior.
- Fit with project conventions: Conflicts with the product rule to add structure only after proven need.

### Option 3: Keep Canon Read-Only And Add Adventure-Only Debug Editing

- Summary: Copy the spike's debug editing concept into Adventure state without authoring source World Characters.
- User impact: Fast experimentation, but edits disappear from future Adventure sources or blur canon and play.
- Implementation complexity: Superficially low but creates duplicate editing semantics and reconciliation work.
- Reversibility: Low once users expect debug edits to represent canon.
- Client surfaces: Adventure workbench only.
- API / contract shape: Owner-only Adventure debug mutations.
- Frontend/backend boundary: Adventure runtime becomes an accidental World Builder.
- Data / schema impact: Adventure overrides for stable fields are intentionally Adventure-owned Debug state; frozen World canon remains immutable.
- Auth / security impact: Risks widening the mutation allowlist and canon boundary.
- Testability: Can prove local edits but not creator-authoritative source behavior.
- Operational risk: High conceptual drift.
- Fit with project conventions: Rejected by World/Adventure isolation and creator-authority principles.

## Selected Approach

Use Option 1. Extend the first-class relational Character aggregate with `initialMood`, `initialStatus`, and `initialMemory`, include them in the next WorldVersion snapshot schema, and initialize Adventure-owned NPC state from those values. Add a dedicated backend Character authoring service whose owner-filtered create, edit, and delete operations validate complete bounded cards and call `publishWorldVersionInTransaction` before committing. Stable keys are explicit at creation and immutable thereafter.

Expand World detail reads to full cards and author capability, and expand owner-only Adventure Scene reads to merge frozen card fields with current Adventure location/mood/status/memory. The React client adds authoring controls to World detail and a list-to-card Scene drill-down inspired by the spike. Prompt builders serialize every current-Scene card in a fixed compact format for opening, narration, and extraction; off-scene Characters are excluded. Model-call evidence remains bounded to NPC-card count and serialized-character count alongside existing metadata. A backend-only development Debug sink writes the spike's correlated JSONL diagnostic unit and sanitized raw transport payloads to a protected, git-ignored temporary path by default; either local capture mode may be explicitly disabled.

## Experience Design

- Applicability: required
- Confirmed direction: preserve the existing World detail and Player/Story/Scene shells; adapt the spike's full card and room-list drill-down; expose the complete card as clearly labeled development/debug information; keep Story dominant.
- User confirmation: Taylor confirmed full cards, permanent debug, and spike inspiration during planning.
- Reference artifacts:
  - Archived spike `src/features/play/room-info-card.tsx` for list-to-card interaction.
  - Archived spike `src/features/play/world-client.tsx#NpcDebugPanel` for complete field/source visibility, not styling or architecture.
  - Current `apps/frontend/src/worlds/WorldDetailPage.tsx` and `apps/frontend/src/adventures/AdventureWorkbench.tsx` as production composition owners.

### User Flow And Information Architecture

- World detail keeps Locations, Characters, and Adventures in one World context.
- Any signed-in account with World access may expand/read a full Character debug card.
- The author can start a Character, complete every field, save, edit, or confirm deletion from the Character section.
- Adventure Scene shows current Location and a list of present NPCs; selecting one replaces or expands the Scene detail with the complete card and provides a clear return path.
- The Character section uses collapsible inline cards: Add Character opens a new inline card form, one existing card may enter explicit Edit mode with Save/Cancel, and delete remains a separate confirmed action.

### Responsive Composition

- Desktop preserves the existing World detail reading column and three-region Adventure workbench.
- Mobile preserves Story-first tabs; NPC drill-down lives within Scene without creating a new primary tab.
- Full card text wraps vertically; no horizontal field grid is required at narrow widths.
- Authoring actions remain reachable with touch-sized controls and without pushing destructive actions into the primary path.

### Component And State Contract

#### Component Strategy

| Component Or Pattern              | Strategy                       | Initial Owner Or Reference                        | Required Preview States                                 | Follow-Up                                   |
| --------------------------------- | ------------------------------ | ------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------- |
| Character card/read view          | application-specific           | `WorldDetailPage`; archived NPC card as reference | populated, sparse, long valid, non-author debug         | collapsible inline card                     |
| Character authoring form          | application-specific           | World detail plus existing text controls          | create, edit, validation, pending, request error, saved | explicit inline Add/Edit with Save/Cancel   |
| NPC Scene list-to-card drill-down | reference candidate            | archived `RoomInfoCard`; current `SceneRegion`    | empty, list, selected, refreshed/moved, long valid      | adapt, do not import dependency             |
| Form controls and actions         | existing application component | `TextField`, `Textarea`, `Button`, `IconButton`   | default, focus, disabled, pending, error                | extend only when missing behavior is proven |
| Delete confirmation               | existing application component | `ConfirmDialog`                                   | open, cancel, pending, failure, success                 | preserve established focus contract         |

### Accessibility And Interaction

- Every field has a persistent label, bound help/limit text where useful, and field-specific error association.
- Create/edit status uses restrained live announcements; background query refresh does not steal focus.
- NPC/Character selection and back navigation are keyboard and touch operable with visible focus.
- Delete confirmation follows the established modal focus trap, Escape/cancel, pending, and focus-return behavior.
- Debug/private disclosure is textual, not color-only.

### Visual Direction

- Continue the accepted Ember charcoal/copper, prose-first, utilitarian grammar.
- Use density and hierarchy appropriate to reference cards; do not turn cards into decorative portraits or generic dashboard tiles.
- Distinguish stable canon from mutable Adventure state through grouping and labels rather than additional color systems.

### Open Design Questions

- None block implementation. Character editing uses one explicit inline edit card at a time; selected Adventure NPCs replace the Scene detail body with a clear Back to Scene action; concise field guidance shows limits without live token estimates.

## Client And API Boundary

- Current clients: React web client through the same-origin `/api` proxy and generated Tuyau types.
- Plausible future clients: mobile, administrative, CLI, automation, and future creator tooling.
- Reusable product capabilities: validate/create/edit/delete Character canon; publish current WorldVersion; project complete Character/NPC cards; assemble current-Scene NPC context.
- API or typed contract: explicit HTTP routes and validators with generated Tuyau client types. Runtime client validation must remain synchronized.
- OpenAPI plan, if HTTP-facing: continue the accepted documented Tuyau typed-contract alternative for this Change; do not introduce a parallel OpenAPI source unless the repository-wide contract decision changes.
- Backend platform exposed directly to clients?: no; AdonisJS remains the authoritative boundary.
- Client-specific presentation or local state: form drafts, selected card, disclosure state, dialogs, query mutation state, and responsive composition.
- Rationale: authoring, authorization, version publication, and prompt selection must be reusable and testable outside React.

## Alternatives Considered

- Explicit publish button and draft state:
  - Why not: adds stale-current-version ambiguity, version UI, and another creator workflow before drafts are needed.
- Full cards for only the addressed NPC:
  - Why not: requires targeting/fallback rules and can starve Pass or multi-NPC scenes; start with all current-Scene cards and measure.
- Full cards for every World Character:
  - Why not: spends tokens on off-scene canon and weakens Scene grounding.
- Separate motivation/current-goal fields:
  - Why not: background and status already carry those meanings for the minimal phase.
- Make card fields optional:
  - Why not: the user wants every field considered, while sparse values already provide the desired low-token path.

## Why This Approach

It adds the smallest coherent creator capability on top of existing first-class Characters, uses already accepted immutable versioning and Adventure isolation, and retains the spike's useful semantic split without its generic-fact architecture. It makes prompt cost and actual grounding inspectable during development while leaving normal operational evidence metadata-only and postponing relevance machinery until real playtests show that current-Scene cards are too expensive or noisy.

## ADRs

- Required: yes
- ADR path: `docs/adrs/2026-07-17-provider-neutral-ai-boundary.md`
- Decision summary: Keep normal operational evidence metadata-only; default local-development JSONL and sanitized raw request/response capture on, allow explicit local disablement, and preserve protected temporary storage, production refusal, expiry/purge, and backup exclusion.
- Reconsider when: Debug capture needs shared/hosted storage, a longer retention period, production access, or a different encryption/access boundary; or when custom fields, typed relationships, visibility policy, draft publication, historical Character queries, or context retrieval becomes a durable cross-Change requirement.

## Implementation Constraints

- Historical promotion constraint met: `2026-07-18-interactive-adventure-turns` integrated/closed before this Change began on current `develop`.
- Use centralized validation constants initially capped at: key 100, name 100, physical description 320, background 700, personality 320, voice 240, private knowledge 700, mood 120, status 320, and memory 500 characters. Every value must be non-blank after trimming. These are deliberate first-playtest ceilings, not permanent product promises.
- Preflight existing Character and Adventure data before tightening mutable-field policy. Do not truncate stored user content silently; replan if safe reconciliation cannot preserve data.
- Character stable key is required at create time, lowercase kebab-case, unique within the World, and immutable after creation.
- Character Location must belong to the same World at both application and database boundaries.
- Character mutation and current WorldVersion publication/reuse must commit or roll back together.
- WorldVersion snapshots remain immutable and schema-versioned; readers must handle the supported snapshot transition explicitly.
- Existing Adventures and reset source identity remain unchanged by later Character authoring.
- Normal generated Adventure mutations remain limited to NPC location, mood, status, and memory; the local Debug editor may override other displayable card fields for one Adventure only, while stable keys and frozen canon remain unchanged.
- Full debug cards may be returned to authorized World/Adventure readers during this stage. Normal model-call evidence and lifecycle logs remain content-free; only the default-on local development Debug sink may retain card, input, prompt, or response content under the amended provider-boundary ADR.
- Context contains all and only current-Scene NPCs. Do not add targeting, ranking, retrieval, summaries, or truncation in this Change.
- Persist only bounded NPC count and serialized-character-count metadata; use provider token counts when available without inventing tokenizer precision. Local development Debug JSONL and sanitized raw payload capture default on but may be explicitly disabled; files live under an application-controlled git-ignored temporary root, are owner-readable only, are automatically purged after seven days, and cannot be enabled in production.
- Preserve unrelated dirty files and do not reuse the current interactive-turn branch for implementation.

## Verification Strategy

- Focused automated tests:
  - Migration/backfill and model tests for required initial fields, stable key, same-World Location integrity, and snapshot schema transition.
  - Character service/API tests for complete create/edit/delete, owner-only authorization, validation bounds, duplicate key, rollback, no-op reuse, and automatic current-version publication.
  - Adventure creation/reset/query tests proving initial state, frozen old Adventure behavior, new-version behavior, complete card projection, and cross-owner non-disclosure.
  - Prompt tests proving every current-Scene card and field is included, off-scene Characters are excluded, fixed formatting is deterministic, mutable state overrides initial state, and normal metadata records only bounded counts.
  - Debug-capture tests proving local-default-on and explicit-disable behavior, production refusal, correlated JSONL record shape, credential/header redaction, temporary-path permissions, and seven-day purge.
- Narration safety tests proving direct private-knowledge reflection is never committed as player-visible narration.
  - Frontend tests for complete cards, author/non-author controls, forms, errors, pending state, confirmation, Scene selection/refresh, empty state, focus, and responsive semantics.
- Broad supporting gates:
  - Root lint, typecheck, build, test, contract generation/check, Storybook build/test, database safety, and scoped SDD validation.
- Deterministic E2E:
  - Author creates, edits, and deletes a Character; each save changes future source while an existing Adventure remains frozen; a new Adventure shows the complete initial/current card; a turn updates mutable fields and Scene selection refreshes on desktop/mobile.
- Live-provider or external-service playtests:
  - Run opening, Act, Guide, and Pass with two to three present NPCs; inspect visible narrative grounding plus bounded card-count/character-count and provider token metadata, using the default-on local Debug trace to compare assembled context and provider output. Record whether full current-Scene cards create noticeable latency, cost, confusion, or local-model quality issues.
- Manual UI confirmation:
  - Creator and non-author World cards; create/edit/delete; Adventure list-to-card drill-down; state refresh; long sparse cards; desktop/mobile; debug disclosure clarity.
- Debug/log inspection:
  - Confirm normal lifecycle logs and model-call evidence remain content-free; inspect enabled local Debug JSONL records, raw-toggle boundaries, redaction, permissions, expiry, and production refusal.

## Decisions

- Keep the existing explicit field model; add only initial mood, status, and memory.
- Require every field but encourage concise content through bounds and UI guidance.
- Keep `Character` in World canon and `NPC` in Adventure language.
- Provide full CRUD on World detail.
- Auto-publish or reuse a WorldVersion in the same transaction as each accepted mutation.
- Expose the entire card as a permanent debug surface for the current stage.
- Send full cards for all current-Scene NPCs and measure before optimizing.
- Provide the spike's diagnostic depth through default-on, explicitly disableable local development Debug capture, not through normal persistence or production logging.
- Reuse the settled production shells and archived interaction reference without a separate `/sdd-design --plan` pass.

## Risks / Trade-Offs

- Full cards intentionally reveal private knowledge to authorized readers and Adventure owners during development; the UI must label this as debug behavior so it is not mistaken for final player disclosure.
- Deterministic direct-reflection checks deliberately ignore normalized private values shorter than three characters so ordinary narration cannot be rejected by values the schema permits; those concise values and semantic paraphrase remain live-provider evaluation limits.
- Required fields can encourage filler. Concise guidance and playtesting must reward useful signal rather than prose volume.
- All current-Scene cards may still become expensive in crowded scenes. Measurements and playtests are the reconsideration trigger; this Change does not solve crowd scaling.
- Automatic publication creates more WorldVersions, but content hashing avoids duplicates and removes stale playable-state ambiguity.
- Stable explicit fields may later be insufficient for relationships or custom concepts. That is an accepted constraint until usage proves another model.
- Tightening bounds can conflict with existing data. Implementation must preflight and replan instead of truncating.
- LC-002 normalization is substantial artifact work but required to avoid mixing legacy status/evidence semantics with new behavior.
