# Design: Account Workspace Entry

## Context

The repository began this change as an AdonisJS 7 API-first monorepo scaffold with an empty frontend workspace, SQLite persistence, and a partial token-oriented account API. The change now contains a Vite React client, PostgreSQL configuration, and a session-based browser account flow. Disposable PostgreSQL and browser verification pass; manual UI confirmation, a dedicated Neon provider smoke check, and production HTTPS cookie proof remain pending.

This change establishes the smallest secure application shell onto which the private World bible can be built. The server remains authoritative and reusable; the initial React client is one delivery adapter.

## Goals / Non-Goals

**Goals:**

- Provide a complete account signup, sign-in, session restoration, sign-out, and protected workspace journey.
- Use one undifferentiated account model.
- Establish PostgreSQL/Neon as durable application storage.
- Establish an API-first AdonisJS authority boundary and a type-safe React client integration.
- Prove the critical journey with focused backend, frontend, and browser evidence.

**Non-Goals:**

- Creating, listing, or editing Worlds.
- Account roles, creator/player account types, or collaboration permissions.
- Email verification, password recovery, social login, or profile management.
- A public API, OpenAPI publication, mobile client, or deployment release.

## Planning Interview / Story Refinement

- Scope boundary reviewed: account access ends at an authenticated empty workspace; World behavior is a later change.
- User decisions: Vite React SPA; Neon PostgreSQL; secure AdonisJS session cookies; Tuyau with TanStack Query; automatic login after signup; no account roles; no display name, verification, or recovery.
- Assumptions: the existing token guard remains for future clients but is not exposed to browser storage; the initial workspace can be empty without a disabled World action.
- Deferred scope: Worlds, profiles, role taxonomy, external identity providers, recovery, verification, mobile, and public API documentation.
- Story boundaries challenged: the three Stories map to first-use, repeat-use, and access-control journeys rather than individual screens or controls.
- Requirements refined: validation, duplicate-account handling, generic credential failures, refresh restoration, authenticated-route behavior, server-side protection, and logout invalidation are observable rules.
- Scenario gaps considered: invalid input, duplicate email, invalid credentials, anonymous direct access, refresh recovery, authenticated auth-page access, and post-logout API denial.
- Open questions that block implementation: none. Hosted Neon verification still requires a fresh disposable credential through ignored environment configuration.

## Epic Changes

### Create Epic: LC-001 Account Identity And Workspace Access

- Directory: `docs/epics/lc-001-account-identity-and-workspace-access/`
- File: `docs/epics/lc-001-account-identity-and-workspace-access/epic.md`

#### Epic

An account holder can securely enter and leave a private Lorecraft workspace, providing the identity and ownership boundary required by future World capabilities.

#### Story S1: New User Enters Their Workspace

As a new user, I want to create an account and enter my private workspace, so that I can begin using Lorecraft.

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

##### Implemented By

Implemented on `change/account-workspace-entry`; the current code map lives in `LC-001/S1`.

##### Verified By

Verified by focused frontend behavior tests, PostgreSQL-backed backend route tests, and the desktop/mobile Playwright account journey recorded in `LC-001/S1`.

##### Verification Gaps

- Manual UI confirmation and production HTTPS cookie verification remain pending.

#### Story S2: Returning User Resumes Their Workspace

As a returning user, I want Lorecraft to recognize or re-authenticate me, so that I can resume my private workspace without unnecessary friction.

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

The system SHALL restore a valid existing session across page refreshes, keep authenticated users out of the signup and sign-in journey, and preserve an unauthenticated visitor's unfinished public auth form during background session revalidation.

###### Scenario R2-S1: Workspace Refresh

- WHEN an authenticated user refreshes the workspace while their session remains valid
- THEN the workspace returns without requiring another sign-in.

###### Scenario R2-S2: Authenticated User Opens An Auth Route

- WHEN an authenticated user opens the signup or sign-in route
- THEN the client returns them to `Your Worlds`.

###### Scenario R2-S3: Public Auth Draft Survives Session Revalidation

- WHEN an unauthenticated visitor partially completes signup or sign-in
- AND returning window focus triggers background session revalidation
- THEN the public form remains mounted while the session check is pending
- AND the visitor's unfinished input remains available when the server still reports no authenticated session
- AND a failed background check leaves the draft mounted with a non-destructive retry action.

##### Implemented By

Implemented on `change/account-workspace-entry`; the current code map lives in `LC-001/S2`.

##### Verified By

Verified by focused frontend behavior tests, PostgreSQL-backed credential/session tests, and the desktop/mobile Playwright account journey recorded in `LC-001/S2`.

##### Verification Gaps

- Manual UI confirmation and production HTTPS cookie verification remain pending.

#### Story S3: User Controls Protected Workspace Access

As an account holder, I want my workspace protected and my session terminable, so that only I can access my private Lorecraft data.

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

##### Implemented By

Implemented on `change/account-workspace-entry`; the current code map lives in `LC-001/S3`.

##### Verified By

Verified by focused client behavior and anonymous API protection tests plus PostgreSQL-backed Playwright proof of logout invalidation and invalidated-cookie replay, as recorded in `LC-001/S3`.

##### Verification Gaps

- Manual UI confirmation remains pending.

## Epic File Rules

- Stories live inside the Epic `epic.md` file.
- The Epic created during apply must preserve the Story, Requirement, and Scenario IDs above.
- No existing Epic truth is superseded because this repository has no existing Epic artifacts.

## Technical Options

### Option 1: AdonisJS API With A Vite React Client

- Summary: AdonisJS owns application behavior and HTTP APIs; a Vite React SPA consumes the API through Tuyau and TanStack Query.
- User impact: Provides a focused, responsive account shell without coupling future product behavior to one presentation layer.
- Implementation complexity: Moderate; requires explicit cookie, CSRF, CORS, client routing, and API-contract configuration.
- Reversibility: High at the client layer; backend capabilities remain reusable by another UI.
- Client surfaces: Web now; mobile, CLI, jobs, and integrations remain plausible.
- API / contract shape: AdonisJS routes produce a generated TypeScript contract consumed by Tuyau; OpenAPI is deferred.
- Frontend/backend boundary: UI owns presentation and client-local state; AdonisJS owns validation, authentication, authorization, and application behavior.
- Data / schema impact: Migrate the scaffold to PostgreSQL and retain users, passwords, sessions, and tokens in server-owned persistence.
- Auth / security impact: HTTP-only session cookies for web, CSRF protection for state-changing browser requests, and no bearer tokens in browser storage.
- Testability: Strong server route/integration tests, isolated component behavior, and deterministic browser journeys.
- Operational risk: Requires a same-origin `/api` proxy and a reachable PostgreSQL environment.
- Fit with project conventions: Matches the repository's API-first shape and workspace AdonisJS guidance.

### Option 2: AdonisJS With Inertia

- Summary: Serve the React web experience through AdonisJS and Inertia while adding separate APIs only when another client appears.
- User impact: Similar initial experience with less client/API plumbing.
- Implementation complexity: Lower initially, but future mobile or alternate clients require extracting APIs from server-driven page behavior.
- Reversibility: Moderate; React views can be retained, but navigation, data loading, and validation contracts become Inertia-specific.
- Client surfaces: Optimized for one web client.
- API / contract shape: Inertia page props are the primary contract; future clients need a second delivery contract.
- Frontend/backend boundary: Server and web presentation are more tightly integrated.
- Data / schema impact: Same PostgreSQL migration.
- Auth / security impact: Session authentication is natural and secure, but not itself reusable by native clients.
- Testability: Strong server-driven feature tests; less direct proof of reusable HTTP capabilities.
- Operational risk: Low initially, with architectural extraction risk later.
- Fit with project conventions: Valid AdonisJS approach, but weaker fit for the explicit API-first and future-client direction.

### Option 3: Independent SPA With Bearer Tokens And Immediate OpenAPI

- Summary: Keep the React SPA fully independent, authenticate with opaque tokens, and publish OpenAPI-generated contracts immediately.
- User impact: Similar screens, but token lifecycle complexity is exposed earlier than needed.
- Implementation complexity: Highest due to token storage, revocation, refresh behavior, and dual contract-generation concerns.
- Reversibility: High in theory, but early public-contract commitments can slow iteration.
- Client surfaces: Broadest immediate portability.
- API / contract shape: OpenAPI is the shared contract for all clients.
- Frontend/backend boundary: Strict HTTP-only separation.
- Data / schema impact: Same PostgreSQL migration plus more token lifecycle state.
- Auth / security impact: Browser token storage increases exposure and requires more defensive lifecycle design.
- Testability: Strong contract testing, with additional security cases.
- Operational risk: More moving parts before a second client or public consumer exists.
- Fit with project conventions: Overbuilds the first product journey.

## Selected Approach

Use Option 1. AdonisJS is the authoritative API-first backend, and the Vite React SPA is the initial client. The backend exposes session-aware account endpoints with server-side validation and authorization. Tuyau generates the TypeScript route contract consumed through TanStack Query; the frontend sends credentials and CSRF tokens but never stores an authentication bearer token. Browser requests use the frontend origin and a `/api` proxy forwards them to AdonisJS, avoiding a deployment-specific cross-host XSRF contract.

Configure Lucid for PostgreSQL through `DATABASE_URL` using the standard `pg` driver. A dedicated Neon project with isolated `main`, `develop`, and resettable `test` branches is the intended hosted topology, not yet a provisioned or provider-verified environment. Migrations remain portable PostgreSQL migrations; application code must not depend on Neon-specific data APIs. Applied migrations are immutable: the historical users migration retains its unused nullable `full_name` compatibility column, while a forward migration transactionally normalizes existing emails and adds the normalized-email constraint. A normalized collision fails and rolls back without partial data or schema changes. Tests must never reset or mutate production or shared development data. Test and E2E launchers must reject the effective normal application target after normalizing PostgreSQL host and schema semantics, require explicit host/database components and an identifiable disposable database or schema, neutralize inherited PostgreSQL connection overrides in child processes, and retain the framework's production migration protection rather than bypassing it unconditionally.

Signup validates email, password, and confirmation, creates the account transactionally, establishes a session, and returns the authenticated account representation. Sign-in, current-account, and sign-out endpoints form the browser auth contract. Existing opaque-token capability may remain for future clients, but SPA routes and client storage must not consume it.

The React client uses route guards based on the current-account query, dedicated signup/sign-in forms, and an authenticated `Your Worlds` route. The current-account query revalidates whenever the window regains focus, suppressing protected UI while the check is unresolved so an expired or externally revoked session cannot leave stale private state visible. Public auth routes distinguish initial session loading from background revalidation so unfinished form input remains mounted during successful and failed anonymous checks, with a non-destructive retry when refresh fails. Protected revalidation restores the prior workspace focus after success, moves focus to sign-in when the session has ended, and focuses the retry action when the check itself fails. Retry controls retain a minimum 44px touch target. Successful sign-out cancels any in-flight session query before clearing its cache. CSS Modules and shared CSS custom properties follow workspace styling defaults. The workspace intentionally contains no World-creation action in this change.

Signup and sign-in accept JSON only. A server middleware boundary rejects unsupported auth content types and declared payloads over 16 KB before the router body parser, session, CSRF, and route-level throttles run. The JSON parser enforces the same limit for unknown-length streams, and the exception handler normalizes that rejection to the same auth error contract. Multipart auto-processing is disabled unless a future change explicitly names an upload route.

## Client And API Boundary

- Current clients: Vite React web SPA.
- Plausible future clients: native mobile, alternate web clients, CLI/automation, administrative tooling, and playable Adventure clients.
- Reusable product capabilities: account creation, authentication, session termination, account identity retrieval, and future World operations.
- API or typed contract: AdonisJS HTTP routes with Tuyau-generated TypeScript contracts and TanStack Query integration.
- OpenAPI plan, if HTTP-facing: defer until a non-TypeScript, public, or external integration requires a language-neutral contract.
- Backend platform exposed directly to clients?: Yes, through intentional application APIs; persistence models and infrastructure details remain private.
- Client-specific presentation or local state: form state, navigation, loading/error presentation, and workspace layout.
- Rationale: one authoritative backend serves future clients while the first web client retains freedom to change independently.

## Alternatives Considered

- AdonisJS with Inertia:
  - Rejected as the primary boundary because the product already anticipates mobile and other clients.
- Browser bearer-token authentication:
  - Rejected because session cookies provide a smaller and safer browser attack surface.
- Immediate OpenAPI publication:
  - Deferred because Tuyau provides the required type safety for the only current client without prematurely stabilizing a public contract.
- Supabase:
  - Rejected for this change because Lorecraft needs hosted PostgreSQL, not a second application/auth platform alongside AdonisJS.
- Local-only PostgreSQL or continued SQLite:
  - Rejected because shared hosted development and PostgreSQL behavior are required now; Neon branching also provides practical environment isolation.

## Why This Approach

It delivers the smallest complete user journey while preserving the architecture Lorecraft expects to need: authoritative backend behavior, changeable clients, portable PostgreSQL data, and secure browser authentication. Each major choice remains replaceable at a defined boundary rather than leaking into domain behavior.

## ADRs

- Required: yes
- ADR paths:
  - `docs/adrs/2026-07-12-adonisjs-api-first-backend.md`
  - `docs/adrs/2026-07-12-postgresql-on-neon.md`
  - `docs/adrs/2026-07-12-browser-session-authentication.md`
  - `docs/adrs/2026-07-12-react-web-client-and-typed-api-contract.md`
- Decision summary: AdonisJS owns an API-first authority boundary; PostgreSQL on Neon is the portable datastore; browser auth uses server sessions; the initial React client consumes a Tuyau contract.
- Reconsider when: a selected boundary prevents a validated client or operational need, generated contracts drift, Neon materially constrains standard PostgreSQL behavior, or session deployment topology becomes impractical.

## Implementation Constraints

- Supply any Neon test credential only through an ignored local environment file or process environment.
- Never commit, log, document, or expose database credentials to the client bundle.
- Use one `User`/account concept with no role or account-type column.
- Keep server-side validation and authorization authoritative.
- Enable CSRF protection for state-changing session-authenticated browser requests.
- Revalidate the current-account query whenever an open browser window regains focus.
- Reject non-JSON and declared-oversized signup and sign-in requests before body parsing, enforce the same bound while parsing unknown-length streams, and do not enable multipart auto-processing without an explicit upload route.
- Keep browser API traffic on the Lorecraft web origin and proxy `/api` to the AdonisJS service in development and deployment.
- Configure cookie security appropriately for local development and production, including HTTP-only, secure-in-production, and an intentional SameSite policy.
- Do not build nonfunctional World controls to imply later behavior.

## Verification Strategy

- Focused automated tests:
  - Backend route/integration tests for validation, normalization, duplicate handling, generic credential failure, session creation/restoration/invalidation, protected APIs, pre-parser auth request rejection, normalized unknown-length stream limits, and transactional upgrade from the historical users schema.
  - Frontend tests for form validation presentation, auth-state routing, focus-triggered session revalidation, loading/error focus recovery, and the intentional empty workspace.
- Broad supporting gates:
  - Root lint, test, typecheck, and build commands.
  - Migration checks against disposable PostgreSQL in CI, followed by a focused smoke check against the resettable Neon test database.
- Deterministic E2E:
  - Playwright journeys for signup, automatic entry, refresh restoration, sign-out, protected-route denial, valid return sign-in, invalid credentials, and duplicate signup.
- Live-provider or external-service playtests:
  - Neon connectivity and migrations in an isolated `test` branch; no destructive production or shared-development checks.
- Manual UI confirmation:
  - User confirms signup/sign-in clarity, workspace transition, refresh behavior, empty state, responsive layout, and sign-out flow.
- Debug/log inspection:
  - Confirm errors omit passwords, cookies, tokens, and connection strings; inspect request outcomes only where needed for diagnosis.

## Decisions

- Lorecraft has accounts, not creator/player account types.
- Account creation requires only email, password, and confirmation.
- Successful signup authenticates immediately.
- AdonisJS remains the API-first backend authority.
- The first client is a Vite React TypeScript SPA.
- Browser authentication uses AdonisJS sessions, while opaque-token capability remains available for future clients.
- PostgreSQL on Neon replaces SQLite for application environments.
- Tuyau and TanStack Query provide the initial typed client contract; OpenAPI is deferred.

## Risks / Trade-Offs

- A separate SPA requires the same-origin `/api` proxy, cookie, and CSRF configuration to remain aligned across environments.
- Hosted development tests depend on network availability and disciplined database isolation.
- Tuyau is TypeScript-specific; a language-neutral contract will still be needed if non-TypeScript or public consumers arrive.
- Retaining both session and token guards creates two auth mechanisms to maintain, though only the session path is in scope now.
