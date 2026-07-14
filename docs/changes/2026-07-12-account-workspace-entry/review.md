# Review: Account Workspace Entry

## Verdict

changes-requested

## Gate Scorecard

| Gate                         | Result            | Notes                                                                                                      |
| ---------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------- |
| Change artifacts             | pass              | Proposal, design, Epic, and task scope describe the implemented account boundary.                          |
| Epic truth                   | pass              | `LC-001/S1-S3` remain current and retain explicit manual and provider gaps.                                |
| Requirements and Scenarios   | findings          | Behavior coverage is broad, but server-side CSRF proof does not cover every independently wired mutation.  |
| Story reference traceability | pass              | Story labels, Requirement IDs, and Scenario IDs are unique and traceable.                                  |
| Tests and verification       | findings          | All suites pass, but disposable-database enforcement is weaker than the documented safety contract.        |
| Manual UI confirmation       | pending user      | The walkthrough is current; automated desktop/mobile journeys pass.                                        |
| Code review                  | findings          | Focus revalidation can erase unfinished signup and sign-in forms.                                          |
| Visual / UX consistency      | findings          | Responsive layout passes automated checks; public-form draft preservation requires correction.             |
| Security review              | findings          | Auth controls are generally sound; database-write safeguards and complete CSRF regression proof need work. |
| Documentation                | pass              | README, ADRs, Epic, and public setup guidance accurately disclose remaining provider and deployment gaps.  |
| Release communication        | pass              | `[Unreleased]` contains only the user-facing account/workspace capability.                                 |
| Branch and merge readiness   | changes-requested | The branch is clean and conflict-free, but three required implementation findings remain.                  |
| PRD alignment                | pass              | The account boundary supports the private, creator-first world-bible direction.                            |

## Findings

### BLOCKING

- None.

### REQUIRED

- [ ] `apps/frontend/src/auth/AuthProvider.tsx:32` and `apps/frontend/src/app/AppRoutes.tsx:51` - Every background session fetch is exposed as global loading state. Returning focus while editing signup or sign-in replaces the public form with `Checking your session...`, remounting it with empty fields after the anonymous response. Recommendation: distinguish initial loading from background revalidation, preserve public forms during background checks, continue suppressing protected content, and add focus/draft-preservation tests for both forms.
- [ ] `apps/backend/scripts/run-tests.mjs:3`, `apps/frontend/playwright.config.ts:5`, and `apps/backend/package.json:16` - The destructive test paths accept any database URL once a write flag is set, and `migrate:ci` always passes Lucid's production override. A mistyped environment can therefore migrate or write to a shared development or production database despite the README's separate-disposable-database contract. Recommendation: centralize and test a disposable-database assertion that rejects the normal application URL and requires an approved test/ephemeral identifier, and remove the unconditional `--force` migration override.
- [ ] `apps/backend/tests/functional/account_security.spec.ts:137` - Exact server-side CSRF rejection is proven only for signup. Login and logout use separately wired mutation routes, so either route could lose CSRF enforcement without a backend regression failure. Recommendation: table-drive missing/invalid-token functional tests over signup, login, and logout, assert the exact `403 INVALID_CSRF_TOKEN` response, and prove no mutation occurred.
- [x] `tasks.md:6-9` - The resume handoff referenced `78bebd6` and expected dirty implementation files even though the reviewed source is clean at `d05d78e`. Corrected in this review update.

### SUGGESTION

- [ ] `apps/backend/config/limiter.ts:3` - Authentication throttles use a process-local memory store. Require a shared limiter store or ingress-level distributed limits before horizontal or production deployment; the Epic already records this deployment limitation.
- [ ] `apps/backend/app/controllers/new_account_controller.ts:55` - The distinct duplicate-account response reveals whether an email is registered. Keep this as an explicit product/privacy decision; if enumeration becomes unacceptable, revise the duplicate-account requirement or add shared per-identifier controls.
- [ ] `apps/backend/app/controllers/new_account_controller.ts:33` - The account transaction commits before session persistence. Define a recoverable post-account/session-failure outcome if operational evidence shows this rare window needs hardening.
- [ ] `apps/frontend/src/workspace/WorkspacePage.module.css:159` - Narrow layouts hide the signed-in email. Consider retaining account identity in a wrapping or secondary header row.

## Verification Evidence

| Command / Scenario                                                        | Evidence Type             | Requirement / Scenario               | Result                                       | What It Proves                                                                                                                      |
| ------------------------------------------------------------------------- | ------------------------- | ------------------------------------ | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Fresh migrations plus root `npm run test` against an isolated Neon schema | focused integration tests | `LC-001/S1-S3`                       | 22 backend and 34 frontend tests passed      | Account persistence, sessions, validation, request boundaries, routing, and UI behavior execute successfully.                       |
| `npm run test:e2e` against a separate isolated Neon schema                | deterministic E2E         | `LC-001/S1-S3`                       | 2 passed, desktop and mobile Chromium        | Same-origin cookie/CSRF flow, refresh, login, logout, replay denial, protected routing, and empty workspace integrate successfully. |
| `npm run lint` and `npm run typecheck`                                    | broad supporting gates    | Cross-story code quality             | passed                                       | Both applications satisfy configured lint and TypeScript checks.                                                                    |
| `npx turbo run build --force` and `npx prettier --check .`                | broad supporting gates    | Cross-story packaging and formatting | passed                                       | The committed applications build without cached results and formatting is normalized.                                               |
| `npm audit --audit-level=high` and credential-signature scan              | security supporting gates | Dependency and secret handling       | passed; 0 vulnerabilities; fixtures only     | No high-severity dependency issue or real credential was found; matches were localhost CI fixtures and documented placeholders.     |
| `git diff develop...HEAD --check` and `git merge-tree --write-tree`       | integration gates         | Branch readiness                     | passed; conflict tree `8e1a239e...` produced | The reviewed source diff is whitespace-clean and integrates mechanically with `develop`.                                            |

## Review Bundle

- App and workflow root: `/Users/taylor/src/my-life/my-vault/03-spaces/code/lorecraft`
- Change folder: `docs/changes/2026-07-12-account-workspace-entry/`
- Source branch/ref: `change/account-workspace-entry`
- Reviewed source commit: `d05d78e00d1a1797544c3e5342bf91cd1338b9c2`
- Target branch/ref: `develop` at `4d9aefeeeee5c7765fad47875bd2c065a91e7cbc`
- Merge base: `4d9aefeeeee5c7765fad47875bd2c065a91e7cbc`
- Source-only commits: `6468754`, `2eb5174`, `95f7799`, `f87cabe`, `5698a3f`, `78bebd6`, `d05d78e`
- Target-only commits: none
- Changed files: 89
- Diff stat: 7,931 insertions and 950 deletions
- Conflict check: clean; `git merge-tree --write-tree develop HEAD` produced `8e1a239eff0a4940b90416db879538d4b1a18f9d`
- Dirty state at review start: clean source repository; unrelated surrounding-vault changes are outside this review
- Branch policy: valid `change/` branch from `develop`; local review is required before integration

## Delegated Review Passes

| Pass                                          | Result  | Notes                                                                                                              |
| --------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| Artifact truth and lifecycle                  | finding | Scope and traceability pass; the resume handoff was stale and manual/provider acceptance remains explicit.         |
| Backend and security                          | finding | Migration/test write safeguards need hardening; deployment-only limiter and enumeration risks remain suggestions.  |
| Frontend and UI                               | finding | Focus revalidation protects private content but erases unfinished public auth forms.                               |
| Verification and integration                  | finding | Suites and conflict checks pass; complete CSRF endpoint proof and stronger disposable-data enforcement are needed. |
| Documentation, release communication, and PRD | pass    | Public and private direction remain aligned without leaking private planning context.                              |

## PR / Merge Readiness

- Source branch: `change/account-workspace-entry`
- Reviewed source: `d05d78e00d1a1797544c3e5342bf91cd1338b9c2`
- Target branch: `develop`
- Conflict check: clean at reviewed source
- Commit state at review start: clean
- PR status: not started and not authorized
- Merge status: not ready and not authorized

## Suggested Manual UI Testing

- Route/setup: use the running local frontend with a unique valid-looking email; email delivery and recovery are not implemented.
- Draft preservation: partially complete `/sign-up` and `/sign-in`, switch windows or tabs, and return. Expected after remediation: drafts and focus survive the background session check.
- Account journey: create an account, refresh `/worlds`, sign out, sign back in, and revisit `/sign-up`. Expect stable transitions and no private-workspace flash.
- Responsive layout: repeat signup, sign-in, empty workspace, account identity, and sign-out at narrow mobile and wide desktop sizes. Expect no clipping, hidden essential identity, or horizontal overflow.
- Status: pending user confirmation.

## Review Log

- 2026-07-13: Initial deep review returned `changes-requested`; all required findings were remediated in the implementation pass ending at `2eb5174`.
- 2026-07-13: Fresh review of `2eb5174` found a stale review watermark, missing login-throttle boundary proof, and CSRF error misclassification. Safe fixes were committed as `95f7799`.
- 2026-07-14: Independent rereview of `f87cabe` returned `changes-requested` for missing open-workspace session revalidation and unauthenticated multipart processing before auth throttles.
- 2026-07-14: Apply remediation implemented both required findings at `78bebd6`; evidence and lifecycle records were committed through `d05d78e`.
- 2026-07-14: Fresh review of `d05d78e` returned `changes-requested` for public-form focus data loss, unsafe disposable-database enforcement, and incomplete server-side CSRF route coverage.
