---
schema: sdd-epic-v2
id: LC-001
status: implemented
created: 2026-07-12
modified: 2026-07-22
last_verified: 2026-07-22
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
  - `docs/changes/2026-07-22-epic-audit-remediation/`
- Related ADRs:
  - `docs/adrs/2026-07-12-adonisjs-api-first-backend.md`
  - `docs/adrs/2026-07-12-postgresql-on-neon.md`
  - `docs/adrs/2026-07-12-browser-session-authentication.md`
  - `docs/adrs/2026-07-12-react-web-client-and-typed-api-contract.md`
  - `docs/adrs/2026-07-14-disposable-database-automation.md`

Lorecraft needs a private account boundary before an individual can create and maintain authoritative Worlds. Accounts do not have creator/player types; clients can support different activities without changing the account model.

## Outcome

A user can create an account, restore or re-establish a browser session, use the protected World workspace, and invalidate that session safely.

## Current Scope

- Email/password account creation with confirmation and duplicate protection.
- Same-origin, HTTP-only browser sessions with CSRF protection and no browser-stored bearer credential.
- Returning sign-in, session restoration, requested protected-route resumption, and public-auth recovery.
- Protected browser and API access, loss-of-session recovery, and server-side session invalidation on sign-out.

## Deferred Scope

- Display names, profiles, email verification, password recovery, social login, multi-factor authentication, and account types.
- Native/mobile token clients, public API documentation, and collaboration permissions.
- Production/private HTTPS and recovery-target validation until an intentionally provisioned, reproducible operational check is recorded.

## Candidate Stories

| Candidate | Status | Story Shape | Acceptance Signals |
| --- | --- | --- | --- |
| Account recovery | deferred | As an account holder, I want to recover access, so that a forgotten password does not permanently lock me out. | Email delivery and recovery security enter product scope. |
| Account verification | deferred | As an account holder, I want to verify my email, so that Lorecraft can trust account contact ownership. | Verification-dependent features enter product scope. |

## Story Index

| Story | Implementation | Verification | Capability | Last Verified | Notes |
| --- | --- | --- | --- | --- | --- |
| S1 | implemented | partial | Create a private account and enter the World workspace. | 2026-07-22 | Local signup/security/UI evidence is current; private production HTTPS remains an operational gap. |
| S2 | implemented | partial | Sign in, restore a session, and preserve public auth recovery. | 2026-07-22 | Requested-route resumption is implemented and proven; recovery and production proof remain gaps. |
| S3 | implemented | partial | Protect workspace access and invalidate sessions. | 2026-07-22 | Current client/API evidence includes New Adventure session loss; private reachability remains an operational gap. |

## Stories

### Story S1: New User Enters Their Workspace

Implementation: implemented
Verification: partial
Created: 2026-07-12
Modified: 2026-07-22
Last verified: 2026-07-22

As a new user, I want to create an account and enter my private workspace, so that I can begin using Lorecraft.

#### Requirements And Scenarios

##### Requirement R1: Valid Account Creation

The system SHALL create an account only when the submitted email and password confirmation are valid and the email is not already registered.

###### Scenario R1-S1: Valid Signup

- WHEN a visitor submits a valid email, password, and matching password confirmation
- THEN the system creates exactly one account for that normalized email address
- AND stores the password only as a secure hash.

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
- THEN the browser receives a session without a reusable bearer token in client-accessible storage
- AND the user sees the authenticated World workspace.

###### Scenario R2-S2: Private Production Signup

- WHEN a visitor creates the first production account through the private HTTPS origin
- THEN the same-origin `/api` path establishes an HTTP-only `Secure` session cookie
- AND the authenticated workspace opens without exposing an application listener on the LAN or public Internet.

##### Requirement R3: Accessible Account Creation Presentation

The system SHALL present account creation as a focused, responsive Lorecraft form with persistent labels, independent password disclosure, visible confirmation, clear validation/pending states, and keyboard-visible focus.

###### Scenario R3-S1: Account Creation At Supported Viewports

- WHEN a visitor opens sign-up at desktop or mobile width
- THEN the Lorecraft identity and complete account form remain readable without horizontal overflow
- AND Email, Password, and Confirm password remain visibly labeled and operable.

###### Scenario R3-S2: Validation And Pending Feedback

- WHEN sign-up validation fails or submission is pending
- THEN field and form feedback remains associated with the relevant controls
- AND current form values and layout remain stable enough to recover without re-entry caused by presentation changes.

###### Scenario R3-S3: Control Account-Creation Password Disclosure

- WHEN a visitor uses the disclosure action for Password or Confirm password
- THEN only the selected field changes between concealed and readable presentation
- AND its value, focus, autocomplete purpose, validation association, and submission behavior remain unchanged.

##### Requirement R4: Secure And Recoverable Signup Boundary

The system SHALL protect signup from cross-site mutation, unsupported or oversized request bodies, and repeated attempts while preserving actionable recovery.

###### Scenario R4-S1: Invalid CSRF Does Not Mutate Signup State

- WHEN signup is submitted without a valid CSRF token
- THEN the request is rejected without creating an account or authenticating the browser session
- AND the visitor receives guidance to refresh the expired secure form.

###### Scenario R4-S2: Signup Accepts Only Bounded JSON

- WHEN signup uses unsupported content, JSON larger than 16 KB, or an unknown-length oversized stream
- THEN the request is rejected before account or session mutation
- AND the response identifies the supported JSON boundary without echoing credentials.

###### Scenario R4-S3: Throttled Signup Is Recoverable

- WHEN repeated signup or prerequisite CSRF requests exceed the per-client limit
- THEN the request is rejected without creating an account
- AND the visitor receives actionable guidance to wait and retry.

#### Implemented By

| Requirement / Scenario | Location / Anchor | Kind | Responsibility |
| --- | --- | --- | --- |
| S1/R1, S1/R2 | `apps/backend/app/controllers/new_account_controller.ts#async store` | primary | Validates, creates the normalized account transactionally, maps duplicate email, and establishes the web session. |
| S1/R1 | `apps/backend/app/validators/user.ts#signupValidator` | support | Defines normalized email, password, and confirmation constraints. |
| S1/R1 | `apps/backend/app/models/user.ts#User` | persistence | Persists account credentials using the model hash contract. |
| S1/R2 | `apps/frontend/src/auth/SignUpPage.tsx#SignUpPage` | primary | Submits signup, publishes the authoritative account, and navigates to Worlds. |
| S1/R3 | `apps/frontend/src/auth/SignUpPage.tsx#SignUpPage` | primary | Owns signup validation, field association, pending state, and focus recovery. |
| S1/R3 | `apps/frontend/src/auth/PasswordField.tsx#PasswordField` | support | Provides independently controllable password disclosure. |
| S1/R4 | `apps/backend/app/middleware/browser_csrf_middleware.ts#async handle` | primary | Enforces browser CSRF validation before state-changing auth mutations. |
| S1/R4 | `apps/backend/app/middleware/auth_request_boundary_middleware.ts#handle` | support | Rejects unsupported and declared-oversized auth request bodies before parsing. |
| S1/R4 | `apps/backend/app/exceptions/handler.ts#async handle` | support | Normalizes unknown-length oversized request failures to the auth error contract. |

#### Implementation Gaps

- None.

#### Verified By

| Requirement / Scenario | Evidence | Proves | Status |
| --- | --- | --- | --- |
| S1/R1-S1, S1/R2-S1 | Automated test `apps/backend/tests/functional/account_auth.spec.ts#LC-001/S1/R1-S1 + R2-S1: valid signup creates a normalized account and session` | Normalized account creation establishes a database-backed web session. | Passing 2026-07-22 |
| S1/R1-S1 | Automated test `apps/backend/tests/functional/account_auth.spec.ts#LC-001/S1/R1-S1: signup persists only a password hash` | A saved account contains a hash rather than the submitted password. | Passing 2026-07-22 |
| S1/R1-S2 | Automated test `apps/backend/tests/functional/account_security.spec.ts#LC-001/S1/R1-S2: invalid signup identifies fields without echoing credentials` | Invalid signup reports safe field errors without persisting an account or echoing credentials. | Passing 2026-07-22 |
| S1/R1-S3 | Automated test `apps/backend/tests/functional/account_auth.spec.ts#LC-001/S1/R1-S3: a normalized duplicate email returns a safe conflict` | Normalized duplicate signup is rejected with the safe conflict contract. | Passing 2026-07-22 |
| S1/R2-S1 | Automated test `apps/frontend/src/app/App.test.tsx#LC-001/S1/R1-S1 + R2-S1 submits a normalized account and enters Worlds without bearer storage` | The browser publishes the account, enters Worlds, and retains no bearer token. | Passing 2026-07-22 |
| S1/R3-S1, S1/R3-S2 | Deterministic Storybook preview `apps/frontend/src/auth/SignUpPage.stories.tsx` | Default, mobile, validation, and pending signup presentations remain available for component-state inspection. | Passing 2026-07-18 |
| S1/R3-S3 | Automated test `apps/frontend/src/app/App.test.tsx#LC-001/S1/R3-S3 independently discloses signup passwords without changing their values or purpose` | Each disclosure control preserves its field value and purpose independently. | Passing 2026-07-22 |
| S1/R4-S1 | Automated test `apps/backend/tests/functional/account_security.spec.ts#csrfMutationCases` | The signup mutation case verifies missing and forged CSRF tokens do not create an account or session. | Passing 2026-07-22 |
| S1/R4-S2 | Automated test `apps/backend/tests/functional/account_security.spec.ts#LC-001/S1/R4-S2 + S2/R4-S2: auth routes reject oversized JSON before session and CSRF processing` | Unsupported and oversized auth input fails before session mutation. | Passing 2026-07-22 |
| S1/R4-S3 | Automated test `apps/backend/tests/functional/account_security.spec.ts#LC-001/S1/R4-S3: repeated signup attempts are throttled before validation` | Rate limiting rejects excess signup attempts before validation. | Passing 2026-07-22 |

#### Verification Gaps

- `S1/R2-S2`: The accepted browser-session ADR explicitly defers reproducible production HTTPS proof of the `Secure` cookie and private listener topology. Historical walkthrough assertions are not current automated or operational evidence.

#### Story Notes

- Account and user are equivalent product terms in this Epic; there is no account-type field.

### Story S2: Returning User Resumes Their Workspace

Implementation: implemented
Verification: partial
Created: 2026-07-12
Modified: 2026-07-22
Last verified: 2026-07-22

As a returning user, I want Lorecraft to recognize or re-authenticate me, so that I can resume my private workspace without unnecessary friction.

#### Requirements And Scenarios

##### Requirement R1: Credential Sign-In

The system SHALL establish a browser session for valid credentials and reject invalid credentials without revealing which credential was wrong.

###### Scenario R1-S1: Valid Credentials And Requested Route Resumption

- WHEN a visitor submits an existing account email and its correct password
- THEN the system establishes an authenticated session
- AND the client resumes the protected route, including its query and hash, that requested sign-in when one exists, otherwise opens the World workspace.

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
- THEN the client returns them to the requested protected route when present, otherwise the authenticated World workspace.

###### Scenario R2-S3: Public Auth Draft Survives Session Revalidation

- WHEN an unauthenticated visitor partially completes signup or sign-in and focus triggers background session revalidation
- THEN the public form remains mounted while the session check is pending
- AND its unfinished input remains available when the server remains unauthenticated or the check fails.

###### Scenario R2-S4: Restored Production Session Data

- WHEN the production database is restored into an isolated recovery target and the deployed application is connected to that target
- THEN the production account can sign in through the private HTTPS origin
- AND a valid restored session remains restorable across a browser refresh.

##### Requirement R3: Focused Sign-In And Session Recovery

The system SHALL present sign-in and public session-refresh recovery as focused, responsive states with independent password disclosure, actionable feedback, and visible keyboard focus.

###### Scenario R3-S1: Sign-In At Supported Viewports

- WHEN a visitor opens sign-in at desktop or mobile width
- THEN the Lorecraft identity, credentials, account-navigation link, and submission action remain readable and operable without horizontal overflow.

###### Scenario R3-S2: Background Session Check Fails

- WHEN a background session check fails while an unfinished public form remains mounted
- THEN a non-destructive recovery notice is presented
- AND its retry action remains keyboard and touch accessible without obscuring the form.

###### Scenario R3-S3: Control Sign-In Password Disclosure

- WHEN a visitor uses the disclosure action for Password
- THEN the field changes between concealed and readable presentation without changing its value, focus, autocomplete purpose, validation association, or submission behavior.

##### Requirement R4: Secure And Recoverable Sign-In Boundary

The system SHALL protect sign-in from cross-site mutation, unsupported or oversized request bodies, malformed credential input, and repeated attempts while preserving generic, actionable recovery.

###### Scenario R4-S1: Invalid CSRF Does Not Mutate Sign-In State

- WHEN sign-in is submitted without a valid CSRF token
- THEN the request is rejected without authenticating or changing browser-session ownership
- AND the visitor receives guidance to refresh the expired secure form.

###### Scenario R4-S2: Sign-In Accepts Only Bounded Valid JSON

- WHEN sign-in uses unsupported content, JSON larger than 16 KB, an unknown-length oversized stream, or malformed credential fields
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

| Requirement / Scenario | Location / Anchor | Kind | Responsibility |
| --- | --- | --- | --- |
| S2/R1 | `apps/backend/app/controllers/sessions_controller.ts#async store` | primary | Validates credentials, maps generic credential failure, and establishes the web session. |
| S2/R1 | `apps/frontend/src/auth/SignInPage.tsx#SignInPage` | primary | Publishes the successful account and resumes `location.state.from` with pathname, query, and hash. |
| S2/R2 | `apps/backend/app/controllers/profile_controller.ts#async show` | primary | Returns the authenticated account for a restorable browser session. |
| S2/R2 | `apps/frontend/src/auth/AuthProvider.tsx#AuthProvider` | primary | Separates initial loading from background revalidation and clears account-owned caches when identity changes. |
| S2/R2 | `apps/frontend/src/app/AppRoutes.tsx#function PublicOnlyRoute` | support | Redirects an authenticated visitor away from auth routes to a requested protected destination or Worlds. |
| S2/R3 | `apps/frontend/src/auth/SignInPage.tsx#SignInPage` | primary | Presents generic credential, validation, throttle, and CSRF recovery states. |
| S2/R3 | `apps/frontend/src/auth/PasswordField.tsx#PasswordField` | support | Provides the sign-in password disclosure control. |
| S2/R4 | `apps/backend/app/middleware/browser_csrf_middleware.ts#async handle` | primary | Enforces CSRF protection for state-changing sign-in. |
| S2/R4 | `apps/backend/app/middleware/auth_request_boundary_middleware.ts#handle` | support | Applies content-type and pre-parse body-size limits. |

#### Implementation Gaps

- None.

#### Verified By

| Requirement / Scenario | Evidence | Proves | Status |
| --- | --- | --- | --- |
| S2/R1-S1 | Automated test `apps/backend/tests/functional/account_auth.spec.ts#LC-001/S2/R1-S1 + R2-S1: valid credentials establish a restorable web session` | Valid credentials establish a persisted web session that profile restoration can read. | Passing 2026-07-22 |
| S2/R1-S1 | Automated test `apps/frontend/src/app/App.test.tsx#LC-001/S2/R1-S1 returns sign-in to the protected route that requested authentication` | Sign-in resumes the protected destination including its query and hash. | Passing 2026-07-22 |
| S2/R1-S2 | Automated test `apps/backend/tests/functional/account_auth.spec.ts#LC-001/S2/R1-S2: unknown email and wrong password return the same generic error` | Unknown email and wrong password share the generic credential failure contract. | Passing 2026-07-22 |
| S2/R2-S1 | Automated test `apps/frontend/src/app/App.test.tsx#LC-001/S2/R2-S1 restores a valid session when the workspace loads` | Restored account state returns an authenticated user to Worlds. | Passing 2026-07-22 |
| S2/R2-S2 | Automated test `apps/frontend/src/app/App.test.tsx#LC-001/S2/R2-S2 returns an authenticated account from auth routes to Worlds` | An authenticated visitor opening an auth route is redirected to their authenticated workspace. | Passing 2026-07-22 |
| S2/R2-S3 | Automated test `apps/frontend/src/app/App.test.tsx#LC-001/S2/R2-S3 preserves an unfinished %s draft during anonymous focus revalidation` | Auth drafts remain mounted while anonymous focus revalidation completes. | Passing 2026-07-22 |
| S2/R3-S1, S2/R3-S2 | Deterministic Storybook preview `apps/frontend/src/auth/SignInPage.stories.tsx` and `apps/frontend/src/auth/SessionStates.stories.tsx` | Sign-in, loading, failure, refresh, and recovery states are available for direct component-state inspection. | Passing 2026-07-18 |
| S2/R3-S3 | Automated test `apps/frontend/src/app/App.test.tsx#LC-001/S2/R3-S3 discloses the sign-in password without changing submission` | Disclosure preserves the submitted password and control behavior. | Passing 2026-07-22 |
| S2/R4-S1 | Automated test `apps/backend/tests/functional/account_security.spec.ts#csrfMutationCases` | The login mutation case verifies missing and invalid CSRF tokens do not alter sign-in session ownership. | Passing 2026-07-22 |
| S2/R4-S2 | Automated test `apps/frontend/src/auth/tuyauAuthApi.test.ts#LC-001/S2/R4-S2 translates server sign-in validation into field guidance` | Safe server validation errors are translated to affected sign-in fields. | Passing 2026-07-22 |
| S2/R4-S3 | Automated test `apps/backend/tests/functional/account_security.spec.ts#LC-001/S2/R4-S3: repeated login attempts are throttled per forwarded client` | Login attempts are rate limited per forwarded client. | Passing 2026-07-22 |

#### Verification Gaps

- `S2/R2-S4`: No current reproducible, isolated recovery-target browser test proves restored production data can sign in and refresh safely.
- `S2/R4-S4`: The accepted browser-session ADR defers production HTTPS `Secure` cookie proof; local source and automated tests do not substitute for it.

#### Story Notes

- Successful signup and sign-in cancel older session reads before publishing the authenticated account, preventing a late anonymous response from overwriting the completed mutation.

### Story S3: User Controls Protected Workspace Access

Implementation: implemented
Verification: partial
Created: 2026-07-12
Modified: 2026-07-22
Last verified: 2026-07-22

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

- WHEN an authenticated user leaves the workspace open, the server session expires or is revoked, and the user returns focus
- THEN the client revalidates the session and returns to sign-in without continuing to render private state
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
- THEN the document title remains stable
- AND focus the user selected is not replaced by automatic route focus.

#### Implemented By

| Requirement / Scenario | Location / Anchor | Kind | Responsibility |
| --- | --- | --- | --- |
| S3/R1 | `apps/frontend/src/app/AppRoutes.tsx#ProtectedRoute` | primary | Suppresses protected content until restoration completes and redirects anonymous sessions to sign-in with the requested location. |
| S3/R1 | `apps/backend/app/middleware/auth_middleware.ts#async handle` | primary | Requires authenticated browser state on protected API routes. |
| S3/R1 | `apps/backend/app/middleware/require_session_cookie_middleware.ts#async handle` | support | Rejects protected browser requests without the session cookie. |
| S3/R1-S3 | `apps/frontend/src/auth/AuthProvider.tsx#AuthProvider` | primary | Revalidates on focus and clears the account-owned cache when the session changes. |
| S3/R1-S4 | `apps/frontend/src/worlds/WorldDetailPage.tsx#WorldDetailPage` | primary | Ends shared session when protected World detail requests are unauthorized. |
| S3/R1-S4 | `apps/frontend/src/adventures/NewAdventurePage.tsx#NewAdventurePage` | primary | Ends shared session when setup World loading or Adventure creation is unauthorized. |
| S3/R1-S4 | `apps/frontend/src/adventures/AdventurePage.tsx#AdventurePage` | primary | Ends shared session when Adventure reads or NPC autosave are unauthorized. |
| S3/R2 | `apps/backend/app/controllers/sessions_controller.ts#async destroy` | primary | Invalidates the active server-side web session. |
| S3/R2 | `apps/frontend/src/workspace/WorkspacePage.tsx#WorkspacePage` | primary | Invokes sign-out and returns the client to the public sign-in path. |
| S3/R3 | `apps/frontend/src/app/AppRoutes.tsx#RoutePresentation` | primary | Sets destination title and heading focus without stealing deliberate focus during non-route updates. |

#### Implementation Gaps

- None.

#### Verified By

| Requirement / Scenario | Evidence | Proves | Status |
| --- | --- | --- | --- |
| S3/R1-S1 | Automated test `apps/frontend/src/app/App.test.tsx#LC-001/S3/R1-S1 redirects an anonymous workspace visit without rendering private content` | Anonymous navigation redirects before private workspace content renders. | Passing 2026-07-22 |
| S3/R1-S2 | Automated test `apps/backend/tests/functional/account_security.spec.ts#LC-001/S3/R1-S2: an anonymous protected API request returns no account data` | An anonymous protected request returns denial without account data. | Passing 2026-07-22 |
| S3/R1-S3 | Automated test `apps/frontend/src/app/App.test.tsx#LC-001/S3/R1-S3 returns an open workspace to sign in when its session ends` | Focus revalidation clears protected state and routes the browser to sign-in after session loss. | Passing 2026-07-22 |
| S3/R1-S4 | Automated test `apps/frontend/src/worlds/WorldRoutes.test.tsx#LC-001/S3/R1-S4 ends the shared session when World detail reports unauthorized` | An unauthorized World-detail request ends the shared session. | Passing 2026-07-22 |
| S3/R1-S4 | Automated test `apps/frontend/src/adventures/AdventureRoutes.test.tsx#LC-001/S3/R1-S4 ends the shared session when New Adventure setup World load reports unauthorized` | An unauthorized New Adventure setup World load returns the browser to sign-in. | Passing 2026-07-22 |
| S3/R1-S4 | Automated test `apps/frontend/src/adventures/AdventureRoutes.test.tsx#LC-001/S3/R1-S4 ends the shared session when New Adventure creation reports unauthorized` | An unauthorized New Adventure creation returns the browser to sign-in. | Passing 2026-07-22 |
| S3/R1-S4 | Direct Storybook inspection: `Application/Adventures/New/WorldLoadSessionLoss` desktop and `CreationSessionLoss` at 390px mobile | The real AuthProvider/AppRoutes boundary replaces the protected New Adventure surface with Sign in after each controlled 401, updates the document title, emits no console error, and has no mobile overflow. | Passing 2026-07-22 |
| S3/R2-S1 | Automated test `apps/backend/tests/functional/account_auth.spec.ts#LC-001/S3/R2-S1: logout removes authentication from the persisted browser session` | Logout clears the active persisted browser session. | Passing 2026-07-22 |
| S3/R2-S2 | Automated E2E `apps/frontend/e2e/account-workspace.spec.ts#LC-001 completes the account and protected workspace journey` | The browser cannot reuse a captured session after sign-out. | Historical passing 2026-07-13 |
| S3/R2-S3 | Automated test `apps/frontend/src/app/App.test.tsx#LC-001/S3/R2-S3 gives actionable recovery guidance when sign-out is throttled` | Rate-limited sign-out preserves protected context and gives actionable recovery. | Passing 2026-07-22 |
| S3/R3-S1 | Automated test `apps/frontend/src/app/RoutePresentation.test.tsx#LC-001/S3/R3-S1 sets the title and focuses the destination heading` | A destination sets its title and focuses the primary heading. | Passing 2026-07-22 |
| S3/R3-S1 | Automated test `apps/frontend/src/app/RoutePresentation.test.tsx#LC-001/S3/R3-S1 applies after an authenticated redirect` | Authenticated redirect applies the Worlds title and heading focus. | Passing 2026-07-22 |
| S3/R3-S2 | Automated test `apps/frontend/src/app/RoutePresentation.test.tsx#LC-001/S3/R3-S2 preserves focus chosen while a destination is loading` | Deliberately chosen focus survives a delayed destination data transition. | Passing 2026-07-22 |

#### Verification Gaps

- `S3/R1-S5`: No current reproducible private-deployment evidence proves same-origin HTTPS traffic and unavailable LAN/public listeners. The accepted session ADR continues to require production `Secure` cookie verification before deployment.

#### Story Notes

- Background session revalidation preserves public auth forms but suppresses protected workspace content until the server session is confirmed.
- World-catalog content and empty-state behavior are owned by `LC-002/S1`.

## Cross-Story Concerns

- AdonisJS remains authoritative for validation, authentication, authorization, and session state.
- Browser API traffic stays on the frontend origin and reaches AdonisJS through `/api`; split-host browser deployment is not supported by the current session/CSRF boundary.
- Public auth and CSRF bootstrap routes are rate limited in-process; a shared ingress or distributed limit is required before horizontal scaling.
- PostgreSQL migration tests require an explicitly acknowledged, identifiable disposable target. A guard refusing an unacknowledged target proves that guard, not a production migration or recovery flow.

## Open Decisions

- No blocking product decision. Production/private HTTPS and recovery validation require a deliberately provisioned operational environment rather than inferred local proof.

## Completion Criteria

This Epic is healthy when:

- Embedded Stories and their implementation/verification states match the running account boundary.
- Every implemented Requirement has a concrete primary governing anchor.
- Every Scenario has focused evidence or an explicit current verification gap.
- Local account/session behavior remains covered by backend and frontend tests, while production/recovery assertions are proved through reproducible operational records before their gaps are removed.
- Related changes, ADRs, and support documentation do not contradict this Epic.

## Notes

- The closed account-workspace Change accepted the account/session capability. Later World and Adventure feature behavior remains owned by `LC-002` and `LC-003`.
