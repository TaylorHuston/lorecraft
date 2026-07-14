---
status: ready_to_close
---

# Tasks: Account Workspace Entry

## Resume Here

- Current state: closed; implementation and review were merged into `develop`, and the Change folder is archived
- Last completed action: merged `change/account-workspace-entry` into `develop` as `47a7c55` and moved the Change to `docs/changes/closed/`
- Next action: none for this Change; use `/sdd-release` when promoting `develop` toward production
- Active branch/ref: `develop`
- Expected dirty files: none expected after the closeout commit
- Known blockers: none; the two accepted deferrals remain pre-production follow-ups

## Task Checklist

### 1. Planning Quality

- [x] 1.1 Confirm the change ends at account access and an empty authenticated workspace.
- [x] 1.2 Challenge the three Stories for user-path fit and Epic ownership.
- [x] 1.3 Refine Requirements and Scenarios for validation, failure, recovery, access control, and empty-state behavior.
- [x] 1.4 Record account roles, Worlds, recovery, verification, mobile, and public API work as deferred.
- [x] 1.5 Confirm the verification plan can map evidence to every Scenario.

### 2. Epic Artifacts

- [x] 2.1 Create `docs/epics/lc-001-account-identity-and-workspace-access/`.
- [x] 2.2 Create its `epic.md` with `LC-001/S1`, `LC-001/S2`, and `LC-001/S3` from `design.md`.
- [x] 2.3 Maintain Story-level Implemented By, Verified By, and Verification Gaps as implementation proceeds.
- [x] 2.4 Confirm no earlier Epic truth requires reconciliation.

### 3. Architecture Decisions

- [x] 3.1 Compare the API-first React approach with Inertia and a bearer-token/OpenAPI-first SPA.
- [x] 3.2 Draft the AdonisJS API-first, Neon/PostgreSQL, browser-session, and React typed-contract ADRs.
- [x] 3.3 Validate each ADR during implementation and update its status; all four ADRs are accepted, with two explicit pre-production follow-ups.

### 4. Enabling Work

- [x] 4.1 Create `change/account-workspace-entry` from `develop` before application code changes.
- [x] 4.2 Configure a fresh Neon test credential only in ignored environments; explicitly deferred with the dedicated Neon smoke check until before production deployment.
- [x] 4.3 Configure PostgreSQL/Lucid and migrate the account and session schema against isolated Neon environments.
- [x] 4.4 Scaffold the Vite React TypeScript client using CSS Modules and shared design tokens.
- [x] 4.5 Configure Tuyau, TanStack Query, routing, credential transport, CORS, sessions, and CSRF protection.

### 5. Implementation

- [x] 5.1 Implement `LC-001/S1` using BDD/TDD.
  - [x] R1/R1-S1: valid signup creates one normalized account with a hashed password.
  - [x] R1/R1-S2: invalid input creates no account and identifies correctable fields.
  - [x] R1/R1-S3: duplicate email creates no second account and returns an actionable error.
  - [x] R2/R2-S1: signup establishes a session and opens `Your Worlds` without browser bearer-token storage.
- [x] 5.2 Implement `LC-001/S2` using BDD/TDD.
  - [x] R1/R1-S1: valid credentials establish a session and open the workspace.
  - [x] R1/R1-S2: unknown email and wrong password return the same generic failure.
  - [x] R2/R2-S1: refresh restores the valid session.
  - [x] R2/R2-S2: authenticated users bypass signup and sign-in routes.
  - [x] R2/R2-S3: unfinished signup and sign-in drafts survive anonymous background focus revalidation.
- [x] 5.3 Implement `LC-001/S3` using BDD/TDD.
  - [x] R1/R1-S1: anonymous workspace navigation redirects before private content renders.
  - [x] R1/R1-S2: anonymous protected API requests return no private data.
  - [x] R1/R1-S3: an open workspace revalidates on focus and removes private content when its session has ended.
  - [x] R2/R2-S1: sign-out invalidates the session and returns to sign-in.
  - [x] R2/R2-S2: the invalidated session cannot be reused.
  - [x] R3/R3-S1: an account with no Worlds sees an intentional empty state and no incomplete creation control.
- [x] 5.4 Update Story-level Implemented By maps with current code locations.
- [x] 5.5 Revalidate the current account session when an open workspace regains focus and remove protected UI when the session has expired or been revoked.
- [x] 5.6 Prevent signup and login requests from triggering unused multipart file processing before rate limiting and validation.

### 6. Verification

- [x] 6.1 Add backend route/integration evidence mapped to every server-owned Scenario.
- [x] 6.2 Add frontend behavior evidence for forms, auth routing, transitions, and the empty workspace.
- [x] 6.3 Add deterministic Playwright coverage for signup, refresh, logout, protected access, return login, invalid credentials, duplicate signup, cookie isolation, and invalidated-cookie replay.
- [x] 6.4 Run root lint, test, typecheck, and build gates.
- [x] 6.5 Validate migrations and integration behavior against disposable PostgreSQL in CI; the isolated Lorecraft Neon smoke test is explicitly deferred until before production deployment.
- [x] 6.6 Confirm browser storage contains no passwords, connection strings, session values, or bearer tokens.
- [x] 6.7 Update Story-level Verified By maps with Scenario-mapped evidence and explicit remaining manual/provider gaps.
- [x] 6.8 Add focused Scenario evidence that an already-rendered workspace returns to sign-in after session expiry or external revocation.
- [x] 6.9 Add deterministic evidence that auth routes reject unsupported or oversized multipart payloads before temporary-file processing.
- [x] 6.10 Capture representative backend auth-failure logs and confirm they contain no passwords, connection strings, session values, or bearer tokens.

### 7. Documentation, Review, And Closeout

- [x] 7.1 Update README setup and architecture claims to match implemented behavior.
- [x] 7.2 Update `[Unreleased]` in `CHANGELOG.md` with only the user-facing account/workspace capability.
- [x] 7.3 Review ADR validation and status.
- [x] 7.4 Run `/sdd-review` as the local integration gate.
- [x] 7.5 Record review outcome and resolve or explicitly defer findings.
- [x] 7.6 Obtain manual UI confirmation or record an accepted gap.
- [x] 7.7 Reconcile stale proposed/not-implemented/not-verified language across change and Epic artifacts.
- [x] 7.8 Merge only after review readiness and user authorization under repository branch policy.
- [x] 7.9 Move the completed change folder to `docs/changes/closed/` after acceptance and merge state are clear.

### 8. Review Remediation

- [x] 8.1 Add `LC-001/S2/R2-S3` focused proof that signup and sign-in drafts survive background focus revalidation while protected workspace content remains suppressed.
- [x] 8.2 Harden backend and E2E launchers so acknowledged test writes still reject the normal application database and require an identifiable disposable target.
- [x] 8.3 Remove the unconditional production migration override from `migrate:ci` and keep CI/E2E migrations working against disposable PostgreSQL.
- [x] 8.4 Add exact server-side CSRF rejection and no-mutation proof for signup, login, and logout.
- [x] 8.5 Reconcile README, Epic evidence, review findings, and the implementation/verification ledgers after focused and broad verification pass.
- [x] 8.6 Compare effective PostgreSQL targets using loopback and identifier normalization, require explicit host/database components, and neutralize inherited PostgreSQL overrides in guarded child processes.
- [x] 8.7 Preserve public auth drafts and a non-destructive retry path when background session revalidation fails.
- [x] 8.8 Restore keyboard focus after protected session revalidation succeeds or redirects to sign-in.
- [x] 8.9 Reconcile Scenario references, verification gaps, canonical manual status, and final evidence counts found during independent artifact review.
- [x] 8.10 Restore the original users migration and add a forward migration plus upgrade-path proof for existing databases.
- [x] 8.11 Move focus to protected-session error recovery when background revalidation fails and add regression evidence.
- [x] 8.12 Give the public background-refresh retry control a minimum 44px touch target.
- [x] 8.13 Correct the unpublished `actions/checkout@v7` CI reference to the current supported major and reconcile stale change artifacts.
- [x] 8.14 Ensure one browser return produces one session check instead of overlapping focus and visibility-triggered requests.
- [x] 8.15 Preserve public auth drafts while a retry is pending, expose progress accessibly, and prevent repeated retry requests.

## Implementation Ledger

| Date       | Slice                                       | Agent / Guidance                                                              | Files / Areas                                                                           | Result                                                         | Commit / Ref  |
| ---------- | ------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------- |
| 2026-07-12 | Planning and ADR drafts                     | `/sdd-propose`, `/sdd-adr`                                                    | `docs/changes/closed/2026-07-12-account-workspace-entry/`, `docs/adrs/`                 | Proposed                                                       | `6468754`     |
| 2026-07-12 | Discovery and Epic establishment            | main orchestrator; SDD doctrine                                               | `docs/epics/lc-001-account-identity-and-workspace-access/epic.md`, `tasks.md`           | Epic truth created; implementation pending                     | `6468754`     |
| 2026-07-13 | LC-001 backend account and session boundary | delegated backend implementation; TDD and current AdonisJS guidance           | `apps/backend/`                                                                         | PostgreSQL/session implementation complete; 17 tests pass      | `6468754`     |
| 2026-07-13 | LC-001 React account workspace              | delegated frontend implementation; TDD, component, and visual guidance        | `apps/frontend/src/`, frontend config                                                   | 26 focused tests pass                                          | `6468754`     |
| 2026-07-13 | Typed contract, CI, and E2E integration     | main orchestrator                                                             | Tuyau adapter, Turbo, Playwright, CI, public docs                                       | Desktop and mobile browser journeys pass against isolated Neon | `6468754`     |
| 2026-07-13 | Apply self-check remediation                | security, coverage, architecture, and artifact reviewers                      | Rate limits, test database guards, persistence model, E2E evidence, public docs         | Findings remediated; automated verification complete           | `6468754`     |
| 2026-07-13 | Independent review remediation              | delegated backend/frontend implementation plus main integration               | Scoped session/CSRF middleware, same-origin proxy, auth errors, tests, CI, docs         | 17 backend, 26 frontend, and 2 browser tests pass              | `6468754`     |
| 2026-07-13 | Safe review fixes                           | main integration after delegated review                                       | Login throttle proof, CSRF recovery, formatting, and Epic evidence                      | 18 backend and 32 frontend tests pass                          | `95f7799`     |
| 2026-07-14 | Required rereview remediation               | delegated frontend/backend implementation plus main integration               | Session focus revalidation, auth request boundary, parser policy, tests, docs           | 22 backend, 34 frontend, and 2 browser tests pass              | `78bebd6`     |
| 2026-07-14 | Fresh independent review                    | delegated artifact, backend/security, frontend/UI, and verification passes    | Full `develop...d05d78e` source, artifacts, tests, security, UI, and integration        | Three required findings recorded; changes requested            | review commit |
| 2026-07-14 | Required review remediation                 | delegated frontend/backend TDD and security guidance plus main integration    | Public auth session states, disposable database launchers, CSRF proof, CI, README, Epic | 24 backend, 38 frontend, 12 safety, and 2 browser tests pass   | `c7d990b`     |
| 2026-07-14 | Independent review fixes                    | delegated artifact, frontend, integration, and security review plus main TDD  | Effective database identity, child environments, failed revalidation, focus, artifacts  | 24 backend, 41 frontend, 16 safety, and 2 browser tests pass   | `c7d990b`     |
| 2026-07-14 | Final required review remediation           | delegated backend/frontend TDD, independent self-review, and main integration | Forward users migration, migration harness, protected error focus, retry sizing         | All required findings resolved; full automated gates pass      | `33ea607`     |
| 2026-07-14 | Fresh review frontend remediation           | main integration plus independent regression rereview                         | Session focus orchestration, public retry state, frontend regression tests              | 44 frontend tests and forced static/build gates pass           | `f799981`     |

## Verification Ledger

| Date       | Check                                                                         | Evidence Type               | What It Proves                                                                                                                                                                                                                      | Result                                                         |
| ---------- | ----------------------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 2026-07-12 | `git diff --check`, artifact/reference checks, and credential-fragment scan   | planning verification       | Proposal, design, tasks, and ADR references are coherent and contain no credential                                                                                                                                                  | passed                                                         |
| 2026-07-13 | `account_security.spec.ts`                                                    | focused automated test      | S1/R1-S2, S1/R2-S1, S3/R1-S2, safe anonymous reads and logout, CSRF, CORS, and exact throttle boundaries                                                                                                                            | 12 passed                                                      |
| 2026-07-13 | `App.test.tsx` and `tuyauAuthApi.test.ts`                                     | focused automated test      | Client behavior across all Stories, transient private-content protection, and auth error mapping                                                                                                                                    | 31 passed                                                      |
| 2026-07-13 | `vite.config.test.ts`                                                         | focused configuration test  | Same-origin `/api` proxy uses a server-only backend target                                                                                                                                                                          | 1 passed                                                       |
| 2026-07-13 | migrated root test, lint, typecheck, forced uncached build, and diff check    | broad supporting gate       | Current backend/frontend tree passes the same ordered database and code-quality gates used by CI                                                                                                                                    | passed                                                         |
| 2026-07-13 | backend test database guard                                                   | safety gate                 | Backend tests refuse to write unless a separate disposable database is acknowledged                                                                                                                                                 | passed                                                         |
| 2026-07-13 | PostgreSQL-backed backend suite                                               | integration test            | Account persistence, hashing, duplicate handling, real database sessions, safe anonymous reads and logout, CSRF, CORS, and exact limits                                                                                             | 18 passed against an isolated Neon schema                      |
| 2026-07-13 | Playwright account workspace journey                                          | deterministic browser E2E   | Same-origin proxy, real cookie/CSRF flow, storage isolation, refresh, replay denial, auth routing, and empty state                                                                                                                  | 2 passed on desktop and mobile against an isolated Neon schema |
| 2026-07-13 | Fresh local integration review of `2eb5174`                                   | independent review          | Artifact truth, code/security, verification, UI, documentation, and integration readiness                                                                                                                                           | changes-requested; safe fixes committed as `95f7799`           |
| 2026-07-14 | Independent rereview of `f87cabe`                                             | independent review          | Corrected auth behavior, Scenario evidence, security, docs, conflict state, and integration readiness                                                                                                                               | changes-requested; open workspaces need session revalidation   |
| 2026-07-14 | Safe review fix                                                               | main integration            | Backend CSRF error contract test                                                                                                                                                                                                    | exact `INVALID_CSRF_TOKEN` response shape asserted             |
| 2026-07-14 | `App.test.tsx` session-focus Scenario                                         | focused automated test      | `LC-001/S3/R1-S3` uses real window focus, immediately suppresses private UI, and prevents sign-out races                                                                                                                            | 22 focused and 34 full frontend tests passed                   |
| 2026-07-14 | `account_security.spec.ts` auth request boundary                              | focused integration test    | Canonical, query-string, and trailing-slash auth routes reject unsupported content; declared and chunked oversized JSON share one 413                                                                                               | 22 backend tests passed against an isolated Neon schema        |
| 2026-07-14 | Fresh root tests and Playwright journey                                       | integration and browser E2E | Current account implementation passes database-backed server, client, desktop, and mobile journeys                                                                                                                                  | 22 backend, 34 frontend, and 2 browser tests passed            |
| 2026-07-14 | Lint, typecheck, forced build, Prettier, audit, and diff checks               | broad supporting gate       | The remediated tree compiles, builds, formats cleanly, and reports no dependency vulnerabilities                                                                                                                                    | passed; 0 vulnerabilities                                      |
| 2026-07-14 | Fresh independent review of `d05d78e`                                         | independent review          | Artifact truth, source diff, security, UI behavior, verification coverage, supporting docs, and integration readiness                                                                                                               | changes-requested; three required findings                     |
| 2026-07-14 | `App.test.tsx` public auth focus scenarios                                    | focused automated test      | `LC-001/S2/R2-S3` preserves both drafts; `LC-001/S1/R2-S1` signup and `LC-001/S2/R1-S1` sign-in remain authoritative over older anonymous revalidation                                                                              | 26 app tests and 38 frontend tests passed                      |
| 2026-07-14 | `database-safety.test.mjs` plus guarded child-process checks                  | focused security test       | Missing acknowledgement/application target, implicit components, effective same targets, ambiguous selectors, inherited overrides, Neon/loopback identity, schema case semantics, and child-environment neutralization are enforced | 16 automated checks passed                                     |
| 2026-07-14 | `account_security.spec.ts` CSRF mutation matrix                               | focused integration test    | Signup, login, and logout reject missing and forged CSRF with exact errors and unchanged account/session state                                                                                                                      | 18 security tests; 24 backend tests passed                     |
| 2026-07-14 | Fresh guarded migrations, root tests, and Playwright against isolated schemas | integration and browser E2E | Guarded no-force migration, full account behavior, typed client, same-origin proxy, and desktop/mobile journeys work together                                                                                                       | 16 safety, 24 backend, 41 frontend, and 2 browser tests passed |
| 2026-07-14 | Lint, typecheck, forced build, Prettier, audit, force scan, and diff checks   | broad supporting gate       | Final remediated source compiles, builds, formats cleanly, has no reported dependency vulnerability, and contains no forced migration command                                                                                       | passed; 0 vulnerabilities                                      |
| 2026-07-14 | Historical users-schema upgrade and harness tests                             | focused integration         | The original schema remains immutable; existing email data normalizes transactionally, compatibility data survives, collisions roll back, and unsafe test setup performs no writes                                                  | 16 safety and 8 focused backend checks passed                  |
| 2026-07-14 | Fresh disposable-schema backend suite                                         | integration test            | Fresh migrations, the forward upgrade, account/session behavior, request boundaries, and migration-test isolation work together                                                                                                     | 32 backend tests passed against isolated Neon                  |
| 2026-07-14 | Protected refresh recovery and responsive browser checks                      | focused automated and UI    | Failed authenticated revalidation focuses retry; public retry is at least 44px at 320px and desktop widths without overflow                                                                                                         | 42 frontend tests and direct Chromium checks passed            |
| 2026-07-14 | Fresh Playwright, forced static/build gates, formatting, and audit            | browser and broad gates     | Desktop/mobile account journeys still pass; both apps compile, build, format cleanly, and report no dependency vulnerabilities                                                                                                      | 2 browser tests passed; all supporting gates passed            |
| 2026-07-14 | Session revalidation and retry regression suite                               | focused automated           | A tab return produces one session check; public drafts survive a pending retry and the retry cannot be submitted repeatedly                                                                                                         | 44 frontend tests passed; focused independent rereview passed  |
| 2026-07-14 | Runtime auth-failure log inspection                                           | runtime inspection          | Invalid-credential login logs omit submitted email and password; observed CSRF warnings contain only request IDs and a generic message                                                                                              | passed; no credential, cookie, session, or database value seen |

## Manual Feedback

| Date       | Feedback                                                                     | Classification         | Action / Artifact Updates                                            | Status   |
| ---------- | ---------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------- | -------- |
| 2026-07-12 | Use one account concept; do not distinguish creator and player account types | requirement refinement | Updated scope, Epic actor language, Requirements, and ADR boundaries | resolved |

## Planning Updates

| Date       | Discovery                                            | Classification       | Planning Updates                                                   | Next Apply Starting Point                          |
| ---------- | ---------------------------------------------------- | -------------------- | ------------------------------------------------------------------ | -------------------------------------------------- |
| 2026-07-12 | AdonisJS API-first foundation needs a durable record | technical constraint | Added an API-first backend ADR and linked it throughout the change | `/sdd-apply` at Epic creation, then `LC-001/S1/R1` |

## Manual UI Confirmation

- Status: confirmed by user on 2026-07-14
- App URL / route: local frontend URL and account/workspace routes established during implementation
- Required setup or test data: migrated disposable PostgreSQL database and a unique test email
- Steps for the user: partially complete signup and sign-in, switch away and return focus, confirm drafts survive; then create an account, observe automatic workspace entry, refresh, sign out, sign back in, and inspect the empty workspace at desktop and mobile widths
- Expected result: unfinished public auth input survives background checks, account forms and errors remain clear, session restoration is stable, private content never flashes after expiry, sign-out succeeds, and `Your Worlds` has an intentional empty state
- Feedback that would change artifacts: confusing validation or transitions, unexpected account-type language, session instability, private-content exposure, or an empty state that implies unavailable World behavior

## Blockers / Open Questions

- No required implementation findings remain in the reviewed code at `f799981`.
- Accepted deferral: dedicated Lorecraft Neon test-branch smoke remains required before production deployment; isolated-schema PostgreSQL and browser proof is complete.
- Accepted deferral: production HTTPS proof of the session cookie's `Secure` behavior remains required before production deployment.
- No product or architecture questions remain open.

## Closeout

- Epic files updated: yes; session behavior, auth request boundaries, guarded database tooling, users migration upgrade behavior, CSRF proof, frontend accessibility, and manual UI confirmation are current; dedicated Neon branch smoke remains an accepted pre-production follow-up
- Story labels/references and Requirement/Scenario IDs current: yes
- Implemented By maps current: yes
- Scenario-mapped Verified By maps current: yes; dedicated Neon provider smoke and production HTTPS cookie proof are accepted pre-production follow-ups
- Superseded earlier Epic truth reconciled: not applicable; no prior Epic truth
- ADR status: all four ADRs accepted; dedicated Neon and production HTTPS verification remain explicit pre-production follow-ups
- Release communication current: yes for implemented user-facing scope
- `sdd-review` verdict: `ready`; code, automated evidence, manual UI, and runtime-log inspection pass, and both deployment-specific gaps are explicitly accepted deferrals
- Review record: `review.md`
- `review.md` findings resolved: yes; deployment-specific verification is explicitly deferred
- Planning updates resolved: current
- Manual UI confirmation status: confirmed by user on 2026-07-14
- PR / merge state: no routine integration PR; merged locally into `develop` as `47a7c55`
- Deferred scope accepted: recorded in proposal and design
- Change moved to `docs/changes/closed/`: yes
