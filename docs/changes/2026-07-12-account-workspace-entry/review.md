# Review: Account Workspace Entry

## Verdict

changes-requested

## Gate Scorecard

| Gate                         | Result               | Notes                                                                                               |
| ---------------------------- | -------------------- | --------------------------------------------------------------------------------------------------- |
| Change artifacts             | pass                 | Proposal, design, tasks, and review state agree with the reviewed implementation.                   |
| Epic truth                   | pass                 | `LC-001/S1-S3` match implemented behavior and retain explicit manual/provider gaps.                 |
| Requirements and Scenarios   | pass                 | Every Scenario has focused automated evidence or an explicit manual/production gap.                 |
| Story reference traceability | pass                 | Story labels, Requirement IDs, and Scenario IDs are unique and current.                             |
| Tests and verification       | pass                 | Exact CSRF, signup, and login throttle boundaries plus auth error presentation are covered.         |
| Manual UI confirmation       | pending user         | The walkthrough is current; automated desktop/mobile journeys pass.                                 |
| Code review                  | pass with suggestion | One rare account-created/session-write failure window remains a non-blocking reliability follow-up. |
| Visual / UX consistency      | pass                 | Responsive browser journeys and focused UI tests pass; formatting is normalized.                    |
| Security review              | pass                 | Session, CSRF, CORS, throttling, storage isolation, and invalidation controls have focused proof.   |
| Documentation                | pass                 | README, ADR, Epic, and lifecycle records agree with current behavior and gaps.                      |
| Release communication        | pass                 | `[Unreleased]` contains only the user-facing account/workspace capability.                          |
| Branch and merge readiness   | findings             | Session revalidation and pre-throttle multipart handling require implementation and rereview.       |
| PRD alignment                | pass                 | The account boundary supports the private, creator-first world-bible direction.                     |

## Findings

### BLOCKING

- None.

### REQUIRED

- [x] `apps/frontend/src/app/App.tsx:10` disables focus revalidation while the server session expires after two hours. Resolved in the 2026-07-14 apply pass: the session query now always revalidates on focus, suppresses private UI while checking, and has controlled-promise regression coverage for expiry and sign-out races.
- [x] `apps/backend/config/bodyparser.ts:50` globally auto-processes multipart uploads up to 20 MB before the route-level signup and login throttles execute. Resolved in the 2026-07-14 apply pass: unused multipart processing is disabled, signup/login enforce a JSON-only boundary, declared payloads over 16 KB fail pre-parser, unknown-length streams use the same parser limit and error contract, and focused integration tests cover each path.
- [x] `apps/backend/tests/functional/account_security.spec.ts` asserted only HTTP 403 while the frontend contract depends on `errors[].code === "INVALID_CSRF_TOKEN"`. Fixed in the review commit with an exact backend response assertion.
- [x] `apps/backend/tests/functional/account_security.spec.ts` did not prove the configured 20-attempt login throttle while the evidence ledger claimed exact limits. Fixed in `95f7799` with success through request 20, throttling on request 21, and forwarded-client isolation.
- [x] `apps/frontend/src/auth/tuyauAuthApi.ts` classified backend `403 INVALID_CSRF_TOKEN` responses as network failures. Fixed in `95f7799` with explicit recovery guidance and adapter/UI tests for signup, sign-in, and sign-out.
- [x] `tasks.md` directed rereview at implementation commit `6468754` instead of the reviewed branch head `2eb5174`. Corrected in this review record and task ledger.

### SUGGESTION

- [ ] `apps/backend/app/controllers/new_account_controller.ts:33` - The account transaction commits before session middleware persists the authenticated session. A narrowly timed session-store failure can therefore leave a valid account after the request fails, and a retry reaches duplicate-account recovery instead of automatic workspace entry. Recommendation: when reliability hardening becomes necessary, define and test an explicit recoverable outcome for post-account session persistence failure rather than adding transaction coupling prematurely.

## Verification Evidence

| Command / Scenario                                                        | Evidence Type             | Requirement / Scenario                 | Result                                               | What It Proves                                                                                                                                              |
| ------------------------------------------------------------------------- | ------------------------- | -------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fresh migrations plus root `npm run test` against an isolated Neon schema | focused integration tests | `LC-001/S1-S3`                         | 18 backend and 32 frontend tests passed at `f87cabe` | Account persistence, validation, hashing, database sessions, API protection, client routing, exact throttles, and auth error handling execute successfully. |
| `apps/backend/tests/functional/account_security.spec.ts`                  | focused integration test  | Cross-Story auth abuse boundary        | 18 backend tests passed                              | CSRF, signup, and login throttles have exact boundary and client-key isolation proof.                                                                       |
| Frontend Vitest suites                                                    | focused automated test    | `LC-001/S1-S3` error and UI behavior   | 32 frontend tests passed                             | CSRF-expiry recovery is correctly translated and presented for all three mutations.                                                                         |
| `npm run test:e2e` with Playwright-owned isolated services and database   | deterministic E2E         | `LC-001/S1-S3`                         | 2 passed, desktop and mobile Chromium                | Same-origin cookie/CSRF flow, refresh, login, logout, replay denial, protected routing, and empty workspace integrate successfully.                         |
| Root lint, typecheck, forced build, formatting, audit, and diff checks    | broad supporting gate     | Cross-story code quality and packaging | passed; 0 vulnerabilities                            | The committed applications compile, build, format, and have no reported moderate-or-higher dependency vulnerability.                                        |
| Credential-signature scan                                                 | security supporting gate  | Secret handling                        | passed                                               | No real database credentials, keys, tokens, or private runtime values appear in the diff.                                                                   |

## Review Bundle

- App and workflow root: `/Users/taylor/src/my-life/my-vault/03-spaces/code/lorecraft`
- Change folder: `docs/changes/2026-07-12-account-workspace-entry/`
- Source branch/ref: `change/account-workspace-entry`
- Reviewed source commit: `f87cabe502f7573d239d4ae0c96006114771c4a9`
- Target branch/ref: `develop` at `4d9aefeeeee5c7765fad47875bd2c065a91e7cbc`
- Merge base: `4d9aefeeeee5c7765fad47875bd2c065a91e7cbc`
- Source-only commits at review start: `6468754`, `2eb5174`, `95f7799`, `f87cabe`
- Target-only commits: none
- Changed files at review start: 87
- Diff stat at review start: 7,595 insertions and 948 deletions
- Conflict check: clean; `git merge-tree --write-tree develop HEAD` produced `c5b8eb5eb78d037c5cbc3796f25948a8ccc02ef0`
- Dirty state at review start: clean source repository; unrelated surrounding-vault changes are outside this review
- Branch policy: valid `change/` branch from `develop`; local review is required before integration

## Delegated Review Passes

| Pass                                          | Result            | Notes                                                                                                                   |
| --------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Artifact truth and lifecycle                  | pass              | Artifacts now use the current immutable review source and preserve explicit gaps.                                       |
| Backend and security                          | finding           | Auth throttles run after unused global multipart processing; the session-write reliability window remains a suggestion. |
| Frontend and UI                               | finding           | Corrected CSRF behavior passes, but open workspaces do not revalidate expired or externally revoked sessions.           |
| Verification coverage                         | pass              | Exact throttle boundaries and all three account journeys have focused evidence.                                         |
| Documentation, release communication, and PRD | pass              | Public and private direction remain aligned without leaking private planning context.                                   |
| Integration readiness                         | changes-requested | Session revalidation and pre-throttle multipart handling require implementation and a fresh review.                     |

## PR / Merge Readiness

- Source branch: `change/account-workspace-entry`
- Reviewed source: `f87cabe502f7573d239d4ae0c96006114771c4a9`
- Target branch: `develop`
- Conflict check: clean at reviewed source
- Commit state: clean
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
- 2026-07-14: Independent rereview of `f87cabe` passed all automated gates but returned `changes-requested` for missing open-workspace session revalidation and unauthenticated multipart processing before auth throttles.
- 2026-07-14: Apply remediation implemented both required findings and added focused race and request-boundary proof. The historical verdict remains `changes-requested` until a fresh independent review evaluates the new source commit.
