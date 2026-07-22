# Design: Restore Release Gate Integrity

## Context

The release candidate passed SDD validation, generated-contract checks, build, lint, typecheck, focused Character and Adventure tests, focused E2E, and manual Character acceptance. A later fresh aggregate backend run passed 159 tests and failed 12.

The failures fall into four related surfaces:

1. Shared or order-dependent state: four Character-authoring scenarios received unexpected `429` responses, and the Adventure generation burst-limit test received `409` where it expected `429`.
2. Contract drift: an Adventure response assertion still expects a minimized projection although LC-003/S3 intentionally exposes complete owner-only debug NPC cards; another WorldVersion test expects blank initial-state values while current publication supplies fallback prose.
3. Persistence compatibility: the frozen-source migration concurrency test invokes current publication code against an intentionally older isolated schema that lacks `initial_mood`.
4. Turn-safety behavior: private Guide reflection, expired-claim recovery, and stale/throwing commit atomicity no longer satisfy their accepted invariants in the integrated suite.

The remediation must not infer intended behavior from a green focused test, a red old test, or implementation shape alone. Epic Requirements and Scenarios are authoritative, and each failure needs isolated plus aggregate evidence.

## Goals / Non-Goals

**Goals:**

- Account for all twelve failures with a reproducible root cause and contract classification.
- Restore every accepted LC-001, LC-002, and LC-003 invariant implicated by the failures.
- Remove test-order, process-global limiter, fixture, and migration-schema coupling that produces false results.
- Preserve owner-only debug disclosure while preventing cross-owner disclosure, model evidence leakage, and direct story reflection of private/Guide text.
- Provide one fresh local CI-equivalent command whose success is required for review and release handoff.
- Replace stale Epic verification claims with current exact evidence.

**Non-Goals:**

- Add new account, Character, WorldVersion, Adventure, or UI capabilities.
- Design a player-safe NPC-card surface or change the temporary complete debug-card product contract.
- Create hosted integration/preview infrastructure or require pushing local `develop` solely to obtain CI evidence.
- Weaken database guards, rate limits, authorization, atomic publication, or private-data rules to make tests pass.
- Resolve unrelated accepted operational/manual verification gaps.

## Planning Interview / Story Refinement

- Scope boundary reviewed: twelve backend failures plus the aggregate-gate process gap.
- User decisions: fix the issues and address why the workflow missed them.
- Assumptions: existing accepted Epic behavior remains intended; no material UI or schema change is expected.
- Deferred scope: deployment, release execution, hosted preview infrastructure, player-safe projections, and unrelated feature work.
- Story boundaries challenged: no new Story is justified because this Change restores existing LC-001/S1-S2, LC-002/S3, and LC-003/S1-S3 contracts and their proof.
- Requirements refined: each failed assertion must be classified as implementation regression, stale test/evidence, test-isolation defect, migration-fixture incompatibility, or a blocking product contradiction.
- Scenario gaps considered: isolated pass/aggregate fail, reversed suite order, stale schema, limiter recovery/per-account separation, owner versus non-owner disclosure, retry/discard, expired lease, stale head, and throwing commit.
- Open questions that block implementation: none; contract contradictions require replanning rather than local assumption.

## Epic Changes

### Update Epic: LC-001 Account Identity And Workspace Access

- Target Epic: `docs/epics/lc-001-account-identity-and-workspace-access/epic.md`
- Change Type: modified verification evidence only unless diagnosis finds an implementation regression.

#### Story Changes

- Added: none.
- Modified: LC-001/S1 R4-S3 and LC-001/S2 R4-S3 evidence for per-client recoverable rate limiting.
- Removed: stale passing dates or anchors that cannot pass in the integrated environment.

#### Supersedes / Reconciles

- Reconcile process-global limiter setup/reset assumptions and any tests that consume another scenario's budget.
- Preserve production in-process limit semantics and the existing horizontal-scaling caveat.

### Update Epic: LC-002 World Bible Catalog

- Target Epic: `docs/epics/lc-002-world-bible-catalog/epic.md`
- Change Type: modified implementation/verification evidence for LC-002/S3 as diagnosis requires.

#### Story Changes

- Added: none.
- Modified: LC-002/S3 R1-R5 evidence covering author authorization, validation, immutable version publication, and rollback.
- Removed: stale passing dates or assertions that encode superseded default serialization rather than accepted behavior.

#### Supersedes / Reconciles

- Reconcile Character initial-state fallback semantics consistently across live publication, isolated migration fixtures, snapshots, and tests.
- Reopen any affected `Verified By` claim until both focused and aggregate database proof pass.

### Update Epic: LC-003 Adventure Play

- Target Epic: `docs/epics/lc-003-adventure-play/epic.md`
- Change Type: modified implementation/verification evidence across existing Stories.

#### Story Changes

- Added: none.
- Modified:
  - LC-003/S1 R2 frozen WorldVersion projection, R3-S5 generation burst limiting, and R4 owner-only resume projection.
  - LC-003/S2 R1-S3 private Guide behavior; R2-S2/R2-S4/R2-S5/R2-S6 durable claim recovery and atomic publication; R3-S5 private-card reflection rejection.
  - LC-003/S3 R1 owner-only complete NPC-card disclosure only where needed to reconcile older S1 minimization evidence.
- Removed: obsolete minimization assertions that contradict accepted owner-only complete debug cards, if confirmed by direct contract inspection.

#### Supersedes / Reconciles

- LC-003/S3's accepted owner-only complete card contract supersedes older response-minimization expectations for that authorized debug surface, but not cross-owner isolation, raw prompt/model-call minimization, or direct narration reflection guards.
- Reopen July 20/22 passing claims for the failed worker scenarios until they pass from a fresh disposable schema and in the aggregate suite.

## Technical Options

### Option 1: Patch Each Red Assertion Or Code Path Independently

- Summary: make the twelve failures green with the smallest local edit per test.
- User impact: fast apparent recovery.
- Implementation complexity: low initially.
- Reversibility: high.
- Client surfaces: unchanged.
- API / contract shape: could drift accidentally because each assertion is treated independently.
- Frontend/backend boundary: unchanged.
- Data / schema impact: uncertain around migration fixtures and publication defaults.
- Auth / security impact: risks weakening limit or privacy rules to satisfy old assertions.
- Testability: focused tests improve, but aggregate-order defects may remain.
- Operational risk: high because it does not explain why the suite disagrees with focused proof.
- Fit with project conventions: poor; it bypasses Epic truth and scenario-mapped evidence.

### Option 2: Contract-First Root-Cause Matrix Plus Fresh Aggregate Gate

- Summary: reproduce each failure in isolation and aggregate context, classify it against accepted Epic truth, repair the owning implementation/test boundary, then require a fresh integrated gate.
- User impact: restores trustworthy release readiness without changing intended behavior.
- Implementation complexity: moderate.
- Reversibility: high for test/workflow changes; ordinary code fixes remain reviewable by slice.
- Client surfaces: existing React owner UI and typed API consumers only.
- API / contract shape: no intentional route or DTO expansion; generated contracts must remain synchronized if a real projection correction changes types.
- Frontend/backend boundary: AdonisJS retains auth, projection, persistence, rate limiting, and worker safety; React retains presentation.
- Data / schema impact: no planned schema change; isolated migration fixtures must represent the schema version they claim to test.
- Auth / security impact: preserves per-client/per-account boundaries, owner-only disclosure, Guide privacy, and atomic publication.
- Testability: strongest; requires isolated, reordered/aggregate, database, browser, and contract evidence.
- Operational risk: moderate implementation effort, low residual release risk.
- Fit with project conventions: strong; follows BDD/TDD, Epic truth, guarded databases, and exact evidence anchors.

### Option 3: Rely On Remote GitHub CI As The Missing Gate

- Summary: push `develop` and let the existing CI workflow catch aggregate failures.
- User impact: failures are caught before `main`, but only after remote mutation and late in the workflow.
- Implementation complexity: low.
- Reversibility: high.
- Client surfaces: unchanged.
- API / contract shape: unchanged.
- Frontend/backend boundary: unchanged.
- Data / schema impact: CI remains clean and disposable.
- Auth / security impact: no direct change.
- Testability: broad but does not fix test isolation or provide local-first evidence.
- Operational risk: still allows closed local Changes to accumulate unverified on `develop`.
- Fit with project conventions: incomplete because this repository intentionally permits local-first integration and remote actions require authorization.

## Selected Approach

Select Option 2.

Implementation begins with a twelve-row failure matrix recording exact reproduction, accepted Scenario, owning boundary, and classification. Fixes then proceed in coherent slices:

- isolate rate-limit state and prove real per-client/per-account production semantics without cross-test consumption;
- align WorldVersion serialization and migration fixtures with supported historical schemas while preserving immutable atomic publication;
- reconcile authorized debug projections separately from privacy/reflection constraints;
- restore turn claim, retry/discard, stale-head, and transaction rollback invariants; and
- add a root `ci:required`-style command and documentation that execute the same deterministic gates as CI from a fresh guarded environment with cache bypass.

The final candidate must be committed before the aggregate gate runs so generated-contract and diff-sensitive checks evaluate the actual handoff. A remote CI run remains required when a branch is pushed, but it is corroborating evidence rather than the first integrated proof.

## Client And API Boundary

- Current clients: Lorecraft React web client and test/browser adapters.
- Plausible future clients: mobile, CLI, and administrative adapters using the same backend application behavior.
- Reusable product capabilities: account request protection, WorldVersion publication, Adventure query projection, and durable turn processing.
- API or typed contract: preserve current Adonis/Tuyau route contracts; regenerate and verify if diagnosis changes a serialized type.
- OpenAPI plan, if HTTP-facing: no new HTTP surface; continue the documented typed-contract alternative.
- Backend platform exposed directly to clients?: only through existing controller/typed API boundaries.
- Client-specific presentation or local state: no intended change.
- Rationale: the failures concern authoritative backend behavior and verification orchestration, not new UI logic.

## Alternatives Considered

- Patch red tests/code independently: rejected because it cannot reliably distinguish contract drift from regressions or suite-state defects.
- Depend on remote CI: retained as corroborating release evidence, rejected as the sole gate because `develop` may intentionally remain local.

## Why This Approach

It corrects both the immediate failures and the mechanism that allowed them to remain hidden. It also avoids using an obsolete test to overwrite accepted product behavior while refusing to dismiss genuine privacy, atomicity, or authorization failures as mere test drift.

## ADRs

- Required: no.
- ADR path: not applicable.
- Decision summary: add a reversible repository verification command and review policy within accepted local-first integration architecture.
- Reconsider when: Lorecraft adopts hosted preview/integration infrastructure, mandatory remote branch protection, horizontal rate limiting, or materially different release topology.

## Experience Design

- Applicability: not required.
- Confirmed direction: no material UI or interaction change; existing complete debug-card and workbench conventions remain authoritative.
- User confirmation: not required for planning.
- Reference artifacts: LC-002/S2-S3 and LC-003/S1-S3 Epic behavior plus existing Storybook/E2E fixtures.

## Implementation Constraints

- Use explicit guarded disposable `TEST_DATABASE_URL`/`E2E_DATABASE_URL`; never use the application or production database for automated verification.
- Preserve migration-test historical schema boundaries. Current application queries must not be assumed valid before the migration that adds their columns.
- Do not disable or globally raise production rate limits to isolate tests.
- Do not remove owner-only debug fields merely to satisfy a superseded minimization assertion.
- Do not expose private card values, Guide input, raw prompts, or provider bodies through model-call records, standard logs, or non-owner responses.
- Worker failure, lease expiry, stale head, and throwing staged commit paths must publish no partial story, revision, state, or turn-count result.
- Aggregate verification must bypass task cache and report which backend, frontend, browser, migration, and contract checks actually executed.
- Keep GitHub workflow steps and the local required-gate command synchronized through one shared script/command where practical.

## Verification Strategy

- Focused automated tests:
  - reproduce and fix every one of the twelve named failures;
  - exercise limiter reset/isolation plus genuine same-client/account exhaustion and independent budgets;
  - exercise publication against both current schema and the exact isolated historical migration schema;
  - prove authorized owner debug disclosure separately from non-owner minimization and direct Guide/private-knowledge narration rejection;
  - prove expired-claim recovery, terminal retry/discard, stale-head refusal, and rollback after injected commit failure.
- Broad supporting gates:
  - root generated-contract verification, lint, typecheck, build, backend/frontend tests, and migration checks through the canonical fresh gate;
  - full backend suite from a clean disposable schema at least once after all focused fixes, with a second order/isolation stress run if root cause involved process-global state.
- Deterministic E2E:
  - full existing E2E suite on guarded isolated schema, not only filtered Character/Adventure specs.
- Storybook:
  - build and run the complete Storybook test suite to preserve owner-only debug surfaces and shared states.
- Live-provider or external-service playtests:
  - not required unless implementation touches provider adapter behavior; deterministic injected generators/extractors are authoritative for these failures.
- Manual UI confirmation:
  - not applicable unless implementation produces a visible UI change; if it does, replan the visual matrix before review.
- Debug/log inspection:
  - inspect bounded test output and model-call rows to prove prohibited private content is absent; do not retain raw private prompts as evidence.
- Workflow proof:
  - demonstrate that the new aggregate command fails for a known failing constituent command and returns success only after every required gate actually executes.

## Decisions

- Existing Epic Requirements and Scenarios decide whether a red test or the implementation is wrong.
- The twelve failures and the missing local aggregate gate are one remediation Change.
- Owner-only complete debug cards remain accepted; narration/model evidence minimization remains a separate required boundary.
- A fresh local CI-equivalent run is mandatory on the committed review/release candidate even when no remote CI run exists.
- No new Epic or Story is needed.

## Risks / Trade-Offs

- Correcting a stale assertion could conceal a real cross-owner leak unless owner and non-owner projections are tested separately.
- Resetting limiter state too aggressively in tests could stop proving production accumulation behavior; isolation and exhaustion need distinct tests.
- Making current publication code tolerate every old schema could hide invalid upgrade order; historical fixture compatibility must be scoped to the migration under test.
- A single aggregate command can drift from GitHub CI unless both call the same underlying script or parity is explicitly tested/reviewed.
- A green cached run is not fresh evidence; required commands must bypass caches or otherwise prove execution.
- Full database, Storybook, and E2E gates increase local review time, but they are proportionate for an integration/release candidate.
