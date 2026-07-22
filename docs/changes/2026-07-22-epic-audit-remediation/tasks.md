---
status: in_review
---
# Tasks: Epic Audit Remediation

## Resume Here

- Last completed action: independent review corrected LC-003 test-label/overview drift and independently rendered the controlled Character 422 and New Adventure 401 states.
- Next action: provide an explicitly acknowledged disposable `TEST_DATABASE_URL` with `ALLOW_TEST_DATABASE_WRITES=1`, or explicitly accept the remaining required database/E2E verification gap before integration can be reconsidered.
- Active branch/ref: `change/epic-audit-remediation` from `develop` at `00be089`.
- Expected dirty files: none after the in-review ledger commit; the LC-002/LC-003 audit reports are tracked historical inputs.
- Known blockers: production/recovery proof is intentionally out of scope without explicit operational authorization. Backend functional tests require an explicitly acknowledged disposable `TEST_DATABASE_URL`; the local guard refused writes without it on 2026-07-22.

## Task Checklist

### 1. Planning Quality

- [x] 1.1 Define the active-Epic scope, exclusions, user decision, and deferred operational work.
- [x] 1.2 Retain existing Story ownership; add only the accepted sign-in-resumption scenario.
- [x] 1.3 Define validation, permission, recovery, session-loss, and evidence scenarios.
- [x] 1.4 Record explicit production/recovery gaps rather than inventing proof.
- [x] 1.5 Require exact scenario-mapped evidence.
- [x] 1.6 Record limited UI design readiness using existing components; no separate design convergence is needed.
- [x] 1.7 Seed rendered and manual UI verification.
- [x] 1.8 Seed risk, fan-out, and environment obligations.
- [x] 1.9 Validate the planned Change before promotion.

### 2. Epic Artifacts

- [x] 2.1 Normalize LC-001 completely to `sdd-epic-v2`, including independent states, requirement-level primary anchors, exact evidence types, and current gaps.
- [x] 2.2 Reconcile LC-001/S2 requested-route resumption and S3 New Adventure/route-presentation maps.
- [x] 2.3 Reconcile LC-002/S2/S3 and LC-003/S1-S3 evidence, forward maps, status/manual claims, and related ADR/closed-Change paths.
- [x] 2.4 Update all active-Epic `Implemented By`, `Verified By`, and gaps only from inspected current code/proof; rerun validation and reverse inventory.

### 3. Implementation

- [x] 3.1 Implement `LC-002/S3/R2-S2` structured duplicate-key and invalid-Location field errors without weakening not-found/non-disclosure behavior.
- [x] 3.2 Add Character mutation permission/validation/no-publication regression coverage for `LC-002/S3/R1-S2` and `R2-S2`.
- [x] 3.3 Add `LC-001/S3/R1-S4` direct New Adventure World-load and creation 401 coverage; rename route-presentation and LC-003 stale test anchors to exact current scenarios.
- [x] 3.4 Reconcile generated contracts if the error shape changes their output; commit each coherent, verified phase.

### 4. Verification

- [x] 4.1 Run focused backend Character and Adventure/auth suites plus focused frontend Character, New Adventure, route, and Adventure suites. Backend database suites remain explicitly blocked by the guard because no disposable target was supplied.
- [x] 4.2 Run Storybook and directly inspect Character error/recovery and session-loss rendering at representative desktop/mobile widths.
- [x] 4.3 Run guarded deterministic E2E only against an explicitly acknowledged disposable environment; otherwise retain the exact gap. No disposable `TEST_DATABASE_URL` or `ALLOW_TEST_DATABASE_WRITES=1` acknowledgement was supplied, so no database or E2E mutation ran.
- [x] 4.4 Run scoped `sdd validate` for the Change and all three Epics, then rerun full current-tree Epic orphan inventories.
- [x] 4.5 Record only repeatable exact evidence in Epic tables; retain production/recovery evidence as an accepted gap when not rerun.

### 5. Review And Closeout

- [x] 5.1 Run `/sdd-review` after all implementation and artifact reconciliation is committed (current verdict: blocked only on guarded database/E2E evidence; review record refreshed at `636045d`).
- [x] 5.2 Record manual Character-editor acceptance as `pending user`, `user confirmed`, or `accepted gap` (current: pending user).
- [x] 5.3 Request explicit authorization before merge, close, push, deployment, or production verification. No such operation was requested or performed.

## Implementation Ledger

| Date | Slice | Agent / Guidance | Files / Areas | Result | Commit / Ref |
|---|---|---|---|---|---|
| 2026-07-22 | Planning | `sdd-change --plan` | LC-001, LC-002, LC-003 audit findings | planned | not applicable |
| 2026-07-22 | LC-002/S3/R1-S2, R2-S2, R6-S2 | `sdd-apply`; risk closure and rendered-route recovery test | Character service/controller, adapter, editor, focused tests, LC-002 Epic | Added fielded author-owned validation errors; retained 401/404 non-disclosure; fixed rejected-editor mutation rejection; backend functional run awaits a safe database target | `3096172` |
| 2026-07-22 | LC-001/S3/R1-S4 and LC-003 label/ownership reconciliation | `sdd-apply`; focused route evidence | New Adventure route tests, route-presentation titles, LC-003 stale labels and source/ADR paths | Both New Adventure 401 boundaries end the shared session; exact test labels and LC-003 owner maps corrected | `4e3ce8f` |
| 2026-07-22 | LC-001/S1-S3 | `sdd-epic-v2` normalization | LC-001 Epic and audit report | Independent implementation/verification states, requirement anchors, exact evidence, requested-route behavior, and honest operational gaps reconciled | `fe46ade` |
| 2026-07-22 | Rendered recovery fixtures | `sdd-apply`; Storybook and browser inspection | Character editor and New Adventure route | Controlled 422 field recovery and both controlled 401 boundaries render through production route/provider seams without console errors or mobile overflow | `454ec94`, `099033c` |
| 2026-07-22 | LC-003/S1-S2 evidence reconciliation | `sdd-apply`; scenario-by-scenario anchor review | LC-003 Epic, route/unit test labels | Replaced aggregate/historical proof claims with narrow inspected anchors and explicit operational/manual gaps | `cb3bf09` |

## Verification Ledger

| Date | Check | Evidence Type | What It Proves | Result |
|---|---|---|---|---|
| 2026-07-22 | Three `sdd-epic-verify` reports | independent audit | Current Epic drift, implementation defect, and exact remediation obligations | findings recorded |
| 2026-07-22 | LC-001 focused frontend + Storybook suites | focused automated / component state | Account/session and route evidence baseline | 96 frontend, 84 Storybook assertions passed |
| 2026-07-22 | `npm run test --workspace @lorecraft/frontend -- WorldRoutes.test.tsx tuyauWorldApi.test.ts` | focused automated / rendered route | LC-002 fielded adapter mapping, inline error association, stable draft, and no unhandled rejection | 34 passed |
| 2026-07-22 | `npm run test --workspace @lorecraft/frontend -- AdventureRoutes.test.tsx RoutePresentation.test.tsx creationRequestId.test.ts` | focused automated route/UI | New Adventure World-load/create 401 session loss; LC-001 route context and LC-003 UUID fallback labels | 23 passed |
| 2026-07-22 | `npm run test --workspace @lorecraft/frontend -- App.test.tsx AdventureRoutes.test.tsx RoutePresentation.test.tsx` | focused automated route/UI | LC-001 requested protected-route resumption, session loss, and route title/focus evidence | 59 passed |
| 2026-07-22 | `sdd validate lorecraft --epic LC-001 --repo …/lorecraft --workspace /Users/taylor --json` | structural Epic validation | LC-001 v2 schema and traceability shape | passed: 0 errors; one accepted `LARGE_STORY_SCOPE` warning for S2's 4 requirements / 13 scenarios |
| 2026-07-22 | `npm run lint --workspace @lorecraft/backend` and backend/frontend typechecks | supporting static gates | Character service/controller and editor compile/lint cleanly | passed |
| 2026-07-22 | `npm run verify:contracts` | generated contract | Controller response-shape change does not leave generated Tuyau artifacts dirty | passed |
| 2026-07-22 | `npm run test --workspace @lorecraft/backend -- tests/functional/world_character_authoring.spec.ts` | guarded environment check | Database safety suite runs; functional assertions do not run without an acknowledged disposable target | blocked safely: `ALLOW_TEST_DATABASE_WRITES=1` and disposable `TEST_DATABASE_URL` absent |
| 2026-07-22 | Review rerun: focused frontend routes/adapter plus World-detail Storybook | focused automated / component state | `key` and `locationKey` field recovery, retained drafts, normal authoring fixture | 35 frontend and 19 Storybook tests passed |
| 2026-07-22 | Review rerun: Change plus LC-001, LC-002, LC-003 scoped validation; changed-from reverse inventories | structural / reverse traceability | Current Change schema, all active Epic anchors, and changed-surface ownership | Change/LC-002 passed without warnings; LC-001 and LC-003 retain accepted large-story warnings only |
| 2026-07-22 | `npm run test:storybook --workspace @lorecraft/frontend -- WorldDetailPage.stories.tsx` | rendered component fixture | Controlled duplicate-key and invalid-Location recovery | 21 passed |
| 2026-07-22 | `npm run test:storybook --workspace @lorecraft/frontend -- NewAdventurePage.stories.tsx` | rendered routed fixture | Controlled New Adventure World-load/create 401 session loss | 7 passed |
| 2026-07-22 | Direct Storybook browser inspection | rendered desktop/mobile | Duplicate-key desktop, invalid-Location at 390px, World-load 401 desktop, creation 401 at 390px | Field-local errors or Sign in replacement, retained Character draft, no console errors, 390px width has no overflow |
| 2026-07-22 | Focused frontend suite `AdventureRoutes`, `creationRequestId`, `AdventureWorkbench`, `WorldRoutes`, `tuyauWorldApi` | focused automated route/UI | Exact LC-001/002/003 labels and evidence anchors | 73 passed |
| 2026-07-22 | Backend guarded test command | environment safety | Database-backed unit/functional evidence is never run without acknowledgement | blocked safely: `ALLOW_TEST_DATABASE_WRITES=1` and disposable `TEST_DATABASE_URL` absent |
| 2026-07-22 | Current-tree reverse inventory for LC-001, LC-002, and LC-003 changed from `develop` | structural / reverse traceability | Every cited implementation/evidence path resolves | no missing implementation or verification references; cross-Epic changed-surface candidates are expected ownership intersections, not deletion candidates |
| 2026-07-22 | Independent review regression pass | independent review | LC-003 evidence-label and current-scope correction | 19 workbench tests, 28 Storybook tests, LC-003 validation, and diff check passed; review record refreshed |

## Implementation Risk And Confirmation Matrix

| Requirement / Surface | End-State Invariant | Risk / Failure Mode | Check Or Confirmation Needed | Evidence / Finding | Status |
|---|---|---|---|---|---|
| LC-002/S3/R2-S2 Character validation | Only the invalid editor field is marked; rejected writes publish no WorldVersion | Field error leaks ownership/existence or maps to no field | Backend response/no-mutation tests; frontend field-error test and rendered inspection | Fielded adapter/route plus controlled Storybook desktop/mobile states pass; backend functional proof awaits safe disposable target | partial |
| LC-001/S3/R1-S4 New Adventure 401 | Session ends on both initial World load and creation rejection | Protected data/error UI remains after session loss | Direct route tests plus rendered session-loss check | Both direct route tests and controlled Storybook desktop/mobile session-loss fixtures pass | complete in controlled proof |
| LC-001/002/003 evidence maps | Every durable claim has exact current code/test evidence or an explicit gap | Broad/stale evidence overstates coverage | Inspect title/assertion before mapping; scoped validation and inventory | LC-003/S1-S2 tables now use narrow current anchors; production/manual gaps remain explicit | complete |
| Private production/recovery | No local artifact states unperformed deployment behavior as verified | False security confidence | Preserve explicit operational gap unless authorized evidence exists | LC-001 ADR contradiction | accepted gap |

## Pattern Parity Matrix

| Concern | Reference Location / Contract | New Location / Contract | Focused Proof | Intentional Divergence / Gap | Status |
|---|---|---|---|---|---|
| Field error serialization | Existing validator errors with `field` | Character duplicate-key/Location service error via controller | Adapter, routed-editor, and controlled Storybook assertions pass; backend JSON assertion is present but unrun pending a disposable target | Only author-owned validation cases receive field detail | partial |
| Session-loss handling | World detail/Adventure page 401 end-session behavior | New Adventure World-load/create 401 behavior | Exact route tests plus real AuthProvider/AppRoutes Storybook fixture pass | None expected | complete in controlled proof |

## Stateful Transition Matrix

| Start State | Trigger / Transition | Expected Invariant | Focused Test Or Runtime Observation | Result |
|---|---|---|---|---|
| Complete Character draft | Duplicate key or invalid Location save | Field error appears; draft remains editable; no canon publication | Frontend form/API and controlled Storybook proof passed; backend mutation test awaits a disposable target | partial |
| New Adventure route | World load or create returns 401 | Shared session ends and protected route is replaced by sign-in | Named route tests plus controlled routed Storybook states | passed |

## Decision Fan-Out Ledger

| Date | Decision / Discovery | End-State Consequence | Affected Surfaces To Reconcile | Evidence / Artifact Updates | Status |
|---|---|---|---|---|---|
| 2026-07-22 | One Change covers all active-Epic audit findings | Shared closure/status/evidence corrections stay consistent | Epics, ADRs, closed Change ledger, tests, reports | proposal/design/tasks | planned |
| 2026-07-22 | Production/recovery assertions remain gaps | No operational test is implied or run | LC-001 Epic, browser-session ADR, evidence tables | artifact reconciliation | planned |
| 2026-07-22 | Character validation must remain fielded only inside an author-owned World | Existing frontend recovery contract needs a safe backend field signal | Character service/controller, generated contract, frontend adapter/editor, functional and route tests, LC-002 Epic | fielded `key`/`locationKey` response and inline-recovery test added | partial |

## Verification Environment

| Evidence Obligation | Required Setup / Safety Boundary | Needed For | Current Readiness | Result / Resolution |
|---|---|---|---|---|
| Character service/functional tests | Existing guarded test harness with `ALLOW_TEST_DATABASE_WRITES=1` and disposable `TEST_DATABASE_URL` | LC-002 validation and no-publication proof | blocked safely; no target configured | test is present; retain explicit verification gap |
| Browser/rendered route tests | Local web/API dev stack and browser automation | Character recovery and New Adventure session loss | deterministic fixtures and direct desktop/390px browser inspection complete | controlled 422 and both controlled 401 states pass; this is not a live API exercise |
| Deterministic E2E/migration checks | Explicitly acknowledged disposable database | Cross-layer browser/migration proof | pending | retain gap if not authorized/configured |
| Production/recovery checks | Private deployment/recovery target and explicit authorization | LC-001 operational evidence | out of scope | accepted gap |

## Manual UI Confirmation

- Status: pending user
- App URL / route: Character editor on an author-owned non-seed World.
- Required setup or test data: an existing Character key and a Location outside the selected World or a removed Location key.
- Steps: save duplicate key or invalid Location; correct the highlighted field; save again; verify other field values remain intact.
- Expected result: an actionable error is associated with the actual field; no generic unhighlighted validation state; corrected save completes normally.
- Feedback that would change artifacts: lost draft, unhighlighted validation, exposed inaccessible data, or a session-loss recovery failure.

## Visual Verification Matrix

| Surface / Route or Fixture | Viewport | State / Interaction | Expected Rendered Behavior | Tool / Setup | Inspected Evidence | Console / Network | Result |
|---|---|---|---|---|---|---|---|
| Character editor | desktop and 390px mobile | normal authoring form | required fields remain readable with no overflow | Storybook `Application/Worlds/Detail/Authoring` plus browser automation | directly inspected current authoring form | no overlay or console errors; no horizontal overflow | pass |
| Character editor | desktop duplicate key; 390px invalid Location | duplicate key / invalid Location save | actual field is visibly invalid; existing draft remains stable | controlled Storybook plus browser automation | duplicate Key and invalid Canonical Location are field-local; complete draft remains present | no console errors; mobile `scrollWidth === clientWidth === 390` | pass (controlled fixture) |
| New Adventure route | desktop World-load 401; 390px creation 401 | controlled World-load/create 401 | protected surface yields to existing sign-in route | real AuthProvider/AppRoutes Storybook fixture plus browser automation | Sign in replaces New Adventure and document title is `Sign in | Lorecraft` | no console errors; mobile `scrollWidth === clientWidth === 390` | pass (controlled fixture) |

## Blockers / Open Questions

- Independent review is complete and blocked only on required database-backed functional/no-publication and deterministic E2E evidence. Provide an explicitly acknowledged disposable `TEST_DATABASE_URL` and `ALLOW_TEST_DATABASE_WRITES=1`, or explicitly accept this non-manual verification gap. Production/recovery checks remain separate accepted out-of-scope gaps.

## Review Handoff Candidate

- Integration target / merge base: `develop` at Apply start.
- Candidate source commit: `636045d` reviewed for behavior; the branch is not an integration candidate until the database/E2E blocker is resolved or accepted.
- Source differs from target when implementation changed: yes.
- Intended implementation fully committed: yes.
- Unrelated dirty state preserved: none expected after the review-safe batch commit.
- Required risk, fan-out, and evidence rows: rendered and LC-003 exact evidence are complete; guarded database/E2E proof is required and unresolved; live-provider/production recovery remain explicit gaps.

## Closeout

- Change status: in_review.
- Epic files updated: LC-001 normalized with controlled 401 rendering proof; LC-002 field recovery evidence includes controlled rendering; LC-003/S1-S2 evidence is scenario-mapped with explicit gaps.
- Manual UI confirmation status: pending user.
- Rendered UI verification status: independently complete for controlled Storybook 422/401 fixtures; live authenticated API proof remains environment-gated.
- PR / merge state: not started.
- Deferred scope accepted: production/recovery checks only. Database/E2E proof is not accepted.
- Change moved to `docs/changes/closed/`: no.
