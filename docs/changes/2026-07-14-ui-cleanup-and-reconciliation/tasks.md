---
status: in_review
---

# Tasks: UI Cleanup and Reconciliation

## Resume Here

- Last completed action: committed the verified UI reconciliation as `65f8b60` after focused tests, Storybook accessibility checks, isolated-schema Playwright, full project gates, browser inspection, and scoped artifact validation passed.
- Next action: obtain the user's desktop/mobile visual confirmation, then run `/sdd-review` as the independent integration gate.
- Active branch/ref: `change/ui-cleanup-and-reconciliation` from `develop` at `8c1af39`; clean implementation worktree is `spaces/code/lorecraft-ui-cleanup`.
- Expected dirty files: this task ledger only while the implementation commit reference is recorded.
- Known blockers: none.

## Task Checklist

### 1. Promotion And Baseline

- [x] 1.1 Create a separate clean implementation worktree from current `develop` and create `change/ui-cleanup-and-reconciliation` under repository policy without altering the existing dirty source worktree.
- [x] 1.2 Promote the validated plan into that implementation worktree without retaining duplicate planned truth.
- [x] 1.3 Confirm the promoted branch contains only the planned Change artifacts before implementation begins and preserve all unrelated dirty files and branches.
- [x] 1.4 Capture current Storybook and browser baselines for the route/state matrix before changing presentation.

### 2. Epic And Guidance Reconciliation

- [x] 2.1 Update `LC-001/S1`, `S2`, and only the affected shared-state portions of `S3` with the planned presentation Requirements and Scenarios.
- [x] 2.2 Update `LC-002/S1` and `S2` with the planned catalog and detail presentation Requirements and Scenarios.
- [x] 2.3 Preserve still-valid backend Requirements and evidence; add presentation implementation/evidence maps without renumbering accepted IDs.
- [x] 2.4 Refresh the private Lorecraft visual identity from MVP gameplay language to the official creator-first world-bible baseline without copying private paths into the public repository.

### 3. Visual Foundation

- [x] 3.1 Reconcile semantic color, surface, text, action, identity, focus, radius, spacing, control-height, and motion tokens.
- [x] 3.2 Bundle Geist Sans and Geist Mono for deterministic application and Storybook loading, then reconcile global typography, focus-visible, selection, reduced-motion, link, button, and input defaults without broad component overrides or runtime font-service dependencies.
- [x] 3.3 Verify the foundation against every in-scope application Storybook surface before adding local exceptions; keep the deferred Adventure prototype buildable without treating it as reconciliation or acceptance scope.

### 4. Account And Session Surfaces

- [x] 4.1 Recompose sign-up as the centered cardless layout while preserving labels, Confirm password, validation, pending, account navigation, and submission behavior.
- [x] 4.2 Recompose sign-in through the same layout while preserving credentials, generic errors, pending state, account navigation, and return routing.
- [x] 4.3 Reconcile initial session loading/error, background refresh failure, retry, protected revalidation, and focus recovery.
- [x] 4.4 Add or update deterministic Storybook/component evidence for desktop, mobile, validation, error, pending, and recovery states.

### 5. World Catalog And Detail Surfaces

- [x] 5.1 Reconcile the catalog header, account identity, sign-out, loading, populated list, empty state, failure, retry, pending, and responsive behavior without adding unavailable creation controls.
- [x] 5.2 Reconcile World detail identity, description, read-only status, return navigation, Location and Character hierarchy, empty Location/Character collections, loading, missing, unavailable, retry, and responsive behavior without changing content or contracts.
- [x] 5.3 Add or update deterministic Storybook/component evidence for every meaningful catalog and detail state in the design matrix.

### 6. Verification And Evidence

- [x] 6.1 Run focused frontend tests after each surface group and retain all existing account and World behavior proof.
- [x] 6.2 Run Storybook interaction and existing `@storybook/addon-a11y` error-gate tests plus the static build; inspect representative desktop and mobile stories and record in-scope accessibility evidence.
- [x] 6.3 Run deterministic account and starter-World E2E at established desktop and mobile sizes, including representative horizontal-overflow assertions.
- [x] 6.4 Run root lint, test, typecheck, and build gates and record what each command actually exercised.
- [x] 6.5 Update `LC-001` and `LC-002` `Implemented By`, scenario-mapped `Verified By`, `Verification Gaps`, and dates to match actual evidence.
- [x] 6.6 Run scoped `sdd validate` and resolve deterministic artifact errors before review handoff.

### 7. Manual Confirmation And Release Communication

- [x] 7.1 Keep the Lorecraft development servers and Storybook on their reserved ports for manual review unless the user asks otherwise.
- [ ] 7.2 Walk the user through sign-up, sign-in, session recovery, catalog, and World detail at desktop and mobile widths.
- [ ] 7.3 Record manual confirmation using `pending user`, `user confirmed`, or `accepted gap`, and classify feedback before changing scope.
- [x] 7.4 Add the concise user-facing reconciliation summary to the next release's `CHANGELOG.md` `Changed` section without exposing private planning context.

### 8. Review And Closeout

- [ ] 8.1 Run `/sdd-review` as the independent local integration gate after implementation and manual evidence are reconciled.
- [ ] 8.2 Address the consolidated review findings as one remediation set and rerun regression-focused verification.
- [ ] 8.3 Confirm proposal, design, tasks, both Epics, visual guidance, tests, release communication, review state, and manual status agree.
- [ ] 8.4 Obtain explicit authorization before merge, close, push, or any remote mutation.
- [ ] 8.5 Close the Change through `sdd change close` only after review and integration gates pass; do not invent a terminal status value.

## Implementation Ledger

| Date       | Slice                                               | Agent / Guidance                                                                                     | Files / Areas                                                                             | Result                                                                                                                                                      | Commit / Ref |
| ---------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| 2026-07-15 | Promotion, baseline, and Requirement reconciliation | main orchestrator plus delegated component/test discovery using building-components and TDD guidance | active Change, LC-001, LC-002, current frontend/Storybook/test surfaces                   | Clean worktree established; Requirements promoted; implementation gaps and test-map drift identified                                                        | `65f8b60`    |
| 2026-07-15 | Visual foundation and private identity guidance     | main orchestrator using building-components guidance and current Fontsource documentation            | frontend token/font entry points, package dependencies, private Lorecraft visual identity | Bundled Geist variable fonts for app and Storybook; normalized creator-first semantic tokens and interaction defaults; replaced stale gameplay-MVP guidance | `65f8b60`    |
| 2026-07-15 | Account and session surfaces                        | delegated frontend implementer, integrated by main orchestrator                                      | auth pages and stories, shared session states, route focus and recovery, component tests  | Centered cardless auth, responsive recovery, accessible state semantics, focus restoration without ID dependence, and protected-return race fix             | `65f8b60`    |
| 2026-07-15 | World catalog and detail surfaces                   | delegated frontend implementer using TDD, integrated by main orchestrator                            | Workspace and World detail components, styles, stories, and route tests                   | Unified populated/empty/failure states; explicit Location/Character empties; responsive read-only hierarchy                                                 | `65f8b60`    |
| 2026-07-15 | Cross-cutting responsive proof and integration      | main orchestrator                                                                                    | E2E UI assertions, full test/build gates, browser screenshots, Epics, changelog           | Desktop/mobile overflow and touch-target proof added; all configured deterministic gates pass                                                               | `65f8b60`    |

## Verification Ledger

| Date       | Check                                                                                    | Evidence Type                          | What It Proves                                                                                                                                                                                                                  | Result                              |
| ---------- | ---------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 2026-07-15 | Frontend Vitest baseline: 5 files / 59 tests                                             | focused automated test                 | Existing account, session, catalog, and detail behavior remains green before visual changes                                                                                                                                     | Passing                             |
| 2026-07-15 | Storybook Vitest/a11y baseline: 6 files / 17 tests                                       | focused automated test                 | Existing deterministic stories pass the configured accessibility error gate before visual changes                                                                                                                               | Passing                             |
| 2026-07-15 | Root build baseline                                                                      | broad supporting gate                  | Current backend and frontend production builds complete before visual changes                                                                                                                                                   | Passing                             |
| 2026-07-15 | Parallel root typecheck baseline                                                         | broad supporting gate                  | Exposed a command-order race: backend typecheck started before concurrent build generated `#generated/controllers`; rerun serially after build is required                                                                      | Did not pass; execution-order issue |
| 2026-07-15 | Frontend typecheck, production build, and Storybook static build after visual foundation | focused automated/build evidence       | Bundled Geist assets resolve deterministically in both app and Storybook without a runtime font service                                                                                                                         | Passing                             |
| 2026-07-15 | Frontend Vitest: 5 files / 65 tests                                                      | focused automated test                 | Account, session, catalog, detail, API-client, and route behavior after reconciliation                                                                                                                                          | Passing                             |
| 2026-07-15 | Storybook Vitest/a11y: 7 files / 46 tests plus static build                              | deterministic state/accessibility gate | Desktop/mobile validation, pending, recovery, catalog, detail, and deferred Adventure states remain buildable and pass the configured accessibility error gate                                                                  | Passing                             |
| 2026-07-15 | Account and starter-World Playwright: 5 tests                                            | deterministic E2E                      | Desktop/mobile account and starter-World journeys, document overflow, and representative 44 px touch targets                                                                                                                    | Passing                             |
| 2026-07-15 | Root lint, build, serial typecheck, and disposable-schema test suite                     | broad supporting gate                  | Both workspaces lint/build/typecheck; 43 backend and 65 frontend tests pass against an isolated scratch schema                                                                                                                  | Passing                             |
| 2026-07-15 | Agent-browser desktop/mobile inspection and screenshots                                  | browser visual/runtime evidence        | Auth, populated catalog, and loaded detail render coherently without browser console errors                                                                                                                                     | Passing                             |
| 2026-07-15 | Scoped `sdd validate`                                                                    | deterministic artifact validation      | Active Change structure and references resolve against the clean implementation worktree; validation temporarily selected the clean worktree in workspace configuration and restored the original mapping immediately afterward | Passing: 0 errors, 0 warnings       |
| TBD        | User walkthrough                                                                         | manual UI confirmation                 | Visual coherence, responsive behavior, focus, density, and state clarity                                                                                                                                                        | pending user                        |

## Manual Feedback

| Date | Feedback | Classification | Action / Artifact Updates | Status |
| ---- | -------- | -------------- | ------------------------- | ------ |
| TBD  | None yet | TBD            | TBD                       | open   |

## Planning Updates

| Date       | Discovery                                                                                                                                         | Classification      | Planning Updates                                                                                                                                                                                                                                                                    | Next Apply Starting Point                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 2026-07-15 | Scope confirmed as full current-web reconciliation rather than authentication-only.                                                               | in-scope refinement | Expanded proposal, design, Epic actions, state matrix, tasks, verification, and release impact to LC-001 and LC-002.                                                                                                                                                                | Create clean branch/worktree, promote, then begin Visual Foundation.        |
| 2026-07-15 | Final plan review found operational ordering, deterministic font, existing accessibility-gate, empty structured-detail, and prototype-scope gaps. | in-scope refinement | Reordered branch and promotion work, required local Geist delivery and Storybook accessibility evidence, added empty Location/Character states, excluded the Adventure prototype from visual acceptance, pinned Burnished Orange, and explicitly deferred password reveal controls. | Create the clean implementation worktree and branch from current `develop`. |

## Manual UI Confirmation

- Status: pending user
- App URLs / routes: `/sign-up`, `/sign-in`, `/worlds`, `/worlds/stormbound-chapel`, and controlled session/error/empty-collection states through Storybook.
- Required setup or test data: a test account, the installed Stormbound Chapel starter World, deterministic Storybook APIs, and supported desktop/mobile viewports.
- Steps for the user: traverse account access, session recovery, populated and empty catalog, and loaded/empty-collection/missing World detail; use keyboard and pointer at desktop and mobile widths.
- Expected result: one coherent creator-focused visual language, preserved behavior/content, clear states, visible focus, usable touch targets, stable responsive layout, and no horizontal overflow.
- Feedback that would change artifacts: a request for persistent navigation, new capability, light mode, changed information architecture, or changed content/contract semantics requires replanning.

## Blockers / Open Questions

- None.

## Closeout

- Change status: in_review; implementation and deterministic validation are complete pending independent review and user confirmation.
- Epic files updated: presentation Requirements, Scenarios, implementation maps, evidence, and remaining manual gaps are current in `LC-001` and `LC-002`.
- Story labels/references and Requirement/Scenario IDs current: yes; additions preserve existing IDs.
- Implemented By maps current: yes.
- Scenario-mapped Verified By maps current: yes.
- Superseded earlier Epic truth reconciled: yes.
- ADR status: not applicable; no new ADR planned.
- Release communication current: yes; concise user-facing entry added under `Unreleased / Changed`.
- `/sdd-review` verdict: not run.
- Review record: none.
- Manual UI confirmation status: pending user.
- PR / merge state: not started.
- Deferred scope accepted: creator shell, new capability, light mode, and general component package.
- Change moved to `docs/changes/closed/`: no.
