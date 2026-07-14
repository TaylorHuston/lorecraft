# Proposal: Account Workspace Entry

## Why

Lorecraft needs a real first user journey before World-building capabilities can be added. A person must be able to create an account, return securely, and reach a private workspace that can later own their Worlds. The current repository has a partial AdonisJS authentication scaffold and no creator-facing client or production database configuration.

## What Changes

- Add a Vite, React, and TypeScript web client for account creation, sign-in, session restoration, sign-out, and an authenticated empty `Your Worlds` workspace.
- Move the AdonisJS backend from local SQLite to PostgreSQL hosted by Neon.
- Use secure AdonisJS session cookies for the browser while retaining opaque access-token capability for future non-browser clients.
- Establish a typed web-to-API contract with Tuyau and TanStack Query.
- Protect the workspace and account APIs consistently at both the client and server boundaries.

## Epic Actions

### New Epic Directories

- Create `docs/epics/lc-001-account-identity-and-workspace-access/`.
- Create `docs/epics/lc-001-account-identity-and-workspace-access/epic.md` during `/sdd-apply`.

### Existing Epic Directory Updates

- None proposed.

## Epic Story Changes

- Add `LC-001/S1`: New user creates an account and enters the workspace.
- Add `LC-001/S2`: Returning user signs in and resumes the workspace.
- Add `LC-001/S3`: User controls and protects their authenticated session.

## Scope Decisions

- Confirmed:
  - Lorecraft has one account model. There are no creator, player, or other account types in this change.
  - Signup asks only for email, password, and password confirmation.
  - Successful signup creates a browser session and enters the workspace immediately.
  - The initial authenticated destination is an intentional empty `Your Worlds` workspace.
  - Browser authentication uses secure HTTP-only AdonisJS session cookies.
  - The web client uses Vite, React, TypeScript, Tuyau, and TanStack Query.
  - The backend uses portable PostgreSQL through the standard driver. A dedicated Neon project with isolated `main`, `develop`, and resettable `test` branches is the intended hosted topology and remains pending provisioning and provider smoke verification.
- Deferred:
  - World creation and editing.
  - Account roles or creator/player account distinctions.
  - Display names, profiles, email verification, password recovery, social login, and multi-factor authentication.
  - Public or third-party API contracts and OpenAPI generation.
  - Mobile and other clients, although the backend boundary must remain reusable by them.
- Assumptions:
  - One account will eventually own multiple private Worlds.
  - The existing opaque-token guard can remain available for later non-browser clients without being used by the SPA.
  - Neon development and test databases are acceptable dependencies for this proof-oriented first application change.
- User decisions that shaped the Story/Requirement split:
  - Account creation and automatic entry form one complete first-use Story.
  - Returning authentication and session restoration form a separate repeat-use Story.
  - Authorization, sign-out, and the empty workspace form the access-control Story.
  - Product persona language may describe a creator, but account data and behavior must use only `user` or `account` terminology.

## Change Folder

- Active location: `docs/changes/2026-07-12-account-workspace-entry/`
- Closed location: `docs/changes/closed/2026-07-12-account-workspace-entry/`

## Impact

- Product: Establishes Lorecraft's first complete account and private-workspace journey.
- Code: Adds the web client, adapts backend authentication for session-based browser use, configures PostgreSQL, and introduces the typed API client boundary.
- Tests: Adds backend route/integration tests, frontend behavior tests, and Playwright coverage for the critical account journey.
- Docs: Creates `LC-001`, updates public setup and architecture documentation during implementation, and corrects scaffold-only claims as behavior becomes real.
- ADRs:
  - `docs/adrs/2026-07-12-adonisjs-api-first-backend.md`
  - `docs/adrs/2026-07-12-postgresql-on-neon.md`
  - `docs/adrs/2026-07-12-browser-session-authentication.md`
  - `docs/adrs/2026-07-12-react-web-client-and-typed-api-contract.md`

## Release Communication Impact

- Required: yes
- Record / section: root `CHANGELOG.md`, `[Unreleased]`
- Public summary: Users can create an account, sign in, stay signed in across refreshes, sign out, and access their private `Your Worlds` workspace.

## Open Questions

- No product or architecture questions block implementation.
- Hosted Neon verification requires a fresh disposable test credential supplied only through ignored local environment configuration.
