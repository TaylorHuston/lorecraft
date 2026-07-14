# Design: Storybook UI Workbench

## Context

The Lorecraft frontend is a Vite React TypeScript application with Vitest, Testing Library, Playwright, CSS Modules, and shared CSS custom properties. Storybook 10 supports the React Vite framework and a Vitest browser integration that can execute stories, interaction tests, and accessibility checks in Chromium.

## Goals

- Make component states and responsive compositions executable in isolation.
- Reuse production components, styles, providers, and fixtures.
- Keep UI evidence complementary to backend, application, and end-to-end tests.
- Establish a small catalog shaped by real Lorecraft needs rather than generated Storybook examples.

## Selected Approach

Configure Storybook inside apps/frontend with the React Vite framework, docs, accessibility, and Vitest integration. Import the production token stylesheet from the Storybook preview. Co-locate CSF story files with their production components. Use component args and deterministic fixtures for pure states; introduce MSW only when a story genuinely exercises the HTTP client boundary.

The first representative composition will remain an isolated future-facing gameplay workbench. It may model desktop and narrow responsive shells, but it will not be mounted in the application router or described in an Epic as implemented behavior.

## Storybook Catalog Shape

- Foundations: tokens, typography, controls, and state indicators only when they have production component ownership.
- Components: reusable semantic UI with meaningful visual or interactive states.
- Features: composed panels and workflows with deterministic fixtures.
- Screens: a small number of representative desktop/mobile compositions used for responsive and visual review.

## Verification Strategy

- Static Storybook build proves configuration and bundling.
- Storybook Vitest browser execution proves render and interaction behavior.
- Accessibility checks run with Storybook tests.
- Existing frontend unit tests continue to prove non-Storybook behavior.
- Application Playwright remains responsible for complete routed frontend/backend workflows.

## Constraints

- Do not duplicate durable business rules inside stories.
- Do not rely on a live backend, database, or provider for deterministic stories.
- Do not treat visual prototypes as accepted product behavior.
- Avoid stories for trivial wrappers that add no meaningful state, interaction, or responsive evidence.

## ADR Assessment

No ADR is required. Storybook is an incrementally adoptable frontend development tool and does not change Lorecraft's application or API authority boundaries.

## Epic Truth

No Epic is created or updated. If a later change mounts Adventure UI in the application, that change must define the relevant Epic, Stories, Requirements, Scenarios, implementation map, and verification evidence.
