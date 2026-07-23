# Proposal: UI Refinements

## Why

This tracked interactive session captures small, user-directed improvements to existing Lorecraft screens while keeping the current creator-first product behavior intact.

## What Changes

- Record and apply one concrete UI refinement at a time.
- Verify each changed rendered surface and keep the owning Epic evidence current when behavior changes.

## Target Repositories

- This repository (role: official-application).

## Epic Actions

### New Epic Directories

- None proposed.

### Existing Epic Directory Updates

- `docs/epics/lc-003-adventure-play/epic.md`
  - Reconcile LC-003/S1 R5-S2 and R5-S4 implementation and rendered-evidence anchors for the full-height desktop workbench and retained narrow-screen tabs.

## Epic Story Changes

- Added: none.
- Modified behavior: Adventure mode uses its existing Player / Story / Scene workbench as the complete desktop shell; its contextual Return and Settings controls move from the top header into Player context.
- Modified evidence: LC-003/S1 R5-S2 and R5-S4 receive current component, Storybook, and rendered-browser evidence.
- Removed: none.

## Interactive Scope Boundary

- In scope: cosmetic polish, accessible control refinement, and narrow UI defects on already implemented account, World, Character, or Adventure flows; specifically, the existing Adventure workbench becomes the full-height three-column desktop shell with no top navigation.
- Out of scope: new capabilities, data or persistence changes, auth or authorization changes, public API or typed-contract changes, deployment changes, and multi-Epic behavior changes.
- Stop and route to `/sdd-change --plan` if a request changes a Requirement or Scenario, requires a data/auth/API/deployment change, or crosses Epic ownership without a clear existing Story.

## Scope Decisions

- Confirmed: the session starts with no concrete UI adjustment selected; each request is classified and recorded in `tasks.md` before or immediately after implementation.
- Deferred: all unrequested product, API, and behavior work.

## Change Folder

- Active location: `docs/changes/2026-07-22-ui-refinements/`
- Closed location: `docs/changes/closed/2026-07-22-ui-refinements/`

## Impact

- Product: preserves the private creator-first World bible and non-canonical Adventure boundaries.
- Code: frontend presentation only unless a concrete request proves otherwise.
- Tests: focused component, browser, or rendered-route verification selected per refinement.
- Docs: this Change ledger and affected Epic evidence only when behavior or its proof changes.
- ADRs: not expected for cosmetic or narrow existing-flow refinements.

## Release Communication Impact

- Not expected for cosmetic-only work. Reassess for a user-visible behavior or public security/operational change.

## Open Questions

- No blocking question. The first request is Adventure-mode desktop composition and contextual-control placement.
