# Lorecraft Frontend

This workspace contains the creator-facing Lorecraft web client built with Vite, React, and TypeScript.

The client consumes the AdonisJS product API through Tuyau and uses TanStack Query for server state. It owns presentation, routing, and form state; account validation, authentication, authorization, and future World behavior remain authoritative on the backend.

Copy `.env.example` to `.env` and keep `API_SERVER_URL` aligned with the backend origin. Vite uses that server-only value to proxy same-origin browser requests under `/api`; it is not exposed through `import.meta.env`. Browser authentication uses HTTP-only session cookies; do not add bearer tokens to browser storage.

Playwright always starts isolated frontend and backend services on dedicated test ports. It requires `DATABASE_URL` for target comparison, `E2E_DATABASE_URL`, and `ALLOW_E2E_DATABASE_WRITES=1`; rejects the normal application database and targets without a disposable database or schema identifier; applies guarded migrations; and exercises the backend only through the frontend's same-origin `/api` proxy. Schema-isolated Neon runs must use the direct endpoint with PostgreSQL `options=-csearch_path=...`.
