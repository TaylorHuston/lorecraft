# Lorecraft

Lorecraft is an API-first narrative game platform built around canonical world state, persistent Adventures, and an AI Game Master that proposes rather than owns durable state changes.

This repository is the production-oriented successor to the experimental `lorecraft-mvp` prototype. It is currently an initial application scaffold, not a playable release.

## Structure

```text
apps/
  backend/   AdonisJS API
  frontend/  Reserved frontend workspace
docs/        Architecture and product implementation documentation
```

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

The backend currently uses local SQLite for scaffold development. The production database and deployment topology have not yet been selected.
