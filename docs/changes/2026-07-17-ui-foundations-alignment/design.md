# Design: UI Foundations Alignment

## Context

Lorecraft is a dark, creator-first TTRPG reference application with a production account flow, World catalog and detail views, and an Adventure workbench. The frontend already owns semantic CSS tokens, Geist interface typography, Lucide icons, compact radii, a Burnished Orange identity/action/focus color, responsive layouts, reduced-motion handling, and a substantial Storybook at exact port `4312`.

The current UI Foundations repository is a copy-owned reference catalog, not a shared runtime package. Its useful references include buttons, icon buttons, fields, text areas, tooltips, dialogs, menus, tabs, checkboxes, switches, authentication forms, confirmation dialogs, empty states, editor toolbars, collection browsing, and three-pane shells. References move from candidate to Storybook prototype to app-owned adoption, then may be standardized only after real-app validation.

Lorecraft's remaining drift is concentrated in duplicated controls, locally hand-rolled overlay mechanics, incomplete password-field affordances, inconsistent cross-route state treatment, and absence from the comparison hub. Its material product distinctions are intentional: World content is a compact catalog and structured document, while Adventure is a story-first three-pane production surface on desktop and a Story/Player/Scene tabbed surface on mobile. Those distinctions are constraints, not targets for replacement.

## Goals / Non-Goals

**Goals:**

- Establish a reviewed classification and ownership decision for every materially affected pattern.
- Copy or adapt only useful UI Foundations controls, overlays, and state grammar into Lorecraft-owned code.
- Improve keyboard, focus, announcement, pending, disabled, validation, and recovery behavior without changing product semantics.
- Add accessible password visibility controls to sign-up and sign-in.
- Preserve World and Adventure information architecture, responsive composition, typography, and atmosphere.
- Add stable app-owned comparison stories and require separate hub registration before closeout.
- Produce scenario-mapped automated, Storybook, browser, manual, and comparison evidence.

**Non-Goals:**

- A UI Foundations runtime dependency, shared package, synchronized source, or automatic upgrade path.
- A broad visual redesign, light mode, utility-class migration, or generic component-library rewrite.
- Replacing World lists with cards, turning World detail into a dashboard, or replacing Adventure with the generic Foundation shell.
- Changing backend APIs, auth/session authority, persistence, routes, World data, or Adventure lifecycle behavior.
- World authoring, interactive turns, new navigation, or other product capability.
- Promoting a Lorecraft pattern into UI Foundations before more than one application validates it.

## Planning Interview / Story Refinement

- Scope boundary reviewed: account presentation, foundational controls, World state/action presentation, Adventure controls and overlays, Storybook evidence, and comparison participation only.
- User decisions: preserve Lorecraft's TTRPG/narrative identity, Burnished Orange palette, three-column desktop Adventure, Story-first tabbed mobile Adventure, and project-specific atmosphere.
- Assumptions: the current copy-owned UI Foundations lifecycle remains the reference model; Base UI remains acceptable as a direct Lorecraft dependency when a headless primitive materially reduces interaction risk.
- Deferred scope: light mode, shared runtime packages, World authoring, Adventure turn generation, information-architecture changes, and Foundation standardization of Lorecraft-first patterns.
- Story boundaries challenged: no new cross-cutting Epic is warranted; account behavior belongs to LC-001, World presentation belongs to LC-002, and Adventure behavior belongs to LC-003.
- Requirements refined: each affected Epic receives observable responsive, state, keyboard, focus, and recovery Scenarios rather than implementation-task Requirements.
- Scenario gaps considered: password disclosure, empty/failure/retry differentiation, narrow viewport overflow, tab keyboard operation, dialog focus containment and restoration, and destructive pending behavior.
- Open questions that block implementation: none. Material experience direction is confirmed; `/sdd-design --plan` is not required unless implementation proposes changing the confirmed composition or identity constraints.

## Epic Changes

### Update Epic: LC-001 Account Identity And Workspace Access

- Target Epic: `docs/epics/lc-001-account-identity-and-workspace-access/epic.md`
- Change Type: modified Requirements and added Scenarios

#### Story Changes

- Added: no Stories.
- Modified: `LC-001/S1` account creation presentation and `LC-001/S2` sign-in presentation.
- Removed: none.

##### Modify LC-001/S1/R3: Account Creation Presentation

The system SHALL present account creation as a focused, responsive Lorecraft form with persistent field labels, accessible password visibility controls, clear validation and pending states, and keyboard-visible focus.

###### Add Scenario R3-S3: Toggle Account-Creation Password Visibility

- WHEN a visitor activates the visibility control for Password or Confirm password
- THEN only the selected field changes between obscured and readable presentation
- AND its value, validation state, focus, autocomplete purpose, and submission behavior are preserved
- AND the control is operable by keyboard and touch with a clear accessible name for its current action.

##### Modify LC-001/S2/R3: Sign-In Presentation

The system SHALL present sign-in as a focused, responsive Lorecraft form with persistent field labels, an accessible password visibility control, clear validation and pending states, and keyboard-visible focus.

###### Add Scenario R3-S3: Toggle Sign-In Password Visibility

- WHEN a visitor activates the password visibility control on sign-in
- THEN the password changes between obscured and readable presentation without changing its value
- AND validation, focus, autocomplete purpose, and submission behavior are preserved
- AND the control is operable by keyboard and touch with a clear accessible name for its current action.

##### Implemented By

- `apps/frontend/src/auth/PasswordField.tsx`
- `apps/frontend/src/components/TextField/TextField.tsx`
- `apps/frontend/src/components/IconButton/IconButton.tsx`
- `apps/frontend/src/auth/SignUpPage.tsx`
- `apps/frontend/src/auth/SignInPage.tsx`

##### Verified By

- Focused routed and component tests in `apps/frontend/src/app/App.test.tsx` and `apps/frontend/src/components/TextField/TextField.test.tsx`.
- Interaction and accessibility stories in `apps/frontend/src/auth/SignUpPage.stories.tsx` and `apps/frontend/src/auth/SignInPage.stories.tsx`.
- Desktop/mobile browser disclosure checks in `apps/frontend/e2e/account-workspace.spec.ts`.

##### Verification Gaps

- User manual confirmation remains pending; deterministic interaction, Storybook, and desktop/mobile browser evidence is complete.

#### Supersedes / Reconciles

- Supersedes the earlier UI-cleanup deferral of password reveal controls now that the shared reference lifecycle is established.
- Preserve all current auth validation, submission, session, and authorization Scenarios; rewrite implementation and evidence maps only where their code paths materially move.
- Reconcile against the active `2026-07-17-epic-truth-reconciliation` Change before promotion because both Changes touch LC-001.
- Manual confirmation remains `pending user` until the implemented sign-up and sign-in states are reviewed.

### Update Epic: LC-002 World Bible Catalog

- Target Epic: `docs/epics/lc-002-world-bible-catalog/epic.md`
- Change Type: modified Requirements and added Scenarios

#### Story Changes

- Added: no Stories.
- Modified: `LC-002/S1` World catalog presentation and `LC-002/S2` World detail presentation.
- Removed: none.

##### Modify LC-002/S1/R2: Coherent World Catalog Presentation

The system SHALL present World catalog loading, failure, empty, populated, and retry states through one responsive Lorecraft interface with predictable app-owned action and state grammar.

###### Add Scenario R2-S4: Preserve Catalog Context Across States And Actions

- WHEN the catalog transitions among loading, failure, empty, and populated states or the user invokes World navigation or retry
- THEN available World identity and page context remain stable
- AND controls expose distinct keyboard focus, pending, disabled, and pressed states where applicable
- AND the interface introduces no horizontal overflow at supported desktop or mobile widths.

##### Modify LC-002/S2/R2: Readable World Detail Presentation

The system SHALL present World identity, metadata, Locations, Characters, navigation, and recovery feedback as a readable structured reference document using the same app-owned control and state grammar as the catalog.

###### Refine Existing Scenario R2-S2: Navigate Or Recover From World Detail

- WHEN a user returns to Worlds or retries an unavailable World
- THEN the command is clearly named and operable by keyboard and touch
- AND pending or disabled behavior is exposed when applicable
- AND loaded canon is visually distinguishable from empty, loading, and failure feedback.

##### Implemented By

- `apps/frontend/src/components/Button/Button.tsx`
- `apps/frontend/src/components/Dialog/ConfirmDialog.tsx`
- `apps/frontend/src/workspace/WorkspacePage.tsx`
- `apps/frontend/src/worlds/WorldDetailPage.tsx`

##### Verified By

- Route coverage in `apps/frontend/src/worlds/WorldRoutes.test.tsx`.
- Deterministic state coverage in `apps/frontend/src/workspace/WorkspacePage.stories.tsx` and `apps/frontend/src/worlds/WorldDetailPage.stories.tsx`.
- Desktop/mobile browser coverage in `apps/frontend/e2e/account-workspace.spec.ts` and `apps/frontend/e2e/starter-world.spec.ts`.
- App-owned comparison fixtures in `apps/frontend/src/comparison/Workbench.stories.tsx`.

##### Verification Gaps

- User manual confirmation remains pending; app-owned deterministic evidence and the separately owned UI Foundations hub capture are complete.

#### Supersedes / Reconciles

- Refines existing catalog/detail presentation Requirements without changing their data or navigation ownership.
- LC-003 continues to own Adventure controls that appear on shared World surfaces; this Change must not move them into LC-002.
- Reconcile implementation paths and evidence if common controls replace route-local markup.
- Reconciled against the integrated `2026-07-17-epic-truth-reconciliation` Change after promotion; existing recovery semantics remain under `LC-002/S2/R2-S2`.

### Update Epic: LC-003 Adventure Play

- Target Epic: `docs/epics/lc-003-adventure-play/epic.md`
- Change Type: modified Requirement and added Scenarios

#### Story Changes

- Added: no Stories.
- Modified: `LC-003/S1` coherent Adventure experience.
- Removed: none.

##### Modify LC-003/S1/R5: Story-First Responsive Adventure Experience

The system SHALL present Adventure creation, pending, failure, ready, reset, delete, resume, and settings behavior through an accessible story-first responsive interface that preserves Lorecraft's Player/Story/Scene composition.

###### Add Scenario R5-S4: Preserve Desktop And Mobile Adventure Composition

- WHEN a ready, pending, or failed Adventure is viewed at a supported desktop width
- THEN Player, Story, and Scene remain distinct regions with Story dominant in the center
- WHEN the same Adventure is viewed at a supported narrow width
- THEN Story is the first view and Story, Player, and Scene are available through keyboard-operable tabs
- AND no region introduces horizontal overflow or hides required actions.

###### Refine Existing Scenario R5-S3: Operate Recoverable And Destructive Actions Safely

- WHEN settings, reset, or delete opens a dialog
- THEN focus enters the appropriate dialog control, remains contained while open, and returns to the invoking control after close
- AND Escape or cancel dismisses the dialog when dismissal is allowed
- WHEN confirmation is pending or fails
- THEN duplicate or conflicting destructive actions are prevented and status or error feedback is announced.

##### Implemented By

- `apps/frontend/src/components/Dialog/Dialog.tsx`
- `apps/frontend/src/components/Dialog/ConfirmDialog.tsx`
- `apps/frontend/src/adventures/AdventurePage.tsx`
- `apps/frontend/src/adventures/NewAdventurePage.tsx`
- `apps/frontend/src/adventures/AdventureWorkbench.tsx`

##### Verified By

- Route and dialog coverage in `apps/frontend/src/adventures/AdventureRoutes.test.tsx`.
- Responsive pane and tab coverage in `apps/frontend/src/adventures/AdventureWorkbench.test.tsx`.
- Deterministic Storybook states in `apps/frontend/src/adventures/AdventurePage.stories.tsx` and `apps/frontend/src/comparison/Workbench.stories.tsx`.
- Desktop/mobile lifecycle coverage in `apps/frontend/e2e/adventure-foundation.spec.ts`.

##### Verification Gaps

- User manual confirmation remains pending; app-owned dialog, responsive, E2E, and visual evidence and the separately owned UI Foundations hub capture are complete.

#### Supersedes / Reconciles

- Extends the earlier UI-cleanup boundary that excluded the then-future Adventure prototype; production Adventure is now explicitly in scope.
- Preserve existing lifecycle, authorization, recovery, and state-machine Scenarios; update only presentation Requirements and stale evidence paths.
- Preserve the current tested mobile tab interaction unless a focused defect requires a local repair.
- Reconciled against the integrated `2026-07-17-epic-truth-reconciliation` Change after promotion; dialog guarantees remain under existing `LC-003/S1/R5-S3`.

## Epic File Rules

- Update Stories only inside each existing Epic's `epic.md`; do not create `docs/stories/` or individual Story files.
- Keep existing Epic-scoped Story, Requirement, and Scenario labels stable; add only the Scenario IDs named above.
- Preserve current `Implemented By` and `Verified By` evidence that remains truthful, replace moved paths, and map new evidence directly to the new Scenarios.
- Record unresolved proof in `Verification Gaps`; do not convert planned commands or visual inspection intentions into verification claims.

## Technical Options

### Option 1: Selective App-Owned Adoption And Comparison Registration

- Summary: copy or adapt useful controls and overlays into Lorecraft, retain application-specific compositions, and expose stable app-owned comparison stories.
- User impact: consistent controls and stronger accessibility without loss of product identity.
- Implementation complexity: moderate, bounded to frontend presentation, fixtures, and tests.
- Reversibility: high because Lorecraft owns each adoption and may diverge later.
- Client surfaces: sign-up, sign-in, World catalog/detail, Adventure routes, Storybook, and the external comparison hub registration.
- API / contract shape: no server contract change; new stable Storybook story IDs are tooling contracts.
- Frontend/backend boundary: frontend-only except existing auth and Adventure calls continue unchanged.
- Data / schema impact: none.
- Auth / security impact: password disclosure must preserve browser autocomplete and never log, persist, or copy credentials.
- Testability: strong through focused tests, stories, Playwright, and deterministic comparison capture.
- Operational risk: low; the only cross-repository dependency is comparison registration.
- Fit with project conventions: exact fit with copy-owned UI Foundations and Lorecraft's existing CSS Modules/Storybook architecture.

### Option 2: Replace Product Surfaces With Generic Foundation Compositions

- Summary: migrate auth, World, and Adventure wholesale to generic Foundation examples and shell composition.
- User impact: visual uniformity at the cost of Lorecraft's document and narrative hierarchy.
- Implementation complexity: high due to broad layout and interaction churn.
- Reversibility: moderate because product-specific behavior would need to be reintroduced.
- Client surfaces: every frontend route and story.
- API / contract shape: nominally unchanged but UI state orchestration would be rewritten.
- Frontend/backend boundary: frontend-only with unnecessary risk around existing calls.
- Data / schema impact: none.
- Auth / security impact: broad auth form replacement increases regression surface.
- Testability: possible but requires rewriting substantial validated evidence.
- Operational risk: high visual and behavioral regression risk.
- Fit with project conventions: poor; it violates the reference lifecycle and confirmed identity constraints.

### Option 3: Storybook Audit Without Production Consolidation

- Summary: add comparison stories and document drift without changing production controls or overlays.
- User impact: none of the accessibility and consistency gaps are resolved.
- Implementation complexity: low.
- Reversibility: high.
- Client surfaces: Storybook only.
- API / contract shape: no change.
- Frontend/backend boundary: no production change.
- Data / schema impact: none.
- Auth / security impact: existing password and overlay gaps remain.
- Testability: comparison evidence exists but does not represent improved behavior.
- Operational risk: low immediate risk, high risk of catalog-only conformance claims.
- Fit with project conventions: incomplete because real-app validation is a required lifecycle step.

## Selected Approach

Use Option 1. Establish or consolidate Lorecraft-owned primitives for buttons, icon buttons, fields, text areas, and overlays by copying or adapting current Foundation references. Preserve existing feature APIs and CSS Modules, map each primitive to Lorecraft semantic tokens, and migrate only the affected account, World, and Adventure call sites. Use a direct headless primitive dependency only where it supplies material dialog, tooltip, or menu accessibility behavior; UI Foundations itself is never a dependency.

Keep World catalog/detail and Adventure composition in their current feature ownership. Add app-owned fixtures and `Comparison/Workbench` exports named `Desktop`, `Mobile`, `FileBrowser`, `Empty`, and `Error`, yielding the hub's stable story IDs. In Lorecraft, `FileBrowser` intentionally demonstrates World navigation/collection rather than a file tree. A separately tracked UI Foundations change registers `http://127.0.0.1:4312`, supports `LORECRAFT_STORYBOOK_URL`, includes Lorecraft in capture, and labels the comparison concept as navigation/collection without breaking the stable ID.

## Experience Design

- Applicability: required and resolved by confirmed product constraints plus current production and Storybook references.
- Confirmed direction: selective foundational alignment inside the existing dark, compact, creator-first Lorecraft system.
- User confirmation: preserve TTRPG/narrative identity, three-column desktop Adventure, Story-first tabbed mobile Adventure, and project-specific atmosphere.
- Reference artifacts: current Lorecraft production routes and stories, `spaces/shared/visual-style-guide.md`, and the current UI Foundations primitives, patterns, reference lifecycle, and comparison catalog.

### User Flow And Information Architecture

- Account remains a centered, cardless focused form; password visibility is an inline field action and does not add a new step.
- Workspace remains the home for the World catalog; list rows remain the primary browsing unit.
- World detail remains a structured reference document for identity, metadata, Locations, and Characters.
- Adventure remains accessed through existing World/Adventure routes and lifecycle actions.
- Adventure Story remains primary; Player and Scene provide compact supporting context rather than equal dashboard panels.

### Responsive Composition

- Desktop Adventure retains Player left, Story center, and Scene right with the Story region visually dominant.
- Mobile Adventure retains Story first and the existing Story/Player/Scene tab model with arrow, Home, and End keyboard behavior.
- Account and World surfaces maintain persistent labels, 44px touch targets, visible focus, and no horizontal overflow at the supported mobile viewport.
- Dialogs fit narrow viewports, keep destructive actions reachable, and do not cause the underlying layout to shift.
- No viewport-based font scaling or generic stacked replacement of the Adventure composition is introduced.

### Component And State Contract

#### Component Strategy

| Component Or Pattern | Strategy | Initial Owner Or Reference | Required Preview States | Follow-Up |
|---|---|---|---|---|
| Semantic tokens, reset, focus, and motion rules | existing application component | Lorecraft global styles | default, keyboard focus, reduced motion, disabled | Preserve dark Zinc, Burnished Orange, Steel Blue, and compact radii |
| Button and IconButton | adopted reference | Foundation source copied/adapted into Lorecraft | default, hover, focus, active, disabled, pending, destructive | App owns API, CSS, tests, and divergence |
| TextField and Textarea | adopted reference | Foundation source copied/adapted into Lorecraft | default, focus, populated, invalid, disabled, pending | Preserve persistent labels and form semantics |
| Auth layout and form orchestration | existing application component | Lorecraft account routes | loading, validation error, pending, success-ready | Preserve cardless layout and current auth/session behavior |
| Password visibility control | reference candidate (Foundation candidate) | Lorecraft first-use implementation | hidden, visible, keyboard focus, invalid, pending | Offer upstream only after real-app validation |
| Dialog and destructive confirmation | adopted reference | Foundation Base UI-backed dialog patterns copied/adapted into Lorecraft | open, cancelable, pending, failure, destructive | Replace local interaction mechanics without changing feature callbacks |
| World catalog rows and World document sections | application-specific | Lorecraft World features | loading, failure, empty, populated, retry | Keep list/document information architecture |
| Shared empty and failure composition | adopted reference | Foundation EmptyState structure with Lorecraft copy | empty, recoverable failure, pending retry | Keep domain language and context local |
| Adventure desktop shell and mobile tabs | deliberate divergence | Lorecraft AdventureWorkbench | ready, pending, failure, desktop, mobile, keyboard tabs | Preserve Player/Story/Scene hierarchy and existing tab behavior |
| Narrative Story reading typography | deliberate divergence | Lorecraft Story pane | empty, narrative content, long content | Preserve serif narrative surface inside Geist interface chrome |
| Comparison/Workbench story contract | adopted reference | Lorecraft Storybook fixtures plus hub IDs | desktop, mobile, navigation/collection, empty, error | Register separately in UI Foundations at exact port `4312` |

### Accessibility And Interaction

- Every icon-only action has an accessible name and tooltip when the icon's meaning is not self-evident.
- Password disclosure is a real button, preserves input value and autocomplete purpose, and communicates the action rather than exposing credential content to logs or storage.
- Fields retain visible labels, associated errors, keyboard-visible focus, and announced pending or validation feedback.
- Dialog focus enters meaningful content, remains contained, supports Escape when permitted, restores to the trigger, and prevents duplicate destructive submission.
- Existing Adventure tab semantics and roving keyboard behavior remain; selected state and controlled panel relationships stay explicit.
- Loading, empty, failure, retry, pending, and disabled are meaningfully distinct and do not rely on color alone.
- Touch targets remain at least the app's established 44px minimum and reduced-motion behavior is preserved.

### Visual Direction

Use the current dark Zinc surface hierarchy, restrained borders, Burnished Orange action/focus treatment, Steel Blue informational treatment, Geist interface type, and narrative serif Story content. Controls become more systematic, but density, language, World-document structure, and Adventure atmosphere remain Lorecraft-specific. Avoid generic SaaS cards, game HUD ornament, faux-parchment fantasy styling, oversized typography, decorative gradients, and a one-color orange wash.

### Open Design Questions

None. Invoke `/sdd-design --plan` before implementation only if a proposed change alters pane order or proportions, the mobile tab model, auth information architecture, Burnished Orange identity usage, or narrative reading typography.

## Client And API Boundary

- Current clients: Lorecraft Vite/React frontend and its app-owned Storybook.
- Plausible future clients: no new client is introduced by this Change.
- Reusable product capabilities: app-owned controls and overlays may be reused across Lorecraft features.
- API or typed contract: existing frontend/backend contracts remain unchanged; stable comparison story IDs are the only new tooling contract.
- OpenAPI plan, if HTTP-facing: not applicable because no HTTP contract changes.
- Backend platform exposed directly to clients?: unchanged from current architecture.
- Client-specific presentation or local state: password visibility, dialog open state, mobile tab selection, story fixtures, and responsive composition remain frontend-local.
- Rationale: the Change aligns presentation behavior without moving product authority or coupling runtime code to the reference repository.

## Alternatives Considered

- Full generic Foundation migration: rejected because it destroys meaningful product hierarchy and creates broad regression risk.
- Catalog-only alignment: rejected because comparison stories without production adoption do not validate the reference lifecycle.
- New cross-cutting UI Epic: rejected because it would duplicate ownership already held by LC-001, LC-002, and LC-003.

## Why This Approach

Selective adoption fixes concrete consistency and accessibility gaps while keeping ownership local and reversible. It exercises the intended reference lifecycle through a real application, gives the comparison hub stable evidence, and treats Lorecraft's narrative composition as a deliberate product choice instead of visual drift.

## ADRs

- Required: no.
- ADR path: not applicable.
- Decision summary: follow the established copy-owned reference lifecycle and existing Lorecraft frontend ownership boundaries.
- Reconsider when: implementation proposes a shared runtime package, synchronized source, a new cross-client contract, or a durable replacement for the app's styling architecture.

## Implementation Constraints

- Promote only after the active Epic truth reconciliation is integrated or explicitly reconciled.
- Modify no backend behavior, data schema, auth/session rule, route contract, or Adventure lifecycle transition.
- Keep UI Foundations out of Lorecraft runtime and development dependency graphs; copy or adapt source with local attribution where repository conventions require it.
- Do not copy a Foundation pattern until its behavior, accessibility, CSS, tests, and product fit are understood.
- Keep Storybook on exact port `4312`; retain existing stories and add deterministic comparison fixtures without network/provider dependence.
- Complete hub registration through separate UI Foundations repository-local tracked work; do not edit that repository from this Change.
- Preserve unrelated user changes and reconcile implementation against the then-current Epics before editing them.

## Verification Strategy

- Focused automated tests: extend `apps/frontend/src/app/App.test.tsx`, `apps/frontend/src/worlds/WorldRoutes.test.tsx`, `apps/frontend/src/adventures/AdventureWorkbench.test.tsx`, and `apps/frontend/src/adventures/AdventureRoutes.test.tsx`; add primitive interaction tests where behavior is not already covered. Map each assertion to the new Scenario it proves.
- Broad supporting gates: run frontend tests plus repository `lint`, `typecheck`, `build`, `test:storybook`, and `build:storybook` scripts as available at implementation time.
- Deterministic E2E: extend `apps/frontend/e2e/account-workspace.spec.ts`, `starter-world.spec.ts`, and `adventure-foundation.spec.ts` at desktop and mobile viewports, retaining overflow and touch-target assertions.
- Storybook evidence: retain useful auth, Workspace, World, New Adventure, and Adventure state stories; add interaction/accessibility coverage and stable `Comparison/Workbench` desktop, mobile, navigation/collection, empty, and error stories.
- Comparison evidence: with Storybooks running at their exact ports, run the UI Foundations comparison capture after separate hub registration and confirm Lorecraft appears in every expected matrix cell.
- Manual UI confirmation: status `pending user`; inspect sign-up/sign-in, World catalog/detail, and Adventure ready/pending/failure/dialog states at `1440x900` and `390x844`, including keyboard-only operation.
- Browser evidence: retain screenshots for the same viewports and representative states, with notes for composition, overflow, focus, and atmosphere.
- Live-provider or external-service playtests: not required because no provider or backend behavior changes; deterministic fixtures cover presentation.
- Debug/log inspection: not required for acceptance; inspect browser console and accessibility output only when a failing Scenario needs diagnosis.
- Epic truth: replace each `Not implemented yet.` and `Not verified yet.` only after code and scenario-mapped proof exist, then remove resolved Verification Gaps.

## Decisions

- Use selective app-owned adoption, not runtime sharing.
- Preserve the existing World and Adventure information architecture as application-specific behavior.
- Treat the Adventure shell, mobile tabs, and serif narrative surface as deliberate divergences.
- Treat password visibility as a Lorecraft-first Foundation candidate pending real-app validation.
- Use stable comparison IDs while interpreting the file-browser cell as the broader navigation/collection pattern.
- Require the separate UI Foundations registration and successful comparison capture before closeout.
- Skip `/sdd-design --plan` because no material visual question remains under the confirmed constraints.

## Risks / Trade-Offs

- Copied reference code can drift; mitigate with explicit local ownership, focused tests, and comparison review rather than synchronization.
- Primitive migration can subtly alter forms and overlays; migrate by Requirement slice and retain existing product tests throughout.
- Hub registration spans repository ownership; treat it as a closeout dependency with its own tracked work, not an unreviewed edit from this Change.
- The generic `FileBrowser` comparison ID does not describe Lorecraft's domain; retain the ID for compatibility while labeling and rendering a navigation/collection analogue.
- Visual consistency can become homogenization; the component strategy and explicit divergence list are acceptance constraints.
