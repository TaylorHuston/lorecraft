# Lorecraft Repository Guide

Lorecraft is the production-oriented successor to the `lorecraft-mvp` prototype. It is a creator-first, API-oriented application for maintaining authoritative, time-aware fictional Worlds. The initial product is a private world bible for individual creators; AI assistance, publishing, collaboration, and playable Adventures remain later capabilities.

When private workspace planning context is available, resolve it through the workspace's idea-to-repository metadata. Do not copy private PRDs, planning notes, or vault paths into this public repository.

## Product Boundaries

- The `World` is the primary product artifact and authoritative source of objective fictional canon.
- The creator decides what becomes canon. Automated checks and AI integrations may surface, analyze, or propose changes but must not silently commit them as truth.
- Canon is time-aware. Do not model changing facts as though a World has only one timeless current state.
- Characters and groups may hold beliefs, knowledge, secrets, or rumors that differ from objective World truth.
- The product must remain medium-agnostic. Avoid assumptions that every World exists for a novel, game, tabletop campaign, or any other single format.
- Start with intelligent defaults for common worldbuilding concepts and add structure as proven needs emerge. Preserve a path for creator-defined concepts without prematurely building a universal schema system.
- Canonical works may contribute creator-approved changes to a World and should eventually support source provenance.
- Playable Adventures are an eventual core capability, but they are non-canonical branches derived from a World. Adventure state must not mutate source canon by default.
- The world bible must provide value without an LLM. Keep AI providers behind replaceable adapters and treat their output as untrusted external input.

## Initial Scope Guardrails

The first application capabilities should serve an individual creator maintaining a private world bible. Do not introduce the following without an explicit product decision and tracked SDD change:

- a full novel, screenplay, or game-writing environment
- public publishing or reader-facing wiki features
- multi-user collaboration and canon-approval workflows
- automated source ingestion or LLM-assisted canon mutation
- playable Adventures or Game Master behavior
- combat, inventory, character stats, rulesets, multiplayer, or marketplace mechanics

These are deferred capabilities, not necessarily permanent product non-goals.

## Repository Boundaries

- `apps/backend/` is the AdonisJS API and authoritative application backend.
- `apps/frontend/` is the Vite, React, and TypeScript creator-facing web client.
- `docs/` owns public architecture guidance and canonical SDD artifacts for implemented behavior.
- Future reusable libraries belong under `packages/` only when a concrete shared boundary exists.
- Keep domain and application behavior independent of HTTP controllers, UI frameworks, persistence models, and AI provider SDKs.
- Treat web, mobile, administrative, CLI, job, and future game surfaces as adapters to shared application behavior.
- Treat generated `.adonisjs/` output, local SQLite files, dependencies, build output, logs, and environment files as local artifacts.

## SDD And Documentation

- Use `docs/epics/` for durable implemented capability truth and behavior-to-code evidence.
- Use `docs/changes/` for active SDD changes and `docs/changes/closed/` after closeout.
- Use `docs/adrs/` for significant architectural decisions.
- Keep the public README and supporting docs aligned with accepted product direction without copying private planning material.
- Do not describe proposed or scaffold-only behavior as implemented.

## Branch Policy

- `main` is production.
- `develop` is integration.
- Code changes use `change/`, `fix/`, or `misc/` branches from `develop` once the integration branch exists.
- Planning and documentation-only changes may happen on `develop`, or on `main` when Taylor explicitly authorizes it.
- Do not commit application code directly to `main` after initial repository setup.

## Commands

- `npm run dev` starts workspace development tasks.
- `npm run lint` runs workspace linting.
- `npm run test` runs workspace tests.
- `npm run typecheck` runs workspace type checks.
- `npm run build` builds all applications.

Use the root npm workspace and Turborepo commands. Do not run repository-wide Git operations from the surrounding vault repository.

## Verification

- Apply BDD/TDD to durable domain and application behavior.
- Prefer fast tests of product rules without HTTP, database, UI, or provider dependencies.
- Add boundary and integration tests for persistence, API contracts, authorization, and external adapters where those concerns become real.
- Add focused end-to-end coverage for critical creator workflows once a frontend exists.
- Run the smallest relevant lint, test, typecheck, build, and manual checks before declaring work complete.
- Report honestly when a command succeeds without executing meaningful tests; verification must identify which backend, frontend, or browser behavior actually ran.
