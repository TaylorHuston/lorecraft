---
status: in_review
---

# Tasks: UI Foundations Alignment

## Resume Here

- Last completed action: completed the follow-up accessibility, comparison-geometry, preview-state, and shared UI Foundations remediation at Lorecraft source commit `90f84b595a7ed71a0bf2f200de0c53434daedc04` and UI Foundations commit `db250f399bac1f19b1cfc1733620c52fc286053a`.
- Next action: await user manual visual confirmation, then rerun `/sdd-review`; do not close or merge without explicit authorization.
- Active branch/ref: `change/ui-foundations-alignment` from `develop` at `9af0728`.
- Expected dirty files: this Change folder and the three affected Epic files during reconciliation; frontend component, feature, test, and Storybook files during implementation.
- Known blockers: no technical blocker. User manual visual confirmation remains pending by request.

## Task Checklist

### 1. Planning Quality

- [x] 1.1 Confirm the scope boundary: foundational controls, accessibility, auth presentation, World state/action grammar, Adventure controls and overlays, Storybook evidence, and comparison participation.
- [x] 1.2 Assign user-path ownership to existing Epics: account behavior to LC-001, World behavior to LC-002, and Adventure behavior to LC-003; create no cross-cutting UI Epic.
- [x] 1.3 Define observable responsive, state, recovery, password-disclosure, tab, focus, pending, and destructive-action Scenarios.
- [x] 1.4 Record confirmed decisions, assumptions, sequencing dependencies, and deferred scope without treating them as implemented behavior.
- [x] 1.5 Require future `Verified By` sections to map evidence directly to Scenario IDs and retain honest `Not implemented yet.` and `Not verified yet.` placeholders until then.
- [x] 1.6 Record why `/sdd-design --plan` is not currently required and the exact visual changes that would trigger it before implementation.
- [x] 1.7 Run scoped validation and set `status: planned` only when proposal, design, tasks, Epic actions, and verification strategy are coherent.

### 2. Promotion And Truth Reconciliation

- [x] 2.1 Confirm `2026-07-17-epic-truth-reconciliation` is integrated or explicitly reconcile its final LC-001, LC-002, and LC-003 text with this planned delta.
- [x] 2.2 Confirm no other unpromoted planned Change owns the same alignment scope immediately before promotion.
- [x] 2.3 Promote with `sdd change promote lorecraft 2026-07-17-ui-foundations-alignment --repo spaces/code/lorecraft --workspace /Users/taylor/src/my-life/my-vault`.
- [x] 2.4 Follow the Lorecraft branch policy and verify the promoted Change is the only active implementation scope before editing application or Epic files.
- [x] 2.5 Re-run scoped `sdd validate` after promotion and resolve any drift caused by the integrated Epic reconciliation.

### 3. App-Owned Foundation Baseline

- [x] 3.1 Inventory affected production call sites against the component-strategy table and record the final classification without broad unrelated cleanup.
- [x] 3.2 Establish or consolidate Lorecraft-owned Button and IconButton behavior for default, focus, active, disabled, pending, and destructive states.
- [x] 3.3 Establish or consolidate Lorecraft-owned TextField and Textarea behavior for labels, descriptions, validation, focus, disabled, populated, and pending states.
- [x] 3.4 Copy or adapt the current Base UI-backed Dialog and confirmation references into Lorecraft ownership, preserving feature callbacks and product language.
- [x] 3.5 Add focused primitive tests for accessible names, keyboard behavior, focus treatment, disabled/pending behavior, and dialog focus containment/restoration.
- [x] 3.6 Confirm Lorecraft has no UI Foundations runtime or development dependency and no automatic source synchronization.

### 4. LC-001 Account Identity And Workspace Access

- [x] 4.1 Update `LC-001/S1/R3` and add `R3-S3` exactly around accessible account-creation password disclosure; retain all current validation, submission, and session Scenarios.
- [x] 4.2 Implement the account-creation disclosure controls for Password and Confirm password through a Lorecraft-owned field action.
- [x] 4.3 Prove that each disclosure control changes only its selected field's presentation while preserving value, focus, autocomplete purpose, validation, and submission.
- [x] 4.4 Update `LC-001/S2/R3` and add `R3-S3` around the corresponding sign-in behavior.
- [x] 4.5 Implement and prove the sign-in password disclosure behavior without changing credentials, auth calls, error semantics, or pending submission behavior.
- [x] 4.6 Align sign-up and sign-in buttons, fields, validation, pending, disabled, and focus states with the app-owned baseline while preserving the current centered cardless layout.
- [x] 4.7 Update LC-001 `Implemented By`, scenario-mapped `Verified By`, and `Verification Gaps`; preserve truthful existing evidence and mark new evidence only after it passes.

### 5. LC-002 World Bible Catalog

- [x] 5.1 Update `LC-002/S1/R2` and add `R2-S4` for stable catalog context, distinct state/action treatment, keyboard/touch operation, and no supported-viewport overflow.
- [x] 5.2 Migrate World catalog actions and feedback to the app-owned control/state baseline across loading, failure, empty, populated, and retry fixtures.
- [x] 5.3 Prove that World identity and page context remain stable through state transitions and that pending, disabled, pressed, and focus states are distinguishable.
- [x] 5.4 Strengthen existing `LC-002/S2/R2-S2` for clearly named World navigation and recovery while keeping loaded canon distinct from non-loaded states.
- [x] 5.5 Align World detail navigation, retry, metadata, Locations, and Characters presentation without replacing the list/document information architecture.
- [x] 5.6 Confirm LC-003 continues to own Adventure controls shown on World surfaces and no Adventure behavior is absorbed into LC-002.
- [x] 5.7 Update LC-002 `Implemented By`, scenario-mapped `Verified By`, and `Verification Gaps` with route, Storybook, overflow, and browser evidence.

### 6. LC-003 Adventure Play

- [x] 6.1 Update `LC-003/S1/R5` and add `R5-S4` for the exact desktop Player/Story/Scene composition and Story-first mobile tab behavior.
- [x] 6.2 Apply app-owned controls and state compositions to Adventure creation, pending, failure, ready, resume, settings, reset, and delete without changing lifecycle transitions.
- [x] 6.3 Preserve the desktop Player-left, Story-center, Scene-right hierarchy and the Story region's narrative serif reading treatment.
- [x] 6.4 Preserve the existing mobile Story/Player/Scene tab semantics, selection, panel relationships, and Arrow/Home/End keyboard behavior.
- [x] 6.5 Add desktop/mobile tests proving ready, pending, and failed Adventure states do not overflow or hide required actions.
- [x] 6.6 Strengthen existing `LC-003/S1/R5-S3` and migrate settings, reset, and delete overlays to the app-owned dialog/confirmation behavior.
- [x] 6.7 Prove dialog entry focus, containment, permitted Escape/cancel, trigger restoration, pending duplicate prevention, and announced error/status behavior.
- [x] 6.8 Update LC-003 `Implemented By`, scenario-mapped `Verified By`, and `Verification Gaps` without relabeling existing lifecycle evidence as new presentation proof.

### 7. Storybook And Comparison Lifecycle

- [x] 7.1 Retain useful app-owned Auth, Workspace, World, New Adventure, Adventure, and prototype stories while updating them to the consolidated components.
- [x] 7.2 Add deterministic interaction/accessibility stories for password disclosure, controls, dialogs, and representative loading, empty, error, pending, ready, and destructive states.
- [x] 7.3 Add app-owned `Comparison/Workbench` exports `Desktop`, `Mobile`, `FileBrowser`, `Empty`, and `Error` with deterministic fixtures and stable generated story IDs.
- [x] 7.4 Render Lorecraft World navigation/collection in the `FileBrowser` compatibility cell and document it as an intentional domain analogue, not a literal file tree.
- [x] 7.5 Verify Storybook still binds exact port `4312`, all existing useful stories remain discoverable, and comparison stories require no backend or external provider.
- [x] 7.6 Create or link separate UI Foundations repository-local tracked work that adds Lorecraft at default `http://127.0.0.1:4312`, supports `LORECRAFT_STORYBOOK_URL`, and includes it in the capture matrix.
- [x] 7.7 Run the comparison capture from UI Foundations and retain evidence that Lorecraft renders in desktop, mobile, navigation/collection, empty, and error cells.
- [x] 7.8 Consider a Foundation promotion proposal for password disclosure or another Lorecraft-first improvement only after real-app evidence demonstrates broader reuse; no promotion is proposed from this first app adoption.

### 8. Verification And Product Truth

- [x] 8.1 Run focused account tests in `apps/frontend/src/app/App.test.tsx` and map assertions to `LC-001/S1/R3-S3` and `LC-001/S2/R3-S3`.
- [x] 8.2 Run focused World tests in `apps/frontend/src/worlds/WorldRoutes.test.tsx` and map assertions to `LC-002/S1/R2-S4` and strengthened `LC-002/S2/R2-S2`.
- [x] 8.3 Run focused Adventure tests in `apps/frontend/src/adventures/AdventureWorkbench.test.tsx` and `apps/frontend/src/adventures/AdventureRoutes.test.tsx`, mapped to `LC-003/S1/R5-S4` and strengthened `R5-S3`.
- [x] 8.4 Run `apps/frontend/e2e/account-workspace.spec.ts`, `starter-world.spec.ts`, and `adventure-foundation.spec.ts` at the established desktop and mobile projects, retaining overflow and touch-target checks.
- [x] 8.5 Run repository frontend tests, `lint`, `typecheck`, `build`, `test:storybook`, and `build:storybook` gates using the scripts available on the implementation branch.
- [x] 8.6 Capture browser screenshots at `1440x900` and `390x844` for representative World and Adventure states and review focus, overflow, hierarchy, and atmosphere; auth disclosure is covered in desktop/mobile E2E.
- [ ] 8.7 Complete the Manual UI Confirmation steps below and record user feedback using the canonical status vocabulary.
- [x] 8.8 Reconcile app identity/style/README claims only where implementation makes current tracked documentation inaccurate; no README claim required revision, and release communication remains user-facing.
- [x] 8.9 Replace all planned `Not implemented yet.` and `Not verified yet.` entries with truthful code paths and scenario-mapped evidence, leaving explicit gaps for anything unproved.
- [x] 8.10 Run scoped `sdd validate lorecraft --change 2026-07-17-ui-foundations-alignment --repo spaces/code/lorecraft --workspace /Users/taylor/src/my-life/my-vault` before review handoff.

### 9. Review And Closeout

- [x] 9.1 Add the required user-facing `CHANGELOG.md` entry without including SDD bookkeeping, scaffolding, refactors, or test-only work.
- [x] 9.2 Run `/sdd-review` as the independent local gate for Requirements, Scenarios, Epic truth, behavior, accessibility, tests, docs, comparison evidence, and branch readiness.
- [x] 9.3 Record the review outcome and resolve findings or explicitly accept non-blocking risk.
- [x] 9.4 Confirm the separate UI Foundations hub registration and comparison capture are complete; do not close with Lorecraft absent from the hub.
- [ ] 9.5 Resolve planning/design updates, manual confirmation, release communication, and all stale implementation/verification placeholders.
- [x] 9.6 Keep machine-readable status aligned with Resume Here, ledgers, review, manual confirmation, branch state, and folder location.
- [ ] 9.7 Follow the repository's authorized PR/merge policy, then run `sdd change close` only after review, integration, acceptance, and closeout truth are complete.

## Implementation Ledger

| Date       | Scope                                              | Result                                                                                                                                                                                                                    | Commit         |
| ---------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 2026-07-17 | Promotion and final-Epic reconciliation discovery  | Promoted the private Change into Lorecraft after the prerequisite Epic reconciliation closed; created the policy-compliant implementation branch and reconciled semantic duplicates onto stable existing Scenario IDs.    | `7d42eca`      |
| 2026-07-17 | App-owned controls and LC-001 account presentation | Added locally owned button, icon-button, field, textarea, and Base UI-backed dialog behavior; migrated sign-up/sign-in to independently controllable password disclosure without changing auth calls or layout ownership. | `d8f7721` |
| 2026-07-17 | LC-002 World presentation | Migrated catalog/detail actions, recovery, pending, and destructive confirmation states to app-owned controls while preserving the World list/document hierarchy and LC-003 ownership of Adventure actions. | `d59b550` |
| 2026-07-17 | LC-003 Adventure presentation | Migrated creation, retry, mobile tabs, settings, reset, and confirmation behavior; replaced the route-local modal with sequential Base UI dialogs and explicit focus restoration while preserving lifecycle semantics. | `d59b550` |
| 2026-07-17 | Comparison contract | Added deterministic `Comparison/Workbench` desktop, mobile, World-navigation analogue, empty, and error fixtures with no backend dependency. | `d59b550` |
| 2026-07-17 | Follow-up accessibility and comparison remediation | Connected destructive consequences to the Dialog description contract, added designed field states, exercised production-height internal scrolling, and aligned Storybook to exact shared-hub host/port. | `90f84b5` |
| 2026-07-17 | Shared comparison registration | Registered Lorecraft and the retained 49th Floor source in the shared UI Foundations Storybook and capture matrix from an isolated worktree. | UI Foundations `db250f3` |

## Verification Ledger

| Date       | Check                                                                                                                                                    | Evidence Type                         | What It Proves                                                                                               | Result                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| 2026-07-17 | `sdd validate lorecraft --change 2026-07-17-ui-foundations-alignment --repo spaces/code/lorecraft --workspace /Users/taylor/src/my-life/my-vault --json` | deterministic artifact validation     | Proposal, design, task, and affected-Epic references are structurally coherent before promotion              | Passed: 1 planned Change, 0 errors, 0 warnings                                               |
| 2026-07-17 | post-promotion scoped `sdd validate`                                                                                                                     | deterministic artifact validation     | Active repository Change resolves all three affected Epics after prerequisite reconciliation                 | Passed: 1 active Change, 3 Epics, 0 errors, 0 warnings                                       |
| 2026-07-17 | focused component and routed account tests                                                                                                               | focused automated tests               | Primitive pending/focus/error behavior plus `LC-001/S1/R3-S3` and `LC-001/S2/R3-S3` disclosure semantics     | Passed: 6 files, 44 tests                                                                    |
| 2026-07-17 | frontend typecheck and lint                                                                                                                              | broad supporting gates                | New component and account TypeScript/CSS/React integration is statically coherent                            | Passed                                                                                       |
| 2026-07-17 | Storybook test suite                                                                                                                                     | deterministic component-preview tests | Existing app states, new control previews, and account disclosure stories remain accessible and interactive after direct Base UI adoption | Passed: 10 files, 69 tests |
| 2026-07-17 | focused World and Adventure route/workbench tests                                                                                                         | focused automated tests               | `LC-002/S1/R2-S4`, strengthened `LC-002/S2/R2-S2`, `LC-003/S1/R5-S3`, and `LC-003/S1/R5-S4` state, dialog, focus, and responsive behavior | Passed: 3 files, 37 tests |
| 2026-07-17 | full frontend test suite                                                                                                                                 | broad regression gate                 | Consolidated controls and migrated World/Adventure surfaces preserve all deterministic frontend behavior | Passed: 13 files, 114 tests |
| 2026-07-17 | full Storybook test suite                                                                                                                                | deterministic component-preview tests | Existing stories plus the five fixed comparison exports render and satisfy interaction/accessibility checks | Passed: 11 files, 74 tests |
| 2026-07-17 | frontend typecheck, lint, production build, and Storybook build                                                                                         | broad supporting gates                | TypeScript, lint, application bundling, and static Storybook integration are coherent | Passed |
| 2026-07-17 | Playwright desktop/mobile suite using the guarded disposable E2E database                                                                               | deterministic E2E                     | Account disclosure, World browsing, Adventure lifecycle, touch targets, and overflow checks pass through production routes and API boundaries | Passed: 7 tests |
| 2026-07-17 | local Storybook captures at `1440x900` and `390x844`                                                                                                     | visual browser inspection             | Three-pane desktop hierarchy, Story-first mobile tabs, World-navigation analogue, empty state, and error recovery render without visible overlap or overflow | Passed; ignored local evidence under `.llm/screenshots/ui-foundations-alignment/` |
| 2026-07-17 | repository `npm test` with guarded disposable test environment                                                                                         | full regression gate                  | Backend database/service/API behavior and all frontend deterministic behavior remain green together | Passed: backend 102 tests; frontend 114 tests |
| 2026-07-17 | changed-surface SDD reverse-traceability audit from `9af0728`                                                                                           | traceability audit                    | Every changed behavior test and source file has current scenario-mapped `Verified By` or `Implemented By` ownership, with no missing references | Passed: 0 unowned tests, 0 unowned source files, 0 missing references |
| 2026-07-17 | final scoped `sdd validate`                                                                                                                             | deterministic artifact validation     | Active Change and all three affected Epics remain structurally coherent after implementation reconciliation | Passed: 0 errors, 0 warnings |
| 2026-07-17 | independent `/sdd-review` discovery and bounded remediation                                                                                           | independent integration review        | Source-vs-target behavior, artifacts, traceability, security, responsive composition, and branch readiness were reviewed together | Ready after four required evidence/artifact fixes |
| 2026-07-17 | focused Dialog test and full Storybook browser suite after review remediation                                                                          | regression verification               | Focus wraps across both dialog boundaries; ready/pending/failed Adventure states retain required actions and overflow-free desktop/mobile composition | Passed: Dialog 2 tests; Storybook 76 tests |
| 2026-07-17 | follow-up frontend and Storybook suites                                                                                                               | regression and component-browser verification | Accessible destructive descriptions, disabled/pending field semantics, and exercised desktop/mobile internal scrolling remain green | Passed: frontend 114 tests; Storybook 78 tests |
| 2026-07-17 | frontend typecheck, lint, production build, and static Storybook build                                                                                | broad supporting gates                | Current TypeScript, CSS, production bundle, and static Storybook output are coherent after remediation | Passed |
| 2026-07-17 | guarded repository tests and Playwright E2E                                                                                                           | full backend/frontend and deterministic E2E | Disposable-database guards accepted the configured targets and all API, persistence, desktop, and mobile journeys remained green | Passed: backend 102 tests; frontend 114 tests; E2E 7 tests |
| 2026-07-17 | UI Foundations `npm run check:all` and `npm run compare:capture`                                                                                      | shared-hub verification and retained visual comparison | Lorecraft is registered in the composed Storybook and appears in all five matched comparison cells | Passed: 20 screenshots plus `comparison-report/index.html`; 5 Lorecraft captures retained at `/private/tmp/ui-foundations-lorecraft/comparison-report/` |
| 2026-07-17 | scoped SDD validation and changed-surface reverse traceability                                                                                        | artifact and ownership verification   | The active Change resolves three Epics with no structural warnings, missing references, or unowned changed source/test files | Passed after Epic comparison-style ownership reconciliation |
| 2026-07-17 | `git merge-tree --write-tree develop 90f84b595a7ed71a0bf2f200de0c53434daedc04`                                                                        | integration verification              | The exact follow-up remediation source merges cleanly into `develop` | Passed: tree `d5eaa6b85c23c17055521aeb9249312508a3e723` |

## Manual Feedback

- 2026-07-17 follow-up review, classified as in-scope defects and verification gaps: expose destructive consequences through the Dialog description contract; assert the resulting accessible description; constrain stable desktop/mobile comparison stories to production-equivalent viewport height; deterministically exercise internal scrolling geometry; add the designed disabled and pending TextField/Textarea previews; refresh exact review SHAs and merge-tree evidence; and complete the separately tracked shared UI Foundations registration and retained capture. No accepted product requirement, Scenario, ownership boundary, or architecture decision changed, so `/sdd-change --replan` was not required.
- Manual visual confirmation remains pending for the user after deterministic remediation is complete.

## Planning Updates

- 2026-07-17 post-promotion reconciliation: the final Epic comparison found that planned `LC-002/S2/R2-S4` duplicated existing recovery Scenario `R2-S2`, and planned `LC-003/S1/R5-S5` duplicated existing destructive-action Scenario `R5-S3`. The proposal, design, tasks, and Epics now strengthen those stable existing IDs instead; no scope or ownership changed.
- Use `/sdd-change --replan` if implementation discovers scope expansion, product drift, Epic ownership changes, or a technical constraint that changes accepted behavior.

## Design Updates

No design-revision entries. Use `/sdd-design --revise` for in-scope experience refinements after comparison or manual feedback. Use `/sdd-design --plan` before implementation if a proposal changes Adventure pane order/proportions, the mobile tab model, auth information architecture, Burnished Orange identity usage, or narrative reading typography.

## Manual UI Confirmation

- Status: pending user.
- App URL / route: Lorecraft frontend at `http://localhost:4310`; Storybook at exact `http://127.0.0.1:4312`.
- Required setup or test data: deterministic account fixtures plus representative empty, populated, failed, and retryable Worlds; ready, pending, failed, settings, reset, and delete Adventure fixtures.
- Steps for the user: inspect sign-up and sign-in password controls; traverse World catalog/detail states; inspect Adventure desktop and mobile layouts; operate tabs and dialogs with keyboard only; inspect the five app-owned `Comparison/Workbench` stories and the retained shared-hub matrix at `/private/tmp/ui-foundations-lorecraft/comparison-report/index.html`.
- Expected result: controls and states feel consistent and accessible while the World list/document structure, Story-dominant Adventure, mobile tabs, dark palette, Burnished Orange identity, and narrative atmosphere remain recognizably Lorecraft.
- Feedback that would change artifacts: requests to change pane hierarchy, mobile navigation, auth flow, palette identity, narrative typography, or the copy-owned reference model require replanning or a design pass before further implementation.

## Blockers / Open Questions

- Planning blockers: none.
- Promotion dependency: resolved; `2026-07-17-epic-truth-reconciliation` is integrated and closed.
- Shared-hub dependency: resolved on isolated UI Foundations branch `misc/register-lorecraft-comparison` at `db250f399bac1f19b1cfc1733620c52fc286053a`; the canonical dirty checkout was not modified.
- Closeout dependency: user manual visual confirmation, fresh independent review, and explicit merge/close authorization.
- Open product or visual questions: none under the confirmed constraints.

## Closeout

- Change status: `in_review`; deterministic remediation and shared-hub evidence are complete, while user manual confirmation remains pending before closeout.
- Epic files updated: yes; LC-001, LC-002, and LC-003 reflect current implementation and evidence.
- Story labels/references and Requirement/Scenario IDs current: yes; semantic duplicate scenarios were reconciled onto stable existing IDs during promotion.
- Implemented By maps current: yes; changed-surface reverse traceability reports no unowned source files or missing paths.
- Scenario-mapped Verified By maps current: yes; changed-surface reverse traceability reports no unowned behavior tests or missing paths.
- Superseded earlier Epic truth reconciled: yes; the prerequisite Epic truth Change is integrated and this Change preserved its stable IDs.
- ADR status: not applicable unless runtime sharing or a new cross-client contract is proposed.
- Release communication current: yes; `CHANGELOG.md` contains only user-facing control and interaction changes.
- `sdd-review` verdict: prior review was ready at implementation commit `2b261810dffec7d7da80d7225931398918ca8951` and review-remediation commit `41699f24e703ece229781ea9556fb8456b73deb5`; follow-up remediation commit `90f84b595a7ed71a0bf2f200de0c53434daedc04` now requires the final independent rerun after user confirmation.
- Review record: `docs/changes/2026-07-17-ui-foundations-alignment/review.md`.
- `review.md` findings resolved: yes; the original four and follow-up accessibility/comparison/shared-hub findings were remediated and deterministically reverified.
- Planning updates resolved: yes; post-promotion duplicate-Scenario reconciliation is recorded.
- Manual UI confirmation status: pending user.
- PR / merge state: implementation committed locally on `change/ui-foundations-alignment`; no push, PR, or merge.
- Deferred scope accepted: recorded in proposal and design; reconfirm if implementation expands it.
- Change moved to `docs/changes/closed/`: no; it remains active until user confirmation, fresh review, explicit integration authorization, and integration complete.
