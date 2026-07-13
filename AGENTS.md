# Lorecraft Repository Guide

Lorecraft is the production-oriented successor to the `lorecraft-mvp` prototype. This repository is an API-first TypeScript monorepo with an AdonisJS backend and a frontend workspace that has not yet selected its framework.

## Read First

- `README.md` for repository status and commands.
- `../../developer-guide.md` for shared architecture, testing, security, branch, and CI/CD guidance.
- `../../story-driven-development.md` for SDD doctrine.
- `../../shared/development/adonisjs.md` before changing backend architecture.
- `../../shared/visual-style-guide.md` before materially changing UI.

## Repository Boundaries

- `apps/backend/` is the AdonisJS API and authoritative application backend.
- `apps/frontend/` is reserved for the player-facing client.
- Future reusable libraries belong under `packages/` only when a concrete shared boundary exists.
- Keep domain and application behavior independent of HTTP controllers, UI frameworks, persistence models, and AI provider SDKs.
- Treat generated `.adonisjs/` output, local SQLite files, dependencies, build output, logs, and environment files as local artifacts.

## Branch Policy

- `main` is production.
- `develop` is integration.
- Code changes use `change/`, `fix/`, or `misc/` branches from `develop` once the integration branch exists.
- Do not commit application code directly to `main` after initial repository setup.

## Commands

- `npm run dev` starts workspace development tasks.
- `npm run lint` runs workspace linting.
- `npm run test` runs workspace tests.
- `npm run typecheck` runs workspace type checks.
- `npm run build` builds all applications.

Use the root npm workspace and Turborepo commands. Do not run repository-wide Git operations from the surrounding vault repository.
