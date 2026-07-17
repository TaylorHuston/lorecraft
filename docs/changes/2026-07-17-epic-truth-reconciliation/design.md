# Design: Epic Truth Reconciliation

## Context

LC-001, LC-002, and LC-003 were implemented through successive account, starter-World, UI reconciliation, and Adventure foundation Changes. Later work correctly reused authentication and World surfaces, but not every earlier Story, evidence map, closed Change record, or public summary was reconciled afterward. The audit reports under each Epic record the detailed matrix and current checks.

The implementation is mostly sound. This Change makes accepted behavior and evidence traceable again and adds one missing authorization proof for existing owner-private World catalog behavior.

## Goals / Non-Goals

**Goals:**

- Restore all three Epics as accurate maps of current product behavior, implementation, evidence, and real gaps.
- Give implemented security/recovery behavior stable Requirement and Scenario ownership.
- Preserve the safer current Character disclosure boundary and verify private World catalog access directly.
- Eliminate stale Story references, closed-Change lifecycle claims, unresolved evidence paths, and app-wide validation drift.
- Rerun enough focused and integrated verification to date the reconciled truth honestly.

**Non-Goals:**

- Add account, World, authoring, Adventure-turn, or UI capabilities.
- Expose Character private knowledge through the shared reader/player World API.
- Redesign account, catalog, World detail, or Adventure UI.
- Resolve production deployment checks that still require a production-like environment.
- Rewrite historical command ledgers that remain accurate merely because wording is old.

## Planning Interview / Story Refinement

- Scope boundary reviewed: all three Epic audits and repository-wide validation findings that directly block coherent Epic truth.
- User decisions: combine findings from LC-001, LC-002, and LC-003 into one Change.
- Assumptions: current runtime behavior is accepted unless an Epic audit identified a concrete defect or unresolved product choice.
- Deferred scope: creator-only private knowledge, interactive turns, quotas, production deployment proof, World authoring/version UI.
- Story boundaries challenged: all six Stories remain coherent; no split, merge, move, or new Epic is warranted.
- Requirements refined: security/recovery boundaries become explicit in LC-001; owner-private visibility becomes explicit in LC-002.
- Scenario gaps considered: CSRF/no mutation, unsupported/oversized requests, throttling recovery, malformed input, protected-request session loss, safe logout failure, owner-private visibility, and other-owner non-disclosure.
- Open questions that block implementation: none.

## Epic Changes

### Update Epic: LC-001 Account Identity And Workspace Access

- Target Epic: `docs/epics/lc-001-account-identity-and-workspace-access/epic.md`
- Change Type: modified scope, Requirements, Scenarios, evidence, gaps, and traceability

#### Story Changes

- `S1`: add `R4 Secure And Recoverable Signup Boundary` with Scenarios for invalid CSRF/no mutation, bounded JSON requests, and throttled recoverable signup. Replace `Your Worlds` with neutral authenticated World-workspace wording.
- `S2`: add `R4 Secure And Recoverable Sign-In Boundary` with Scenarios for invalid CSRF/no session mutation, bounded JSON/malformed input, and throttled generic recovery. Keep requested-route resumption as existing supporting behavior, not a new contract in this Change.
- `S3`: add `R1-S4 Protected Request Detects Session Loss` and `R2-S3 Sign-Out Fails Safely`. Remove empty-catalog ownership from Outcome, Current Scope, and Story Index.
- Remap existing backend/frontend evidence and relabel test titles from broad or removed references to these Scenarios.

#### Supersedes / Reconciles

- Former `LC-001/S3/R3-S1` empty-catalog ownership moved to `LC-002/S1/R1-S3`.
- Security evidence currently mapped broadly to unrelated happy-path Scenarios.
- Parallel Deferred Verification sections move into canonical Verification Gaps.
- UI-cleanup Change paths and manual statuses become closed/current.

### Update Epic: LC-002 World Bible Catalog

- Target Epic: `docs/epics/lc-002-world-bible-catalog/epic.md`
- Change Type: modified Requirements, Scenarios, disclosure wording, implementation/evidence maps, and gaps

#### Story Changes

- `S1`: add `R1-S4 Owner-Private World Visibility`, requiring the author to see their private World while another account receives no catalog or detail disclosure. Add focused backend proof.
- `S1`: record LC-003-owned Adventure summaries/actions as shared-surface dependencies without absorbing their behavior.
- `S2/R1-S1`: remove private knowledge from the accepted shared World detail fields and state that it is withheld.
- Refresh July 17 shared-surface evidence, fully qualify E2E paths, and clarify fixture-only empty collection combinations.

#### Supersedes / Reconciles

- Earlier testing posture that exposed Character private knowledge to every authenticated reader.
- July 15 presentation evidence predating Adventure integration.
- Stale UI-cleanup path and unresolved E2E basenames.

### Update Epic: LC-003 Adventure Play

- Target Epic: `docs/epics/lc-003-adventure-play/epic.md`
- Change Type: modified outcome, evidence metadata, gaps, and lifecycle support

#### Story Changes

- `S1`: no Requirement or Scenario behavior change.
- Narrow Outcome from shaping a persistent narrative to receiving, managing, and resuming a durable opening grounded in frozen canon.
- Move July 17 manual acceptance into scenario-mapped evidence with `user confirmed`; retain only actual verification gaps.
- Refresh Epic/Story verification dates after the consolidated checks.

#### Supersedes / Reconciles

- Closed Private Adventure Foundation design placeholders saying implementation and verification are pending.
- Closed tasks Resume Here, review path, and manual status that still read as active.
- README/PRD language that describes the Adventure foundation only as future.

## Technical Options

### Option 1: One Cross-Epic Reconciliation Change

- Summary: repair all three Epics, affected tests, supporting docs, and lifecycle records together.
- User impact: none beyond more accurate public wording.
- Implementation complexity: low to moderate; mostly documentation and test traceability plus one focused test.
- Reversibility: high.
- Client surfaces: no UI behavior change.
- API / contract shape: unchanged.
- Frontend/backend boundary: unchanged.
- Data / schema impact: none.
- Auth / security impact: adds direct proof of existing owner-private visibility and records current disclosure behavior.
- Testability: strong; focused tests plus guarded E2E.
- Operational risk: low.
- Fit with project conventions: best fit because the drift crosses shared account, World, and Adventure surfaces.

### Option 2: Separate Change Per Epic

- Summary: create three narrow remediation Changes.
- User impact: none.
- Implementation complexity: higher coordination and repeated validation.
- Reversibility: high.
- Auth / security impact: risks temporarily leaving cross-Epic ownership inconsistent.
- Testability: duplicates broad regression work.
- Operational risk: low but creates process overhead.
- Fit with project conventions: weaker after the user explicitly requested consolidation.

## Selected Approach

Use one cross-Epic reconciliation Change. Update artifacts and test references in one branch, add the missing owner-private catalog test, then run focused backend/frontend checks followed by Storybook, full guarded E2E, scoped Epic validation, and repository-wide validation. Do not change production contracts or data. If verification reveals a real behavioral defect, stop and replan rather than expanding this cleanup silently.

## Client And API Boundary

- Current clients: Vite/React web application and Adventure worker.
- Plausible future clients: mobile, creator administration, automation, and game clients.
- Reusable product capabilities: session auth, account-scoped catalog access, minimized World detail, private Adventure lifecycle.
- API or typed contract: existing AdonisJS routes and Tuyau clients remain unchanged.
- OpenAPI plan, if HTTP-facing: no new route or DTO; current typed contract remains the boundary.
- Backend platform exposed directly to clients?: no; clients use Lorecraft APIs.
- Client-specific presentation or local state: unchanged.
- Rationale: this Change corrects truth and proof around existing boundaries rather than redesigning them.

## Alternatives Considered

- Restore private Character knowledge to the shared World detail API:
  - Rejected because the current API serves authenticated readers as well as the author, LC-003 accepted a safer disclosure boundary, and creator-only access needs a future authoring/authorization design.
- Treat all drift as documentation-only:
  - Rejected because one test cites a removed Scenario and owner-private World visibility lacks focused API proof.

## Why This Approach

It preserves current behavior, closes the highest-value traceability and security gaps, and avoids three Changes that would edit the same shared files. It also leaves creator-only knowledge access and interactive Adventure turns available for deliberate future design.

## ADRs

- Required: no
- ADR path: not applicable
- Decision summary: no architecture decision changes; existing accepted ADRs remain authoritative.
- Reconsider when: remediation uncovers a contract or disclosure change rather than documentation drift.

## Implementation Constraints

- Preserve unrelated uncommitted ADR and LC-003 documentation work and incorporate it without overwriting.
- Do not expose private Character knowledge through shared World APIs.
- Do not bypass disposable database guards to obtain verification evidence.
- Keep changelog edits user-facing; do not mention SDD bookkeeping.
- Remove the stale empty planned UI-cleanup directory only through an explicitly reviewed cleanup step.

## Verification Strategy

- Focused automated tests:
  - backend account auth/security, World catalog, migrations, Adventure services/API/worker/provider;
  - frontend App/auth API, World routes/API, Adventure routes/workbench/API;
  - new owner-private World visibility/non-disclosure assertion.
- Broad supporting gates: lint, typecheck, build, Storybook build/tests, full test union.
- Deterministic E2E: guarded desktop/mobile account, starter World, and Adventure foundation journeys with fake provider and cleanup.
- Live-provider or external-service playtests: not required; no provider behavior changes.
- Manual UI confirmation: `not applicable` unless implementation unexpectedly changes presentation.
- Debug/log inspection: not required unless a test exposes worker/session uncertainty.
- Artifact checks: scoped validation for LC-001/2/3 and repository-wide validation with zero errors; resolve or explicitly classify remaining historical warnings.

## Decisions

- Consolidate all three Epic audits into one Change.
- Preserve current safer omission of private Character knowledge from the shared World read API.
- Defer creator-only private knowledge to World authoring.
- Treat interactive turns as deferred; narrow LC-003 outcome rather than promoting a Story.
- Route PRD posture correction through `/sdd-prd` before closeout.

## Risks / Trade-Offs

- Updating many artifact references together creates review volume, but the changes share one ownership boundary and validation pass.
- Historical closed Change cleanup can erase useful planning context if overdone; only contradictory current-state claims will change.
- Database/E2E evidence depends on explicitly guarded disposable infrastructure; inability to run it remains a verification gap rather than permission to bypass safety.
