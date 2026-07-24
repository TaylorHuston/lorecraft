# Design: UI Refinements

## Context

Lorecraft is running locally for iterative inspection. The first request targets the existing Adventure desktop workbench: it already renders Player, Story, and Scene as three columns, but a contextual header consumes vertical space above it.

## Goals / Non-Goals

**Goals:**

- Improve a named existing UI surface without broadening product behavior.
- Preserve responsive, accessible interaction and current visual conventions.
- Inspect actual rendering rather than relying only on source or test exits.
- Make Adventure mode a full-height three-column desktop workbench without a top navigation bar while retaining an icon-only Return to Worlds link and Adventure settings in contextual Player-pane controls.
- Let an Adventure owner read resolved play as a durable left/right chat transcript, including their italicized Guide input, without changing generation context.
- Specify and prove the existing development/test Player Debug writer as Adventure-local state, with deterministic transcript ordering and accessible failed-save recovery.

**Non-Goals:**

- Redesign product flows or introduce new World, Character, or Adventure capabilities.
- Add data storage, schema changes, World-canon mutation, a new authorization model, provider behavior, or deployment configuration.
- Expose Guide text outside the authenticated owner detail response, model prompts, model evidence, or raw provider output through browser APIs.

## Technical Approach

- Locate the owning frontend route/component and its closest existing test, Storybook state, or E2E coverage after each request.
- Make the smallest safe presentation change.
- Use rendered verification at an appropriate viewport and record the exact surface in `tasks.md`.
- Update Epic truth only when a request changes accepted behavior or its scenario-mapped evidence.
- Remove the Adventure-page header. Pass its contextual settings action into the workbench and render an icon-only Return to Worlds link plus Settings inside the Player pane. The existing narrow View tabs remain the navigation model below the desktop breakpoint.
- Extend the owner-only Adventure detail projection from existing durable `adventure_turns`, revision lineage, and narration entries. Each completed Act or Guide is paired before the narration in its result revision; each completed Pass contributes an explicit player-facing marker; opening narration remains a Game Master message. A current pending/processing/failed Act, Pass, or Guide is projected only for the owner so its right-side bubble remains visible during progress or recovery. Guide messages are styled in italics; the raw input is not exposed through any other response.
- Derive a stable transcript order from the resolved head-revision lineage, then the story-entry sequence within each revision. Do not use `created_at` as the chronology authority because multiple revisions and entries may share it.
- Treat Player Debug as the existing NPC Debug sibling boundary: only a ready owner in development/test may write the five existing Adventure Player fields; a pending/processing turn, invalid frozen Location, non-owner, and production environment fail closed without mutating World canon, revisions, or turn count. The client preserves an unchanged failed draft, renders field-specific guidance, and offers a retry when the failure is recoverable.
- Preserve a visible neutral focus treatment for the focusable Story scroll region; removing the orange decorative ring must not remove keyboard focus feedback.
- Keep the prompt's normal story history unchanged. It continues to consume narration and structured state, not the owner-visible Act/Pass/Guide transcript. No migration is necessary because the source turn and revision records already exist.

## Affected Epic Truth

| Epic | Story | Requirement / Scenario | Impact | Needed Update |
|---|---|---|---|---|
| LC-003 Adventure Play | S1, S2, S3 | S1/R5-S2, S1/R5-S4, **new S1/R5-S7**, S2/R3-S2, S2/R5-S2 through R5-S6, S3/R1-S1, S3/R2-S1, S3/R3-S1 | Existing Player / Story / Scene composition becomes the complete desktop shell; S1/R5-S7 owns Player Debug local-state editing/recovery; S2/R5-S6 owns lineage-stable transcript chronology. Scene NPC drill-down remains player-visible and read-only, while contextual Settings retains local Debug editors for Adventure-owned NPC and Player state. | During Apply, update LC-003 as a whole-file `sdd-epic-v2` reconciliation with ownership/evidence anchors and migrate or supersede its invalid historical verification-report chain. |

## Experience Design

- Current direction: use three persistent desktop panes—Player at left, Story dominant in the center, and Scene at right—without a top navigation bar. The Player pane has an accessible icon-only back arrow to the Worlds index plus Settings; these are contextual controls, not global navigation. The frozen World name is a pinned, large Story-column heading; it is a presentation label rather than a new Adventure title field, and a brief steep background fade lets narration visually recede beneath it as the story scrolls. Within Story, generated narration renders as an unboxed left-aligned Game Master message and resolved Act/Pass events as unboxed right-aligned player messages. Player entries use a visible amber `Action`, `Pass`, or `Guide` eyebrow and slim right-edge accent rather than a message card; adjacent paragraphs have one line-height of separation, and player entries have extra space before the following narration. Resolved/current Guide input uses the same right-side treatment in italics. The ready composer omits the repeated provider disclosure, uses a brief steep fade to clear lower narration beneath its dock, uses the italic dynamic Act/Guide prompt as the textarea placeholder, and keeps equal-width Send and Pass controls joined together across the text area's bottom border with reserved typing clearance. Selecting a Scene NPC opens only its player-visible name, physical description, and current Status (what it is doing), with no Debug metadata or controls. Adventure Settings opens a large two-pane workspace: a left keyboard-operable section navigator (Adventure Settings, Player, NPCs, Locations) and a right detail panel. Player contains the same local-only Debug editor treatment as NPCs for the existing Adventure-owned fields: name, physical description, backstory, status, and frozen Location key. It is unavailable in production, blocked while the Adventure is resolving, and never mutates World canon. Prompt instructions and Location tools remain explicit placeholders.
- Responsive/accessibility baseline: retain semantic Link/Button controls, a visible neutral focus treatment on every keyboard-focusable region, 44px action targets, Story-first keyboard-operable narrow tabs, per-field validation guidance, recoverable-save feedback, and no horizontal overflow. Message alignment must not become the only author cue: Game Master and Player labels remain available to assistive technology.
- Rendered evidence: inspect the Adventure ready state at desktop and narrow viewports through the existing Storybook fixture and local route; record the exact surface, result, and console/network outcome in `tasks.md`.

### Component Strategy

| Component Or Pattern | Strategy | Initial Owner Or Reference | Required Preview States | Follow-Up |
|---|---|---|---|---|
| Adventure Story transcript | existing application component | `AdventureWorkbench#StoryRegion` | resolved Act/Guide/narration/Pass chronology; pending Guide; failed Guide; desktop and narrow layouts | None. |
| Chat message treatment | application-specific | `AdventureWorkbench.module.css` | left/right alignment, long content wrapping, non-visual author labels, Story-title overlap | Reassess only if messaging is adopted outside Adventure play. |
| Player Debug editor | existing NPC Debug sibling | `AdventureWorkbench#AdventurePlayerEditor` and Adventure detail route | valid autosave, field validation error, recoverable failure/retry, unavailable production state | Keep one shared recovery/accessibility contract with NPC Debug while retaining Player-specific fields. |

## Client And API Boundary

- Current clients: the React Adventure route.
- Plausible future clients: authenticated web/mobile Adventure readers.
- Reusable product capability: owner-visible immutable Adventure transcript projection.
- API or typed contract: extend `AdventureDetail.story` with lineage-stably ordered derived `act`, `pass`, and `guide` entries; retain the owner-only Player Debug update endpoint and authoritative detail refresh.
- OpenAPI plan, if HTTP-facing: the existing typed Tuyau contract is regenerated and checked; no separate OpenAPI document is introduced for this narrow existing endpoint.
- Backend platform exposed directly to clients?: no; the client remains behind the existing same-origin API proxy and owner query service.
- Client-specific presentation or local state: message alignment, labels, and composer/recovery controls remain in the React workbench.
- Rationale: preserves the owner-only server authority and durable reload behavior while keeping Guide data out of normal prompt history.

## Alternatives / Deferred

- A broad navigation or visual-system redesign is deferred to `/sdd-change --plan` and, if experience uncertainty is material, `/sdd-design --plan`.
- A client-only optimistic player bubble was rejected because it disappears on reload and cannot accurately represent recovery. Persisting a second message table was rejected because existing turn and revision records already identify the permitted transcript events.

## Contract And Privacy Constraints

- The existing owner-only detail response may expose resolved/current `act` and `guide` content plus a fixed `pass` display marker in its visible transcript. It MUST NOT expose model prompts, provider evidence, rejected mutation detail, Guide data to another owner, or another owner's data.
- A failed Act/Pass/Guide can remain visible only while its existing retry/discard lifecycle action is available. Discard removes the active turn from the authoritative projection; a completed turn appears once, immediately before its resulting narration.
- The Player Debug endpoint is development/test-only, owner-scoped, and only permits the existing Adventure player fields. It validates the Location against the frozen World, refuses non-ready or resolving Adventures, and cannot mutate source World data or revision history.
- Player Debug validation failures identify their individual fields to assistive technology and visually; a non-validation failed save leaves the unchanged draft retryable without requiring a new edit.
- Transcript chronology is the head-lineage order plus entry sequence. Timestamp equality cannot reorder owner events or their resulting narration.
- Existing `story` persistence remains narration-only. The API's owner-visible transcript is a derived read projection and does not alter story-entry writes, revision immutability, or the bounded prompt history.

## Open Questions

- None. The reviewed replan preserves the user-confirmed Player Debug and chat transcript direction.

## Replan Verification Strategy

- Start with a tied-timestamp functional query test that proves opening, Act, Pass, and Guide events follow their revision lineage after reload.
- Add a Player Debug functional API suite patterned after the NPC suite. It must prove CSRF-authenticated owner success, non-owner non-disclosure, production refusal, ready/busy and frozen-Location rejection, and no World/revision/turn-count mutation.
- Add focused Player editor tests for field-specific validation descriptions, unchanged-draft retry, and visible Story scroll focus; retain current desktop/narrow Storybook states.
- Regenerate and check the typed client after any route/contract change, rerun targeted deterministic E2E, then run `npm run ci:required` against explicitly acknowledged disposable test and E2E databases on the final implementation candidate.
- Before review, migrate or supersede the three historical LC-003 Epic verification reports through the Epic verification workflow so `sdd validate` sees a coherent versioned-report lineage.

## Planning Updates

| Date | Discovery / Classification | Decision | Artifacts Changed | Restart Point |
|---|---|---|---|---|
| 2026-07-23 | Epic ownership change and technical constraints from independent review. | Add S1/R5-S7 for local Player Debug editing/recovery, tighten S2/R5-S6 chronology, and require deterministic database/API, client-accessibility, E2E, aggregate, and report-lineage proof. No ADR is needed. | `proposal.md`, `design.md`, `tasks.md`; actual LC-003 remains Apply-owned. | Begin Apply with failing query and Player Debug boundary/recovery tests. |
