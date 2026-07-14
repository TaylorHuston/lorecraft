# ADR: AdonisJS API-First Backend

- Status: Accepted
- Date: 2026-07-12
- Related change: `docs/changes/2026-07-12-account-workspace-entry/`
- Related Epics / Stories: `LC-001/S1`, `LC-001/S2`, and `LC-001/S3`

## Context

Lorecraft begins with a creator-facing web client but plausibly needs mobile, administrative, automation, integration, and playable Adventure clients. Its time-aware canon and continuity rules must remain authoritative and consistent across those clients. The repository is already scaffolded around an AdonisJS backend and separate frontend workspace.

## Decision

Use AdonisJS as Lorecraft's API-first backend authority. Product rules, validation, authorization, use-case orchestration, and persistence access belong behind intentional backend application APIs. Web and future clients are delivery adapters and must not become the sole implementation of durable behavior. Inertia may be used for a future bounded surface, but it is not the primary application contract.

## Options Considered

### Option 1: AdonisJS API-First Backend

- Summary: Keep the backend independently addressable and serve all clients through application APIs.
- Pros: Reusable behavior, clear authority, independent clients, strong boundary testing, and natural support for jobs and integrations.
- Cons: More explicit contract, CORS, authentication, and client-state work for the first web experience.

### Option 2: AdonisJS With Inertia As The Primary Boundary

- Summary: Couple the initial React experience to server-driven page props and navigation.
- Pros: Faster integrated web development and straightforward session behavior.
- Cons: Optimizes for one web client and defers extraction of reusable APIs until alternate clients exist.

### Option 3: Full-Stack Frontend Framework Owns The Backend

- Summary: Put backend behavior primarily in a web framework's server routes or actions.
- Pros: One framework and deployment surface for the initial web application.
- Cons: Weakens the intended client-independent authority boundary and makes substantial stateful domain behavior easier to couple to UI concerns.

## Consequences

- Positive: Lorecraft gains one authoritative behavior layer reusable by web, mobile, jobs, and future integrations.
- Negative: The initial SPA must deliberately configure API contracts, sessions, CORS, CSRF, and error translation.
- Follow-up: Keep domain/application behavior out of controllers and persistence models; document API contracts and add OpenAPI when external or non-TypeScript consumers justify it.

## Validation

The account change must demonstrate that the React client completes signup, sign-in, session restoration, protected access, and sign-out entirely through documented AdonisJS APIs. Backend tests must prove the same rules without the browser, and client tests must not duplicate server authority.

Validated on 2026-07-13 by the PostgreSQL-backed backend suite and desktop/mobile Playwright journey. The React client completes the account lifecycle through AdonisJS endpoints while server-owned validation, authentication, and authorization remain independently tested.

## Reconsider When

Revisit if Lorecraft demonstrably has only one server-rendered web surface, if API separation repeatedly adds cost without enabling another client or integration, or if a different backend platform materially improves the domain and operational model.
