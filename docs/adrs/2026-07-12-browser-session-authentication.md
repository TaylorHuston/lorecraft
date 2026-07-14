# ADR: Browser Session Authentication

- Status: Accepted
- Date: 2026-07-12
- Related change: `docs/changes/2026-07-12-account-workspace-entry/`
- Related Epics / Stories: `LC-001/S1`, `LC-001/S2`, and `LC-001/S3`

## Context

The AdonisJS scaffold supports both opaque access tokens and session authentication. The first client is a browser SPA, but future native or integration clients may need token authentication. The browser path should minimize credential exposure without removing future capability.

## Decision

Use AdonisJS server-side sessions carried by secure HTTP-only cookies for the browser client. Serve browser API requests through the Lorecraft web origin, proxying `/api` to AdonisJS in development and deployment. Protect state-changing browser requests against CSRF, and do not store bearer tokens in browser-accessible storage. Retain opaque access-token capability as a separate future-client mechanism, not as the SPA's auth path.

## Options Considered

### Option 1: Server Session Cookie

- Summary: Authenticate browser requests through an opaque HTTP-only session cookie.
- Pros: Keeps credentials out of JavaScript, supports explicit server invalidation, and fits browser security conventions.
- Cons: Requires CSRF, cookie, origin, and session-store configuration.

### Option 2: Opaque Bearer Token In The SPA

- Summary: Return an AdonisJS access token and store it for browser requests.
- Pros: Simple API header model and directly reusable by non-browser clients.
- Cons: Browser storage exposes reusable credentials to script compromise and adds lifecycle/revocation complexity.

### Option 3: External Identity Provider

- Summary: Delegate account authentication to a hosted auth service.
- Pros: Provides mature recovery, verification, and social-login capabilities.
- Cons: Adds dependency and integration complexity before those capabilities are in scope.

## Consequences

- Positive: The browser receives strong default credential isolation and immediate logout invalidation.
- Negative: Web deployments must preserve a same-origin `/api` proxy even when the frontend and backend run as separate services.
- Follow-up: Add email verification, recovery, MFA, token issuance, and session-management UI only through later product changes.

## Validation

Automated browser tests prove the same-origin proxy topology, session creation, restoration, protection, CSRF behavior, logout invalidation, and denial when an invalidated cookie is replayed. Browser inspection confirms the session cookie is HTTP-only and no bearer token is stored in localStorage, sessionStorage, or readable cookies. Production HTTPS verification of the cookie's `Secure` attribute was explicitly deferred by the user on 2026-07-14 and remains required before production deployment.

## Reconsider When

Revisit if the web and API cannot share one browser origin, if a native client becomes current scope, or if external identity requirements outweigh maintaining first-party credentials.
