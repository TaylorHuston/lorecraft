---
status: in_progress
---
# Tasks: Epic Audit Remediation

## Resume Here

- Last completed action: promoted the Change, moved it to `in_progress`, and completed the LC-002 Character validation/recovery implementation slice.
- Next action: add and verify LC-001 New Adventure session-loss coverage and exact route labels, then reconcile LC-001/LC-003 Epic truth.
- Active branch/ref: `change/epic-audit-remediation` from `develop` at `00be089`.
- Expected dirty files: this Change's implementation/tests/artifacts plus the three pre-existing untracked Epic audit reports, which remain inputs for the later reconciliation phase.
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

- [ ] 2.1 Normalize LC-001 completely to `sdd-epic-v2`, including independent states, requirement-level primary anchors, exact evidence types, and current gaps.
- [ ] 2.2 Reconcile LC-001/S2 requested-route resumption and S3 New Adventure/route-presentation maps.
- [ ] 2.3 Reconcile LC-002/S2/S3 and LC-003/S1-S3 evidence, forward maps, status/manual claims, and related ADR/closed-Change paths.
- [ ] 2.4 Update all active-Epic `Implemented By`, `Verified By`, and gaps only from inspected current code/proof; rerun validation and reverse inventory.

### 3. Implementation

- [x] 3.1 Implement `LC-002/S3/R2-S2` structured duplicate-key and invalid-Location field errors without weakening not-found/non-disclosure behavior.
- [x] 3.2 Add Character mutation permission/validation/no-publication regression coverage for `LC-002/S3/R1-S2` and `R2-S2`.
- [ ] 3.3 Add `LC-001/S3/R1-S4` direct New Adventure World-load and creation 401 coverage; rename route-presentation and LC-003 stale test anchors to exact current scenarios.
- [ ] 3.4 Reconcile generated contracts if the error shape changes their output; commit each coherent, verified phase.

### 4. Verification

- [ ] 4.1 Run focused backend Character and Adventure/auth suites plus focused frontend Character, New Adventure, route, and Adventure suites.
- [ ] 4.2 Run Storybook and directly inspect Character error/recovery and session-loss rendering at representative desktop/mobile widths.
- [ ] 4.3 Run guarded deterministic E2E only against an explicitly acknowledged disposable environment; otherwise retain the exact gap.
- [ ] 4.4 Run scoped `sdd validate` for the Change and all three Epics, then rerun full current-tree Epic orphan inventories.
- [ ] 4.5 Record only repeatable exact evidence in Epic tables; retain production/recovery evidence as an accepted gap when not rerun.

### 5. Review And Closeout

- [ ] 5.1 Run `/sdd-review` after all implementation and artifact reconciliation is committed.
- [ ] 5.2 Record manual Character-editor acceptance as `pending user`, `user confirmed`, or `accepted gap`.
- [ ] 5.3 Request explicit authorization before merge, close, push, deployment, or production verification.

## Implementation Ledger

| Date | Slice | Agent / Guidance | Files / Areas | Result | Commit / Ref |
|---|---|---|---|---|---|
| 2026-07-22 | Planning | `sdd-change --plan` | LC-001, LC-002, LC-003 audit findings | planned | not applicable |
| 2026-07-22 | LC-002/S3/R1-S2, R2-S2, R6-S2 | `sdd-apply`; risk closure and rendered-route recovery test | Character service/controller, adapter, editor, focused tests, LC-002 Epic | Added fielded author-owned validation errors; retained 401/404 non-disclosure; fixed rejected-editor mutation rejection; backend functional run awaits a safe database target | `3096172` |

## Verification Ledger

| Date | Check | Evidence Type | What It Proves | Result |
|---|---|---|---|---|
| 2026-07-22 | Three `sdd-epic-verify` reports | independent audit | Current Epic drift, implementation defect, and exact remediation obligations | findings recorded |
| 2026-07-22 | LC-001 focused frontend + Storybook suites | focused automated / component state | Account/session and route evidence baseline | 96 frontend, 84 Storybook assertions passed |
| 2026-07-22 | `npm run test --workspace @lorecraft/frontend -- WorldRoutes.test.tsx tuyauWorldApi.test.ts` | focused automated / rendered route | LC-002 fielded adapter mapping, inline error association, stable draft, and no unhandled rejection | 34 passed |
| 2026-07-22 | `npm run lint --workspace @lorecraft/backend` and backend/frontend typechecks | supporting static gates | Character service/controller and editor compile/lint cleanly | passed |
| 2026-07-22 | `npm run verify:contracts` | generated contract | Controller response-shape change does not leave generated Tuyau artifacts dirty | passed |
| 2026-07-22 | `npm run test --workspace @lorecraft/backend -- tests/functional/world_character_authoring.spec.ts` | guarded environment check | Database safety suite runs; functional assertions do not run without an acknowledged disposable target | blocked safely: `ALLOW_TEST_DATABASE_WRITES=1` and disposable `TEST_DATABASE_URL` absent |

## Implementation Risk And Confirmation Matrix

| Requirement / Surface | End-State Invariant | Risk / Failure Mode | Check Or Confirmation Needed | Evidence / Finding | Status |
|---|---|---|---|---|---|
| LC-002/S3/R2-S2 Character validation | Only the invalid editor field is marked; rejected writes publish no WorldVersion | Field error leaks ownership/existence or maps to no field | Backend response/no-mutation tests; frontend field-error test and rendered inspection | Frontend adapter/route proof passed; backend functional proof awaits safe disposable target | partial |
| LC-001/S3/R1-S4 New Adventure 401 | Session ends on both initial World load and creation rejection | Protected data/error UI remains after session loss | Direct route tests plus rendered session-loss check | 2026-07-22 LC-001 audit | known |
| LC-001/002/003 evidence maps | Every durable claim has exact current code/test evidence or an explicit gap | Broad/stale evidence overstates coverage | Inspect title/assertion before mapping; scoped validation and inventory | 2026-07-22 audits | known |
| Private production/recovery | No local artifact states unperformed deployment behavior as verified | False security confidence | Preserve explicit operational gap unless authorized evidence exists | LC-001 ADR contradiction | accepted gap |

## Pattern Parity Matrix

| Concern | Reference Location / Contract | New Location / Contract | Focused Proof | Intentional Divergence / Gap | Status |
|---|---|---|---|---|---|
| Field error serialization | Existing validator errors with `field` | Character duplicate-key/Location service error via controller | Adapter and routed-editor assertions pass; backend JSON assertion is present but unrun pending a disposable target | Only author-owned validation cases receive field detail | partial |
| Session-loss handling | World detail/Adventure page 401 end-session behavior | New Adventure World-load/create 401 behavior | Exact New Adventure route tests | None expected | pending |

## Stateful Transition Matrix

| Start State | Trigger / Transition | Expected Invariant | Focused Test Or Runtime Observation | Result |
|---|---|---|---|---|
| Complete Character draft | Duplicate key or invalid Location save | Field error appears; draft remains editable; no canon publication | Frontend form/API proof passed; backend mutation test awaits a disposable target | partial |
| New Adventure route | World load or create returns 401 | Shared session ends and protected route is replaced by sign-in | New Adventure route tests | pending |

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
| Browser/rendered route tests | Local web/API dev stack and browser automation | Character recovery and New Adventure session loss | ready | run during Apply |
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
| Character editor | desktop and mobile | duplicate key / invalid Location save | actual field is visibly invalid; existing draft remains stable | local app + browser automation | direct rendered observation | no unhandled failure; 422 maps to named field | pending |
| New Adventure route | desktop | initial World-load 401 and create 401 | protected surface yields to existing sign-in route | focused route test plus rendered route where practical | direct rendered observation | no private-content continuation | pending |

## Blockers / Open Questions

- None blocking `/sdd-apply`. Production/recovery checks remain explicit out-of-scope gaps.

## Review Handoff Candidate

- Integration target / merge base: `develop` at Apply start.
- Candidate source commit: pending implementation.
- Source differs from target when implementation changed: yes.
- Intended implementation fully committed: pending.
- Unrelated dirty state preserved: the three audit reports must be intentionally reconciled, not discarded.
- Required risk, fan-out, environment, and evidence rows: pending Apply.

## Closeout

- Change status: planned.
- Epic files updated: pending Apply.
- Manual UI confirmation status: pending user.
- Rendered UI verification status: pending.
- PR / merge state: not started.
- Deferred scope accepted: production/recovery checks only.
- Change moved to `docs/changes/closed/`: no.
