# Lorecraft

Lorecraft is a creator-first world bible for building and maintaining coherent fictional universes across novels, games, animation, and other media.

The initial product is a private workspace for individual worldbuilders. It treats the World as an authoritative, time-aware body of canon rather than a loose collection of notes. Future capabilities may use that foundation for source-backed AI assistance, continuity analysis, selective publishing, and non-canonical playable Adventures.

## Product Principles

- The creator decides what becomes canon.
- The World is the authoritative source for objective fictional truth.
- Canon is time-aware so facts can change across stories, generations, and eras.
- Common worldbuilding concepts should work well by default without imposing a genre or medium.
- AI may analyze and propose, but it must not silently redefine canon.
- Canonical works may contribute creator-approved changes to the World.
- Playable Adventures may consume canon later, but their events remain separate from it by default.
- The world bible should remain useful without AI.

## Status

This repository is the production-oriented successor to the experimental `lorecraft-mvp` prototype. It currently contains the application scaffold and is not yet a usable world-building product.

The current product boundary is the creator-facing world bible. A complete writing environment, collaboration, public publishing, source ingestion, AI assistance, and playable Adventures are not part of the initial implementation unless introduced through later planned changes.

## Architecture

Lorecraft is an API-first TypeScript monorepo:

```text
apps/
  backend/   AdonisJS API and authoritative application backend
  frontend/  Reserved creator-facing web client
docs/        Architecture and product implementation documentation
```

The backend is designed as a stable product API so future web, mobile, administrative, automation, and game clients can share the same authoritative behavior. Domain and application logic should remain independent of HTTP controllers, persistence libraries, UI frameworks, and AI provider SDKs.

Shared packages will be added under `packages/` only when a concrete cross-application contract requires one.

## Requirements

- Node.js 24 or newer
- npm 11 or newer

## Development

Install dependencies:

```bash
npm install
```

Run the workspace:

```bash
npm run dev
```

Run verification:

```bash
npm run lint
npm run test
npm run typecheck
npm run build
```

The backend currently uses local SQLite for scaffold development. The production database, frontend framework, and deployment topology have not yet been selected.
