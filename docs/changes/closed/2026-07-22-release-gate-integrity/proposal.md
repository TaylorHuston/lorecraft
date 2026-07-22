# Proposal: Restore Release Gate Integrity

## Why

The `develop` release candidate reached release preparation with twelve backend failures even though the contributing Changes had been reviewed and closed. Focused Change verification had passed, but it did not rerun the integrated backend suite. The branch was also seventy-one commits ahead of its remote, so GitHub CI had never evaluated the actual candidate.

The failures span accepted account, World Character, WorldVersion, Adventure projection, generation-limit, and turn-worker behavior. Some are likely genuine regressions, some are stale assertions after accepted debug-disclosure changes, and some expose test-order or shared-state coupling. Treating all twelve as code bugs or all twelve as test bugs would risk either changing accepted behavior or preserving defects.

Lorecraft needs to restore the accepted contracts and make a fresh aggregate gate part of local review and release readiness, even when `develop` remains intentionally local.

## What Changes

- Build a contract-to-failure matrix for all twelve release failures before changing code or assertions.
- Restore or prove the accepted LC-001 account/auth rate-limit boundary without suite-order leakage.
- Restore or prove LC-002 Character mutation, immutable WorldVersion publication, default-card serialization, and migration compatibility.
- Restore or prove LC-003 owner-only Adventure projection, generation burst limiting, private Guide reflection rejection, retry/discard recovery, and stale-worker atomicity.
- Reconcile stale tests and Epic evidence when an accepted later contract intentionally supersedes an older assertion, especially complete owner-only debug NPC-card disclosure.
- Add one repository command that runs the required deterministic CI-equivalent checks from a fresh, guarded environment without relying on Turborepo cache hits.
- Require that command on the final committed candidate before `sdd-review` can report ready and before a `develop` release bundle is handed to `/sdd-release`.
- Reconcile current Epic evidence and Change review records with the new aggregate proof.

## Target Repositories

- This repository (role: official-application).

## Epic Actions

### New Epic Directories

- None proposed.

### Existing Epic Directory Updates

- `docs/epics/lc-001-account-identity-and-workspace-access/epic.md`
  - Reconcile LC-001/S1 and LC-001/S2 rate-limit evidence if shared test state or runtime configuration changes.
- `docs/epics/lc-002-world-bible-catalog/epic.md`
  - Reconcile LC-002/S3 Character mutation/publication evidence and any affected WorldVersion default semantics.
- `docs/epics/lc-003-adventure-play/epic.md`
  - Reconcile LC-003/S1 frozen-source/projection/generation-limit evidence, LC-003/S2 turn-safety evidence, and the LC-003/S1 versus LC-003/S3 debug-disclosure boundary.

## Epic Story Changes

- Added: none.
- Modified behavior: none intended. Existing accepted Requirements and Scenarios remain authoritative.
- Modified evidence: LC-001/S1 and S2, LC-002/S3, and LC-003/S1 through S3 may receive corrected exact test anchors, current aggregate results, and reopened/resolved Verification Gaps.
- Removed: only obsolete or contradictory evidence/assertions proven to have been superseded by accepted Epic truth.
- If diagnosis shows that satisfying the failures requires a product-contract change rather than restoration, stop and replan before changing the Epic behavior.

## Scope Decisions

- Confirmed:
  - This Change covers the twelve backend failures found during the 2026-07-22 release attempt and the workflow gap that allowed them to reach release preparation.
  - The current Epic contracts, not the failing assertions or current implementation by themselves, decide the intended behavior.
  - Complete Character/NPC cards, including private knowledge, are intentionally available only to the authorized World or Adventure owner during the current development/debug stage; cross-owner disclosure and story/model reflection remain prohibited.
  - Aggregate verification must run locally because a local-first `develop` branch may not have remote CI evidence.
- Deferred:
  - Production deployment, release metadata, versioning, and an actual `develop` to `main` release.
  - Hosted preview or persistent `develop` infrastructure.
  - Player-safe/public NPC-card projections beyond the accepted debug-stage product contract.
  - Unrelated feature work and existing operational/manual gaps not implicated by these failures.
- Assumptions:
  - The failing release run is sufficient discovery evidence, but each failure will be reproduced in a fresh disposable environment before its classification is finalized.
  - No schema change is expected. A migration change is allowed only if diagnosis proves the existing migration contract is wrong for supported upgrade paths.
  - No material UI behavior is intended to change.
- User decisions that shaped the Story/Requirement split:
  - The user asked to fix both the failures and the fact that existing tests/workflow did not catch them; this plan therefore combines contract remediation with a mandatory aggregate gate rather than creating separate Changes.

## Change Folder

- Planned location: promoted; private draft removed
- Active location after promotion: `docs/changes/2026-07-22-release-gate-integrity/`
- Closed location: `docs/changes/closed/2026-07-22-release-gate-integrity/`

## Impact

- Product: restores accepted private-world-bible and Adventure safety behavior; no new capability.
- Code: backend rate limiting, WorldVersion publication/migration compatibility, Adventure query/worker boundaries, and root verification orchestration as diagnosis requires.
- Tests: exact failing tests, isolation/reset behavior, full backend aggregation, contracts, Storybook, and E2E gates.
- Docs: Epic evidence/gaps, repository verification guidance, active Change ledgers, and review/release handoff policy.
- ADRs: not expected; the selected remediation and local aggregate gate are reversible implementation/workflow corrections within accepted architecture.

## Release Communication Impact

- Required: conditional.
- Record / section: `CHANGELOG.md` Unreleased only if implementation changes user-visible or public security/operational behavior.
- Public summary: omit test-only, SDD, and workflow bookkeeping. Describe only an actual restored user-facing behavior or appropriate bounded security fix.

## Open Questions

- None blocking planning. Any diagnosis that conflicts with accepted Epic behavior triggers `/sdd-change --replan` before implementation continues.
