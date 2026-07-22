# Lorecraft Repository Guide

## Purpose

Production successor to `lorecraft-mvp`: a creator-first, API-oriented application for maintaining authoritative, time-aware fictional Worlds. The current product is a private world bible for individual creators.

## Operating Order

1. Inspect the current branch, worktree status, and relevant diff. Preserve unrelated changes.
2. Read `README.md` and the root `package.json` scripts.
3. When this repo is inside an initialized SDD workspace, run `sdd context . --json`; read the returned `workflowPath` and the resolved private PRD when product scope matters. Never copy private planning paths or content into this public repository.
4. Before changing behavior, read the matching `docs/changes/<change>/` artifacts and affected `docs/epics/**/epic.md` files. Epic/Story truth must remain aligned with implementation.
5. Read relevant accepted ADRs and current public docs before changing architecture, contracts, persistence, auth, deployment, or UI conventions.

Stop before editing when product scope, canon authority, Epic ownership, repository context, branch policy, or a destructive/external mutation is ambiguous.

## Git And Mutation Policy

- `main` is production; `develop` is integration.
- Branch product or architecture work from `develop` as `change/<short-slug>`, defects as `fix/<short-slug>`, and maintenance as `misc/<short-slug>`.
- Planning-only edits may land on `develop`; documentation accompanying implementation travels with its implementation branch. Do not commit application code directly to `main`.
- Local commits require explicit user authorization or an invoked workflow that explicitly authorizes policy-compliant commits. Never stage unrelated files.
- Push, merge, deploy, rebase, amend, tag, publish, branch deletion, production migration, provider mutation, and other remote or destructive operations require explicit user authorization.

## Product Boundaries

- The `World` is the primary product artifact and authoritative source of objective fictional canon.
- The creator decides what becomes canon. Automated checks and AI integrations may surface, analyze, or propose changes but must not silently commit them as truth.
- Canon is time-aware. Do not model changing facts as though a World has only one timeless current state.
- Characters and groups may hold beliefs, knowledge, secrets, or rumors that differ from objective World truth.
- The product must remain medium-agnostic. Avoid assumptions that every World exists for a novel, game, tabletop campaign, or any other single format.
- Start with intelligent defaults for common worldbuilding concepts and add structure as proven needs emerge. Preserve a path for creator-defined concepts without prematurely building a universal schema system.
- Canonical works may contribute creator-approved changes to a World and should eventually support source provenance.
- Playable Adventures are a core capability, but they are non-canonical branches derived from frozen World canon. Adventure state must not mutate source canon by default, and creator-first World-bible work remains the primary product priority.
- The world bible must provide value without an LLM. Keep AI providers behind replaceable adapters and treat their output as untrusted external input.

## Initial Scope Guardrails

The first application capabilities should serve an individual creator maintaining a private world bible. Do not introduce the following without an explicit product decision and tracked SDD change:

- a full novel, screenplay, or game-writing environment
- public publishing or reader-facing wiki features
- multi-user collaboration and canon-approval workflows
- automated source ingestion or LLM-assisted canon mutation
- interactive Adventure turns, Game Master state mutation, or history revision beyond the implemented private opening/resume foundation
- combat, inventory, character stats, rulesets, multiplayer, or marketplace mechanics

These are deferred capabilities, not necessarily permanent product non-goals.

## Repository Map And Engineering Boundaries

- `apps/backend/` is the AdonisJS API and authoritative application backend.
- `apps/frontend/` is the Vite, React, and TypeScript creator-facing web client.
- `docs/` owns public architecture guidance and canonical SDD artifacts for implemented behavior.
- Future reusable libraries belong under `packages/` only when a concrete shared boundary exists.
- Keep domain and application behavior independent of HTTP controllers, UI frameworks, persistence models, and AI provider SDKs.
- Treat web, mobile, administrative, CLI, job, and future game surfaces as adapters to shared application behavior.
- Treat generated `.adonisjs/` output, local SQLite files, dependencies, build output, logs, and environment files as local artifacts.
- Follow OpenAPI for HTTP APIs whenever practical and keep routes, validators, auth requirements, errors, examples, consumers, and generated clients synchronized. Document an intentional typed-contract alternative when OpenAPI does not fit.
- Keep secrets, credentials, provider payloads, private World content, and environment values out of logs, fixtures, Markdown artifacts, commits, and client bundles.
- Use `docs/adrs/` for durable architecture decisions.
- Keep the public README and supporting docs aligned with accepted product direction without copying private planning material.
- Do not describe proposed or scaffold-only behavior as implemented.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run test
npm run typecheck
npm run build
npm run test:e2e
npm run test:storybook
```

Use the root npm workspace and Turborepo commands. Do not run repository-wide Git operations from the surrounding vault repository.

## Local Port Reservations

- Web client: `4310`
- API server: `4311`
- Storybook: `4312`
- Playwright web server: `4313`
- Playwright API server: `4314`

Use the checked-in Vite, Storybook, Playwright, and environment defaults. Do not silently move Lorecraft to another port when a reservation is unavailable; stop the conflicting process or report the conflict.

## Completion Gate

- Apply BDD/TDD to durable domain and application behavior.
- Prefer fast tests of product rules without HTTP, database, UI, or provider dependencies.
- Add boundary and integration tests for persistence, API contracts, authorization, and external adapters where those concerns become real.
- Add focused E2E and Storybook coverage for critical creator workflows and shared UI states.
- Run the smallest relevant lint, test, typecheck, build, and manual checks before declaring work complete.
- Run focused checks during implementation. After the final implementation commit, run `npm run ci:required` with an explicitly supplied acknowledged disposable-test environment before moving a Change to `in_review`; rerun it for the accumulated `develop` candidate before `/sdd-release`. Remote CI corroborates rather than replaces that local integrated proof.
- Update affected Epic `Implemented By`, scenario-mapped `Verified By`, and `Verification Gaps`; record chronological command results in the active `tasks.md`.
- Report honestly when a command succeeds without executing meaningful tests; verification must identify which backend, frontend, or browser behavior actually ran.
