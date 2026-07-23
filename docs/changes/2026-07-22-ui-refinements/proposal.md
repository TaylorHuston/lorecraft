# Proposal: UI Refinements

## Why

This tracked interactive session captures small, user-directed improvements to existing Lorecraft screens while keeping the current creator-first product behavior intact. It now also reconciles the Adventure detail projection required for a durable chat-style transcript.

## What Changes

- Record and apply one concrete UI refinement at a time.
- Verify each changed rendered surface and keep the owning Epic evidence current when behavior changes.
- Project owner-visible completed Act, Pass, and Guide events beside Game Master narration so an Adventure reads as a coherent chat transcript.
- Make selected Scene NPC details player-visible and read-only, while retaining complete local Debug editing in Adventure Settings.
- Provide the same development/test-only local Debug capability for the Adventure Player record in Settings, without changing frozen World canon.

## Target Repositories

- This repository (role: official-application).

## Epic Actions

### New Epic Directories

- None proposed.

### Existing Epic Directory Updates

- `docs/epics/lc-003-adventure-play/epic.md`
  - Reconcile LC-003/S1 R5-S2 and R5-S4 implementation and rendered-evidence anchors for the full-height desktop workbench and retained narrow-screen tabs.
  - Extend LC-003/S2 R5 with an owner-visible chat transcript scenario while preserving the generation-context exclusion for prior Guide input.
  - Refine LC-003/S3 so the Scene pane renders name, physical description, and current Status only; complete Debug controls remain in Settings, including the development/test Player editor.

## Epic Story Changes

- Added: none.
- Modified behavior: Adventure mode uses its existing Player / Story / Scene workbench as the complete desktop shell; its contextual icon-only Return to Worlds and Settings controls move from the top header into Player context.
- Modified behavior: the owner-visible Adventure detail becomes a chronological chat transcript: completed Act text and Pass markers appear as right-aligned player messages, completed/current Guide input appears as an italicized right-aligned player message, and generated narration appears on the left. A pending or failed Act/Pass/Guide remains visible for its recovery state.
- Modified behavior: selecting an NPC in Scene opens a read-only player-visible detail view with its name, physical description, and current Status (what it is doing). Complete Debug fields and editing remain in Settings.
- Modified behavior: Adventure Settings exposes a development/test-only Player Debug editor for the five existing Adventure-owned Player fields; it uses the same owner/ready/resolving/frozen-Location protections as the local NPC editor and is unavailable in production.
- Modified evidence: LC-003/S1 R5-S2 and R5-S4 receive current component, Storybook, and rendered-browser evidence.
- Removed: none.

## Interactive Scope Boundary

- In scope: cosmetic polish, accessible control refinement, and narrow UI defects on already implemented account, World, Character, or Adventure flows; specifically, the existing Adventure workbench becomes the full-height three-column desktop shell with no top navigation. This replan also permits the owner-only Adventure detail contract to project its already durable completed and active Act/Pass/Guide data for the chat transcript, separates Scene-visible NPC details from the existing Settings Debug workflow, and adds a guarded development/test-only Player Debug route for existing Adventure-owned fields.
- Out of scope: new data storage or migrations, changes to the authorization model, exposure of Guide input outside the authenticated owner detail response, changing the Game Master's normal story context, model/provider behavior, deployment changes, and multi-Epic behavior changes.
- Stop and route to `/sdd-change --plan` if a request goes beyond this owner-only transcript projection or changes a Requirement or Scenario outside LC-003/S2.

## Scope Decisions

- Confirmed: the session starts with no concrete UI adjustment selected; each request is classified and recorded in `tasks.md` before or immediately after implementation.
- Confirmed: a resolved Act, Pass, and Guide are player-facing chat events for the Adventure owner. Guide messages are italicized so their private-direction role is distinct. The returned transcript must survive reload from existing durable turn and revision data, while the Game Master's prompt continues to receive narration and state only.
- Deferred: all unrequested product, API, and behavior work.

## Change Folder

- Active location: `docs/changes/2026-07-22-ui-refinements/`
- Closed location: `docs/changes/closed/2026-07-22-ui-refinements/`

## Impact

- Product: preserves the private creator-first World bible and non-canonical Adventure boundaries.
- Code: frontend presentation, a narrow owner-only Adventure query/client contract projection, and a development/test-only owner-scoped Player Debug writer; no schema or World-canon writer change.
- Tests: focused query/service, Player validation/debug-service, client route/workbench, Storybook, and rendered-browser verification selected per refinement.
- Docs: this Change ledger and LC-003/S1-S3 behavior/evidence after implementation.
- ADRs: not expected because this reuses existing immutable turn/revision data and does not establish a new storage or integration boundary.

## Release Communication Impact

- Not expected for cosmetic-only work. Reassess for a user-visible behavior or public security/operational change.

## Open Questions

- No blocking question. The first request is Adventure-mode desktop composition and contextual-control placement.
