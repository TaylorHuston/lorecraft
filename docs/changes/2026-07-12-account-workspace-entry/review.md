# Review: Account Workspace Entry

## Verdict

changes-requested

## Gate Scorecard

| Gate                         | Result              | Notes                                                                                                                 |
| ---------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Change artifacts             | pass after safe fix | The Epic upgrade gap, closeout checklist, current review watermark, and public-safe paths were reconciled.            |
| Change status                | in_progress         | Required implementation remediation remains.                                                                          |
| Epic truth                   | pass                | `LC-001/S1-S3` match current behavior and retain explicit acceptance gaps.                                            |
| Requirements and Scenarios   | pass                | Story labels and local Requirement/Scenario IDs are unique and mapped.                                                |
| Story reference traceability | pass                | Full Story references remain Epic-scoped and traceable.                                                               |
| Tests and verification       | findings            | Fresh-database proof passes, but no upgrade-path test covers databases that already ran the original users migration. |
| Manual UI confirmation       | pending user        | The walkthrough is current; automated desktop/mobile journeys pass.                                                   |
| Code review                  | findings            | The existing-database migration path is incorrect.                                                                    |
| Visual / UX consistency      | findings            | Protected refresh errors lose focus, and the public retry control is below the 44px touch-target baseline.            |
| Security review              | pass                | Session, CSRF, request-boundary, throttling, and disposable-database safeguards pass focused review.                  |
| Documentation                | pass after safe fix | README, ADRs, Epic, change design, and setup guidance agree after reconciliation.                                     |
| Release communication        | pass                | `[Unreleased]` contains only the user-facing account/workspace capability.                                            |
| Branch and merge readiness   | changes-requested   | The branch is clean and conflict-free, but three required implementation findings remain.                             |
| PRD alignment                | pass                | The account boundary supports the private, creator-first world-bible direction.                                       |

## Findings

### BLOCKING

- None.

### REQUIRED

- [ ] `apps/backend/database/migrations/1761885935168_create_users_table.ts:14` - The change edits a migration already present on `develop`. Existing databases will not rerun it, so they retain `full_name` and do not receive the normalized-email constraint and named unique index. Restore the original migration, add a forward migration, and prove migration from the target schema to the source schema.
- [ ] `apps/frontend/src/app/AppRoutes.tsx:69` - Failed protected-session revalidation replaces the workspace with `SessionError`, but keyboard focus falls to the document body. Focus the error recovery surface and add a regression test.
- [ ] `apps/frontend/src/app/AppRoutes.module.css:75` - The public background-refresh retry control measures below the project's 44px touch-target baseline at mobile width. Add minimum sizing or equivalent padding and verify it at the narrow viewport.
- [x] `.github/workflows/ci.yml:49` - Corrected the unpublished `actions/checkout@v7` reference to supported `actions/checkout@v6`, verified against the official action releases.
- [x] `docs/epics/lc-001-account-identity-and-workspace-access/epic.md`, `tasks.md`, and this review - Reconciled the migration-upgrade gap, unresolved-finding checklist state, current review watermark, and public-safe repository paths.

### SUGGESTION

- [ ] `apps/backend/config/limiter.ts:3` - Authentication throttles use a process-local memory store. Require a shared limiter store or ingress-level distributed limits before horizontal or production deployment.
- [ ] `apps/backend/app/controllers/new_account_controller.ts:55` - The duplicate-account response reveals whether an email is registered. Retain this only as an explicit product/privacy choice.
- [ ] `apps/backend/app/controllers/new_account_controller.ts:33` - Define a recoverable post-account/session-persistence failure outcome if operational evidence shows this rare window needs hardening.
- [ ] `apps/frontend/src/workspace/WorkspacePage.module.css:159` - Narrow layouts hide the signed-in email; consider retaining account identity in a wrapping or secondary row.

## Verification Evidence

| Command / Scenario                                                               | Evidence Type             | Requirement / Scenario         | Result                                   | What It Proves                                                                                                                      |
| -------------------------------------------------------------------------------- | ------------------------- | ------------------------------ | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Fresh guarded migrations and backend tests against isolated Neon schema          | focused integration       | `LC-001/S1-S3`                 | 16 safety and 24 backend tests passed    | Fresh-schema persistence, authentication, session, CSRF, request, and database-tooling behavior works.                              |
| `npm test --workspace @lorecraft/frontend`                                       | focused automated         | `LC-001/S1-S3`                 | 41 passed                                | Forms, routing, session races, draft preservation, focus success/expiry, error mapping, and empty workspace behavior pass.          |
| `npm run test:e2e` against a separate isolated Neon schema                       | deterministic E2E         | `LC-001/S1-S3`                 | 2 passed, desktop and mobile Chromium    | Same-origin cookie/CSRF flow, refresh, login, logout, replay denial, protected routing, and empty workspace integrate successfully. |
| `npx turbo lint typecheck build --force` and `npx prettier --check .`            | broad supporting gates    | Cross-story code quality       | passed; no cached tasks                  | Both applications lint, typecheck, build, and match configured formatting from the reviewed source.                                 |
| `npm audit --audit-level=low` and credential-pattern scan                        | security supporting gates | Dependency and secret handling | passed; 0 vulnerabilities; fixtures only | No reported dependency issue or real credential was found.                                                                          |
| `git diff develop...HEAD --check` and `git merge-tree --write-tree develop HEAD` | integration gates         | Branch readiness               | passed; conflict tree `b71181d2...`      | Reviewed source is whitespace-clean and mechanically integrates with `develop`.                                                     |

## Review Bundle

- App and workflow root: repository root
- Change folder: `docs/changes/2026-07-12-account-workspace-entry/`
- Source branch/ref: `change/account-workspace-entry`
- Reviewed source commit: `c22e4b65893d2411003db80135bd3d536737520e`
- Target branch/ref: `develop` at `4d9aefeeeee5c7765fad47875bd2c065a91e7cbc`
- Merge base: `4d9aefeeeee5c7765fad47875bd2c065a91e7cbc`
- Source-only commits: `6468754`, `2eb5174`, `95f7799`, `f87cabe`, `5698a3f`, `78bebd6`, `d05d78e`, `aeb6627`, `c7d990b`, `b38d7b7`, `c22e4b6`
- Target-only commits: none
- Changed files: 93
- Diff stat: 8,862 insertions and 950 deletions
- Conflict check: clean; `git merge-tree --write-tree develop HEAD` produced `b71181d208d77a642b25c932f414d43b21b52872`
- Dirty state at review start: clean source repository; unrelated surrounding-vault changes are outside this review
- Branch policy: valid `change/` branch from `develop`; local review is required before integration

## Discovery Wave

| Pass                                          | Result              | Notes                                                                                |
| --------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------ |
| Artifact truth and lifecycle                  | pass after safe fix | Epic gap, checklist state, review watermark, and public-safe path drift corrected.   |
| Backend and security                          | finding             | Existing databases cannot receive edits made to the already-applied users migration. |
| Frontend and UI                               | finding             | Protected refresh failure loses focus; public retry is undersized on mobile.         |
| Verification and integration                  | finding             | Current gates pass; existing-database upgrade proof remains absent.                  |
| Documentation, release communication, and PRD | pass after safe fix | Public and private direction remain aligned without a committed private path.        |

## Consolidated Remediation

- Root causes addressed: review-record drift, incomplete Epic gap inventory, and a private absolute path in a public artifact.
- Safe-fix batch: reconciled the Epic, task ledger, and review record.
- Deferred or unsafe findings: users-schema forward migration plus upgrade test, protected-error focus recovery, and 44px public retry sizing require `/sdd-apply`.
- Affected verification union: artifact scans, forced static/build gates, frontend tests, database-safety tests, dependency audit, diff check, and merge-tree check.
- Regression-focused rereview: artifact, documentation, branch, and integration surfaces pass after the safe batch; the three implementation findings remain unchanged.
- New regressions introduced by remediation: none.

## PR / Merge Readiness

- Source branch: `change/account-workspace-entry`
- Reviewed source: `c22e4b65893d2411003db80135bd3d536737520e`
- Target branch: `develop`
- Conflict check: clean at reviewed source
- Commit state at review start: clean
- PR status: not started and not authorized
- Merge status: not ready and not authorized

## Suggested Manual UI Testing

- Route/setup: use `http://localhost:5173` with a unique valid-looking email; email delivery and recovery are not implemented.
- Draft preservation: partially complete `/sign-up` and `/sign-in`, switch windows or tabs, and return. Drafts should survive successful and failed background checks, and retry should not remount the form.
- Session recovery: from `/worlds`, return focus with both a valid and expired session. Private content should be suppressed during the check; focus should return to the prior workspace control on success and move to error recovery or sign-in on failure/expiry.
- Account journey: create an account, refresh `/worlds`, sign out, sign back in, and revisit `/sign-up`. Expect stable transitions and no private-workspace flash.
- Responsive layout: repeat the journey at narrow mobile and wide desktop sizes. Expect no clipping or horizontal overflow and at least 44px interactive targets.
- Status: pending user.

## Review Log

- 2026-07-13 through 2026-07-14: Earlier independent reviews and remediation are recorded in the implementation and verification ledgers in `tasks.md`.
- 2026-07-14: Fresh review of `b38d7b7` returned `changes-requested` for the users migration upgrade path and two accessibility defects. CI action and artifact-only findings were safely corrected; fresh review remains required after `/sdd-apply` resolves the implementation findings.
- 2026-07-14: Comprehensive review of `c22e4b6` confirmed the same three implementation findings and corrected the complete artifact-only batch. Forced static/build gates, 41 frontend tests, 16 database-safety tests, dependency audit, diff, and merge checks pass; prior backend and E2E evidence remains applicable because intervening changes were limited to CI and artifacts.
