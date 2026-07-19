# Review: Interactive Adventure Turns

## Verdict

changes-requested

## Gate Scorecard

| Gate | Result | Notes |
|---|---|---|
| Change artifacts | findings | Review record and status reconciled; private-context and evidence findings remain. |
| Change status | pass | Transitioned from `in_review` to `in_progress` after review findings. |
| Epic truth | findings | S2 reset-after-turn verification was overstated; corrected to an explicit gap. |
| Requirements and Scenarios | findings | S2/R4-S6 lacks direct automated proof; browser recovery/concurrency and live-provider evidence also remain open. |
| Story reference traceability | pass | LC-003/S1 and S2 labels are unique; S2 has stable primary anchors. |
| Reverse traceability | pass | 71 change candidates; no missing implementation or verification references; the only unowned source file is generated Tuyau registry output. |
| Tests and verification | findings | Frontend suite, Storybook, lint, typecheck, and build pass; backend and E2E require a newly configured disposable target and were not rerun. |
| Manual UI confirmation | pass | Current walkthrough is `pending user`; confirmation remains required before merge/closeout, not a code-review defect. |
| Code review | findings | Narration publication lacks an enforceable private-context disclosure boundary. |
| Visual / UX consistency | pass | Story-first responsive composition, controls, and component states match the recorded direction; remaining browser/manual cases are explicit. |
| Security review | findings | Private frozen canon and mutable NPC state can be reflected into player-visible narration. |
| Documentation | findings | Source artifacts corrected; Idea-side current-state documents still describe interactive turns as deferred. |
| Idea repository / current-state truth | findings | Private planning README, folder note, PRD, and visual identity need a mechanical current-state update. |
| Release communication | pass | README and CHANGELOG accurately describe implemented turn behavior without private detail. |
| Branch and merge readiness | blocked | `change/interactive-adventure-turns` cleanly merges into `develop`, but required findings remain. |
| PRD alignment | findings | Product direction remains aligned; its current implementation statement is stale. |

## Findings

### BLOCKING

- [ ] `apps/backend/app/services/story_generation/turn_prompt.ts:43-48,74-83,97` and `apps/backend/app/services/adventure_turn_production_completion_port.ts:191-196,291-298` — narration receives private Character knowledge and hidden mutable NPC state, then persists and exposes untrusted provider prose without an enforceable non-disclosure check. A provider can reflect that data into player-visible story content, contradicting the private-canon boundary. Recommendation: define and test a server-side publication boundary that rejects or safely removes private-context disclosure; prompt wording alone is not sufficient.

### REQUIRED

- [ ] `docs/epics/lc-003-adventure-play/epic.md:S2/R4-S6` — reset-after-interactive-play has no direct proof that completed NPC state is reset to frozen source state. Its former evidence claim was corrected. Recommendation: seed a completed state mutation, reset, and assert player/NPC state and active lineage are rebuilt.
- [ ] `docs/epics/lc-003-adventure-play/epic.md:Verification Gaps` — dedicated browser failure/retry/discard and concurrent-tab choreography remain unimplemented, and live-provider Act/Guide evidence remains pending. Recommendation: add the deterministic browser journey; run the live-provider playtest only with explicit provider-use authorization and record bounded visible evidence.
- [ ] `/Users/taylor/src/my-life/my-vault/spaces/ideas/lorecraft/{README.md,lorecraft.md,prd.md,visual-identity.md}` — current Idea-side docs state interactive turns are deferred/future despite this change implementing them. Recommendation: update them together to describe Act/Pass/private Guide as the current non-canonical Adventure capability and keep the broader deferred scope explicit.

### SUGGESTION

- [ ] `apps/backend/README.md` — add a short pointer to the root disposable-database test setup so a clean review checkout makes the backend test prerequisite easier to discover.

## Verification Evidence

| Command / Scenario | Evidence Type | Requirement / Scenario | Result | What It Proves |
|---|---|---|---|---|
| `sdd validate lorecraft --change 2026-07-18-interactive-adventure-turns --repo /Users/taylor/src/my-life/spaces/lorecraft --workspace /Users/taylor --json` | structural SDD gate | LC-003/S2 | pass; 0 errors, 2 intentional scope warnings | Change/Epic structure and documented one-path story scope. |
| `python3 .../sdd_orphan_audit.py ... --changed-from develop --epic lc-003-adventure-play` | reverse traceability | LC-003/S2 | pass | No missing Epic refs or unowned behavior tests. |
| `npm run test --workspace @lorecraft/frontend` | focused automated | LC-003/S2/R5 | pass; 127 tests | Composer, client, lifecycle, and accessibility component coverage. |
| `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:storybook` | broad supporting gates | LC-003/S2 | pass | Static checks, production builds, and 81 Storybook tests. |
| `npm run test` | backend/database gate | LC-003/S2 | blocked safely | Database-safety sub-suite passed (20 tests); the backend suite correctly refused to run without `ALLOW_TEST_DATABASE_WRITES=1` and a disposable `TEST_DATABASE_URL`. |
| Recorded guarded disposable-Neon backend suite and deterministic Playwright journey | focused database and deterministic E2E | LC-003/S2 | historical passing evidence | Migration, lifecycle, Act/Guide/Pass, reload/reset, owner isolation, and desktop/mobile happy path; explicit gaps above remain. |

## Review Bundle

- Source branch/ref: `change/interactive-adventure-turns`
- Reviewed source commit: `a6a911fee195fee2bece160273c91700be94dcd2`
- Target branch/ref: `develop`
- Merge base: `d389ccd6d7b93e4fa6b11fb82cd9eec1efbd0e79`
- Source-only commits: `a6a911f feat: add interactive adventure turns`
- Target-only commits: none
- Diff stat: 70 files, 6,368 insertions, 181 deletions before review-artifact corrections
- Conflict check: clean (`git merge-tree --write-tree develop HEAD` -> `f09860b05e99370390a19386e7aeab2c23a33d8f`)
- Dirty state at review start: only unrelated untracked `.neon`
- Branch policy: correct `change/*` source targeting non-production `develop`; no PR, merge, push, deployment, or closeout was authorized.

## Discovery Wave

| Pass | Reviewer | Result | Notes |
|---|---|---|---|
| Artifact truth, docs, Idea truth | independent artifact reviewer | findings | Stale ADR/status/evidence claims and Idea-side deferred wording. |
| Code, security, risk | independent code reviewer | blocking | Private prompt context can reach visible narration. |
| Reverse traceability | main review | pass | Generated registry is the expected single ownership exclusion. |
| UI / verification | main review | findings | Component and happy-path E2E evidence are sound; required failure/concurrency/live gaps remain explicit. |
| Integration readiness | main review | blocked | Merge is technically clean but findings prevent integration. |

## Consolidated Remediation

- Root causes addressed: stale ADR status, Story Index database-gap wording, overstated S2/R4-S6 verification, task-ledger review state, and review record.
- Safe-fix batch: source artifact corrections only; no application behavior changed.
- Deferred or unsafe findings: private-context publication boundary, reset-after-turn proof, browser recovery/concurrency, live-provider evidence, and Idea-side current-state docs.
- Affected verification union: `sdd validate`, reverse traceability, frontend tests, lint, typecheck, build, and Storybook.
- Regression-focused rereview: artifact changes preserve explicit gaps; no new regression introduced.

## PR / Merge Readiness

- Source branch: `change/interactive-adventure-turns`
- Reviewed source commit: `a6a911fee195fee2bece160273c91700be94dcd2`
- Target branch: `develop`
- Conflict check: clean
- Commit state: review artifact corrections pending a local review commit; `.neon` remains untouched
- PR status: not started
- Merge status: blocked by findings

## Review Log

- 2026-07-19: Independent local review completed; changes requested.
