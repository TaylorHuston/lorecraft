# Proposal: UI Refinements

## Why

This tracked interactive session captures small, user-directed improvements to existing Lorecraft screens while keeping the current creator-first product behavior intact. It now also reconciles the Adventure detail projection required for a durable chat-style transcript.

## What Changes

- Record and apply one concrete UI refinement at a time.
- Verify each changed rendered surface and keep the owning Epic evidence current when behavior changes.
- Project owner-visible completed Act and Pass events beside Game Master narration so an Adventure reads as a coherent chat transcript.
- Make selected Scene NPC details player-visible and read-only, while retaining complete local Debug editing in Adventure Settings.

## Target Repositories

- This repository (role: official-application).

## Epic Actions

### New Epic Directories

- None proposed.

### Existing Epic Directory Updates

- `docs/epics/lc-003-adventure-play/epic.md`
  - Reconcile LC-003/S1 R5-S2 and R5-S4 implementation and rendered-evidence anchors for the full-height desktop workbench and retained narrow-screen tabs.
  - Extend LC-003/S2 R5 with an owner-visible chat transcript scenario while preserving the existing private-Guide and generation-context exclusions.
  - Refine LC-003/S3 so the Scene pane renders name, physical description, and current Status only; complete Debug controls remain in Settings.

## Epic Story Changes

- Added: none.
- Modified behavior: Adventure mode uses its existing Player / Story / Scene workbench as the complete desktop shell; its contextual Return and Settings controls move from the top header into Player context.
- Modified behavior: the owner-visible Adventure detail becomes a chronological chat transcript: completed Act text and Pass markers appear as right-aligned player messages, while generated narration appears on the left. A pending or failed Act/Pass remains visible for its recovery state; Guide text remains absent.
- Modified behavior: selecting an NPC in Scene opens a read-only player-visible detail view with its name, physical description, and current Status (what it is doing). Complete Debug fields and editing remain in Settings.
- Modified evidence: LC-003/S1 R5-S2 and R5-S4 receive current component, Storybook, and rendered-browser evidence.
- Removed: none.

## Interactive Scope Boundary

- In scope: cosmetic polish, accessible control refinement, and narrow UI defects on already implemented account, World, Character, or Adventure flows; specifically, the existing Adventure workbench becomes the full-height three-column desktop shell with no top navigation. This replan also permits the owner-only Adventure detail contract to project its already durable completed and active Act/Pass data for the chat transcript, and separates Scene-visible NPC details from the existing Settings Debug workflow without expanding the data or save boundary.
- Out of scope: new data storage or migrations, auth or authorization changes, Guide disclosure, changing the Game Master's normal story context, model/provider behavior, deployment changes, and multi-Epic behavior changes.
- Stop and route to `/sdd-change --plan` if a request goes beyond this owner-only transcript projection or changes a Requirement or Scenario outside LC-003/S2.

## Scope Decisions

- Confirmed: the session starts with no concrete UI adjustment selected; each request is classified and recorded in `tasks.md` before or immediately after implementation.
- Confirmed: a resolved Act and Pass are player-facing chat events; private Guide text is not. The returned transcript must survive reload from existing durable turn and revision data, while the Game Master's prompt continues to receive narration and state only.
- Deferred: all unrequested product, API, and behavior work.

## Change Folder

- Active location: `docs/changes/2026-07-22-ui-refinements/`
- Closed location: `docs/changes/closed/2026-07-22-ui-refinements/`

## Impact

- Product: preserves the private creator-first World bible and non-canonical Adventure boundaries.
- Code: frontend presentation plus a narrow owner-only Adventure query/client contract projection; no schema or persistence writer change.
- Tests: focused query/service, client route/workbench, Storybook, and rendered-browser verification selected per refinement.
- Docs: this Change ledger and LC-003/S2 behavior/evidence after implementation.
- ADRs: not expected because this reuses existing immutable turn/revision data and does not establish a new storage or integration boundary.

## Release Communication Impact

- Not expected for cosmetic-only work. Reassess for a user-visible behavior or public security/operational change.

## Open Questions

- No blocking question. The first request is Adventure-mode desktop composition and contextual-control placement.
