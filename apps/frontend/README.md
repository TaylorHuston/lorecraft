# Lorecraft Frontend

This workspace contains the creator-facing Lorecraft web client built with Vite, React, and TypeScript.

The client consumes the AdonisJS product API through Tuyau and uses TanStack Query for server state. It owns presentation, routing, and form state; account validation, authentication, authorization, and future World behavior remain authoritative on the backend.

Copy `.env.example` to `.env` and keep `API_SERVER_URL` aligned with the backend origin. Vite uses that server-only value to proxy same-origin browser requests under `/api`; it is not exposed through `import.meta.env`. Browser authentication uses HTTP-only session cookies; do not add bearer tokens to browser storage.

The checked-in development topology reserves `http://localhost:4310` for the web client and `http://localhost:4311` for the API. Vite uses a strict port and exits on conflicts. Playwright uses the separate reserved ports `4313` and `4314` for its isolated web and API services.

Playwright always starts isolated frontend and backend services on dedicated test ports. It requires `DATABASE_URL` for target comparison, `E2E_DATABASE_URL`, and `ALLOW_E2E_DATABASE_WRITES=1`; rejects the normal application database and targets without a disposable database or schema identifier; applies guarded migrations; and exercises the backend only through the frontend's same-origin `/api` proxy. Schema-isolated Neon runs must use the direct endpoint with PostgreSQL `options=-csearch_path=...`.

## Storybook

Storybook is the executable isolated UI workbench. Stories import application-owned React components and shared tokens; they are not a separate product implementation or a substitute for Epic truth, application tests, or routed Playwright journeys.

From the repository root:

```bash
npm run storybook
npx playwright install chromium # one-time browser setup
npm run test:storybook
npm run build:storybook
```

The catalog includes the production authentication and empty-workspace surfaces alongside isolated future-facing prototypes. Use deterministic args and fixtures for component states. Add MSW only when a story needs to exercise the HTTP client boundary, and keep domain or application rules out of stories.

Storybook reserves `http://localhost:4312` and exits rather than selecting another port when it is unavailable.
