---
status: in_progress
---
# Tasks: UI Foundations Alignment

## Resume Here

- Last completed action: promoted and reconciled the Change against final Epic truth, transitioned it to `in_progress`, and committed the planning baseline at `7d42eca`.
- Next action: implement and verify the app-owned control baseline, then migrate LC-001 account presentation as the first user-facing slice.
- Active branch/ref: `change/ui-foundations-alignment` from `develop` at `9af0728`.
- Expected dirty files: this Change folder and the three affected Epic files during reconciliation; frontend component, feature, test, and Storybook files during implementation.
- Known blockers: no implementation blocker. Closeout still depends on separately tracked UI Foundations hub registration and comparison capture.

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

- [ ] 3.1 Inventory affected production call sites against the component-strategy table and record the final classification without broad unrelated cleanup.
- [ ] 3.2 Establish or consolidate Lorecraft-owned Button and IconButton behavior for default, focus, active, disabled, pending, and destructive states.
- [ ] 3.3 Establish or consolidate Lorecraft-owned TextField and Textarea behavior for labels, descriptions, validation, focus, disabled, populated, and pending states.
- [ ] 3.4 Copy or adapt the current Base UI-backed Dialog and confirmation references into Lorecraft ownership, preserving feature callbacks and product language.
- [ ] 3.5 Add focused primitive tests for accessible names, keyboard behavior, focus treatment, disabled/pending behavior, and dialog focus containment/restoration.
- [ ] 3.6 Confirm Lorecraft has no UI Foundations runtime or development dependency and no automatic source synchronization.

### 4. LC-001 Account Identity And Workspace Access

- [x] 4.1 Update `LC-001/S1/R3` and add `R3-S3` exactly around accessible account-creation password disclosure; retain all current validation, submission, and session Scenarios.
- [ ] 4.2 Implement the account-creation disclosure controls for Password and Confirm password through a Lorecraft-owned field action.
- [ ] 4.3 Prove that each disclosure control changes only its selected field's presentation while preserving value, focus, autocomplete purpose, validation, and submission.
- [x] 4.4 Update `LC-001/S2/R3` and add `R3-S3` around the corresponding sign-in behavior.
- [ ] 4.5 Implement and prove the sign-in password disclosure behavior without changing credentials, auth calls, error semantics, or pending submission behavior.
- [ ] 4.6 Align sign-up and sign-in buttons, fields, validation, pending, disabled, and focus states with the app-owned baseline while preserving the current centered cardless layout.
- [ ] 4.7 Update LC-001 `Implemented By`, scenario-mapped `Verified By`, and `Verification Gaps`; preserve truthful existing evidence and mark new evidence only after it passes.

### 5. LC-002 World Bible Catalog

- [x] 5.1 Update `LC-002/S1/R2` and add `R2-S4` for stable catalog context, distinct state/action treatment, keyboard/touch operation, and no supported-viewport overflow.
- [ ] 5.2 Migrate World catalog actions and feedback to the app-owned control/state baseline across loading, failure, empty, populated, and retry fixtures.
- [ ] 5.3 Prove that World identity and page context remain stable through state transitions and that pending, disabled, pressed, and focus states are distinguishable.
- [x] 5.4 Strengthen existing `LC-002/S2/R2-S2` for clearly named World navigation and recovery while keeping loaded canon distinct from non-loaded states.
- [ ] 5.5 Align World detail navigation, retry, metadata, Locations, and Characters presentation without replacing the list/document information architecture.
- [ ] 5.6 Confirm LC-003 continues to own Adventure controls shown on World surfaces and no Adventure behavior is absorbed into LC-002.
- [ ] 5.7 Update LC-002 `Implemented By`, scenario-mapped `Verified By`, and `Verification Gaps` with route, Storybook, overflow, and browser evidence.

### 6. LC-003 Adventure Play

- [x] 6.1 Update `LC-003/S1/R5` and add `R5-S4` for the exact desktop Player/Story/Scene composition and Story-first mobile tab behavior.
- [ ] 6.2 Apply app-owned controls and state compositions to Adventure creation, pending, failure, ready, resume, settings, reset, and delete without changing lifecycle transitions.
- [ ] 6.3 Preserve the desktop Player-left, Story-center, Scene-right hierarchy and the Story region's narrative serif reading treatment.
- [ ] 6.4 Preserve the existing mobile Story/Player/Scene tab semantics, selection, panel relationships, and Arrow/Home/End keyboard behavior.
- [ ] 6.5 Add desktop/mobile tests proving ready, pending, and failed Adventure states do not overflow or hide required actions.
- [ ] 6.6 Strengthen existing `LC-003/S1/R5-S3` and migrate settings, reset, and delete overlays to the app-owned dialog/confirmation behavior.
- [ ] 6.7 Prove dialog entry focus, containment, permitted Escape/cancel, trigger restoration, pending duplicate prevention, and announced error/status behavior.
- [ ] 6.8 Update LC-003 `Implemented By`, scenario-mapped `Verified By`, and `Verification Gaps` without relabeling existing lifecycle evidence as new presentation proof.

### 7. Storybook And Comparison Lifecycle

- [ ] 7.1 Retain useful app-owned Auth, Workspace, World, New Adventure, Adventure, and prototype stories while updating them to the consolidated components.
- [ ] 7.2 Add deterministic interaction/accessibility stories for password disclosure, controls, dialogs, and representative loading, empty, error, pending, ready, and destructive states.
- [ ] 7.3 Add app-owned `Comparison/Workbench` exports `Desktop`, `Mobile`, `FileBrowser`, `Empty`, and `Error` with deterministic fixtures and stable generated story IDs.
- [ ] 7.4 Render Lorecraft World navigation/collection in the `FileBrowser` compatibility cell and document it as an intentional domain analogue, not a literal file tree.
- [ ] 7.5 Verify Storybook still binds exact port `4312`, all existing useful stories remain discoverable, and comparison stories require no backend or external provider.
- [ ] 7.6 Create or link separate UI Foundations repository-local tracked work that adds Lorecraft at default `http://127.0.0.1:4312`, supports `LORECRAFT_STORYBOOK_URL`, and includes it in the capture matrix.
- [ ] 7.7 Run the comparison capture from UI Foundations and retain evidence that Lorecraft renders in desktop, mobile, navigation/collection, empty, and error cells.
- [ ] 7.8 Consider a Foundation promotion proposal for password disclosure or another Lorecraft-first improvement only after real-app evidence demonstrates broader reuse; do not make promotion a Lorecraft implementation dependency.

### 8. Verification And Product Truth

- [ ] 8.1 Run focused account tests in `apps/frontend/src/app/App.test.tsx` and map assertions to `LC-001/S1/R3-S3` and `LC-001/S2/R3-S3`.
- [ ] 8.2 Run focused World tests in `apps/frontend/src/worlds/WorldRoutes.test.tsx` and map assertions to `LC-002/S1/R2-S4` and strengthened `LC-002/S2/R2-S2`.
- [ ] 8.3 Run focused Adventure tests in `apps/frontend/src/adventures/AdventureWorkbench.test.tsx` and `apps/frontend/src/adventures/AdventureRoutes.test.tsx`, mapped to `LC-003/S1/R5-S4` and strengthened `R5-S3`.
- [ ] 8.4 Run `apps/frontend/e2e/account-workspace.spec.ts`, `starter-world.spec.ts`, and `adventure-foundation.spec.ts` at the established desktop and mobile projects, retaining overflow and touch-target checks.
- [ ] 8.5 Run repository frontend tests, `lint`, `typecheck`, `build`, `test:storybook`, and `build:storybook` gates using the scripts available on the implementation branch.
- [ ] 8.6 Capture browser screenshots at `1440x900` and `390x844` for auth, World, and Adventure ready/pending/error/dialog states and review focus, overflow, hierarchy, and atmosphere.
- [ ] 8.7 Complete the Manual UI Confirmation steps below and record user feedback using the canonical status vocabulary.
- [ ] 8.8 Reconcile app identity/style/README claims only where implementation makes current tracked documentation inaccurate; keep release communication user-facing.
- [ ] 8.9 Replace all planned `Not implemented yet.` and `Not verified yet.` entries with truthful code paths and scenario-mapped evidence, leaving explicit gaps for anything unproved.
- [ ] 8.10 Run scoped `sdd validate lorecraft --change 2026-07-17-ui-foundations-alignment --repo spaces/code/lorecraft --workspace /Users/taylor/src/my-life/my-vault` before review handoff.

### 9. Review And Closeout

- [ ] 9.1 Add the required user-facing `CHANGELOG.md` entry without including SDD bookkeeping, scaffolding, refactors, or test-only work.
- [ ] 9.2 Run `/sdd-review` as the independent local gate for Requirements, Scenarios, Epic truth, behavior, accessibility, tests, docs, comparison evidence, and branch readiness.
- [ ] 9.3 Record the review outcome and resolve findings or explicitly accept non-blocking risk.
- [ ] 9.4 Confirm the separate UI Foundations hub registration and comparison capture are complete; do not close with Lorecraft absent from the hub.
- [ ] 9.5 Resolve planning/design updates, manual confirmation, release communication, and all stale implementation/verification placeholders.
- [ ] 9.6 Keep machine-readable status aligned with Resume Here, ledgers, review, manual confirmation, branch state, and folder location.
- [ ] 9.7 Follow the repository's authorized PR/merge policy, then run `sdd change close` only after review, integration, acceptance, and closeout truth are complete.

## Implementation Ledger

| Date | Scope | Result | Commit |
|---|---|---|---|
| 2026-07-17 | Promotion and final-Epic reconciliation discovery | Promoted the private Change into Lorecraft after the prerequisite Epic reconciliation closed; created the policy-compliant implementation branch and reconciled semantic duplicates onto stable existing Scenario IDs. | `7d42eca` |

## Verification Ledger

| Date | Check | Evidence Type | What It Proves | Result |
|---|---|---|---|---|
| 2026-07-17 | `sdd validate lorecraft --change 2026-07-17-ui-foundations-alignment --repo spaces/code/lorecraft --workspace /Users/taylor/src/my-life/my-vault --json` | deterministic artifact validation | Proposal, design, task, and affected-Epic references are structurally coherent before promotion | Passed: 1 planned Change, 0 errors, 0 warnings |
| 2026-07-17 | post-promotion scoped `sdd validate` | deterministic artifact validation | Active repository Change resolves all three affected Epics after prerequisite reconciliation | Passed: 1 active Change, 3 Epics, 0 errors, 0 warnings |

## Manual Feedback

No entries. Manual testing begins after implementation provides reviewable routes and stories.

## Planning Updates

- 2026-07-17 post-promotion reconciliation: the final Epic comparison found that planned `LC-002/S2/R2-S4` duplicated existing recovery Scenario `R2-S2`, and planned `LC-003/S1/R5-S5` duplicated existing destructive-action Scenario `R5-S3`. The proposal, design, tasks, and Epics now strengthen those stable existing IDs instead; no scope or ownership changed.
- Use `/sdd-change --replan` if implementation discovers scope expansion, product drift, Epic ownership changes, or a technical constraint that changes accepted behavior.

## Design Updates

No design-revision entries. Use `/sdd-design --revise` for in-scope experience refinements after comparison or manual feedback. Use `/sdd-design --plan` before implementation if a proposal changes Adventure pane order/proportions, the mobile tab model, auth information architecture, Burnished Orange identity usage, or narrative reading typography.

## Manual UI Confirmation

- Status: pending user.
- App URL / route: Lorecraft frontend at its implementation-time local URL; Storybook at exact `http://127.0.0.1:4312`.
- Required setup or test data: deterministic account fixtures plus representative empty, populated, failed, and retryable Worlds; ready, pending, failed, settings, reset, and delete Adventure fixtures.
- Steps for the user: inspect sign-up and sign-in password controls; traverse World catalog/detail states; inspect Adventure desktop and mobile layouts; operate tabs and dialogs with keyboard only; compare the five app-owned comparison stories in the UI Foundations hub.
- Expected result: controls and states feel consistent and accessible while the World list/document structure, Story-dominant Adventure, mobile tabs, dark palette, Burnished Orange identity, and narrative atmosphere remain recognizably Lorecraft.
- Feedback that would change artifacts: requests to change pane hierarchy, mobile navigation, auth flow, palette identity, narrative typography, or the copy-owned reference model require replanning or a design pass before further implementation.

## Blockers / Open Questions

- Planning blockers: none.
- Promotion dependency: resolved; `2026-07-17-epic-truth-reconciliation` is integrated and closed.
- Closeout dependency: complete separately tracked UI Foundations hub registration and successful Lorecraft comparison capture.
- Open product or visual questions: none under the confirmed constraints.

## Closeout

- Change status: planned after scoped validation; later status must follow the active Change lifecycle.
- Epic files updated: not yet; private planning does not edit actual Epics.
- Story labels/references and Requirement/Scenario IDs current: planned deltas defined; implementation reconciliation pending.
- Implemented By maps current: not yet; implementation has not started.
- Scenario-mapped Verified By maps current: not yet; verification has not started.
- Superseded earlier Epic truth reconciled: planned; active reconciliation integration is a promotion dependency.
- ADR status: not applicable unless runtime sharing or a new cross-client contract is proposed.
- Release communication current: planned for implementation closeout.
- `sdd-review` verdict: pending implementation.
- Review record: none yet.
- `review.md` findings resolved: not applicable before review.
- Planning updates resolved: no updates currently recorded.
- Manual UI confirmation status: pending user.
- PR / merge state: no implementation branch, PR, or merge.
- Deferred scope accepted: recorded in proposal and design; reconfirm if implementation expands it.
- Change moved to `docs/changes/closed/`: no; this is a private planned Change.
