# Review: Account Workspace Entry

## Verdict

changes-requested

## Gate Scorecard

| Gate                         | Result   | Notes                                                                                      |
| ---------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| Change artifacts             | findings | Design verification state, Neon topology, and ADR summary are stale or overstated.         |
| Epic truth                   | findings | Story structure is sound, but Japa evidence overclaims database-backed sessions.           |
| Requirements and Scenarios   | findings | All Scenarios are mapped, but the no-private-content-flash Scenario lacks direct evidence. |
| Story reference traceability | pass     | `LC-001/S1`, `S2`, and `S3` labels and references are unique and current.                  |
| Tests and verification       | findings | Broad gates pass; limiter boundary tests and one privacy assertion need stronger evidence. |
| Manual UI confirmation       | findings | Status remains `pending user`; the walkthrough is current but incomplete.                  |
| Code review                  | findings | Auth error translation, E2E safety, and deployment topology require remediation.           |
| Visual / UX consistency      | findings | Responsive layouts are sound; test-only copy and negative heading tracking remain.         |
| Security review              | findings | Anonymous requests can create unthrottled persisted CSRF sessions.                         |
| Documentation                | findings | Setup and project guidance contain stale or incomplete instructions.                       |
| Release communication        | pass     | `[Unreleased]` contains only the implemented user-facing capability.                       |
| Branch and merge readiness   | blocked  | The source branch has no source-only commits; the entire change is uncommitted.            |
| PRD alignment                | pass     | The account boundary supports the private, creator-first world-bible direction.            |

## Findings

### BLOCKING

- [x] `change/account-workspace-entry` at `4d9aefeeeee5c7765fad47875bd2c065a91e7cbc` contained no source-only commits. Resolved by committing the complete verified implementation as `6468754`; independent rereview must use that immutable source SHA.

### REQUIRED

- [x] `apps/backend/config/shield.ts:33`, `apps/backend/config/session.ts:69`, `apps/backend/start/routes.ts:15` - Remediated by applying session and CSRF middleware only to stateful browser routes, rejecting anonymous logout before session initialization, and proving safe anonymous requests create no persisted session.
- [x] `apps/backend/config/shield.ts:44`, `apps/frontend/src/auth/tuyauAuthApi.ts:65`, `apps/frontend/playwright.config.ts:16` - Remediated by selecting a same-origin `/api` proxy topology and exercising it in frontend configuration and browser tests.
- [x] `apps/frontend/playwright.config.ts:9` - Remediated by removing externally managed server mode; Playwright always owns isolated services and requires an explicit disposable database plus write acknowledgment.
- [x] `apps/frontend/src/auth/tuyauAuthApi.ts:118`, `apps/frontend/src/auth/SignInPage.tsx:42` - Remediated with centralized validation and rate-limit translation plus adapter and UI tests for signup, sign-in, and sign-out.
- [x] `apps/backend/scripts/run-tests.mjs:18`, `docs/epics/lc-001-account-identity-and-workspace-access/epic.md:123` - Remediated by running Japa with the database session store and proving persisted session creation and invalidation.
- [x] `apps/backend/tests/functional/account_security.spec.ts:85` - Remediated with isolated forwarded addresses and exact success-through-limit then throttle assertions.
- [x] `apps/frontend/src/app/App.test.tsx:8`, `apps/frontend/e2e/account-workspace.spec.ts:94` - Remediated with deferred session resolution and a mutation observer proving private workspace content never appears during anonymous redirection.
- [x] `docs/changes/2026-07-12-account-workspace-entry/design.md:5`, `design.md:90`, `design.md:136`, `design.md:192` - Reconciled to retain only manual confirmation, dedicated Neon provider smoke, production HTTPS cookie proof, and independent rereview as open evidence.
- [x] `docs/changes/2026-07-12-account-workspace-entry/proposal.md:41`, `design.md:255`, `tasks.md:131` - Reframed dedicated Neon branches as intended topology pending provisioning and provider smoke.
- [x] `docs/changes/2026-07-12-account-workspace-entry/tasks.md:141`, `AGENTS.md:37` - Reconciled ADR state and the implemented Vite/React frontend guidance.
- [x] `README.md:78` - Added the required disposable-database migration step before guarded backend tests.

### SUGGESTION

- [x] `apps/frontend/src/auth/SignUpPage.tsx:129` - Intentionally retained for the current local-only workflow at the user's request; replace it with product-neutral copy before public deployment.
- [x] `apps/frontend/src/auth/AuthLayout.module.css:90`, `apps/frontend/src/workspace/WorkspacePage.module.css:104` - Normalized heading letter spacing to zero.

## Verification Evidence

| Command / Scenario                                              | Evidence Type             | Requirement / Scenario                | Result                                  | What It Proves                                                                                                                                         |
| --------------------------------------------------------------- | ------------------------- | ------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Migrations plus `npm test` against a fresh isolated Neon schema | focused integration tests | `LC-001/S1-S3` server/client mappings | 17 backend and 26 frontend tests passed | Account persistence, validation, hashing, database sessions, API protection, client routing, and empty state execute successfully.                     |
| `npm run lint`                                                  | broad supporting gate     | Cross-story code quality              | passed                                  | Backend and frontend lint cleanly.                                                                                                                     |
| `npm run typecheck`                                             | broad supporting gate     | Typed API/client integration          | passed                                  | Backend, generated Tuyau contract, and frontend compile together.                                                                                      |
| `npx turbo build --force`                                       | broad supporting gate     | Production build shape                | passed                                  | Both applications build uncached.                                                                                                                      |
| `npm audit --audit-level=moderate`                              | security supporting gate  | Dependency surface                    | passed, 0 vulnerabilities               | Installed dependency graph has no reported moderate-or-higher vulnerability.                                                                           |
| `git diff --check` and credential-signature scan                | safety supporting gate    | Repository hygiene                    | passed                                  | No whitespace errors or real credential signatures were found; CI-local PostgreSQL credentials are non-secret test fixtures.                           |
| `apps/frontend/e2e/account-workspace.spec.ts` on isolated Neon  | deterministic E2E         | Account journey across `LC-001/S1-S3` | 2 passed, desktop and mobile Chromium   | Cookie/CSRF flow, refresh, login, logout, replay denial, protected routes, and empty workspace integrate successfully in the same-host local topology. |

## Review Bundle

- Source branch/ref: `change/account-workspace-entry`
- Reviewed source commit: `4d9aefeeeee5c7765fad47875bd2c065a91e7cbc`; this commit does not contain the working-tree implementation
- Target branch/ref: `develop` at `4d9aefeeeee5c7765fad47875bd2c065a91e7cbc`
- Merge base: `4d9aefeeeee5c7765fad47875bd2c065a91e7cbc`
- Source-only commits: none
- Target-only commits: none
- Changed files: 33 modified/deleted tracked files plus 43 untracked files at bundle capture
- Diff stat: working tree `3263 insertions`, `932 deletions` across tracked files, plus untracked implementation/artifact files
- Conflict check: clean; `git merge-tree --write-tree develop HEAD` produced tree `844b050f17311e6327041317de93ee191f3d0cde`
- Dirty state: all application code, generated contract files, tests, CI, docs, and release communication remain uncommitted in the source repository
- Branch policy: source branch prefix and `develop` target are correct; commit state is not integration-ready

## Delegated Review Passes

| Pass                               | Reviewer                       | Result   | Notes                                                                                                       |
| ---------------------------------- | ------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------- |
| Artifact truth                     | delegated fresh-context pass   | findings | Found uncommitted source, stale verification claims, Neon overstatement, and stale ADR summary.             |
| Code diff                          | delegated fresh-context pass   | findings | Found split-host CSRF failure, misleading auth errors, and E2E safety bypass.                               |
| Verification coverage              | delegated fresh-context pass   | findings | Found session evidence overclaim, state-coupled limiter tests, and missing transient-content proof.         |
| Security                           | delegated security pass        | findings | Found unthrottled anonymous persisted-session creation; auth isolation and secret handling otherwise clean. |
| UI / visual identity               | delegated verification/UI pass | findings | Desktop/mobile layout and accessibility smoke passed; two low-risk consistency findings remain.             |
| Docs / release communication / PRD | main plus artifact pass        | findings | README and guidance drift; CHANGELOG and PRD alignment pass.                                                |
| Integration readiness              | main review                    | blocked  | Source branch contains no committed change to integrate.                                                    |

## PR / Merge Readiness

- Source branch: `change/account-workspace-entry`
- Reviewed source commit: `4d9aefeeeee5c7765fad47875bd2c065a91e7cbc`
- Target branch: `develop`
- Conflict check: clean for the identical committed refs
- Commit state: blocked; proposed change is entirely uncommitted
- PR status: not started and not authorized
- Merge status: not ready and not authorized

## Suggested Manual UI Testing

- Route/setup: use the running local frontend with a unique valid-looking email; email delivery and recovery are not implemented.
- Create account: trigger invalid email, short password, mismatched confirmation, and duplicate account errors; confirm the right field is focused and corrections are clear.
- Session: create an account, refresh `/worlds`, sign out, sign back in, and revisit `/sign-up`; confirm transitions are stable and no private workspace content flashes before authentication resolves.
- Failure handling: after remediation, trigger login throttling and server-side validation failure; confirm neither is described as a connection outage.
- Responsive layout: repeat signup, sign-in, empty workspace, and sign-out at narrow mobile and wide desktop sizes; confirm no clipping, horizontal scroll, or obscured controls.

## Review Log

- 2026-07-13: Deep local review created with verdict `changes-requested`; no safe-fix commit was attempted because the complete implementation is uncommitted and required code/security work remains.
- 2026-07-13: All required code, security, verification, documentation, and UI findings were remediated and the complete automated suite passed; immutable commit proof and independent rereview remain pending.
- 2026-07-13: The remediated implementation was committed as `6468754`; the historical verdict remains `changes-requested` until an independent rereview evaluates that source commit.
