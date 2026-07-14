# Review: Account Workspace Entry

## Verdict

changes-requested

## Gate Scorecard

| Gate                         | Result              | Notes                                                                                                          |
| ---------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------- |
| Change artifacts             | pass after safe fix | Current source, evidence counts, ADR status, and remaining gaps are reconciled.                                |
| Change status                | review              | Implementation is complete; acceptance evidence remains open.                                                  |
| Epic truth                   | pass                | `LC-001/S1-S3` match current behavior and retain explicit verification gaps.                                   |
| Requirements and Scenarios   | pass                | Story labels and local Requirement/Scenario IDs are unique and mapped.                                         |
| Story reference traceability | pass                | Full Story references remain Epic-scoped and traceable.                                                        |
| Tests and verification       | pass                | Fresh database, backend, frontend, browser, static, formatting, and dependency gates pass.                     |
| Manual UI confirmation       | pass                | The user confirmed the local account, session, focus, empty-state, and responsive flow on 2026-07-14.          |
| Code review                  | pass after safe fix | Duplicate focus refreshes and repeatable public retries were resolved in `f799981`.                            |
| Visual / UX consistency      | pass after safe fix | Pending retry state is visible, accessible, non-destructive, and prevents repeated requests.                   |
| Security review              | evidence gap        | Code review is clean; representative runtime auth logs and production HTTPS cookie behavior remain unverified. |
| Documentation                | pass after safe fix | README, ADRs, Epic, change design, and evidence ledgers agree.                                                 |
| Release communication        | pass                | `[Unreleased]` contains only the user-facing account/workspace capability.                                     |
| Branch and merge readiness   | not ready           | Merge is mechanically clean, but three acceptance gaps require evidence or explicit user acceptance.           |
| PRD alignment                | pass                | The account boundary supports the private, creator-first world-bible direction.                                |

## Findings

### BLOCKING

- None.

### REQUIRED

- [x] `apps/frontend/src/auth/AuthProvider.tsx:14` - Removed overlapping TanStack visibility and explicit focus refresh sources; one browser return now produces one session check with regression coverage in `f799981`.
- [x] `apps/frontend/src/app/AppRoutes.tsx:44` - Public background-refresh retry now exposes pending state, disables repeated requests, and preserves the unfinished auth draft in `f799981`.
- [ ] `docs/changes/2026-07-12-account-workspace-entry/tasks.md:82` - Capture representative backend auth-failure logs and verify they omit passwords, connection strings, session values, and bearer tokens, or obtain explicit acceptance of this evidence gap.
- [x] Manual UI confirmation - The user confirmed the documented local flow on 2026-07-14.
- [ ] `docs/adrs/2026-07-12-postgresql-on-neon.md` - Run the dedicated Lorecraft Neon provider smoke check or record explicit user acceptance of the gap before closeout.
- [ ] `docs/adrs/2026-07-12-browser-session-authentication.md` - Verify the session cookie over production HTTPS or record explicit user acceptance of the gap before closeout.

### SUGGESTION

- [ ] `.github/workflows/ci.yml:72` - After Tuyau generation, add a generated-client diff check so CI cannot silently repair an uncommitted contract drift.
- [ ] `apps/backend/config/limiter.ts:3` - Require a shared limiter store or ingress-level distributed limits before horizontal or production deployment.
- [ ] `apps/backend/app/controllers/new_account_controller.ts:55` - Retain the duplicate-account response only as an explicit product/privacy choice because it reveals whether an email is registered.
- [ ] `apps/frontend/src/workspace/WorkspacePage.module.css:159` - Consider retaining signed-in account identity on narrow layouts instead of hiding it.

## Verification Evidence

| Command / Scenario                                                               | Evidence Type            | Requirement / Scenario   | Result                                 | What It Proves                                                                                                                      |
| -------------------------------------------------------------------------------- | ------------------------ | ------------------------ | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Fresh guarded migrations and backend tests against disposable Neon schema        | focused integration      | `LC-001/S1-S3`           | 16 safety and 32 backend tests passed  | Fresh and upgraded schemas, authentication, sessions, CSRF, request boundaries, and database guards work together.                  |
| `npm test --workspace @lorecraft/frontend`                                       | focused automated        | `LC-001/S1-S3`           | 44 passed                              | Forms, routing, session races, single focus refresh, pending retry behavior, focus recovery, and empty workspace behavior pass.     |
| `npm run test:e2e` against a separate disposable Neon schema                     | deterministic E2E        | `LC-001/S1-S3`           | 2 passed, desktop and mobile Chromium  | Same-origin cookie/CSRF flow, refresh, login, logout, replay denial, protected routing, and empty workspace integrate successfully. |
| `npx turbo lint typecheck build --force` and `npx prettier --check .`            | broad supporting gates   | Cross-story code quality | 6 uncached tasks and formatting passed | Both applications lint, typecheck, build, and match configured formatting.                                                          |
| `npm audit --audit-level=low`                                                    | security supporting gate | Dependency safety        | passed; 0 reported vulnerabilities     | The current dependency graph has no reported issue at the configured threshold.                                                     |
| `git diff develop...HEAD --check` and `git merge-tree --write-tree develop HEAD` | integration gates        | Branch readiness         | passed; conflict tree `677b3642...`    | Reviewed implementation is whitespace-clean and mechanically integrates with `develop`.                                             |

## Review Bundle

- App and workflow root: repository root
- Change folder: `docs/changes/2026-07-12-account-workspace-entry/`
- Source branch/ref: `change/account-workspace-entry`
- Reviewed source commit: `f799981a169fa36cdbd13935fec21d527a8582b9`
- Target branch/ref: `develop` at `4d9aefeeeee5c7765fad47875bd2c065a91e7cbc`
- Merge base: `4d9aefeeeee5c7765fad47875bd2c065a91e7cbc`
- Source-only commits: 15, from `6468754` through `f799981`
- Target-only commits: none
- Changed files: 96
- Diff stat: 9,448 insertions and 948 deletions
- Conflict check: clean; `git merge-tree --write-tree develop HEAD` produced `677b36420d5a38363c6704a82fc636bf39e6335c`
- Dirty state at review start: clean source repository; review artifacts changed only after implementation commit `f799981`
- Branch policy: valid `change/` branch from `develop`; local review is required before integration

## Discovery Wave

| Pass                                          | Reviewer                          | Result              | Notes                                                                                                    |
| --------------------------------------------- | --------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------- |
| Artifact truth and lifecycle                  | delegated artifact review         | pass after safe fix | Stale watermark, counts, task state, and ADR-validation checkbox were reconciled.                        |
| Backend and security                          | delegated backend/security review | pass                | No code finding; production/provider assumptions and evidence gaps remain explicit.                      |
| Frontend and UI                               | delegated frontend review         | pass after safe fix | Duplicate refresh and pending retry findings were fixed and independently regression-reviewed.           |
| Verification and integration                  | delegated verification review     | evidence gaps       | Automated and manual UI gates pass; runtime-log, dedicated Neon, and production HTTPS evidence are open. |
| Documentation, release communication, and PRD | delegated integration review      | pass                | Public docs, changelog scope, and creator-first direction agree with implemented behavior.               |

## Consolidated Remediation

- Root causes addressed: overlapping browser lifecycle handlers, retry controls without an observable pending state, and verification-ledger drift.
- Safe-fix batch: implementation commit `f799981` plus this artifact reconciliation.
- Deferred or unsafe findings: dedicated Neon provider, production HTTPS cookie, and runtime-log evidence require external observation or explicit user acceptance.
- Affected verification union: 44 frontend tests, forced lint/typecheck/build, formatting, diff, merge-tree, and independent focused frontend rereview; fresh backend/E2E evidence remains applicable because remediation is frontend-only.
- Regression-focused rereview: passed; one focus check occurs per browser return, public retry is non-repeatable while pending, and the auth draft remains mounted.
- New regressions introduced by remediation: none found.

## PR / Merge Readiness

- Source branch: `change/account-workspace-entry`
- Reviewed source: `f799981a169fa36cdbd13935fec21d527a8582b9`
- Target branch: `develop`
- Conflict check: clean at reviewed source
- Commit state: implementation committed; review artifacts pending commit
- PR status: not started and not authorized
- Merge status: not ready and not authorized; acceptance gaps remain open

## Suggested Manual UI Testing

- Route/setup: use `http://localhost:5173` with a unique valid-looking email; email delivery and recovery are not implemented.
- Draft preservation: partially complete `/sign-up` and `/sign-in`, switch windows or tabs, and return. Drafts should survive both successful and failed background checks; retry should show progress without remounting the form.
- Session recovery: from `/worlds`, return focus with both a valid and expired session. Private content should be suppressed during the check; focus should return to the prior control on success and move to recovery or sign-in on failure.
- Account journey: create an account, refresh `/worlds`, sign out, sign back in, and revisit `/sign-up`. Expect stable transitions and no private-workspace flash.
- Responsive layout: repeat at narrow mobile and wide desktop sizes. Expect no clipping or horizontal overflow and at least 44px interactive targets.
- Status: confirmed by user on 2026-07-14.

## Review Log

- 2026-07-13 through 2026-07-14: Earlier independent reviews and remediation are recorded in the implementation and verification ledgers in `tasks.md`.
- 2026-07-14: Fresh review of `baf0445` found two frontend defects and four acceptance-evidence gaps; backend/security review found no code defect.
- 2026-07-14: `f799981` resolved duplicate session refresh and public pending-retry behavior. The focused independent rereview and 44-test frontend suite passed.
- 2026-07-14: The user confirmed the manual UI flow. Verdict remains `changes-requested` until runtime-log, dedicated Neon, and production HTTPS evidence are completed or explicitly accepted.
