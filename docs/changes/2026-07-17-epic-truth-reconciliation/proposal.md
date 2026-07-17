# Proposal: Epic Truth Reconciliation

## Why

End-to-end verification of Lorecraft's three implemented Epics found that the running account, World, and Adventure foundations are largely healthy, but their canonical behavior maps drifted as later Changes reused and extended shared routes. LC-001 still claims catalog behavior owned by LC-002, LC-002 describes disclosure behavior the current shared API intentionally rejects, and LC-003 plus its closed Change disagree about what is implemented and verified. Several tests and evidence paths also point to removed or unresolved Scenario references.

Leaving this drift in place would make the next Adventure-turn or World-authoring Change start from misleading scope, security, and verification truth.

## What Changes

- Reconcile LC-001 account/session scope, security and recovery Scenarios, evidence mappings, implementation maps, deployment gaps, and stale catalog ownership.
- Reconcile LC-002 catalog/detail disclosure truth, add owner-private World visibility and non-disclosure coverage, refresh shared-surface evidence after LC-003, and repair evidence paths.
- Reconcile LC-003's opening-only outcome, verification metadata, manual evidence, and closed Change lifecycle truth without changing its implemented runtime behavior.
- Correct stale Scenario labels in existing tests and add one focused backend catalog authorization test for owner-private versus other-private Worlds.
- Align README and user-facing changelog wording with the implemented Adventure foundation and current Character disclosure boundary.
- Resolve deterministic repository artifact drift surfaced by app-wide validation, including the stale empty UI-cleanup planning collision and missing canonical sections in the closed Storybook Change.
- Route the PRD through `/sdd-prd` so it acknowledges the implemented Adventure foundation while preserving creator-first priority and keeping the interactive turn loop deferred.

## Target Repositories

- This repository (role: official-application).

## Epic Actions

### New Epic Directories

- None proposed.

### Existing Epic Directory Updates

- `docs/epics/lc-001-account-identity-and-workspace-access/epic.md`
- `docs/epics/lc-002-world-bible-catalog/epic.md`
- `docs/epics/lc-003-adventure-play/epic.md`

## Epic Story Changes

- Modify `LC-001/S1` to preserve account creation and authenticated workspace entry while adding stable Scenarios for CSRF/no-mutation, bounded JSON requests, and recoverable throttling.
- Modify `LC-001/S2` to preserve sign-in/session restoration while adding stable Scenarios for CSRF/no-mutation, bounded JSON requests, throttling, and field-safe malformed input.
- Modify `LC-001/S3` to add protected-request session-loss and safe logout-failure Scenarios; remove the stale empty-catalog claim now owned by `LC-002/S1`.
- Modify `LC-002/S1` to declare owner-private World visibility and other-owner non-disclosure, while retaining LC-003 ownership of Adventure summaries and actions on the shared catalog surface.
- Modify `LC-002/S2` to reflect the current shared read boundary: stable Character fields are visible, private knowledge is omitted, and creator-only knowledge management remains deferred to authoring.
- Modify `LC-003/S1` metadata and evidence only; no Story split or new Adventure behavior is proposed.
- Preserve every existing Story label and Requirement/Scenario ID. Add new Requirements/Scenarios after current IDs and explicitly relabel stale test references.

## Scope Decisions

- Confirmed:
  - One consolidated Change owns cross-Epic reconciliation so shared account, World, and Adventure boundaries are corrected together.
  - Current implementation is authoritative where it reflects later accepted LC-003 security behavior: the shared World detail API omits private Character knowledge.
  - Owner-private World visibility is existing intended behavior and needs explicit Scenario/test coverage, not a new feature design.
  - LC-003 owns Adventure controls embedded in World catalog/detail surfaces; LC-002 owns the underlying canon browsing and read-only detail behavior.
  - The implemented Adventure foundation is current product behavior, while interactive turns remain deferred.
- Deferred:
  - Creator-only private knowledge authoring or inspection.
  - Interactive Adventure turns, rollback/retry of successful turns, quotas, and provider billing controls.
  - Production HTTPS cookie proof, dedicated Neon smoke verification, and routed WorldVersion publication E2E remain explicit deployment/capability gates.
- Assumptions:
  - No schema, route contract, migration, UI composition, or runtime behavior change is needed beyond the focused owner-private catalog test.
  - Existing July 17 manual Adventure acceptance remains valid; this reconciliation does not materially change UI.
- User decisions that shaped the Story/Requirement split:
  - Taylor requested that findings from all three Epic audits be combined into this Change.

## Change Folder

- Planned location: promoted; private draft removed
- Active location: `docs/changes/2026-07-17-epic-truth-reconciliation/`
- Closed location: `docs/changes/closed/2026-07-17-epic-truth-reconciliation/`

## Impact

- Product: no new capability; accepted account, World, and Adventure behavior becomes accurately described.
- Code: test-description/reference corrections only unless focused verification exposes a defect.
- Tests: add owner-private World catalog authorization coverage; rerun focused backend/frontend, Storybook, and guarded E2E suites.
- Docs: update all three Epics, related closed Change artifacts, README, changelog, and PRD posture through its owning workflow.
- ADRs: no new decision required; existing auth, canon/isolation, revision, provider, and worker ADRs remain authoritative.

## Release Communication Impact

- Required: yes, as a correction to existing `Unreleased` wording rather than a new feature entry.
- Record / section: `CHANGELOG.md` under `Unreleased / Added` and README current-status/principles text.
- Public summary: clarify that World detail exposes stable Character canon but not private knowledge, and that the opening/resume Adventure foundation is implemented while the interactive turn loop remains deferred.

## Open Questions

- None blocking planning. Creator-only private knowledge belongs to a future World-authoring decision rather than this reconciliation.
