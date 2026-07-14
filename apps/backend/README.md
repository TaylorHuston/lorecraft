# Lorecraft Backend

The Lorecraft backend is the authoritative AdonisJS API for account access, application workflows, and persistence. The current product is a creator-first World bible; World canon and later AI-assisted workflows will be introduced only through tracked product changes.

Run backend-only commands from this directory or through the root npm workspace:

```bash
npm run dev
npm run lint
npm run test
npm run typecheck
npm run build
```

The backend currently implements account creation, session sign-in and sign-out, current-account restoration, and protected workspace access. It uses VineJS validation, Lucid with PostgreSQL, database-backed browser sessions, Japa integration tests, and Tuyau type generation. Opaque API-token capability remains reserved for future non-browser clients.
