# Review: Account Workspace Entry

## Verdict

changes-requested

## Gate Scorecard

| Gate                         | Result               | Notes                                                                                               |
| ---------------------------- | -------------------- | --------------------------------------------------------------------------------------------------- |
| Change artifacts             | pass after safe fix  | Proposal, design, tasks, and review state agree after correcting the stale review watermark.        |
| Epic truth                   | pass                 | `LC-001/S1-S3` match implemented behavior and retain explicit manual/provider gaps.                 |
| Requirements and Scenarios   | pass                 | Every Scenario has focused automated evidence or an explicit manual/production gap.                 |
| Story reference traceability | pass                 | Story labels, Requirement IDs, and Scenario IDs are unique and current.                             |
| Tests and verification       | pass after safe fix  | Exact CSRF, signup, and login throttle boundaries plus auth error presentation are covered.         |
| Manual UI confirmation       | pending user         | The walkthrough is current; automated desktop/mobile journeys pass.                                 |
| Code review                  | pass with suggestion | One rare account-created/session-write failure window remains a non-blocking reliability follow-up. |
| Visual / UX consistency      | pass                 | Responsive browser journeys and focused UI tests pass; formatting is normalized.                    |
| Security review              | pass after safe fix  | Session, CSRF, CORS, throttling, storage isolation, and invalidation controls have focused proof.   |
| Documentation                | pass after safe fix  | README, ADR, Epic, and lifecycle records agree with current behavior and gaps.                      |
| Release communication        | pass                 | `[Unreleased]` contains only the user-facing account/workspace capability.                          |
| Branch and merge readiness   | findings             | Safe review fixes at `95f7799` require a fresh independent review before integration.               |
| PRD alignment                | pass                 | The account boundary supports the private, creator-first world-bible direction.                     |

## Findings

### BLOCKING

- [ ] Safe functional review fixes in `95f7799` have not received an independent review. Recommendation: rerun `/sdd-review` against `95f7799`; the subsequent review-record-only commit does not change runtime behavior.

### REQUIRED

- [x] `apps/backend/tests/functional/account_security.spec.ts` did not prove the configured 20-attempt login throttle while the evidence ledger claimed exact limits. Fixed in `95f7799` with success through request 20, throttling on request 21, and forwarded-client isolation.
- [x] `apps/frontend/src/auth/tuyauAuthApi.ts` classified backend `403 INVALID_CSRF_TOKEN` responses as network failures. Fixed in `95f7799` with explicit recovery guidance and adapter/UI tests for signup, sign-in, and sign-out.
- [x] `tasks.md` directed rereview at implementation commit `6468754` instead of the reviewed branch head `2eb5174`. Corrected in this review record and task ledger.

### SUGGESTION

- [ ] `apps/backend/app/controllers/new_account_controller.ts:33` - The account transaction commits before session middleware persists the authenticated session. A narrowly timed session-store failure can therefore leave a valid account after the request fails, and a retry reaches duplicate-account recovery instead of automatic workspace entry. Recommendation: when reliability hardening becomes necessary, define and test an explicit recoverable outcome for post-account session persistence failure rather than adding transaction coupling prematurely.

## Verification Evidence

| Command / Scenario                                                              | Evidence Type             | Requirement / Scenario                 | Result                                                               | What It Proves                                                                                                                              |
| ------------------------------------------------------------------------------- | ------------------------- | -------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Fresh migrations plus root `npm run test` against an isolated PostgreSQL schema | focused integration tests | `LC-001/S1-S3`                         | 17 backend and 26 frontend tests passed at reviewed source `2eb5174` | Account persistence, validation, hashing, database sessions, API protection, client routing, and empty-state behavior execute successfully. |
| `apps/backend/tests/functional/account_security.spec.ts` after safe fix         | focused integration test  | Cross-Story auth abuse boundary        | 18 backend tests passed                                              | CSRF, signup, and login throttles have exact boundary and client-key isolation proof.                                                       |
| Frontend tests after safe fix                                                   | focused automated test    | `LC-001/S1-S3` error and UI behavior   | 32 frontend tests passed                                             | CSRF-expiry recovery is correctly translated and presented for all three mutations.                                                         |
| `npm run test:e2e` with Playwright-owned isolated services                      | deterministic E2E         | `LC-001/S1-S3`                         | 2 passed, desktop and mobile Chromium                                | Same-origin cookie/CSRF flow, refresh, login, logout, replay denial, protected routing, and empty workspace integrate successfully.         |
| Root lint, typecheck, forced build, formatting, audit, and diff checks          | broad supporting gate     | Cross-story code quality and packaging | passed; 0 vulnerabilities                                            | The committed applications compile, build, format, and have no reported moderate-or-higher dependency vulnerability.                        |
| Credential-signature scan                                                       | security supporting gate  | Secret handling                        | passed                                                               | No real database credentials, keys, tokens, or private runtime values appear in the diff.                                                   |

## Review Bundle

- App and workflow root: `/Users/taylor/src/my-life/my-vault/03-spaces/code/lorecraft`
- Change folder: `docs/changes/2026-07-12-account-workspace-entry/`
- Source branch/ref: `change/account-workspace-entry`
- Reviewed source commit: `2eb5174ac9439a389318fb5865aed4046f0fe221`
- Safe-fix commit requiring rereview: `95f7799`
- Target branch/ref: `develop` at `4d9aefeeeee5c7765fad47875bd2c065a91e7cbc`
- Merge base: `4d9aefeeeee5c7765fad47875bd2c065a91e7cbc`
- Source-only commits at review start: `6468754`, `2eb5174`
- Target-only commits: none
- Changed files at review start: 87
- Diff stat at review start: 7,420 insertions and 946 deletions
- Conflict check: clean; `git merge-tree --write-tree develop HEAD` produced `46973db12a3922387d82cce8ca9b113719076ade`
- Dirty state at review start: clean source repository; unrelated surrounding-vault changes are outside this review
- Branch policy: valid `change/` branch from `develop`; local review is required before integration

## Delegated Review Passes

| Pass                                          | Result               | Notes                                                                                                     |
| --------------------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------- |
| Artifact truth and lifecycle                  | finding fixed        | Found the stale immutable rereview target.                                                                |
| Backend and security                          | pass with suggestion | Core controls pass; identified the non-blocking post-transaction session-write reliability window.        |
| Frontend and UI                               | finding fixed        | Found CSRF rejection misclassification; cross-tab revalidation was rejected as outside current Scenarios. |
| Verification coverage                         | finding fixed        | Found the missing exact login-throttle boundary test.                                                     |
| Documentation, release communication, and PRD | pass                 | Public and private direction remain aligned without leaking private planning context.                     |
| Integration readiness                         | changes-requested    | New safe-fix commit requires a fresh independent review.                                                  |

## PR / Merge Readiness

- Source branch: `change/account-workspace-entry`
- Reviewed functional source: `2eb5174`
- Safe-fix source awaiting rereview: `95f7799`
- Target branch: `develop`
- Conflict check: clean before safe fixes; must be rerun during fresh review
- Commit state: clean after the review-record commit
- PR status: not started and not authorized
- Merge status: not ready and not authorized

## Suggested Manual UI Testing

- Route/setup: use the running local frontend with a unique valid-looking email; email delivery and recovery are not implemented.
- Create account: trigger invalid email, short password, mismatched confirmation, duplicate account, and CSRF-expiry guidance; confirm errors are clear and focus moves appropriately.
- Session: create an account, refresh `/worlds`, sign out, sign back in, and revisit `/sign-up`; confirm stable transitions and no private-workspace flash.
- Responsive layout: repeat signup, sign-in, empty workspace, and sign-out at narrow mobile and wide desktop sizes; confirm no clipping or horizontal overflow.

## Review Log

- 2026-07-13: Initial deep review returned `changes-requested`; all required findings were remediated in the implementation pass ending at `2eb5174`.
- 2026-07-13: Fresh review of `2eb5174` found a stale review watermark, missing login-throttle boundary proof, and CSRF error misclassification. Safe fixes were committed as `95f7799`; a fresh independent review is required before integration.
