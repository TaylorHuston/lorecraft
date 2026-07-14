# ADR: React Web Client And Typed API Contract

- Status: Accepted
- Date: 2026-07-12
- Related change: `docs/changes/2026-07-12-account-workspace-entry/`
- Related Epics / Stories: `LC-001/S1`, `LC-001/S2`, and `LC-001/S3`

## Context

Lorecraft needs an initial creator-facing web experience while keeping durable product behavior independent from its UI. The current frontend workspace is empty. The backend and initial client are TypeScript, but there is not yet a public or non-TypeScript API consumer.

## Decision

Build the initial web client as a Vite, React, and TypeScript SPA. Consume AdonisJS APIs through Tuyau-generated TypeScript contracts integrated with TanStack Query. Use CSS Modules with shared CSS custom properties for styling. Defer OpenAPI until a public, external, or non-TypeScript consumer creates a concrete need for a language-neutral contract.

## Options Considered

### Option 1: Vite React With Tuyau

- Summary: Independent React SPA with framework-native typed AdonisJS contracts.
- Pros: Fast client tooling, compile-time route types, clear client/server separation, and low contract overhead for an all-TypeScript stack.
- Cons: Tuyau does not provide a language-neutral public contract and adds AdonisJS-specific client generation.

### Option 2: AdonisJS Inertia React

- Summary: Render React pages through server-driven Inertia navigation and props.
- Pros: Integrated routing, forms, validation, and session behavior.
- Cons: Couples the web client more tightly to AdonisJS and does not establish the desired reusable API boundary.

### Option 3: Vite React With OpenAPI-Generated Client

- Summary: Define a language-neutral OpenAPI contract immediately and generate the TypeScript client.
- Pros: Broad interoperability and explicit public contract semantics.
- Cons: More authoring and synchronization overhead before a second consumer exists.

## Consequences

- Positive: The first UI can evolve independently while retaining end-to-end TypeScript feedback against backend routes.
- Negative: A future non-TypeScript client requires adding and maintaining OpenAPI or an equivalent language-neutral contract.
- Follow-up: Keep route responses intentional and application-oriented; centralize query keys and error translation; introduce OpenAPI when the reconsideration threshold is met.

## Validation

Type checking must detect incompatible route inputs or outputs across the backend and frontend. Frontend tests and Playwright must prove loading, error, auth-routing, and workspace behavior without duplicating backend authorization rules.

Validated on 2026-07-13 by root type checking, generated Tuyau registry compilation, 26 frontend tests, and passing desktop/mobile Playwright journeys.

## Reconsider When

Revisit if a non-TypeScript or public client becomes active, Tuyau generation becomes unreliable, server rendering becomes an essential user requirement, or Vite SPA deployment materially harms the desired experience.
