# Tasks: Account Workspace Entry

## Resume Here

- Current state: fresh independent review of `d05d78e` returned `changes-requested` with three required implementation and verification findings
- Last completed action: reviewed the full source-vs-`develop` diff at `d05d78e` and recorded the findings in `review.md`
- Next action: run `/sdd-apply` to preserve public auth drafts during focus revalidation, harden disposable-database safeguards, and complete server-side CSRF mutation coverage
- Active branch/ref: `change/account-workspace-entry`
- Expected dirty files: none at the reviewed source; this review update changes only `review.md` and `tasks.md`
- Known blockers: three required review findings remain; manual UI confirmation and provider-specific evidence remain explicit acceptance gaps

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
- [ ] 3.3 Validate each ADR during implementation and update its status from `Proposed` only when evidence supports acceptance.

### 4. Enabling Work

- [x] 4.1 Create `change/account-workspace-entry` from `develop` before application code changes.
- [ ] 4.2 Configure a fresh Neon test credential only in ignored environments.
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
- [x] 5.3 Implement `LC-001/S3` using BDD/TDD.
  - [x] R1/R1-S1: anonymous workspace navigation redirects before private content renders.
  - [x] R1/R1-S2: anonymous protected API requests return no private data.
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
- [ ] 6.5 Validate migrations and integration behavior against disposable PostgreSQL in CI, then smoke-test the isolated Neon test branch.
- [x] 6.6 Confirm logs and browser storage contain no passwords, connection strings, session values, or bearer tokens.
- [x] 6.7 Update Story-level Verified By maps with Scenario-mapped evidence and explicit remaining manual/provider gaps.
- [x] 6.8 Add focused Scenario evidence that an already-rendered workspace returns to sign-in after session expiry or external revocation.
- [x] 6.9 Add deterministic evidence that auth routes reject unsupported or oversized multipart payloads before temporary-file processing.

### 7. Documentation, Review, And Closeout

- [x] 7.1 Update README setup and architecture claims to match implemented behavior.
- [x] 7.2 Update `[Unreleased]` in `CHANGELOG.md` with only the user-facing account/workspace capability.
- [x] 7.3 Review ADR validation and status.
- [x] 7.4 Run `/sdd-review` as the local integration gate.
- [x] 7.5 Record review outcome and resolve or explicitly defer findings.
- [ ] 7.6 Obtain manual UI confirmation or record an accepted gap.
- [x] 7.7 Reconcile stale proposed/not-implemented/not-verified language across change and Epic artifacts.
- [ ] 7.8 Merge only after review readiness and user authorization under repository branch policy.
- [ ] 7.9 Move the completed change folder to `docs/changes/closed/` after acceptance and merge state are clear.

## Implementation Ledger

| Date       | Slice                                       | Agent / Guidance                                                           | Files / Areas                                                                    | Result                                                         | Commit / Ref  |
| ---------- | ------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------- |
| 2026-07-12 | Planning and ADR drafts                     | `/sdd-propose`, `/sdd-adr`                                                 | `docs/changes/2026-07-12-account-workspace-entry/`, `docs/adrs/`                 | Proposed                                                       | `6468754`     |
| 2026-07-12 | Discovery and Epic establishment            | main orchestrator; SDD doctrine                                            | `docs/epics/lc-001-account-identity-and-workspace-access/epic.md`, `tasks.md`    | Epic truth created; implementation pending                     | `6468754`     |
| 2026-07-13 | LC-001 backend account and session boundary | delegated backend implementation; TDD and current AdonisJS guidance        | `apps/backend/`                                                                  | PostgreSQL/session implementation complete; 17 tests pass      | `6468754`     |
| 2026-07-13 | LC-001 React account workspace              | delegated frontend implementation; TDD, component, and visual guidance     | `apps/frontend/src/`, frontend config                                            | 26 focused tests pass                                          | `6468754`     |
| 2026-07-13 | Typed contract, CI, and E2E integration     | main orchestrator                                                          | Tuyau adapter, Turbo, Playwright, CI, public docs                                | Desktop and mobile browser journeys pass against isolated Neon | `6468754`     |
| 2026-07-13 | Apply self-check remediation                | security, coverage, architecture, and artifact reviewers                   | Rate limits, test database guards, persistence model, E2E evidence, public docs  | Findings remediated; automated verification complete           | `6468754`     |
| 2026-07-13 | Independent review remediation              | delegated backend/frontend implementation plus main integration            | Scoped session/CSRF middleware, same-origin proxy, auth errors, tests, CI, docs  | 17 backend, 26 frontend, and 2 browser tests pass              | `6468754`     |
| 2026-07-13 | Safe review fixes                           | main integration after delegated review                                    | Login throttle proof, CSRF recovery, formatting, and Epic evidence               | 18 backend and 32 frontend tests pass                          | `95f7799`     |
| 2026-07-14 | Required rereview remediation               | delegated frontend/backend implementation plus main integration            | Session focus revalidation, auth request boundary, parser policy, tests, docs    | 22 backend, 34 frontend, and 2 browser tests pass              | `78bebd6`     |
| 2026-07-14 | Fresh independent review                    | delegated artifact, backend/security, frontend/UI, and verification passes | Full `develop...d05d78e` source, artifacts, tests, security, UI, and integration | Three required findings recorded; changes requested            | review commit |

## Verification Ledger

| Date       | Check                                                                       | Evidence Type               | What It Proves                                                                                                                          | Result                                                         |
| ---------- | --------------------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 2026-07-12 | `git diff --check`, artifact/reference checks, and credential-fragment scan | planning verification       | Proposal, design, tasks, and ADR references are coherent and contain no credential                                                      | passed                                                         |
| 2026-07-13 | `account_security.spec.ts`                                                  | focused automated test      | S1/R1-S2, S1/R2-S1, S3/R1-S2, safe anonymous reads and logout, CSRF, CORS, and exact throttle boundaries                                | 12 passed                                                      |
| 2026-07-13 | `App.test.tsx` and `tuyauAuthApi.test.ts`                                   | focused automated test      | Client behavior across all Stories, transient private-content protection, and auth error mapping                                        | 31 passed                                                      |
| 2026-07-13 | `vite.config.test.ts`                                                       | focused configuration test  | Same-origin `/api` proxy uses a server-only backend target                                                                              | 1 passed                                                       |
| 2026-07-13 | migrated root test, lint, typecheck, forced uncached build, and diff check  | broad supporting gate       | Current backend/frontend tree passes the same ordered database and code-quality gates used by CI                                        | passed                                                         |
| 2026-07-13 | backend test database guard                                                 | safety gate                 | Backend tests refuse to write unless a separate disposable database is acknowledged                                                     | passed                                                         |
| 2026-07-13 | PostgreSQL-backed backend suite                                             | integration test            | Account persistence, hashing, duplicate handling, real database sessions, safe anonymous reads and logout, CSRF, CORS, and exact limits | 18 passed against an isolated Neon schema                      |
| 2026-07-13 | Playwright account workspace journey                                        | deterministic browser E2E   | Same-origin proxy, real cookie/CSRF flow, storage isolation, refresh, replay denial, auth routing, and empty state                      | 2 passed on desktop and mobile against an isolated Neon schema |
| 2026-07-13 | Fresh local integration review of `2eb5174`                                 | independent review          | Artifact truth, code/security, verification, UI, documentation, and integration readiness                                               | changes-requested; safe fixes committed as `95f7799`           |
| 2026-07-14 | Independent rereview of `f87cabe`                                           | independent review          | Corrected auth behavior, Scenario evidence, security, docs, conflict state, and integration readiness                                   | changes-requested; open workspaces need session revalidation   |
| 2026-07-14 | Safe review fix                                                             | main integration            | Backend CSRF error contract test                                                                                                        | exact `INVALID_CSRF_TOKEN` response shape asserted             |
| 2026-07-14 | `App.test.tsx` session-focus Scenario                                       | focused automated test      | `LC-001/S3/R1-S3` uses real window focus, immediately suppresses private UI, and prevents sign-out races                                | 22 focused and 34 full frontend tests passed                   |
| 2026-07-14 | `account_security.spec.ts` auth request boundary                            | focused integration test    | Canonical, query-string, and trailing-slash auth routes reject unsupported content; declared and chunked oversized JSON share one 413   | 22 backend tests passed against an isolated Neon schema        |
| 2026-07-14 | Fresh root tests and Playwright journey                                     | integration and browser E2E | Current account implementation passes database-backed server, client, desktop, and mobile journeys                                      | 22 backend, 34 frontend, and 2 browser tests passed            |
| 2026-07-14 | Lint, typecheck, forced build, Prettier, audit, and diff checks             | broad supporting gate       | The remediated tree compiles, builds, formats cleanly, and reports no dependency vulnerabilities                                        | passed; 0 vulnerabilities                                      |
| 2026-07-14 | Fresh independent review of `d05d78e`                                       | independent review          | Artifact truth, source diff, security, UI behavior, verification coverage, supporting docs, and integration readiness                   | changes-requested; three required findings                     |

## Manual Feedback

| Date       | Feedback                                                                     | Classification         | Action / Artifact Updates                                            | Status   |
| ---------- | ---------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------- | -------- |
| 2026-07-12 | Use one account concept; do not distinguish creator and player account types | requirement refinement | Updated scope, Epic actor language, Requirements, and ADR boundaries | resolved |

## Planning Updates

| Date       | Discovery                                            | Classification       | Planning Updates                                                   | Next Apply Starting Point                          |
| ---------- | ---------------------------------------------------- | -------------------- | ------------------------------------------------------------------ | -------------------------------------------------- |
| 2026-07-12 | AdonisJS API-first foundation needs a durable record | technical constraint | Added an API-first backend ADR and linked it throughout the change | `/sdd-apply` at Epic creation, then `LC-001/S1/R1` |

## Manual UI Confirmation

- Status: pending user
- App URL / route: local frontend URL and account/workspace routes established during implementation
- Required setup or test data: migrated disposable PostgreSQL database and a unique test email
- Steps for the user: create an account, observe automatic workspace entry, refresh, sign out, sign back in, and inspect the empty workspace at desktop and mobile widths
- Expected result: clear account forms and errors, stable session restoration, no private-content flash, successful sign-out, and an intentional `Your Worlds` empty state
- Feedback that would change artifacts: confusing validation or transitions, unexpected account-type language, session instability, private-content exposure, or an empty state that implies unavailable World behavior

## Blockers / Open Questions

- Required: preserve partially completed signup and sign-in forms when focus triggers background session revalidation.
- Required: prevent test and CI migration commands from accepting the normal application database or bypassing production protection.
- Required: add exact server-side CSRF regression proof for signup, login, and logout mutations.
- Gap: Neon ADR acceptance still requires a dedicated Lorecraft Neon test branch and provider smoke check; isolated-schema PostgreSQL and browser proof is complete.
- No product or architecture questions remain open.

## Closeout

- Epic files updated: yes; session revalidation and auth multipart handling are implemented, while manual UI confirmation and dedicated Neon branch smoke remain explicit gaps
- Story labels/references and Requirement/Scenario IDs current: yes
- Implemented By maps current: yes
- Scenario-mapped Verified By maps current: yes; remaining gaps are dedicated Neon provider smoke, production HTTPS cookie proof, and manual UI confirmation
- Superseded earlier Epic truth reconciled: not applicable; no prior Epic truth
- ADR status: API-first and React/Tuyau ADRs accepted; session and Neon ADRs proposed pending remaining evidence
- Release communication current: yes for implemented user-facing scope
- `sdd-review` verdict: `changes-requested` on 2026-07-14 for source `d05d78e00d1a1797544c3e5342bf91cd1338b9c2`
- Review record: `review.md`
- `review.md` findings resolved: no; three required findings remain for `/sdd-apply`, with deployment and reliability suggestions also recorded
- Planning updates resolved: current
- Manual UI confirmation status: pending user
- PR / merge state: not started
- Deferred scope accepted: recorded in proposal and design
- Change moved to `docs/changes/closed/`: no
