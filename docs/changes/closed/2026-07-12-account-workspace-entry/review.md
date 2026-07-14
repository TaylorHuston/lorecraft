# Review: Account Workspace Entry

## Verdict

ready

## Gate Scorecard

| Gate                         | Result              | Notes                                                                                                            |
| ---------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Change artifacts             | pass after safe fix | Current source, evidence counts, ADR status, and accepted deployment follow-ups are reconciled.                  |
| Change status                | ready_to_close      | Implementation and acceptance are complete; two deployment checks are explicitly deferred.                       |
| Epic truth                   | pass                | `LC-001/S1-S3` match current behavior and retain explicit deferred verification.                                 |
| Requirements and Scenarios   | pass                | Story labels and local Requirement/Scenario IDs are unique and mapped.                                           |
| Story reference traceability | pass                | Full Story references remain Epic-scoped and traceable.                                                          |
| Tests and verification       | pass                | Fresh database, backend, frontend, browser, static, formatting, and dependency gates pass.                       |
| Manual UI confirmation       | pass                | The user confirmed the local account, session, focus, empty-state, and responsive flow on 2026-07-14.            |
| Code review                  | pass after safe fix | Duplicate focus refreshes and repeatable public retries were resolved in `f799981`.                              |
| Visual / UX consistency      | pass after safe fix | Pending retry state is visible, accessible, non-destructive, and prevents repeated requests.                     |
| Security review              | pass                | Runtime auth logs omit submitted credentials; production HTTPS cookie proof is an accepted pre-production check. |
| Documentation                | pass after safe fix | README, ADRs, Epic, change design, and evidence ledgers agree.                                                   |
| Release communication        | pass                | `[Unreleased]` contains only the user-facing account/workspace capability.                                       |
| Branch and merge readiness   | ready               | Merge is mechanically clean; closeout still requires explicit user authorization.                                |
| PRD alignment                | pass                | The account boundary supports the private, creator-first world-bible direction.                                  |

## Findings

### BLOCKING

- None.

### REQUIRED

- [x] `apps/frontend/src/auth/AuthProvider.tsx:14` - Removed overlapping TanStack visibility and explicit focus refresh sources; one browser return now produces one session check with regression coverage in `f799981`.
- [x] `apps/frontend/src/app/AppRoutes.tsx:44` - Public background-refresh retry now exposes pending state, disables repeated requests, and preserves the unfinished auth draft in `f799981`.
- [x] `docs/changes/closed/2026-07-12-account-workspace-entry/tasks.md:82` - Runtime inspection confirmed invalid-credential and CSRF failure logs omit submitted credentials, cookies, sessions, and database values.
- [x] Manual UI confirmation - The user confirmed the documented local flow on 2026-07-14.
- [x] `docs/adrs/2026-07-12-postgresql-on-neon.md` - The user explicitly deferred the dedicated Lorecraft Neon smoke check until before production deployment.
- [x] `docs/adrs/2026-07-12-browser-session-authentication.md` - The user explicitly deferred production HTTPS `Secure` cookie proof until before production deployment.

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
| Invalid-credential login plus backend log inspection                             | runtime inspection       | Sensitive-value handling | passed; generic/no auth-failure output | Submitted credentials, cookies, sessions, connection strings, and database values were absent from observed runtime logs.           |
| `git diff develop...HEAD --check` and `git merge-tree --write-tree develop HEAD` | integration gates        | Branch readiness         | passed; conflict tree `677b3642...`    | Reviewed implementation is whitespace-clean and mechanically integrates with `develop`.                                             |

## Review Bundle

- App and workflow root: repository root
- Change folder: `docs/changes/closed/2026-07-12-account-workspace-entry/`
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
| Verification and integration                  | delegated verification review     | pass                | Automated, manual UI, and runtime-log gates pass; two deployment-specific checks are accepted deferrals. |
| Documentation, release communication, and PRD | delegated integration review      | pass                | Public docs, changelog scope, and creator-first direction agree with implemented behavior.               |

## Consolidated Remediation

- Root causes addressed: overlapping browser lifecycle handlers, retry controls without an observable pending state, and verification-ledger drift.
- Safe-fix batch: implementation commit `f799981` plus this artifact reconciliation.
- Deferred or unsafe findings: dedicated Neon provider and production HTTPS cookie checks are explicitly accepted pre-production follow-ups.
- Affected verification union: 44 frontend tests, forced lint/typecheck/build, formatting, diff, merge-tree, and independent focused frontend rereview; fresh backend/E2E evidence remains applicable because remediation is frontend-only.
- Regression-focused rereview: passed; one focus check occurs per browser return, public retry is non-repeatable while pending, and the auth draft remains mounted.
- New regressions introduced by remediation: none found.

## PR / Merge Readiness

- Source branch: `change/account-workspace-entry`
- Reviewed source: `f799981a169fa36cdbd13935fec21d527a8582b9`
- Target branch: `develop`
- Conflict check: clean at reviewed source
- Commit state: implementation and review artifacts merged into `develop` as `47a7c55`; closeout reconciliation pending commit
- PR status: not used for routine integration under repository policy
- Merge status: merged into `develop` as `47a7c55`

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
- 2026-07-14: Runtime auth-log inspection passed, and the user explicitly accepted dedicated Neon and production HTTPS checks as pre-production deferrals. Verdict advanced to `ready`.
