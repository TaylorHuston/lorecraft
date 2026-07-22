# Proposal: Epic Audit Remediation

## Why

The current implementation is mostly sound, but the three active Lorecraft Epics are not equally dependable as the durable map of that implementation. LC-002 exposes unfielded Character validation errors that produce misleading UI recovery. LC-001, LC-002, and LC-003 also contain stale status, evidence, ownership, and schema claims discovered by their 2026-07-22 Epic audits.

## What Changes

- Return field-specific duplicate Character-key and invalid Location errors for create and edit, so the existing editor can highlight the actual invalid field.
- Add the missing focused permission, validation, and protected-route session-loss regressions.
- Normalize LC-001 to `sdd-epic-v2` and reconcile all three active Epics with current code, exact test anchors, closed Change location, honest operational gaps, and current scenario-mapped evidence.

## Target Repositories

- This repository (role: official-application).

## Epic Actions

### New Epic Directories

- None.

### Existing Epic Directory Updates

- `docs/epics/lc-001-account-identity-and-workspace-access/`: normalize legacy shape and reconcile account/session requirements and evidence.
- `docs/epics/lc-002-world-bible-catalog/`: repair Character validation behavior and its scenario evidence/status.
- `docs/epics/lc-003-adventure-play/`: reconcile Adventure/NPC traceability, exact evidence anchors, and closure/manual-evidence status.

## Epic Story Changes

- LC-001/S1-S3: retain behavior; normalize independent implementation/verification state and add the already-implemented requested-protected-route resumption scenario under S2.
- LC-002/S3: retain Character authoring scope; make duplicate-key and invalid-Location recovery field-specific, and add missing permission/validation proof.
- LC-003/S1-S3: retain Adventure scope; correct stale test labels, complete forward maps, and split aggregate evidence only where exact existing proof supports it.
- No Stories move between Epics and no new product capability is introduced.

## Scope Decisions

- Confirmed: the scope is the three active Epics in the official application repository, not the archived `lorecraft-mvp` prototype.
- Confirmed: existing private-production/recovery assertions without a reproducible current record remain explicit operational verification gaps; this Change does not deploy or perform production verification.
- Confirmed: sign-in return to an originally requested protected route is accepted existing behavior and will be documented, not redesigned.
- Deferred: production/recovery environment validation, distributed rate limiting, account recovery, and any new Adventure or World capability.
- Assumption: current feature behavior remains the source of truth unless focused tests expose a defect.

## Change Folder

- Planned location: promoted; private draft removed
- Active location: `docs/changes/2026-07-22-epic-audit-remediation/`
- Closed location: `docs/changes/closed/2026-07-22-epic-audit-remediation/`

## Impact

- Product: clearer Character-editor recovery; no scope expansion.
- Code: Character service/controller error contract, typed frontend error mapping, and focused frontend/backend tests.
- Tests: Character create/edit validation and authorization; New Adventure session-loss; precise LC-001 and LC-003 test labels.
- Docs: all three Epics, related ADR/closed Change references, and audit reconciliation.
- ADRs: update stale links/status wording only; no new architecture decision is proposed.

## Release Communication Impact

- Required: no.
- Record / section: not applicable; this is an internal correctness, recovery, and traceability remediation.
- Public summary: none.

## Open Questions

- None blocking planning. Apply must preserve operational verification gaps unless an explicitly authorized, reproducible environment check is available.
