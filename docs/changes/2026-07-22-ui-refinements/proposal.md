# Proposal: UI Refinements

## Why

This tracked interactive session captures small, user-directed improvements to existing Lorecraft screens while keeping the current creator-first product behavior intact. It now also reconciles the Adventure detail projection required for a durable chat-style transcript.

## What Changes

- Record and apply one concrete UI refinement at a time.
- Verify each changed rendered surface and keep the owning Epic evidence current when behavior changes.
- Project owner-visible completed Act, Pass, and Guide events beside Game Master narration so an Adventure reads as a coherent chat transcript.
- Make selected Scene NPC details player-visible and read-only, while retaining complete local Debug editing in Adventure Settings.
- Provide the same development/test-only local Debug capability for the Adventure Player record in Settings, without changing frozen World canon.
- Complete the review-discovered Player Debug boundary, deterministic transcript-ordering, and keyboard/recovery obligations before this Change returns to implementation.

## Target Repositories

- This repository (role: official-application).

## Epic Actions

### New Epic Directories

- None proposed.

### Existing Epic Directory Updates

- `docs/epics/lc-003-adventure-play/epic.md`
  - Reconcile LC-003/S1 R5-S2 and R5-S4 implementation and rendered-evidence anchors for the full-height desktop workbench and retained narrow-screen tabs.
  - Add LC-003/S1 R5-S7 for owner-scoped development/test Player Debug editing, including recovery, accessibility, and no-canon-mutation constraints.
  - Extend LC-003/S2 R5 with an owner-visible chat transcript scenario while preserving the generation-context exclusion for prior Guide input.
  - Tighten LC-003/S2 R5-S6 so transcript ordering follows frozen revision lineage rather than timestamps that may tie.
  - Refine LC-003/S3 so the Scene pane renders name, physical description, and current Status only; complete Debug controls remain in Settings, including the development/test Player editor.

## Epic Story Changes

- Added: none.
- Modified behavior: Adventure mode uses its existing Player / Story / Scene workbench as the complete desktop shell; its contextual icon-only Return to Worlds and Settings controls move from the top header into Player context.
- Modified behavior: the owner-visible Adventure detail becomes a chronological chat transcript: completed Act text and Pass markers appear as right-aligned player messages, completed/current Guide input appears as an italicized right-aligned player message, and generated narration appears on the left. A pending or failed Act/Pass/Guide remains visible for its recovery state.
- Modified behavior: selecting an NPC in Scene opens a read-only player-visible detail view with its name, physical description, and current Status (what it is doing). Complete Debug fields and editing remain in Settings.
- Modified behavior: Adventure Settings exposes a development/test-only Player Debug editor for the five existing Adventure-owned Player fields; it uses the same owner/ready/resolving/frozen-Location protections as the local NPC editor and is unavailable in production.
- Modified evidence: LC-003/S1 R5-S2 and R5-S4 receive current component, Storybook, and rendered-browser evidence.
- Added behavior contract: a ready Adventure owner can retry an unchanged failed Player Debug autosave and receives per-field validation guidance; production, non-owners, invalid frozen Locations, and resolving Adventures are refused without state mutation.
- Modified behavior contract: completed owner transcript events remain deterministically ordered by their revision lineage even when database timestamps and per-revision entry sequences tie.
- Removed: none.

## Interactive Scope Boundary

- In scope: cosmetic polish, accessible control refinement, and narrow UI defects on already implemented account, World, Character, or Adventure flows; specifically, the existing Adventure workbench becomes the full-height three-column desktop shell with no top navigation. This replan permits the owner-only Adventure detail contract to project its already durable completed and active Act/Pass/Guide data for the chat transcript, separates Scene-visible NPC details from the existing Settings Debug workflow, and makes the guarded development/test-only Player Debug writer a fully specified local Adventure-state capability.
- Out of scope: new data storage, schema changes, World-canon mutation, authorization-model changes, exposure of Guide input outside the authenticated owner detail response, changing the Game Master's normal story context, model/provider behavior, deployment changes, and multi-Epic behavior changes.
- Stop and route to `/sdd-change --plan` if a request goes beyond this owner-only transcript projection, local Player Debug boundary, or changes a Requirement or Scenario outside LC-003/S1-S3.

## Scope Decisions

- Confirmed: the user-directed refinements and their review-discovered recovery, deterministic-ordering, and verification obligations remain one LC-003 Change; each is classified and recorded in `tasks.md` before implementation resumes.
- Confirmed: a resolved Act, Pass, and Guide are player-facing chat events for the Adventure owner. Guide messages are italicized so their private-direction role is distinct. The returned transcript must survive reload from existing durable turn and revision data, while the Game Master's prompt continues to receive narration and state only.
- Deferred: all unrequested product, API, and behavior work.

## Change Folder

- Active location: `docs/changes/2026-07-22-ui-refinements/`
- Closed location: `docs/changes/closed/2026-07-22-ui-refinements/`

## Impact

- Product: preserves the private creator-first World bible and non-canonical Adventure boundaries.
- Code: frontend presentation, a narrow owner-only Adventure query/client contract projection, a development/test-only owner-scoped Player Debug writer, and its existing typed client contract; no schema or World-canon writer change.
- Tests: deterministic transcript query/service, Player Debug functional boundary, client route/workbench recovery and accessibility, Storybook/rendered-browser, targeted E2E, and aggregate candidate verification.
- Docs: this Change ledger and LC-003/S1-S3 behavior/evidence after implementation.
- ADRs: not expected because this reuses existing immutable turn/revision data and the established local Debug mutation boundary without a new storage or public integration decision.

## Release Communication Impact

- No public release note is expected: this remains a private local product-flow refinement and development/test-only capability. Do not describe the Change as cosmetic-only in internal release assessment.

## Open Questions

- No blocking product question. The replan preserves the confirmed local Player Debug scope and non-canonical Adventure boundary.

## Planning Updates

| Date | Discovery / Classification | Decision | Artifacts Changed | Restart Point |
|---|---|---|---|---|
| 2026-07-23 | Review found an Epic ownership change and technical constraints: the existing Player Debug writer lacks an accepted Scenario and functional boundary evidence; transcript ties are nondeterministic; Player recovery/accessibility and Story focus are incomplete. | Keep the writer in this Change as a guarded local Adventure-state capability. Add S1/R5-S7, tighten S2/R5-S6 lineage ordering, and require NPC-parity recovery/accessibility plus functional and aggregate proof. | `proposal.md`, `design.md`, `tasks.md`; LC-003 and historical report migration are Apply work. | Restart `/sdd-apply` with the failing deterministic transcript test and Player Debug functional/client tests before modifying production code. |
