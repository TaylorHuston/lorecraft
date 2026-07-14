---
status: in_progress
---

# Tasks: Public Starter World

## Resume Here

- Current state: independent review found required data-integrity, session/cache-boundary, recovery-state, and verification-evidence work
- Last completed action: recorded the consolidated independent review and reconciled safe artifact drift
- Next action: run `/sdd-apply` against `review.md`, then repeat independent review and obtain user UI confirmation
- Active branch/ref: `change/public-starter-world`, stacked on Storybook workbench commit `cd5604a`
- Expected dirty files: none before the next `/sdd-apply` pass
- Known blockers: required review findings, the unfinished stacked Storybook Change, and manual user confirmation remain

## Task Checklist

- [x] Resolve scope, data boundary, visibility, ownership, and seed behavior.
- [x] Create canonical Change artifacts and remove the superseded private draft.
- [x] Implement and verify the World persistence and explicit idempotent seed.
- [x] Implement and verify authenticated catalog/detail API behavior.
- [x] Implement and verify catalog/detail web behavior and Storybook states.
- [x] Seed the local starter World for the configured author and run automated browser verification.
- [x] Reconcile LC-001, create LC-002, and update user-facing release communication.
- [x] Run the implementation self-check.
- [x] Run independent `/sdd-review`.
- [ ] Obtain manual UI confirmation or record an accepted gap.
- [ ] Prepare closeout only after review and explicit merge authorization.

## Implementation Ledger

| Date       | Slice                     | Files / Areas                                         | Result      | Commit / Ref |
| ---------- | ------------------------- | ----------------------------------------------------- | ----------- | ------------ |
| 2026-07-14 | Planning and branch setup | Change artifacts; `change/public-starter-world`       | in progress | this branch  |
| 2026-07-14 | Persistence and API       | Migrations, models, application queries, routes, seed | implemented | this branch  |
| 2026-07-14 | Web catalog and detail    | API adapter, routes, components, CSS, Storybook       | implemented | this branch  |
| 2026-07-14 | Durable truth             | LC-001, LC-002, README, CHANGELOG                     | implemented | this branch  |

## Verification Ledger

| Date       | Evidence                                     | Scope                                             | Result               |
| ---------- | -------------------------------------------- | ------------------------------------------------- | -------------------- |
| 2026-07-14 | Scope interview and existing-code inspection | Product, API, data, auth, seed, and UI boundaries | settled; no blockers |
| 2026-07-14 | Backend full suite                           | World scenarios plus account/database regressions | 36 passed            |
| 2026-07-14 | Frontend full suite                          | Catalog/detail plus account regressions           | 50 passed            |
| 2026-07-14 | Storybook browser suite                      | Production catalog/detail and existing stories    | 17 passed            |
| 2026-07-14 | Lint, typecheck, and production builds       | Both applications                                 | passed               |
| 2026-07-14 | Chromium at 1440x900 and 390x844             | Seeded catalog/detail and overflow                | passed               |

## Manual UI Confirmation

- Status: pending user
- Surface: `/worlds` and `/worlds/stormbound-chapel`
- Expected result: every signed-in account sees one read-only starter World and can inspect all structured Locations and Characters without seeing author account data

## Release Communication

- Status: complete; `CHANGELOG.md` records the catalog and structured World detail behavior

## Review And Closeout

- Review status: changes requested
- Review record: `docs/changes/2026-07-14-public-starter-world/review.md`
- ADR status: not applicable; existing ADRs govern this slice
- Epic reconciliation: create LC-002 and revise LC-001 empty-workspace wording
- PR / merge state: branch created; not reviewed or merged
- Accepted deferred gaps: authoring, anonymous publishing, bylines, mutable gameplay state, and hidden private-knowledge policy
- Change folder move: pending review remediation, repeated verification and review, manual status, merge authorization, and closeout
