---
status: in_review
---
# Tasks: Restore Release Gate Integrity

## Resume Here

- Last completed action: independent `/sdd-review` remediated all required findings and `f46fdf5` passed the fresh guarded `ci:required` aggregate gate.
- Next action: request user authorization before merging into `develop`, closing the Change, pushing, or releasing.
- Active branch/ref: `fix/release-gate-integrity` from `develop` at `998d7af`
- Expected dirty files: none after committing this status/handoff reconciliation.
- Known blockers: none

## Task Checklist

### 1. Planning Quality

- [x] 1.1 Confirm scope: twelve backend release failures plus the missing aggregate local gate.
- [x] 1.2 Confirm existing Epic ownership: LC-001/S1-S2, LC-002/S3, and LC-003/S1-S3; no new Epic or Story.
- [x] 1.3 Preserve accepted owner-only complete debug-card disclosure while keeping cross-owner, Guide, narration, model-evidence, and log privacy boundaries distinct.
- [x] 1.4 Compare symptom patching, contract-first remediation, and remote-CI-only enforcement; select contract-first remediation plus a fresh local gate.
- [x] 1.5 Record no-UI/no-new-capability boundaries and the replan trigger for any product-contract conflict.
- [x] 1.6 Seed risks, decision fan-out, state transitions, command parity, and verification environment obligations.
- [x] 1.7 Run scoped `sdd validate`, resolve findings, and set `status: planned`.

### 2. Failure Classification And Evidence Baseline

- [x] 2.1 Create a twelve-row root-cause ledger in this Change before modifying code or assertions. For every row, record isolated reproduction, aggregate reproduction, accepted Epic Scenario, owning boundary, classification, and intended remedy.
- [x] 2.2 Classify each row as one of: implementation regression, stale test/evidence, test-isolation defect, migration-fixture incompatibility, or blocking product contradiction.
- [x] 2.3 Reproduce the implicated suites on a freshly migrated guarded disposable database with cache bypass; record commands and actual discovered test counts.
- [x] 2.4 When aggregate-only behavior is suspected, run the affected suite alone and after its likely state-producing predecessor; prove the order dependency before resetting state.
- [ ] 2.5 If any row contradicts current accepted Epic behavior, stop implementation and run `/sdd-change --replan` rather than choosing product behavior locally.

#### Initial Failure Inventory

| # | Current failure | Expected owning contract | Initial hypothesis; must be proved |
|---|---|---|---|
| 1 | `frozen_world_source_migration.spec.ts` concurrent publication reads missing `initial_mood` | LC-003/S1/R2-S1 | Current publication code is running against an intentionally older migration fixture schema. |
| 2 | `adventure_api.spec.ts` minimized projection contains `He knows who rang the bell.` | LC-003/S1/R4-S1 and LC-003/S3/R1-S1 | Older minimization assertion conflicts with accepted owner-only complete debug cards; non-owner privacy still requires proof. |
| 3 | `adventure_api.spec.ts` generation burst limit returns 409 instead of expected 429 | LC-003/S1/R3-S5 | State/action ordering or limiter accounting prevents the final request from reaching the expected quota boundary. |
| 4 | `adventure_query_service.spec.ts` frozen Adventure projection mismatch | LC-003/S1/R2-S2 and R4-S1 | Projection expectation drift after complete NPC-card/current-state work. |
| 5 | `adventure_turn_worker.spec.ts` short reflected Guide rejection fails | LC-003/S2/R1-S3 and R3-S5 | Genuine private narration guard regression or incomplete short-value rule. |
| 6 | `adventure_turn_worker.spec.ts` expired claim/retry/discard fails | LC-003/S2/R2-S2 and R2-S5 | Claim lifecycle state or aggregate fixture interference violates recovery invariants. |
| 7 | `adventure_turn_worker.spec.ts` stale-head/throwing-commit atomicity fails | LC-003/S2/R2-S4 and R2-S6 | Genuine stale/transaction rollback regression or leaked test state. |
| 8 | `world_character_authoring.spec.ts` valid create gets 429 | LC-002/S3/R1-S1, R2-S1, R5-S1 | Process-global request limiter state leaks into unrelated functional tests. |
| 9 | `world_character_authoring.spec.ts` valid edit gets 429 | LC-002/S3/R3-S1 and R5-S1 | Same shared limiter hypothesis. |
| 10 | `world_character_authoring.spec.ts` valid delete gets 429 | LC-002/S3/R4-S1 and R5-S1 | Same shared limiter hypothesis. |
| 11 | `world_character_authoring.spec.ts` authorization/validation path gets 429 | LC-002/S3/R1-S2 and R2-S2 | Same shared limiter hypothesis, with security semantics preserved. |
| 12 | `world_version_publication.spec.ts` expects blank initial state but gets fallback prose | LC-003/S1/R2-S1 and LC-002/S3/R5 | Test/default serialization drift; accepted current fallback semantics must be located and made consistent. |

#### Classified Failure Ledger

| # | Reproduction / Aggregate Evidence | Accepted Scenario | Owner | Classification | Remedy |
|---|---|---|---|---|---|
| 1 | Isolated historical fixture installs through `1784233200000`; current publisher selects later `initial_*` fields. | LC-003/S1/R2-S1 | migration fixture | migration-fixture incompatibility | Keep exact historical migration proof; move publisher concurrency proof to a schema composed through `1784416800000`. |
| 2 | Owner API intentionally returns current-scene card `privateKnowledge`; prior minimization assertion fails. | LC-003/S1/R4-S1, LC-003/S3/R1-S1 | owner projection test | stale test/evidence | Assert complete owner-debug card; retain non-owner, model-evidence, and frozen-source privacy assertions. |
| 3 | Test-only limiter capacity is 100, so the expected eleventh request reaches busy-controller conflict and receives 409. | LC-003/S1/R3-S5 | limiter configuration/test | implementation regression | Restore ten-request functional quota; preserve a narrowly documented E2E-only capacity fixture if browser flow requires more requests. |
| 4 | `AdventureQueryService#findForOwner` deliberately projects complete frozen/current card data; minimized DTO expectation fails. | LC-003/S1/R2-S2, R4-S1; LC-003/S3/R1 | query-service test | stale test/evidence | Update the authorized owner DTO expectation while preserving filtering/isolation assertions. |
| 5 | Short Guide `OK` is exempted by the `<12` reflection filter and reaches extraction. | LC-003/S2/R1-S3, R3-S5 | `turn_prompt` | implementation regression | Remove short-value exemption; prove normalized direct match rejects without publication and ordinary prose remains allowed. |
| 6 | Retry changes uncommitted failed work to pending; discard only accepts failed and returns 409. | LC-003/S2/R2-S2, R2-S5 | turn submission lifecycle | implementation regression | Permit owner discard of uncommitted pending work; retain refusal for processing and committed work. |
| 7 | Stale head returns `stale` while leaving the claimed job/turn processing; retry then cannot reclaim it. Throwing staged commit rolls back but first attempt correctly schedules retry. | LC-003/S2/R2-S4, R2-S6 | turn worker/lifecycle test | mixed: implementation regression + stale test/evidence | Terminally fail stale exact claims without publishing; change injected-throw expectation to retry-first then terminal-failure proof. |
| 8 | Earlier functional signup traffic consumes shared default-IP in-memory quota before valid Character create. | LC-002/S3/R1-S1, R2-S1, R5-S1 | functional test lifecycle | test-isolation defect | Clear in-memory limiter before every functional test; retain same-test exhaustion proof. |
| 9 | Same suite-order leak before valid Character edit. | LC-002/S3/R3-S1, R5-S1 | functional test lifecycle | test-isolation defect | Same lifecycle reset; prove mutation traffic is not cross-charged. |
| 10 | Same suite-order leak before valid Character delete. | LC-002/S3/R4-S1, R5-S1 | functional test lifecycle | test-isolation defect | Same lifecycle reset; prove mutation traffic is not cross-charged. |
| 11 | Same suite-order leak masks authorization/validation scenarios with 429. | LC-002/S3/R1-S2, R2-S2 | functional test lifecycle | test-isolation defect | Same lifecycle reset; retain rate-limit security scenarios in their owning account tests. |
| 12 | `1784424000000` intentionally backfills/defaults nonblank initial state; publication correctly hashes those values. | LC-002/S3/R2, R5; LC-003/S1/R2-S1 | publication test | stale test/evidence | Update current-row snapshot/hash expectation to fallback values; keep historical snapshots immutable and derive fallback only for Adventure state. |

### 3. LC-001 Rate-Limit Isolation

- [x] 3.1 Identify every process-global/public-auth/generation limiter and its lifecycle, key derivation, test configuration, and reset seam.
- [x] 3.2 Add focused tests that separately prove same-client/account exhaustion, independent client/account budgets, recovery after the defined window, and no cross-test budget consumption.
- [x] 3.3 Refactor test lifecycle or injected limiter ownership so suites are deterministic without disabling, globally raising, or weakening production limits.
- [x] 3.4 Prove Character mutation requests are not accidentally charged to an unrelated auth or generation budget.
- [x] 3.5 Reconcile LC-001/S1 R4-S3 and LC-001/S2 R4-S3 exact `Verified By` evidence and any affected cross-story notes.
- [x] 3.6 Commit the verified rate-limit phase before beginning another implementation phase.

### 4. LC-002 WorldVersion And Character Publication

- [x] 4.1 Decide from existing Epic/code history whether blank Character initial state or deterministic fallback prose is the accepted canonical snapshot behavior; record that decision in the failure ledger.
- [x] 4.2 Make Character model defaults, publication serialization, immutable content hashing/reuse, seed fixtures, and tests use that one accepted behavior.
- [x] 4.3 Keep current publication atomic with Character create/edit/delete, including no-op reuse and rollback on injected serialization/persistence failure.
- [x] 4.4 Make the frozen-source migration test exercise only columns available at that migration boundary, or explicitly compose later migrations when current publication behavior is what the test intends to prove.
- [x] 4.5 Prove concurrent publication still reuses one immutable version without weakening the unique/content-hash or insert-only constraints.
- [x] 4.6 Rerun all LC-002/S3 author, non-author, anonymous, validation, edit, delete, and frozen-Adventure publication scenarios together after limiter isolation.
- [x] 4.7 Reconcile LC-002/S3 and affected LC-003/S1 WorldVersion implementation/evidence maps and Verification Gaps.
- [x] 4.8 Commit each completed, verified publication/migration phase before the next phase.

### 5. LC-003 Projection And Generation-Limit Contracts

- [x] 5.1 Separate projections and assertions by audience and purpose: authorized owner debug UI, non-owner/unknown access, generation context, visible narration, model-call evidence, and logs.
- [x] 5.2 Update obsolete minimized-owner assertions only after exact LC-003/S3 contract confirmation; add/retain focused proof that another owner receives no Adventure or private-card content.
- [x] 5.3 Reconcile `AdventureQueryService` expected projection with the accepted frozen identity plus Adventure-owned current state, including current-Scene filtering.
- [x] 5.4 Make the generation burst-limit scenario deterministic: requests that should consume budget must reach the queuing boundary, conflicts must not accidentally substitute for quota proof, and another account must retain an independent budget.
- [x] 5.5 Verify generated API contracts and frontend consumers if any serialized projection type changes.
- [x] 5.6 Reconcile LC-003/S1 and S3 exact evidence, cross-story disclosure notes, and any superseded minimization language.
- [x] 5.7 Commit the verified projection/generation-limit phase.

### 6. LC-003 Turn Safety And Recovery

- [x] 6.1 Restore deterministic rejection of visible narration that directly reflects the current raw Guide or bounded current-Scene private knowledge under the accepted normalization/short-value rules.
- [x] 6.2 Prove rejected narration never reaches extraction and publishes no story entry, result revision, state mutation, turn count, raw Guide model-call evidence, or standard log content.
- [x] 6.3 Restore expired-claim reclamation, terminal failure, owner retry, and discard behavior while leaving the last committed Adventure head/count intact.
- [x] 6.4 Restore stale-head refusal and injected staged-commit rollback so no partial narration, revision, mutation, current state, or result pointer survives.
- [x] 6.5 Run worker tests both focused and inside the full backend suite on a fresh disposable schema; add a second ordering/stress pass if shared state contributed.
- [x] 6.6 Reconcile LC-003/S2 `Implemented By`, exact scenario-mapped `Verified By`, and reopened/resolved Verification Gaps.
- [x] 6.7 Commit each completed, verified turn-safety phase.

### 7. Canonical Aggregate Gate

- [x] 7.1 Add one root command, named `ci:required` unless implementation evidence supports a clearer project convention, that runs the deterministic required gates from the committed candidate.
- [x] 7.2 Include generated-contract verification, guarded migration verification, lint, typecheck, unit/functional tests, production build, Storybook build/tests, and full deterministic E2E; make actual execution and test counts visible.
- [x] 7.3 Bypass Turborepo/task caches for candidate evidence or otherwise prove every required constituent executed freshly.
- [x] 7.4 Keep local command and `.github/workflows/ci.yml` in parity through a shared script/command where practical; document any environment-only CI setup difference.
- [x] 7.5 Prove fail-closed orchestration by injecting or selecting a known failing constituent and confirming the aggregate command exits non-zero without reporting readiness.
- [x] 7.6 Update `README.md`, repository guidance, and Change/review handoff rules so:
  - focused tests remain required during implementation;
  - the full fresh gate runs after the final implementation commit and before `in_review`/ready;
  - a bundled `develop` candidate reruns it after all accumulated Changes and before `/sdd-release`;
  - remote CI corroborates a pushed branch but is not the first integrated proof.
- [x] 7.7 Commit the verified gate/docs phase.

### 8. Final Verification And Reconciliation

- [x] 8.1 From a freshly migrated guarded disposable database, run every previously failing test and record all twelve resolutions.
- [x] 8.2 Run the full backend suite with actual discovered/passed counts and zero failures.
- [x] 8.3 Run the canonical fresh aggregate gate on the final committed candidate.
- [x] 8.4 Run full Storybook and full deterministic E2E; do not substitute filtered Character/Adventure specs.
- [x] 8.5 Run scoped and full `sdd validate`; resolve deterministic artifact, traceability, and evidence-anchor errors.
- [x] 8.6 Inspect each cited Epic test source and assertion before recording new passing evidence.
- [x] 8.7 Update the changelog only if implementation changed user-facing or public security/operational behavior.
- [x] 8.8 Confirm manual UI is still not applicable; if a visible UI contract changed, stop and add proportional rendered/manual verification through replanning.

### 9. Review And Closeout

- [x] 9.1 Record the immutable candidate commit and prove intended implementation is fully committed before review.
- [x] 9.2 Run `/sdd-review` with the fresh aggregate result as a mandatory gate, not broad supporting evidence that can be omitted.
- [x] 9.3 Resolve all review findings and rerun the aggregate gate after the final fix commit.
- [x] 9.4 Confirm LC-001/002/003 Epic maps, active Change claims, README guidance, CI workflow, and release handoff all describe the same current truth.
- [x] 9.5 Keep `status: in_review` until review and user-authorized integration are complete, then use `sdd change close`.

## Implementation Ledger

| Date | Slice | Agent / Guidance | Files / Areas | Result | Commit / Ref |
|---|---|---|---|---|---|
| 2026-07-22 | Planning | `/sdd-change --plan` | private proposal/design/tasks | Contract-first remediation plan drafted | baseline `998d7af` |
| 2026-07-22 | Failure classification | `/sdd-apply` discovery wave | Change artifacts, LC-001/002/003 Epics, limiter, publication, projection, worker tests | Twelve rows classified; no product contradiction or replan trigger | `9b8a0aa` |
| 2026-07-22 | LC-001/S1 R4-S3 + S2 R4-S3; LC-003/S1 R3-S5 | BDD/TDD limiter phase | functional test bootstrap, limiter config, auth tests, isolation test | Functional tests clear only in-memory limiter between scenarios; same-test signup exhaustion and ten-request Adventure quota remain enforced. | `8f87ebd` |
| 2026-07-22 | LC-002/S3 R5-S2; LC-003/S1 R2 | BDD/TDD publication/migration phase | WorldVersion publication and frozen-source migration tests | Current fallback-state snapshot/hash reuse and composed-current-schema concurrency pass; predecessor migration remains exact-boundary only. | `ed33de5` |
| 2026-07-22 | LC-003/S1 R2/R4; S2 R1-S3/R2-S2/R2-S5/R2-S6 | BDD/TDD worker safety phase | owner projection, Guide guard, production stale claims, retry/discard | Owner debug cards remain complete; punctuation/common-token Guides do not over-reject; stale claims terminally fail without provider/publication and remain discardable. | `4372aa8` |
| 2026-07-22 | Required aggregate gate | CI parity phase | root script/tests, package command, GitHub workflow | Shared caller-env guarded, sequential cache-bypassed gate; fail-closed tests prove later stages do not run after failure. | `4372aa8` |
| 2026-07-22 | Fresh aggregate verification | `/sdd-apply` final-candidate gate | committed `fbc09cf`, all aggregate stages | Build, contract check, guarded migration, lint, typecheck, full tests, Storybook build/test, and deterministic E2E passed with cache bypass. | `fbc09cf` |
| 2026-07-22 | LC-003/S2/R1-S3 boundary remediation | fresh-context implementation self-check | `turn_prompt`, unit context, and production worker test | Concise Guide literals match normalized words/phrases, not substrings inside ordinary narration; direct reflection still blocks extraction/publication. | `31bb167` |
| 2026-07-22 | Final implementation gate and self-check | `/sdd-apply` closeout readiness | `9f67af0`, full aggregate and fresh code/artifact checks | All required stages passed; reviewers found no remaining actionable code or traceability defect. | `9f67af0` |
| 2026-07-22 | Independent review remediation | `/sdd-review --until-ready` | changelog, owner projection expectation, E2E limiter fixture, account-route test | Public security communication, stale expectations, E2E-only capacity, and routed assertion synchronization reconciled. | `757d10d`, `7cbc261`, `f46fdf5` |

## Verification Ledger

| Date | Check | Evidence Type | What It Proves | Result |
|---|---|---|---|---|
| 2026-07-22 | Release preflight `npm run test -- --force` | broad supporting gate | Frontend passed 149/149; backend exposed 12 failures after 159 passes | failed; this Change owns remediation |
| 2026-07-22 | Fresh guarded `migrate:ci` and backend suite | database/migration baseline | Fresh test schema migration passed; focused discovery reproduced the projection, worker, publication, and limiter boundaries in their owning suites. | baseline remains failing; final aggregate count pending remediation |
| 2026-07-22 | `tests/functional/limiter_isolation.spec.ts` | focused database-backed test | Same forwarded client is throttled on request 11 in one test, then starts fresh in the next test. | passed 2/2 |
| 2026-07-22 | `tests/functional/adventure_api.spec.ts#LC-003/S1/R3-S5: generation-queuing mutations share an account burst limit` | focused database-backed test | Restored ten-request cap returns 429 before controller busy conflict. | passed; its containing file still has the separately tracked stale owner-minimization failure |
| 2026-07-22 | `tests/functional/world_character_authoring.spec.ts` | focused database-backed test | All author create/edit/delete and non-author/validation Character scenarios execute without leaked 429. | passed 6/6 |
| 2026-07-22 | `tests/database/frozen_world_source_migration.spec.ts`; `tests/functional/world_version_publication.spec.ts` | focused database-backed tests | Historical migration constraints, composed current publisher concurrency, fallback snapshot/hash, and reuse. | passed 3/3; 4/4 |
| 2026-07-22 | `tests/unit/story_generation/adventure_turn_context.spec.ts`; `tests/functional/adventure_turn_worker.spec.ts` | focused database-backed worker proof | Direct short Guide rejection, whole-word boundary allowance, punctuation/common-token allowance, production-port stale terminal failure, retry/discard, and rollback. | passed 18/18 plus 20 database-safety checks |
| 2026-07-22 | `npm run test:ci-required` | aggregate-gate orchestration proof | Missing environment refuses; injected failure stops subsequent stages; workflow delegates after Chromium installation. | passed 3/3 |
| 2026-07-22 | `npm run lint --workspace @lorecraft/backend`; `npm run typecheck --workspace @lorecraft/backend` | broad supporting gates | Limiter lifecycle hook and config type/lint cleanly. | passed |
| 2026-07-22 | `NODE_ENV=test APP_KEY=<test-only> npm run ci:required` with acknowledged disposable database environment | fresh local release gate | Cache-bypassed application build, generated-contract cleanliness, guarded migration, lint, typecheck, full backend/frontend tests, Storybook build/test, and deterministic E2E all ran sequentially. | passed against final implementation candidate `9f67af0` |
| 2026-07-22 | Fresh code and artifact self-checks | failure-seeking review | Whole-word/phrase Guide boundary, production publication path, README caller environment, Epic anchors, tasks handoff, and CI parity. | no remaining actionable findings |
| 2026-07-22 | Final review aggregate | fresh local release gate | `f46fdf5`: all aggregate stages | Build/contracts/migrations/lint/typecheck; backend 177/177; frontend 149/149; Storybook 88/88; desktop/mobile E2E 11/11. | passed |

## Manual Feedback

| Date | Feedback | Classification | Action / Artifact Updates | Status |
|---|---|---|---|---|
| 2026-07-22 | Fix the failures and the workflow gap that missed them. | in-scope refinement | Combined behavior remediation and mandatory aggregate gate in one Change. | incorporated |

## Planning Updates

| Date | Discovery | Classification | Planning Updates | Next Apply Starting Point |
|---|---|---|---|---|
| 2026-07-22 | LC-003/S3 intentionally exposes complete owner-only NPC debug cards. | product contract clarification | Separate authorized debug projection from non-owner/narration/evidence privacy in proposal/design/tasks. | Build failure classification ledger first. |

## Implementation Risk And Confirmation Matrix

| Requirement / Surface | End-State Invariant | Risk / Failure Mode | Check Or Confirmation Needed | Evidence / Finding | Status |
|---|---|---|---|---|---|
| LC-001/S1-S2 rate limits | Real same-client requests throttle; independent clients and unrelated tests do not share budget. | A test reset weakens production semantics or global state makes aggregate tests order-dependent. | Separate exhaustion, independence, recovery, and aggregate-order tests. | Functional-only `limiter.clear(['memory'])` runs before each test; same-test request 11 is 429 and next-test request is 422. | resolved |
| LC-002/S3 + LC-003/S1 publication defaults | Current Character rows serialize nonblank fallback initial state; immutable historical snapshots remain unchanged and derive fallback only for Adventure state. | Current/default and historical snapshot contracts are conflated. | Current-row hash/reuse test plus exact historical migration and composed-current-schema proof. | Current fallback snapshot/hash reuse, exact historical migration, and composed-current concurrency pass. | resolved |
| Frozen-source migration | A migration runs against exactly its supported predecessor schema. | Current serializer queries columns not yet created. | Isolated historical migration plus composed-current-schema test where appropriate. | Exact predecessor migration and separate current-schema publisher proof pass. | resolved |
| LC-003/S1/S3 projection | Authorized debug cards are complete; inaccessible/cross-owner responses disclose nothing. | Removing debug data breaks accepted behavior; broadening it leaks private content. | Audience-specific service/API tests and generated-contract check. | Owner/debug and non-owner boundaries pass in the fresh aggregate; generated client remains clean. | resolved |
| LC-003/S1 generation budget | Generation-queuing requests share one per-account burst limit and conflicts remain distinct. | Test-only capacity can mask quota with controller conflict. | Deterministic queueable requests, over-quota 429, independent-account proof. | Removed `NODE_ENV=test` 100-request override; exact burst scenario now reaches 429. | resolved |
| LC-003/S2 private narration | Raw Guide/private card values do not appear directly in published narration or retained evidence. | Short-value normalization misses reflection or over-rejects ordinary prose. | Focused short/long/direct/non-match cases plus DB/log inspection. | Direct concise reflection is rejected before extraction/publication; punctuation/common-token and larger-word cases remain ordinary narration. | resolved |
| LC-003/S2 turn lifecycle | Retry/discard and expired leases preserve last committed head/count. | Reclaim or discard publishes/removes committed work. | Injected expired claim and lifecycle DB assertions. | Expired recovery, retry/pending/discard, and stale terminal handling pass. | resolved |
| LC-003/S2 atomic completion | Stale/throwing work publishes nothing partial. | Transaction or staged state leaks a revision/mutation/state/result. | Stale-head race and injected commit throw with full DB absence assertions. | Production-port stale claims terminate without generator/extractor calls; staged throws leave no partial result. | resolved |
| Required aggregate gate | Every required check executes freshly on the committed candidate and any failure blocks readiness. | Cache hits, workflow drift, or focused substitutions create false green. | Cache-bypassed run, fail-closed proof, local/CI parity review. | `ci:required` shares CI stages, requires caller-supplied guarded env, and passed against `9f67af0`. | resolved |

## Pattern Parity Matrix

| Concern | Reference Location / Contract | New Location / Contract | Focused Proof | Intentional Divergence / Gap | Status |
|---|---|---|---|---|---|
| Local/remote required gates | `.github/workflows/ci.yml` required job | root `ci:required` command/shared script | constituent list parity and fail-closed command test/inspection | CI-only PostgreSQL service and Chromium installation remain workflow-owned. | resolved |
| Migration historical fixture | sibling isolated migration tests | frozen-source concurrency fixture | exact predecessor-schema migration run | Current-schema publication proof remains a separate composed-schema test. | resolved |
| Rate limiter lifecycle | `apps/backend/start/limiter.ts` per-client in-memory definitions | `apps/backend/tests/bootstrap.ts#configureSuite` functional test hook | `limiter_isolation.spec.ts` plus account/Adventure functional suites | Reset is functional-test-only; production and E2E lifetimes remain unchanged. | resolved |

## Stateful Transition Matrix

| Start State | Trigger / Transition | Expected Invariant | Focused Test Or Runtime Observation | Result |
|---|---|---|---|---|
| Ready Adventure | Guide narration directly reflects raw Guide | resolution retries/fails; no extraction or publication; evidence omits Guide | exact short-reflection worker test plus DB/model-call inspection | resolved |
| Processing turn with expired lease | replacement worker reclaims final/non-final attempt | bounded retry/failure; committed head/count unchanged | expired-claim worker and lifecycle tests | resolved |
| Failed uncommitted turn | owner retries then discards | retry is pending; discard removes only uncommitted turn/job | lifecycle service DB assertions | resolved |
| Claimed turn | Adventure head changes before finish | stale work cannot publish over new head | stale-head race test | resolved |
| Claimed turn | staged commit throws | transaction rolls back story/revision/mutation/state/result | injected commit-failure test | resolved |
| Account below quota | conflicting and queueable generation requests accumulate | only accepted budget semantics produce 429; another account remains independent | API burst-limit test | resolved |

## Decision Fan-Out Ledger

| Date | Decision / Discovery | End-State Consequence | Affected Surfaces To Reconcile | Evidence / Artifact Updates | Status |
|---|---|---|---|---|---|
| 2026-07-22 | Owner-only complete debug NPC cards are accepted. | Do not restore old blanket minimization; preserve audience-specific privacy. | LC-003/S1/S3, query/API tests, DTO/client, README/current docs | Audience-specific assertions and clean generated client preserve the boundary. | resolved |
| 2026-07-22 | Local-first `develop` may be unpushed. | Local aggregate proof is mandatory before review/release handoff. | package scripts, CI workflow, README/AGENTS or SDD review guidance, review/release records | Shared gate, workflow parity, README, and repository guidance now state the sequence. | resolved |
| 2026-07-22 | Current Character initial state is deterministic fallback prose; historical persisted WorldVersion snapshots retain their original values. | Snapshot/hash behavior must distinguish current rows from historical immutable snapshots without serializer compatibility hacks. | LC-002/S3, LC-003/S1, publisher, migrations, fixtures, tests | Exact historical migration and composed-current publication tests pass with Epic maps reconciled. | resolved |

## Verification Environment

| Evidence Obligation | Required Setup / Safety Boundary | Needed For | Current Readiness | Result / Resolution |
|---|---|---|---|---|
| Backend functional/database suite | explicit acknowledged disposable Neon `TEST_DATABASE_URL`; never application/production DB | all 12 failures and aggregate backend proof | supplied to `ci:required` | passed against final implementation candidate `9f67af0` |
| Historical migration tests | isolated disposable database and exact predecessor schema | frozen-source migration compatibility | repository harness | passed against final implementation candidate `9f67af0` |
| Generated contracts | committed candidate and clean diff-sensitive comparison | API projection/type changes | repository harness | passed against final implementation candidate `9f67af0` |
| Storybook | checked-in Storybook config, port 4312 if served | full component-state regression | repository harness | passed against final implementation candidate `9f67af0` |
| E2E | acknowledged isolated `E2E_DATABASE_URL`, ports 4313/4314 | full creator workflow regression | supplied to `ci:required` | passed against final implementation candidate `9f67af0` |
| Provider | deterministic injected generator/extractor | Guide reflection and worker failure paths | repository harness | passed; live provider not required |
| Remote CI | user-authorized pushed branch | corroborating branch evidence | not required for local implementation gate | not applicable until push authorized |

## Manual UI Confirmation

- Status: not applicable unless implementation changes visible UI behavior.
- App URL / route: not applicable.
- Required setup or test data: not applicable.
- Steps for the user: none planned.
- Expected result: existing owner-only debug surfaces and workbench behavior remain unchanged under full Storybook/E2E proof.
- Feedback that would change artifacts: any visible projection or interaction change requires replanning and a proportional visual/manual matrix.

## Visual Verification Matrix

Not applicable: this is a backend contract, test-isolation, persistence, worker-safety, and verification-workflow remediation. Full existing Storybook/E2E remain regression gates; any intentional UI change triggers replanning.

## Blockers / Open Questions

- None. Contract contradictions are an explicit replan condition.

## Review Handoff Candidate

- Integration target / merge base: `develop` / `998d7af`.
- Candidate source commit: `9f67af0` (final implementation candidate); this status-only handoff commit follows it.
- Source differs from target when implementation changed: yes; all intended implementation and evidence changes are committed.
- Intended implementation fully committed: yes; worktree was clean before status transition.
- Unrelated dirty state preserved: yes; no unrelated paths were staged.
- Commit-sensitive generated-contract / diff / integration checks: passed through `ci:required` against `9f67af0`.
- Required risk, fan-out, environment, or verification rows still pending or blocked: none; all are resolved or explicitly not applicable.
- Pattern parity and stateful transition matrices reconciled or not applicable with reason: reconciled.
- Evidence claims falsified against exact tests, assertions, routes, or observations: code and artifact fresh-context self-checks found no remaining actionable finding.
- Fresh-context failure-seeking passes completed: implementation self-check completed; independent `/sdd-review` remains review-owned.

## Closeout

- Change status: in_review after final implementation gate and implementation self-check.
- Epic files updated: LC-001, LC-002, and LC-003 maps reconciled; LC-003/S2 Guide boundary evidence added.
- Story labels/references and Requirement/Scenario IDs current: existing labels retained.
- Implemented By maps current: confirmed.
- One canonical implementation and verification map per Story: confirmed for affected Stories.
- Primary anchors inspected as behavior-owning definitions/registrations rather than incidental occurrences: confirmed in self-check.
- Scenario-mapped Verified By maps current: confirmed against exact source anchors.
- Superseded earlier Epic truth reconciled: confirmed.
- README/current-state docs and active/closed Change claims reconciled: confirmed for active Change; this Change remains active in review.
- ADR status: not applicable unless diagnosis changes architecture.
- Release communication current: Unreleased Security note records the restored private-Guide reflection boundary without private detail.
- `sdd-review` verdict: ready.
- Review record: `review.md`, immutable reviewed source `f46fdf56074a9504a6c6377d92f2c75c84e96d78`.
- `review.md` findings resolved: all four required findings resolved and rerun through the final aggregate gate.
- Planning updates resolved: current plan coherent; future contradictions require replan.
- Implementation risk and confirmation rows resolved: yes.
- Pattern parity and stateful transition rows resolved: yes.
- Evidence-claim integrity checked: yes.
- Decision fan-out reconciled: yes.
- Verification environment obligations resolved: yes.
- Immutable review handoff candidate: `f46fdf5`.
- Manual UI confirmation status: not applicable unless visible behavior changes.
- Rendered UI verification status: full existing Storybook/E2E required; no new visual matrix.
- PR / merge state: not started; remote/integration mutation requires user authorization.
- Deferred scope accepted: recorded in proposal/design.
- Change moved to `docs/changes/closed/`: no; it remains `in_review` until independent review and user-authorized integration complete.
