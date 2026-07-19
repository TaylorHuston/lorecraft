---
id: LC-001
status: implemented
created: 2026-07-12
modified: 2026-07-18
last_verified: 2026-07-18
stories:
  - S1
  - S2
  - S3
---

# LC-001 Account Identity And Workspace Access

## Product Context

- Related changes:
  - `docs/changes/closed/2026-07-12-account-workspace-entry/`
  - `docs/changes/closed/2026-07-14-ui-cleanup-and-reconciliation/`
- Related ADRs:
  - `docs/adrs/2026-07-12-adonisjs-api-first-backend.md`
  - `docs/adrs/2026-07-12-postgresql-on-neon.md`
  - `docs/adrs/2026-07-12-browser-session-authentication.md`
  - `docs/adrs/2026-07-12-react-web-client-and-typed-api-contract.md`
  - `docs/adrs/2026-07-14-disposable-database-automation.md`

Lorecraft needs a secure private account boundary before an individual can create and maintain authoritative Worlds. Accounts are not divided into creator, player, or other types; client surfaces may support different activities without changing the account model.

## Outcome

A user can create an account, return through a secure browser session, reach a protected World workspace, and end that session safely.

## Current Scope

- Email and password account creation with confirmation and duplicate protection.
- Automatic authenticated workspace entry after signup.
- Returning sign-in and session restoration.
- Protected browser and API access.
- Server-side session invalidation on sign-out.

## Deferred Scope

- World creation and editing.
- Account roles or creator/player account types.
- Display names, profiles, email verification, password recovery, social login, and multi-factor authentication.
- Public API documentation, mobile clients, and collaboration permissions.

## Candidate Stories

| Candidate            | Status   | Story Shape                                                                                                    | Acceptance Signals                                        |
| -------------------- | -------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Account recovery     | deferred | As an account holder, I want to recover access, so that a forgotten password does not permanently lock me out. | Email delivery and recovery security enter product scope. |
| Account verification | deferred | As an account holder, I want to verify my email, so that Lorecraft can trust account contact ownership.        | Verification-dependent features enter product scope.      |

## Story Index

| Story | Status      | Capability                                             | Last Verified | Notes                                                                       |
| ----- | ----------- | ------------------------------------------------------ | ------------- | --------------------------------------------------------------------------- |
| S1    | implemented | New account creation and automatic workspace entry.    | 2026-07-17    | Focused backend and frontend proof passes; deployment gaps remain explicit. |
| S2    | implemented | Returning sign-in and session restoration.             | 2026-07-17    | Focused backend and frontend proof passes; deployment gaps remain explicit. |
| S3    | implemented | Protected access, session-loss handling, and sign-out. | 2026-07-17    | Focused backend and frontend proof passes.                                  |

## Stories

### Story S1: New User Enters Their Workspace

Status: implemented
Created: 2026-07-12
Modified: 2026-07-18
Last verified: 2026-07-17

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

The system SHALL establish an authenticated browser session after successful account creation and take the user to their authenticated World workspace.

###### Scenario R2-S1: Signup Completes

- WHEN account creation succeeds
- THEN the browser receives a secure session without receiving a reusable bearer token in client-accessible storage
- AND the user sees the authenticated World workspace.

###### Scenario R2-S2: Private Production Signup

- WHEN a visitor creates the first production account through the private HTTPS origin
- THEN the same-origin `/api` path establishes an HTTP-only session cookie with the `Secure` attribute
- AND the authenticated workspace opens without exposing an application listener on the LAN or public Internet.

##### Requirement R3: Accessible Account Creation Presentation

The system SHALL present account creation as a focused, responsive Lorecraft form with persistent field labels, independently controllable password disclosure, visible password confirmation, clear validation and pending states, and keyboard-visible focus.

###### Scenario R3-S1: Account Creation At Supported Viewports

- WHEN a visitor opens sign-up at desktop or mobile width
- THEN the Lorecraft identity and complete account form remain readable without horizontal overflow
- AND Email, Password, and Confirm password remain visibly labeled and operable.

###### Scenario R3-S2: Validation And Pending Feedback

- WHEN sign-up validation fails or submission is pending
- THEN field and form feedback remains associated with the relevant controls
- AND the current form values and layout remain stable enough to recover without re-entry caused by presentation changes.

###### Scenario R3-S3: Control Account-Creation Password Disclosure

- WHEN a visitor uses the disclosure action for Password or Confirm password
- THEN only the selected field changes between concealed and readable presentation
- AND its value, focus, autocomplete purpose, validation association, and submission behavior remain unchanged
- AND the action is operable by keyboard and touch with a clear accessible name for its current action.

##### Requirement R4: Secure And Recoverable Signup Boundary

The system SHALL protect signup from cross-site mutation, unsupported or oversized request bodies, and repeated attempts while preserving actionable recovery for the visitor.

###### Scenario R4-S1: Invalid CSRF Does Not Mutate Signup State

- WHEN signup is submitted without a valid CSRF token
- THEN the request is rejected without creating an account or authenticating the browser session
- AND the visitor receives guidance to refresh the expired secure form.

###### Scenario R4-S2: Signup Accepts Only Bounded JSON

- WHEN signup uses an unsupported content type or a JSON body larger than 16 KB, including an unknown-length stream
- THEN the request is rejected before account or session mutation
- AND the response identifies the supported JSON boundary without echoing credentials.

###### Scenario R4-S3: Throttled Signup Is Recoverable

- WHEN repeated signup or prerequisite CSRF requests exceed the per-client limit
- THEN the request is rejected without creating an account
- AND the visitor receives actionable guidance to wait and retry.

#### Implemented By

| Path                                                                                                         | Role                                                                                                                                  | Recheck Trigger                                                   |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `apps/backend/app/controllers/new_account_controller.ts`                                                     | Creates a normalized account transactionally and establishes its web session.                                                         | Recheck when signup or transaction behavior changes.              |
| `apps/backend/app/validators/user.ts`                                                                        | Defines the email, password, and confirmation trust boundary.                                                                         | Recheck when account input policy changes.                        |
| `apps/backend/app/models/user.ts`                                                                            | Persists and hashes account credentials.                                                                                              | Recheck when account identity or hashing changes.                 |
| `apps/backend/database/migrations/1761885935168_create_users_table.ts`                                       | Preserves the immutable historical account schema, including the unused nullable `full_name` compatibility column.                    | Never edit after application; recheck through forward migrations. |
| `apps/backend/database/migrations/1784049600000_normalize_users_email.ts`                                    | Transactionally normalizes existing emails and adds the normalized-email constraint.                                                  | Recheck when account identity normalization changes.              |
| `apps/frontend/src/auth/SignUpPage.tsx`                                                                      | Presents signup, local validation, errors, and automatic workspace entry.                                                             | Recheck when the signup journey changes.                          |
| `apps/frontend/src/auth/PasswordField.tsx`, `apps/frontend/src/components/TextField/TextField.tsx`, `apps/frontend/src/components/IconButton/IconButton.tsx`, and `apps/frontend/src/components/Button/Button.tsx` | Provide app-owned labeled fields, independent password disclosure, and pending action behavior without changing credential semantics. | Recheck when account controls or disclosure behavior changes. |
| `apps/frontend/src/auth/AuthForm.module.css`, `apps/frontend/src/components/Button/Button.module.css`, `apps/frontend/src/components/IconButton/IconButton.module.css`, `apps/frontend/src/components/TextField/TextField.module.css`, and `apps/frontend/src/components/Textarea/Textarea.module.css` | Define app-owned account and control focus, pending, disabled, validation, and layout presentation. | Recheck when shared account/control styling changes. |
| `apps/frontend/src/components/Controls.stories.tsx` and `apps/frontend/src/components/Controls.stories.module.css` | Expose deterministic control states independently of feature routes. | Recheck when control APIs or preview states change. |
| `apps/frontend/src/auth/AuthLayout.tsx` and `apps/frontend/src/auth/AuthLayout.module.css`                   | Define the shared centered, cardless, responsive account-access composition.                                                          | Recheck when account presentation changes.                        |
| `apps/frontend/src/auth/SignUpPage.stories.tsx`                                                              | Exposes deterministic default, mobile, validation, and pending signup states.                                                         | Recheck when signup states or presentation change.                |
| `apps/frontend/src/auth/tuyauAuthApi.ts`                                                                     | Uses the generated Tuyau contract with credentialed session requests.                                                                 | Recheck when account routes or client transport changes.          |
| `apps/backend/app/middleware/auth_request_boundary_middleware.ts`                                            | Rejects unsupported and declared-oversized signup payloads before body parsing.                                                       | Recheck when signup request formats or limits change.             |
| `apps/backend/app/exceptions/handler.ts`                                                                     | Normalizes unknown-length oversized auth streams to the auth 413 contract.                                                            | Recheck when parser errors or auth limits change.                 |

#### Verified By

| Requirement / Scenario                 | Evidence                                                                                                                                               | Proves                                                                                                                                                                         | Status                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| S1/R1-S1, S1/R1-S2, S1/R1-S3, S1/R2-S1 | `apps/frontend/src/app/App.test.tsx` and `apps/frontend/src/auth/tuyauAuthApi.test.ts`                                                                 | Client normalization, validation, duplicate presentation, and workspace transition.                                                                                            | Passing 2026-07-17        |
| S1/R1-S2                               | `apps/backend/tests/functional/account_security.spec.ts`                                                                                               | Server validation omits credentials and does not create an invalid account.                                                                                                    | Passing 2026-07-17        |
| S1/R1-S1, S1/R1-S3, S1/R2-S1           | `apps/backend/tests/functional/account_auth.spec.ts`                                                                                                   | Account normalization, hashing, uniqueness, and database-backed session state.                                                                                                 | Passing 2026-07-13        |
| S1/R1-S1 through S1/R2-S1              | `apps/frontend/e2e/account-workspace.spec.ts`                                                                                                          | Same-origin browser signup, HTTP-only cookie behavior, empty bearer storage, and workspace entry.                                                                              | Passing 2026-07-13        |
| S1/R4-S1                               | `apps/backend/tests/functional/account_security.spec.ts`, `apps/frontend/src/app/App.test.tsx`, and `apps/frontend/src/auth/tuyauAuthApi.test.ts`      | Missing and forged CSRF tokens do not create an account or authenticate the browser, and the client presents recovery guidance.                                                | Passing 2026-07-17        |
| S1/R4-S2                               | `apps/backend/tests/functional/account_security.spec.ts`                                                                                               | Signup rejects unsupported content before parsing and applies one 16 KB contract to declared and streamed JSON payloads without allocating session state.                      | Passing 2026-07-17        |
| S1/R4-S3                               | `apps/backend/tests/functional/account_security.spec.ts`, `apps/frontend/src/app/App.test.tsx`, and `apps/frontend/src/auth/tuyauAuthApi.test.ts`      | Signup and CSRF limits reject excess attempts while the client preserves actionable recovery.                                                                                  | Passing 2026-07-17        |
| S1/R2-S1                               | `apps/frontend/src/app/App.test.tsx`                                                                                                                   | Successful signup cancels an older anonymous session read before publishing the authenticated account.                                                                         | Passing 2026-07-14        |
| S1/R1-S1, S1/R1-S3                     | `apps/backend/tests/database/users_email_normalization_migration.spec.ts` and `apps/backend/tests/unit/migration_database.spec.ts`                     | Existing historical schemas upgrade transactionally, preserve compatibility data, reject collisions without partial writes, and use a guarded disposable harness.              | Passing 2026-07-14        |
| S1/R1-S1 through S1/R2-S1              | User-confirmed local walkthrough                                                                                                                       | Validation clarity, responsive layout, signup, and automatic workspace transition behave as intended.                                                                          | User confirmed 2026-07-14 |
| S1/R3-S1, S1/R3-S2                     | `apps/frontend/src/app/App.test.tsx` and `apps/frontend/src/auth/SignUpPage.stories.tsx`                                                               | Persistent labels, validation association, pending stability, responsive composition, and Storybook accessibility.                                                             | Passing 2026-07-15        |
| S1/R3-S1, S1/R3-S2                     | `apps/frontend/e2e/account-workspace.spec.ts`                                                                                                          | Signup remains operable without horizontal overflow and keeps a representative 44 px mobile action target.                                                                     | Passing 2026-07-15        |
| S1/R3-S1, S1/R3-S2                     | User-confirmed desktop/mobile UI walkthrough                                                                                                           | Current signup hierarchy, validation, pending presentation, focus, and responsive behavior are accepted.                                                                       | user confirmed 2026-07-15 |
| S1/R3-S3                               | `apps/frontend/src/app/App.test.tsx`, `apps/frontend/src/components/TextField/TextField.test.tsx`, and `apps/frontend/src/auth/SignUpPage.stories.tsx` | Password and confirmation disclosure remain independent while preserving values, autocomplete purpose, field identity, validation association, keyboard focus, and submission. | Passing 2026-07-17        |
| S1/R3-S3                               | `apps/frontend/e2e/account-workspace.spec.ts`                                                                                                          | Independent disclosure remains value-preserving and overflow-free through the real sign-up route at desktop and mobile widths.                                                  | Passing 2026-07-17        |
| S1/R3-S1..R3-S3                       | `apps/frontend/src/components/Button/Button.test.tsx`, `apps/frontend/src/components/IconButton/IconButton.test.tsx`, `apps/frontend/src/components/TextField/TextField.test.tsx`, and `apps/frontend/src/components/Textarea/Textarea.test.tsx` | Shared account controls retain accessible names, labels, pending/disabled semantics, and validation association. | Passing 2026-07-17 |

#### Verification Gaps

- `S1/R2-S2` passed in private production on 2026-07-18 through normal HTTPS signup, same-origin API traffic, browser confirmation of `Secure` and HTTP-only session attributes, and listener inspection proving tailnet-only HTTPS plus a loopback-only gateway.

#### Story Notes

- Account and user are equivalent product terms in this Epic; there is no account-type field.

### Story S2: Returning User Resumes Their Workspace

Status: implemented
Created: 2026-07-12
Modified: 2026-07-18
Last verified: 2026-07-17

As a returning user, I want Lorecraft to recognize or re-authenticate me, so that I can resume my private workspace without unnecessary friction.

#### Requirements And Scenarios

##### Requirement R1: Credential Sign-In

The system SHALL establish a browser session for valid credentials and reject invalid credentials without revealing which credential was wrong.

###### Scenario R1-S1: Valid Credentials

- WHEN a visitor submits an existing account email and its correct password
- THEN the system establishes an authenticated session
- AND the user sees the authenticated World workspace.

###### Scenario R1-S2: Invalid Credentials

- WHEN a visitor submits an unknown email or incorrect password
- THEN no authenticated session is established
- AND the response uses the same generic credential error in either case.

##### Requirement R2: Session Restoration

The system SHALL restore a valid existing session across page refreshes, keep authenticated users out of the signup and sign-in journey, and preserve an unauthenticated visitor's unfinished public auth form during background session revalidation.

###### Scenario R2-S1: Workspace Refresh

- WHEN an authenticated user refreshes the workspace while their session remains valid
- THEN the workspace returns without requiring another sign-in.

###### Scenario R2-S2: Authenticated User Opens An Auth Route

- WHEN an authenticated user opens the signup or sign-in route
- THEN the client returns them to the authenticated World workspace.

###### Scenario R2-S3: Public Auth Draft Survives Session Revalidation

- WHEN an unauthenticated visitor partially completes signup or sign-in
- AND returning window focus triggers background session revalidation
- THEN the public form remains mounted while the session check is pending
- AND the visitor's unfinished input remains available when the server still reports no authenticated session
- AND a failed background check leaves the draft mounted with a non-destructive retry action.

###### Scenario R2-S4: Restored Production Session Data

- WHEN the production database is restored into an isolated recovery target and the deployed application is connected to that target
- THEN the production account can sign in through the private HTTPS origin
- AND a valid restored session remains restorable across a browser refresh.

##### Requirement R3: Focused Sign-In And Session Recovery

The system SHALL present sign-in and public session-refresh recovery as focused, responsive states with independently controllable password disclosure, actionable feedback, and visible keyboard focus.

###### Scenario R3-S1: Sign-In At Supported Viewports

- WHEN a visitor opens sign-in at desktop or mobile width
- THEN the Lorecraft identity, credentials, account-navigation link, and submission action remain readable and operable without horizontal overflow.

###### Scenario R3-S2: Background Session Check Fails

- WHEN a background session check fails while an unfinished public form remains mounted
- THEN a visually distinct but non-destructive recovery notice is presented
- AND its retry action is keyboard and touch accessible without obscuring the form.

###### Scenario R3-S3: Control Sign-In Password Disclosure

- WHEN a visitor uses the disclosure action for Password
- THEN the field changes between concealed and readable presentation without changing its value, focus, autocomplete purpose, validation association, or submission behavior
- AND the action is operable by keyboard and touch with a clear accessible name for its current action.

##### Requirement R4: Secure And Recoverable Sign-In Boundary

The system SHALL protect sign-in from cross-site mutation, unsupported or oversized request bodies, malformed credential input, and repeated attempts while preserving generic, actionable recovery.

###### Scenario R4-S1: Invalid CSRF Does Not Mutate Sign-In State

- WHEN sign-in is submitted without a valid CSRF token
- THEN the request is rejected without authenticating or changing browser-session ownership
- AND the visitor receives guidance to refresh the expired secure form.

###### Scenario R4-S2: Sign-In Accepts Only Bounded Valid JSON

- WHEN sign-in uses an unsupported content type, a JSON body larger than 16 KB, an unknown-length oversized stream, or malformed credential fields
- THEN the request is rejected before authentication or session mutation
- AND validation identifies safe field corrections without echoing credentials.

###### Scenario R4-S3: Throttled Sign-In Is Recoverable

- WHEN repeated sign-in or prerequisite CSRF requests exceed the per-client limit
- THEN the request is rejected without authenticating the browser
- AND the visitor receives generic guidance to wait and retry without credential disclosure.

###### Scenario R4-S4: Secure Production Browser Session

- WHEN valid credentials are submitted through the private production HTTPS origin
- THEN sign-in and subsequent state-changing requests use the same-origin `/api` path with CSRF protection
- AND the session credential is HTTP-only and `Secure` without a bearer token in browser-accessible storage.

#### Implemented By

| Path                                                                                                         | Role                                                                                                                      | Recheck Trigger                                               |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `apps/backend/app/controllers/sessions_controller.ts`                                                        | Verifies credentials, establishes the web session, and invalidates it on logout.                                          | Recheck when session behavior changes.                        |
| `apps/backend/app/controllers/profile_controller.ts`                                                         | Returns the authenticated account for session restoration.                                                                | Recheck when account serialization changes.                   |
| `apps/backend/config/auth.ts`                                                                                | Defines web sessions as the browser authentication guard while retaining future token capability.                         | Recheck when guards change.                                   |
| `apps/frontend/src/auth/SignInPage.tsx`                                                                      | Presents generic credential errors and resumes the attempted protected route.                                             | Recheck when sign-in changes.                                 |
| `apps/frontend/src/auth/PasswordField.tsx`, `apps/frontend/src/components/TextField/TextField.tsx`, `apps/frontend/src/components/IconButton/IconButton.tsx`, and `apps/frontend/src/components/Button/Button.tsx` | Provide app-owned labeled fields, password disclosure, and pending action behavior without changing credential semantics. | Recheck when account controls or disclosure behavior changes. |
| `apps/frontend/src/auth/AuthProvider.tsx`                                                                    | Separates initial session loading from background revalidation through TanStack Query.                                    | Recheck when session restoration changes.                     |
| `apps/frontend/src/app/AppRoutes.tsx`                                                                        | Protects private routes while preserving public auth forms during anonymous background checks.                            | Recheck when routing changes.                                 |
| `apps/frontend/src/auth/SignInPage.stories.tsx` and `apps/frontend/src/auth/SessionStates.stories.tsx`       | Expose deterministic sign-in, session loading, failure, refresh, and recovery states.                                     | Recheck when account or session presentation changes.         |
| `apps/backend/app/middleware/auth_request_boundary_middleware.ts`                                            | Rejects unsupported and declared-oversized login payloads before body parsing.                                            | Recheck when login request formats or limits change.          |
| `apps/backend/app/exceptions/handler.ts`                                                                     | Normalizes unknown-length oversized auth streams to the auth 413 contract.                                                | Recheck when parser errors or auth limits change.             |

#### Verified By

| Requirement / Scenario                 | Evidence                                                                                                                                               | Proves                                                                                                                                                        | Status                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| S2/R1-S1, S2/R1-S2, S2/R2-S1, S2/R2-S2 | `apps/frontend/src/app/App.test.tsx` and `apps/frontend/src/auth/tuyauAuthApi.test.ts`                                                                 | Sign-in success, generic credential error presentation, session restoration, and auth-route redirection.                                                      | Passing 2026-07-17        |
| S2/R1-S1, S2/R1-S2, S2/R2-S1           | `apps/backend/tests/functional/account_auth.spec.ts`                                                                                                   | Generic credential failure and database-backed session behavior.                                                                                              | Passing 2026-07-13        |
| S2/R1-S1 through S2/R2-S2              | `apps/frontend/e2e/account-workspace.spec.ts`                                                                                                          | Same-origin return login, generic unknown/wrong-password errors, refresh, and auth-route bypass.                                                              | Passing 2026-07-13        |
| S2/R4-S1                               | `apps/backend/tests/functional/account_security.spec.ts`, `apps/frontend/src/app/App.test.tsx`, and `apps/frontend/src/auth/tuyauAuthApi.test.ts`      | Missing and forged CSRF tokens do not change session ownership, and the client presents recovery guidance.                                                    | Passing 2026-07-17        |
| S2/R4-S2                               | `apps/backend/tests/functional/account_security.spec.ts` and `apps/frontend/src/app/App.test.tsx`                                                      | Login rejects unsupported or oversized JSON before session mutation and presents field-safe validation for malformed credentials.                             | Passing 2026-07-17        |
| S2/R4-S3                               | `apps/backend/tests/functional/account_security.spec.ts`, `apps/frontend/src/app/App.test.tsx`, and `apps/frontend/src/auth/tuyauAuthApi.test.ts`      | Login and CSRF limits isolate clients while the UI presents generic recovery without credential disclosure.                                                   | Passing 2026-07-17        |
| S2/R2-S3                               | `apps/frontend/src/app/App.test.tsx`                                                                                                                   | Real window focus keeps signup and sign-in drafts mounted during pending, successful, and failed anonymous revalidation and exposes retry without remounting. | Passing 2026-07-14        |
| S2/R1-S1                               | `apps/frontend/src/app/App.test.tsx`                                                                                                                   | Successful sign-in cancels an older anonymous session read before publishing the authenticated account.                                                       | Passing 2026-07-14        |
| S2/R1-S1 through S2/R2-S3              | User-confirmed local walkthrough                                                                                                                       | Sign-in, refresh, focus revalidation, draft preservation, and recovery behavior work as intended.                                                             | User confirmed 2026-07-14 |
| S2/R3-S1, S2/R3-S2                     | `apps/frontend/src/app/App.test.tsx`, `apps/frontend/src/auth/SignInPage.stories.tsx`, and `apps/frontend/src/auth/SessionStates.stories.tsx`          | Responsive sign-in, pending/error states, non-destructive refresh recovery, focus restoration without ID dependence, and Storybook accessibility.             | Passing 2026-07-15        |
| S2/R3-S1, S2/R3-S2                     | `apps/frontend/e2e/account-workspace.spec.ts`                                                                                                          | Sign-in remains operable without horizontal overflow and keeps a representative 44 px mobile action target.                                                   | Passing 2026-07-15        |
| S2/R3-S1, S2/R3-S2                     | User-confirmed desktop/mobile UI walkthrough                                                                                                           | Current sign-in and background session-recovery presentation are accepted.                                                                                    | user confirmed 2026-07-15 |
| S2/R3-S3                               | `apps/frontend/src/app/App.test.tsx`, `apps/frontend/src/components/TextField/TextField.test.tsx`, and `apps/frontend/src/auth/SignInPage.stories.tsx` | Sign-in disclosure preserves the submitted password, autocomplete purpose, field identity, validation association, and keyboard focus.                        | Passing 2026-07-17        |
| S2/R3-S3                               | `apps/frontend/e2e/account-workspace.spec.ts`                                                                                                          | Sign-in disclosure preserves the entered password and remains overflow-free through the real route at desktop and mobile widths.                              | Passing 2026-07-17        |

#### Verification Gaps

- `S2/R2-S4` and `S2/R4-S4` have private-production sign-in/session/CSRF and HTTPS cookie proof plus isolated restored account/session rows and current-image readiness. Fresh credential submission against a separately exposed restored UI is an accepted closeout gap.

#### Story Notes

- Successful signup and sign-in cancel older session reads before publishing the authenticated account, so a late anonymous focus response cannot overwrite the completed mutation.

### Story S3: User Controls Protected Workspace Access

Status: implemented
Created: 2026-07-12
Modified: 2026-07-18
Last verified: 2026-07-17

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
- AND the workspace returns to sign-in without continuing to render private account state
- AND keyboard focus moves to sign-in, or returns to the previously focused workspace control when the session remains valid.

###### Scenario R1-S4: Protected Request Detects Session Loss

- WHEN an authenticated World or Adventure request returns an authentication failure because the server session is no longer valid
- THEN the client ends its shared authenticated session state
- AND protected content is replaced by the sign-in journey.

###### Scenario R1-S5: Private Same-Origin Production Reachability

- WHEN an authorized tailnet device opens Lorecraft's private production HTTPS origin
- THEN browser application and `/api` traffic remain on that origin and protected routes require a Lorecraft session
- AND the application is unavailable through LAN and public interfaces.

##### Requirement R2: Logout Invalidation

The system SHALL invalidate the active server-side session when the user signs out.

###### Scenario R2-S1: Successful Sign-Out

- WHEN an authenticated user signs out
- THEN the server invalidates that session
- AND the client returns to sign in.

###### Scenario R2-S2: Reuse After Sign-Out

- WHEN the signed-out browser refreshes the former workspace route or calls a protected endpoint
- THEN it remains unauthenticated and cannot access private data.

###### Scenario R2-S3: Sign-Out Fails Safely

- WHEN sign-out is rejected by CSRF validation or throttling
- THEN the existing authenticated session remains active
- AND the client keeps the user in the protected workspace with actionable recovery guidance.

##### Requirement R3: Route Context Across Account And Workspace Navigation

The system SHALL identify each account or workspace destination through its document title and primary page heading while preserving focus during background refresh.

###### Scenario R3-S1: Destination Navigation Or Redirect

- WHEN navigation or an authentication redirect replaces the current account or workspace destination
- THEN the document title identifies the destination
- AND focus moves to the destination's primary heading without exposing protected content first.

###### Scenario R3-S2: Background Refresh Preserves Focus

- WHEN session or route data refreshes without changing the current destination
- THEN the document title remains accurate
- AND the currently focused control or reading position is not displaced.

#### Implemented By

| Path                                                                                                                                                  | Role                                                                                                   | Recheck Trigger                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `apps/backend/start/routes.ts`                                                                                                                        | Applies the web guard to protected account, World, and Adventure routes.                               | Recheck when API routes or guards change.                |
| `apps/backend/config/shield.ts`                                                                                                                       | Enforces CSRF protection and exposes the XSRF cookie.                                                  | Recheck when browser security changes.                   |
| `apps/backend/config/cors.ts`                                                                                                                         | Restricts credentialed browser requests to the configured frontend origin.                             | Recheck when deployment origins change.                  |
| `apps/backend/database/migrations/1768620764697_create_sessions_table.ts`                                                                             | Defines durable server-side session storage.                                                           | Recheck when session persistence changes.                |
| `apps/frontend/src/app/AppRoutes.tsx`                                                                                                                 | Prevents anonymous private-content rendering and moves route context to the destination heading without displacing focus the user selects while data is loading. | Recheck when protected routing or route presentation changes. |
| `apps/frontend/src/auth/AuthProvider.tsx`                                                                                                             | Revalidates the server session whenever an open workspace regains focus.                               | Recheck when session query behavior changes.             |
| `apps/frontend/src/auth/authContext.ts`                                                                                                               | Exposes the shared session-ending boundary used by protected feature routes.                           | Recheck when account-owned client session state changes. |
| `apps/frontend/src/workspace/WorkspacePage.tsx`, `apps/frontend/src/worlds/WorldDetailPage.tsx`, and `apps/frontend/src/adventures/AdventurePage.tsx` | End shared client session state when protected World or Adventure requests report authentication loss. | Recheck when protected feature error handling changes.   |
| `apps/frontend/src/workspace/WorkspacePage.tsx`                                                                                                       | Presents account identity and logout within the protected workspace.                                   | Recheck when workspace behavior changes.                 |
| `apps/frontend/vite.config.ts`                                                                                                                        | Keeps browser API traffic on the same origin through the development proxy.                            | Recheck when browser/API deployment topology changes.    |

#### Verified By

| Requirement / Scenario       | Evidence                                                                                                                                          | Proves                                                                                                                                                          | Status                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| S3/R1-S1, S3/R2-S1           | `apps/frontend/src/app/App.test.tsx` and `apps/frontend/src/auth/tuyauAuthApi.test.ts`                                                            | Deferred-session observation proves no private-content flash and successful logout returns to sign-in.                                                          | Passing 2026-07-17        |
| S3/R1-S2                     | `apps/backend/tests/functional/account_security.spec.ts`                                                                                          | Anonymous API denial, no persisted session allocation for safe anonymous reads, and untrusted-origin rejection.                                                 | Passing 2026-07-13        |
| S3/R2-S1                     | `apps/backend/tests/functional/account_auth.spec.ts`                                                                                              | Logout removes authentication from the active database-backed test session.                                                                                     | Passing 2026-07-13        |
| S3/R1-S2, S3/R2-S1, S3/R2-S2 | `apps/frontend/e2e/account-workspace.spec.ts`                                                                                                     | Same-origin anonymous API denial, protected workspace, logout, and invalidated-cookie replay.                                                                   | Passing 2026-07-13        |
| S3/R1-S3                     | `apps/frontend/src/app/App.test.tsx` and `apps/frontend/src/auth/SessionStates.stories.tsx`                                                       | Focus revalidation suppresses private UI, restores controls with or without IDs, focuses sign-in or retry after failure, and exposes accessible session states. | Passing 2026-07-15        |
| S3/R1-S4                     | `apps/frontend/src/worlds/WorldRoutes.test.tsx` and `apps/frontend/src/adventures/AdventureRoutes.test.tsx`                                       | Catalog, World-detail, and Adventure-detail authentication failures end shared session state and return to sign-in.                                             | Passing 2026-07-17        |
| S3/R2-S3                     | `apps/backend/tests/functional/account_security.spec.ts`, `apps/frontend/src/app/App.test.tsx`, and `apps/frontend/src/auth/tuyauAuthApi.test.ts` | CSRF and throttle failures preserve the authenticated session while presenting actionable recovery.                                                             | Passing 2026-07-17        |
| S3/R1-S1 through S3/R2-S2    | User-confirmed local walkthrough                                                                                                                  | Protected transitions, session restoration, and logout behaved as intended.                                                                                     | user confirmed 2026-07-14 |
| S3/R1-S3, S3/R2-S1           | User-confirmed desktop/mobile UI walkthrough                                                                                                      | Current protected-session recovery and sign-out presentation are accepted.                                                                                      | user confirmed 2026-07-15 |
| S3/R3-S1 and S3/R3-S2        | `apps/frontend/src/app/RoutePresentation.test.tsx`                                                                                                | Account/workspace destinations receive stable titles and heading focus on navigation while preserving focus the user selects before delayed route data appears.  | Passing 2026-07-18        |
| S3/R1-S2 supporting same-origin boundary | `apps/frontend/vite.config.test.ts`                                                                                                      | The development browser/API proxy remains same-origin and pinned to the reserved backend target.                                                                 | Passing 2026-07-18        |

#### Verification Gaps

- `S3/R1-S5` passed on 2026-07-18: Tailscale Serve exposed private HTTPS, Docker published only the gateway on host loopback, API/worker remained unpublished, and LAN listener probes failed as intended.

#### Story Notes

- Background session revalidation preserves public auth forms but continues to suppress protected workspace content until the server session is confirmed.
- World-catalog content and empty-state behavior are owned and verified by `LC-002/S1`.

## Cross-Story Concerns

- AdonisJS is authoritative for validation, authentication, authorization, and session state.
- The browser uses HTTP-only session cookies with CSRF protection and does not store bearer tokens.
- PostgreSQL migrations and integration tests must use explicitly acknowledged, identifiable disposable databases or schemas, require explicit host/database components and the application target for comparison, reject equivalent application targets after host/schema normalization, neutralize inherited PostgreSQL connection overrides, and never bypass production migration protection. Schema-isolated Neon runs use a direct endpoint and PostgreSQL `options=-csearch_path=...`.
- Public auth and CSRF bootstrap routes are rate-limited in-process; a shared ingress or distributed limit remains a deployment requirement before horizontal scaling.
- Signup and login accept only JSON; unsupported and declared-oversized requests fail before parsing, while unknown-length streams use the same parser limit and normalized 413 contract. Multipart auto-processing remains disabled until an explicit upload route is designed.
- Browser API traffic stays on the frontend origin and reaches AdonisJS through the `/api` proxy; split-host browser deployment is not supported by this session/CSRF contract.
- The React client consumes the typed Tuyau contract while keeping presentation and form state client-specific.

### Cross-Story Implementation And Evidence

| Path / Evidence                                                                                | Role / Proof                                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/backend/scripts/database-safety.mjs`                                                     | Centralizes acknowledgement, explicit target components, effective application-target comparison, disposable identifiers, PostgreSQL host/schema normalization, selector rejection, and guarded child environments. |
| `apps/backend/scripts/run-tests.mjs` and `run-migrations.mjs`                                  | Enforce the disposable-target boundary and neutralize inherited PostgreSQL overrides before backend tests or migrations execute.                                                                                    |
| `apps/frontend/playwright.config.ts`                                                           | Applies the same database guard and sanitized backend environment before Playwright starts isolated services.                                                                                                       |
| `apps/backend/scripts/database-safety.test.mjs`                                                | Proves target-component, acknowledgement, effective same-target, selector, environment-override, loopback/Neon normalization, schema casing, valid-target, and child-environment behavior.                          |
| `apps/backend/tests/helpers/migration_database.ts` and `tests/unit/migration_database.spec.ts` | Guard per-test PostgreSQL schemas before any write and prove cleanup across setup and callback failures.                                                                                                            |
| `apps/backend/tests/functional/account_security.spec.ts`                                       | Proves exact missing/forged CSRF rejection and unchanged account/session state for signup, login, and logout.                                                                                                       |
| `apps/frontend/src/styles/fonts.css`, `styles/tokens.css`, and `main.tsx`                      | Load the bundled type system and shared semantic presentation foundation used across account and workspace routes.                                                                                                  |
| `apps/frontend/.storybook/preview.tsx`                                                         | Applies the same shared foundation to deterministic component-state and accessibility evidence.                                                                                                                     |

### Cross-Story Verification Gaps

- Dedicated Lorecraft production, development, disposable validation, and isolated recovery targets are provisioned and verified.
- Private HTTPS signup/sign-in, `Secure` and HTTP-only cookie behavior, same-origin production `/api`, and private-only reachability passed. Isolated restore preserved account/session/content state and current-image readiness; only fresh credential submission against a separately exposed restored UI remains an accepted gap.

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

- The closed account-workspace Change accepted the account and session capability. LC-002 owns review and manual confirmation for the later World-catalog presentation.
