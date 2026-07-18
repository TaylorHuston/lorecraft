# Proposal: UI Foundations Alignment

## Why

Lorecraft already uses much of the shared visual grammar: app-owned semantic tokens, Zinc surfaces, Geist interface typography, Lucide icons, compact radii, responsive states, and a substantial Storybook on reserved port `4312`. Its UI still predates the current UI Foundations reference lifecycle, however. Common buttons, fields, empty states, tabs, and overlays are implemented repeatedly or with app-local interaction mechanics, and Lorecraft is not registered in the cross-application comparison hub.

The alignment must improve consistency and accessibility without erasing Lorecraft's creator-first and narrative identity. Burnished Orange, document-like World views, the story-first Adventure reading surface, the three-column desktop Adventure layout, and Story/Player/Scene mobile tabs are product decisions rather than drift to remove.

## What Changes

- Audit material UI patterns and classify each as an existing application component, adopted reference, application-specific, reference candidate, or deliberate divergence.
- Consolidate useful app-owned controls and state compositions from the current UI Foundations references without importing UI Foundations at runtime.
- Adopt a proven headless behavior layer only where overlays or similar accessibility mechanics justify it; keep product APIs, styling, tests, and later divergence inside Lorecraft.
- Add password visibility controls to sign-in and sign-up while preserving current validation, pending, security, and session behavior.
- Align World catalog/detail controls and states while preserving their list and structured-document information architecture.
- Preserve the Adventure's Player/Story/Scene desktop composition, Story-first mobile tabs, narrative typography, and project-specific atmosphere while strengthening reusable controls, dialogs, and state evidence.
- Add app-owned `Comparison/Workbench` Storybook stories with stable desktop, mobile, navigation/collection, empty, and error IDs.
- Require a separate UI Foundations repository-local handoff to register Lorecraft's exact `4312` catalog and include it in comparison capture before this Change closes.
- Reconcile `LC-001`, `LC-002`, and `LC-003` Requirements, Scenarios, implementation maps, and scenario-mapped evidence after implementation.

## Target Repositories

- This repository (role: official-application).

## Epic Actions

### New Epic Directories

- None proposed. Interface alignment refines existing account, World, and Adventure user paths rather than creating a competing cross-cutting product capability.

### Existing Epic Directory Updates

- Update `docs/epics/lc-001-account-identity-and-workspace-access/epic.md`.
- Update `docs/epics/lc-002-world-bible-catalog/epic.md`.
- Update `docs/epics/lc-003-adventure-play/epic.md`.

## Epic Story Changes

- Modify `LC-001/S1/R3` and add `R3-S3` for an accessible password visibility control on account creation.
- Modify `LC-001/S2/R3` and add `R3-S3` for the corresponding sign-in behavior.
- Preserve `LC-001/S3` authentication and session semantics; update its implementation/evidence maps only where adopted controls or overlay behavior materially support its existing Scenarios.
- Modify `LC-002/S1/R2` and add `R2-S4` for stable, coherent catalog state and action presentation without absorbing LC-003-owned Adventure behavior.
- Refine existing `LC-002/S2/R2-S2` for consistent World-detail navigation and recovery presentation without duplicating its current recovery Scenario.
- Modify `LC-003/S1/R5`, add `R5-S4` for the confirmed desktop/mobile composition, and strengthen existing `R5-S3` with predictable dialog focus, dismissal, pending, and confirmation behavior.
- Do not add, move, split, merge, or remove Stories.

## Scope Decisions

- Confirmed:
  - Lorecraft copies or adapts useful reference source and owns the result.
  - UI Foundations is never imported as a runtime package and does not synchronize Lorecraft automatically.
  - Existing API contracts, auth rules, backend authority, data, routes, and Adventure lifecycle semantics remain unchanged.
  - Burnished Orange remains Lorecraft's identity/action/focus color; Steel Blue remains informational; dark-only presentation remains accepted.
  - The World catalog remains a list and World detail remains a structured reference document.
  - The Adventure remains a three-column Player/Story/Scene composition on desktop and Story-first tabs on mobile.
  - Lorecraft Storybook remains app-owned at exact port `4312` and retains its existing production and prototype catalogs.
  - Comparison participation uses stable app-owned stories and a separately tracked UI Foundations registration.
- Deferred:
  - Light mode, a shared runtime component package, synchronized upgrades, a utility-class migration, and a general component-library rewrite.
  - World authoring, interactive Adventure turns, new navigation information architecture, and any other product capability.
  - Standardizing a Lorecraft-derived improvement in UI Foundations until real application evidence shows it is broadly reusable.
- Assumptions:
  - The current UI Foundations copy-owned model and Base UI-backed reference approach remain available when implementation starts.
  - The active `2026-07-17-epic-truth-reconciliation` Change is integrated or explicitly reconciled before this Change is promoted because it edits the same Epics.
  - Current Lorecraft Storybook, frontend tests, and desktop/mobile Playwright harnesses remain the evidence starting point.
- User decisions that shaped the Story/Requirement split:
  - Preserve app-specific identity and Adventure composition.
  - Align only useful foundational grammar, controls, accessibility, states, auth, tokens, and comparison surfaces.
  - Do not blindly homogenize Lorecraft or make UI Foundations a runtime dependency.

## Change Folder

- Planned location: promoted; private draft removed
- Active location: `docs/changes/2026-07-17-ui-foundations-alignment/`
- Closed location: `docs/changes/closed/2026-07-17-ui-foundations-alignment/`

## Impact

- Product: current account, World, and Adventure surfaces become more consistent and accessible while retaining Lorecraft's established identity and workflows.
- Code: frontend-only app-owned controls, fields, overlays, state compositions, route presentation, Storybook fixtures, and tests; no backend or persistence change.
- Tests: focused component and route tests, Storybook interaction/accessibility coverage, existing desktop/mobile E2E, comparison capture, and manual browser review.
- Docs: update affected Epics, public style/README claims only when implementation changes them, and user-facing release communication.
- ADRs: no new ADR is expected; the selected copy-owned approach follows existing workspace and repository conventions. Replan and assess an ADR if implementation proposes a shared runtime package or a new cross-client contract.

## Release Communication Impact

- Required: yes
- Record / section: `CHANGELOG.md`, next user-facing `Changed` entry
- Public summary: Lorecraft's account, World, and Adventure interfaces now use more consistent accessible controls and states while preserving the product's creator-first and narrative presentation.

## Open Questions

- None block planning. Implementation is sequenced after the active Epic reconciliation, and UI Foundations hub registration is a defined cross-repository coordination dependency rather than an unresolved design decision.
