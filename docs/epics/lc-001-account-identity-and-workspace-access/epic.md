---
id: LC-001
status: draft
created: 2026-07-12
modified: 2026-07-14
last_verified: 2026-07-14
stories:
  - S1
  - S2
  - S3
---

# LC-001 Account Identity And Workspace Access

## Product Context

- Related change: `docs/changes/2026-07-12-account-workspace-entry/`
- Related ADRs:
  - `docs/adrs/2026-07-12-adonisjs-api-first-backend.md`
  - `docs/adrs/2026-07-12-postgresql-on-neon.md`
  - `docs/adrs/2026-07-12-browser-session-authentication.md`
  - `docs/adrs/2026-07-12-react-web-client-and-typed-api-contract.md`

Lorecraft needs a secure private account boundary before an individual can create and maintain authoritative Worlds. Accounts are not divided into creator, player, or other types; client surfaces may support different activities without changing the account model.

## Outcome

A user can create an account, return through a secure browser session, reach a protected private workspace, and end that session. The workspace clearly communicates when the account has no Worlds without presenting unavailable World behavior.

## Current Scope

- Email and password account creation with confirmation and duplicate protection.
- Automatic authenticated workspace entry after signup.
- Returning sign-in and session restoration.
- Protected browser and API access.
- Server-side session invalidation on sign-out.
- An intentional empty `Your Worlds` workspace.

## Deferred Scope

- World creation, listing, and editing.
- Account roles or creator/player account types.
- Display names, profiles, email verification, password recovery, social login, and multi-factor authentication.
- Public API documentation, mobile clients, and collaboration permissions.

## Candidate Stories

| Candidate            | Status   | Story Shape                                                                                                    | Acceptance Signals                                        |
| -------------------- | -------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Account recovery     | deferred | As an account holder, I want to recover access, so that a forgotten password does not permanently lock me out. | Email delivery and recovery security enter product scope. |
| Account verification | deferred | As an account holder, I want to verify my email, so that Lorecraft can trust account contact ownership.        | Verification-dependent features enter product scope.      |

## Story Index

| Story | Status      | Capability                                          | Last Verified | Notes                                       |
| ----- | ----------- | --------------------------------------------------- | ------------- | ------------------------------------------- |
| S1    | implemented | New account creation and automatic workspace entry. | 2026-07-14    | Automated backend and browser proof passes. |
| S2    | implemented | Returning sign-in and session restoration.          | 2026-07-14    | Automated backend and browser proof passes. |
| S3    | implemented | Protected access, sign-out, and empty workspace.    | 2026-07-14    | Manual UI confirmation remains pending.     |

## Stories

### Story S1: New User Enters Their Workspace

Status: implemented
Created: 2026-07-12
Modified: 2026-07-13
Last verified: 2026-07-14

As a new user, I want to create an account and enter my private workspace, so that I can begin using Lorecraft.

#### Requirements And Scenarios

##### Requirement R1: Valid Account Creation

The system SHALL create an account only when the submitted email and password confirmation are valid and the email is not already registered.

###### Scenario R1-S1: Valid Signup

- WHEN a visitor submits a valid email, password, and matching password confirmation
- THEN the system creates exactly one account for that normalized email address
- AND the password is stored only as a secure hash.

###### Scenario R1-S2: Invalid Signup Input

- WHEN a visitor submits an invalid email, an unacceptable password, or a non-matching confirmation
- THEN the account is not created
- AND the form identifies the fields that need correction without exposing sensitive values.

###### Scenario R1-S3: Duplicate Email

- WHEN a visitor submits an email already associated with an account
- THEN no additional account is created
- AND the visitor receives an actionable account-already-exists response.

##### Requirement R2: Automatic Workspace Entry

The system SHALL establish an authenticated browser session after successful account creation and take the user to `Your Worlds`.

###### Scenario R2-S1: Signup Completes

- WHEN account creation succeeds
- THEN the browser receives a secure session without receiving a reusable bearer token in client-accessible storage
- AND the user sees the authenticated `Your Worlds` workspace.

#### Implemented By

| Path                                                                   | Role                                                                            | Recheck Trigger                                          |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `apps/backend/app/controllers/new_account_controller.ts`               | Creates a normalized account transactionally and establishes its web session.   | Recheck when signup or transaction behavior changes.     |
| `apps/backend/app/validators/user.ts`                                  | Defines the email, password, and confirmation trust boundary.                   | Recheck when account input policy changes.               |
| `apps/backend/app/models/user.ts`                                      | Persists and hashes account credentials.                                        | Recheck when account identity or hashing changes.        |
| `apps/backend/database/migrations/1761885935168_create_users_table.ts` | Defines normalized unique account storage.                                      | Recheck for account schema changes.                      |
| `apps/frontend/src/auth/SignUpPage.tsx`                                | Presents signup, local validation, errors, and automatic workspace entry.       | Recheck when the signup journey changes.                 |
| `apps/frontend/src/auth/tuyauAuthApi.ts`                               | Uses the generated Tuyau contract with credentialed session requests.           | Recheck when account routes or client transport changes. |
| `apps/backend/app/middleware/auth_request_boundary_middleware.ts`      | Rejects unsupported and declared-oversized signup payloads before body parsing. | Recheck when signup request formats or limits change.    |
| `apps/backend/app/exceptions/handler.ts`                               | Normalizes unknown-length oversized auth streams to the auth 413 contract.      | Recheck when parser errors or auth limits change.        |

#### Verified By

| Requirement / Scenario                 | Evidence                                                                               | Proves                                                                                                                       | Status             |
| -------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| S1/R1-S1, S1/R1-S2, S1/R1-S3, S1/R2-S1 | `apps/frontend/src/app/App.test.tsx` and `apps/frontend/src/auth/tuyauAuthApi.test.ts` | Client normalization, validation, duplicate presentation, CSRF-expiry recovery, and workspace transition.                    | Passing 2026-07-13 |
| S1/R1-S2, S1/R2-S1                     | `apps/backend/tests/functional/account_security.spec.ts`                               | Server validation omits credentials; XSRF bootstrap creates the intended database session while anonymous safe reads do not. | Passing 2026-07-13 |
| S1/R1-S1, S1/R1-S3, S1/R2-S1           | `apps/backend/tests/functional/account_auth.spec.ts`                                   | Account normalization, hashing, uniqueness, and database-backed session state.                                               | Passing 2026-07-13 |
| S1/R1-S1 through S1/R2-S1              | `apps/frontend/e2e/account-workspace.spec.ts`                                          | Same-origin browser signup, HTTP-only cookie behavior, empty bearer storage, and workspace entry.                            | Passing 2026-07-13 |
| S1 cross-story request boundary        | `apps/backend/tests/functional/account_security.spec.ts`                               | Signup rejects unsupported content before parsing and applies one 16 KB contract to declared and streamed JSON payloads.     | Passing 2026-07-14 |

#### Verification Gaps

- Manual confirmation remains pending for validation clarity, focus behavior, responsive layout, and workspace transition.
- Production HTTPS verification remains pending for the session cookie's `Secure` attribute.

#### Story Notes

- Account and user are equivalent product terms in this Epic; there is no account-type field.

### Story S2: Returning User Resumes Their Workspace

Status: implemented
Created: 2026-07-12
Modified: 2026-07-13
Last verified: 2026-07-14

As a returning user, I want Lorecraft to recognize or re-authenticate me, so that I can resume my private workspace without unnecessary friction.

#### Requirements And Scenarios

##### Requirement R1: Credential Sign-In

The system SHALL establish a browser session for valid credentials and reject invalid credentials without revealing which credential was wrong.

###### Scenario R1-S1: Valid Credentials

- WHEN a visitor submits an existing account email and its correct password
- THEN the system establishes an authenticated session
- AND the user sees `Your Worlds`.

###### Scenario R1-S2: Invalid Credentials

- WHEN a visitor submits an unknown email or incorrect password
- THEN no authenticated session is established
- AND the response uses the same generic credential error in either case.

##### Requirement R2: Session Restoration

The system SHALL restore a valid existing session across page refreshes and keep authenticated users out of the signup and sign-in journey.

###### Scenario R2-S1: Workspace Refresh

- WHEN an authenticated user refreshes the workspace while their session remains valid
- THEN the workspace returns without requiring another sign-in.

###### Scenario R2-S2: Authenticated User Opens An Auth Route

- WHEN an authenticated user opens the signup or sign-in route
- THEN the client returns them to `Your Worlds`.

#### Implemented By

| Path                                                              | Role                                                                                              | Recheck Trigger                                      |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `apps/backend/app/controllers/sessions_controller.ts`             | Verifies credentials, establishes the web session, and invalidates it on logout.                  | Recheck when session behavior changes.               |
| `apps/backend/app/controllers/profile_controller.ts`              | Returns the authenticated account for session restoration.                                        | Recheck when account serialization changes.          |
| `apps/backend/config/auth.ts`                                     | Defines web sessions as the browser authentication guard while retaining future token capability. | Recheck when guards change.                          |
| `apps/frontend/src/auth/SignInPage.tsx`                           | Presents generic credential errors and resumes the attempted protected route.                     | Recheck when sign-in changes.                        |
| `apps/frontend/src/auth/AuthProvider.tsx`                         | Restores current-account server state through TanStack Query.                                     | Recheck when session restoration changes.            |
| `apps/frontend/src/app/AppRoutes.tsx`                             | Keeps authenticated users out of public-only auth routes.                                         | Recheck when routing changes.                        |
| `apps/backend/app/middleware/auth_request_boundary_middleware.ts` | Rejects unsupported and declared-oversized login payloads before body parsing.                    | Recheck when login request formats or limits change. |
| `apps/backend/app/exceptions/handler.ts`                          | Normalizes unknown-length oversized auth streams to the auth 413 contract.                        | Recheck when parser errors or auth limits change.    |

#### Verified By

| Requirement / Scenario                 | Evidence                                                                               | Proves                                                                                                                      | Status             |
| -------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| S2/R1-S1, S2/R1-S2, S2/R2-S1, S2/R2-S2 | `apps/frontend/src/app/App.test.tsx` and `apps/frontend/src/auth/tuyauAuthApi.test.ts` | Sign-in success, validation/rate-limit/CSRF/credential error presentation, session restoration, and auth-route redirection. | Passing 2026-07-13 |
| S2/R1-S1, S2/R1-S2, S2/R2-S1           | `apps/backend/tests/functional/account_auth.spec.ts`                                   | Generic credential failure and database-backed session behavior.                                                            | Passing 2026-07-13 |
| S2/R1-S2                               | `apps/backend/tests/functional/account_security.spec.ts`                               | The exact login throttle boundary and forwarded-client key isolation.                                                       | Passing 2026-07-13 |
| S2/R1-S1 through S2/R2-S2              | `apps/frontend/e2e/account-workspace.spec.ts`                                          | Same-origin return login, generic unknown/wrong-password errors, refresh, and auth-route bypass.                            | Passing 2026-07-13 |
| S2 cross-story request boundary        | `apps/backend/tests/functional/account_security.spec.ts`                               | Login rejects unsupported content before parsing and applies one 16 KB contract to declared and streamed JSON payloads.     | Passing 2026-07-14 |

#### Verification Gaps

- Manual UI confirmation remains pending.

### Story S3: User Controls Protected Workspace Access

Status: implemented
Created: 2026-07-12
Modified: 2026-07-13
Last verified: 2026-07-14

As an account holder, I want my workspace protected and my session terminable, so that only I can access my private Lorecraft data.

#### Requirements And Scenarios

##### Requirement R1: Protected Workspace Boundary

The system SHALL deny unauthenticated access to both the workspace UI and protected account APIs.

###### Scenario R1-S1: Anonymous Workspace Navigation

- WHEN an unauthenticated visitor opens the workspace route directly
- THEN the client takes them to sign in
- AND no private workspace data is rendered first.

###### Scenario R1-S2: Anonymous Protected API Request

- WHEN a request without a valid session calls a protected account endpoint
- THEN the API returns an authentication failure without private account data.

###### Scenario R1-S3: Open Workspace Session Ends

- WHEN an authenticated user leaves the workspace open and the server session later expires or is revoked elsewhere
- AND the user returns focus to the workspace
- THEN the client revalidates the session
- AND the workspace returns to sign-in without continuing to render private account state.

##### Requirement R2: Logout Invalidation

The system SHALL invalidate the active server-side session when the user signs out.

###### Scenario R2-S1: Successful Sign-Out

- WHEN an authenticated user signs out
- THEN the server invalidates that session
- AND the client returns to sign in.

###### Scenario R2-S2: Reuse After Sign-Out

- WHEN the signed-out browser refreshes the former workspace route or calls a protected endpoint
- THEN it remains unauthenticated and cannot access private data.

##### Requirement R3: Intentional Empty Workspace

The system SHALL present an intentional `Your Worlds` empty state when an account has no Worlds.

###### Scenario R3-S1: Account With No Worlds

- WHEN an authenticated account with no Worlds opens the workspace
- THEN the user sees that they have no Worlds yet
- AND no disabled or nonfunctional World-creation control is shown.

#### Implemented By

| Path                                                                      | Role                                                                       | Recheck Trigger                              |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------- |
| `apps/backend/start/routes.ts`                                            | Applies the web guard to protected account routes.                         | Recheck when API routes or guards change.    |
| `apps/backend/config/shield.ts`                                           | Enforces CSRF protection and exposes the XSRF cookie.                      | Recheck when browser security changes.       |
| `apps/backend/config/cors.ts`                                             | Restricts credentialed browser requests to the configured frontend origin. | Recheck when deployment origins change.      |
| `apps/backend/database/migrations/1768620764697_create_sessions_table.ts` | Defines durable server-side session storage.                               | Recheck when session persistence changes.    |
| `apps/frontend/src/app/AppRoutes.tsx`                                     | Prevents anonymous private-content rendering.                              | Recheck when protected routing changes.      |
| `apps/frontend/src/auth/AuthProvider.tsx`                                 | Revalidates the server session whenever an open workspace regains focus.   | Recheck when session query behavior changes. |
| `apps/frontend/src/workspace/WorkspacePage.tsx`                           | Presents account identity, logout, and the intentional empty workspace.    | Recheck when workspace behavior changes.     |

#### Verified By

| Requirement / Scenario                 | Evidence                                                                               | Proves                                                                                                                        | Status             |
| -------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| S3/R1-S1, S3/R2-S1, S3/R3-S1           | `apps/frontend/src/app/App.test.tsx` and `apps/frontend/src/auth/tuyauAuthApi.test.ts` | Deferred-session observation proves no private-content flash, plus logout, CSRF-expiry recovery, and empty workspace content. | Passing 2026-07-13 |
| S3/R1-S2                               | `apps/backend/tests/functional/account_security.spec.ts`                               | Anonymous API denial, no persisted session allocation for safe anonymous reads, and untrusted-origin rejection.               | Passing 2026-07-13 |
| S3/R2-S1                               | `apps/backend/tests/functional/account_auth.spec.ts`                                   | Logout removes authentication from the active database-backed test session.                                                   | Passing 2026-07-13 |
| S3/R1-S2, S3/R2-S1, S3/R2-S2, S3/R3-S1 | `apps/frontend/e2e/account-workspace.spec.ts`                                          | Same-origin anonymous API denial, protected workspace, logout, invalidated-cookie replay, and empty state.                    | Passing 2026-07-13 |
| S3/R1-S3                               | `apps/frontend/src/app/App.test.tsx`                                                   | Focus revalidation immediately suppresses private UI and returns the workspace to sign-in when the server reports no session. | Passing 2026-07-14 |

#### Verification Gaps

- Manual confirmation is needed for the protected transition, empty workspace, responsive layout, and logout flow.

## Cross-Story Concerns

- AdonisJS is authoritative for validation, authentication, authorization, and session state.
- The browser uses HTTP-only session cookies with CSRF protection and does not store bearer tokens.
- PostgreSQL migrations and integration tests must use explicitly acknowledged disposable databases and never target production or shared development data.
- Public auth and CSRF bootstrap routes are rate-limited in-process; a shared ingress or distributed limit remains a deployment requirement before horizontal scaling.
- Signup and login accept only JSON; unsupported and declared-oversized requests fail before parsing, while unknown-length streams use the same parser limit and normalized 413 contract. Multipart auto-processing remains disabled until an explicit upload route is designed.
- Browser API traffic stays on the frontend origin and reaches AdonisJS through the `/api` proxy; split-host browser deployment is not supported by this session/CSRF contract.
- The React client consumes the typed Tuyau contract while keeping presentation and form state client-specific.

## Open Decisions

- None blocking implementation. Exact password-policy tuning may evolve without introducing account types or changing the account journey.

## Completion Criteria

This Epic is healthy when:

- All three Stories match running account and workspace behavior.
- Every Scenario has focused automated or explicit gap evidence.
- Implementation and verification maps identify the current backend, client, migration, and test starting points.
- Manual UI confirmation covers the complete browser journey.
- Related change artifacts, ADRs, README, and release communication do not contradict this Epic.

## Notes

- The 2026-07-14 apply pass resolved the independent review's session-revalidation and pre-throttle multipart-processing findings. Fresh independent review, manual UI confirmation, and the recorded provider gaps remain before acceptance and merge.
