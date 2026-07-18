# Proposal: Storybook UI Workbench

## Why

Lorecraft has an established React frontend and emerging visual directions, but no executable isolated workspace for developing component states, responsive compositions, and accessibility behavior before those components are connected to product routes. Static design references alone cannot prove what the production code supports.

## What Changes

- Add Storybook to the Vite React frontend.
- Configure component, interaction, and accessibility testing through the current Storybook/Vitest integration.
- Add Lorecraft-owned representative stories that prove the workbench can render responsive application compositions and stateful UI components.
- Keep Storybook stories coupled to production components rather than maintaining separate mock implementations.

## Epic Actions

- None. This change adds developer tooling and isolated UI prototypes; it does not make playable Adventure behavior part of implemented product truth.

## Scope Decisions

- Storybook lives in apps/frontend and uses the existing Vite, React, TypeScript, CSS Modules, and shared-token stack.
- Stories use production components and deterministic local fixtures.
- Initial Adventure-oriented compositions are explicitly isolated prototypes with no application route, backend contract, persistence, or Epic behavior claim.
- Storybook interaction and accessibility checks may become verification evidence only when executed; a story file alone is not verification.

## Non-Goals

- Adding playable Adventure routes or Game Master behavior.
- Connecting stories to AdonisJS or a live provider.
- Publishing a public component library.
- Introducing Tailwind, shadcn, or a custom utility-class system.
- Replacing application-level Playwright journeys or domain/application tests.

## Impact

- Product: no shipped product behavior.
- Code: frontend development configuration, isolated components, stories, and test setup.
- Tests: Storybook browser tests and accessibility checks.
- Docs: this Change and concise frontend workflow guidance if needed.

## Release Communication Impact

- Required: no
- Reason: developer tooling and isolated prototype work are not user-facing release changes.

## Open Questions

- Hosted Storybook publication and external visual-regression services are deferred until local usage proves valuable.
