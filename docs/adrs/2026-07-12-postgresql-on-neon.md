# ADR: PostgreSQL On Neon

- Status: Proposed
- Date: 2026-07-12
- Related change: `docs/changes/2026-07-12-account-workspace-entry/`
- Related Epics / Stories: `LC-001/S1`, `LC-001/S2`, and `LC-001/S3`

## Context

The scaffold uses SQLite, while Lorecraft's production-oriented data model will need relational integrity, migrations, concurrent access, and environment isolation. The first account journey needs durable shared storage before World concepts are added.

## Decision

Use standard PostgreSQL through Lucid and the `pg` driver, hosted in a dedicated Neon project. Maintain isolated Neon `main`, `develop`, and resettable `test` branches/databases. Connect through `DATABASE_URL` in ignored environment configuration and keep application persistence portable rather than depending on Neon-specific data APIs.

## Options Considered

### Option 1: PostgreSQL On Neon

- Summary: Hosted PostgreSQL with database branching and standard driver access.
- Pros: Portable SQL, low operational overhead, environment isolation, and a path from development to production.
- Cons: Development and integration tests depend on network access and require disciplined branch/database handling.

### Option 2: PostgreSQL On Supabase

- Summary: Use Supabase-hosted PostgreSQL alongside AdonisJS.
- Pros: Managed PostgreSQL plus optional platform services.
- Cons: Adds an overlapping platform whose auth and data APIs are not needed for this architecture.

### Option 3: Local PostgreSQL Or Continued SQLite

- Summary: Keep persistence entirely local during early work.
- Pros: No hosted dependency and fast local access.
- Cons: Does not prove hosted PostgreSQL behavior or provide shared environment isolation; SQLite can conceal PostgreSQL-specific behavior.

## Consequences

- Positive: Application data uses production-relevant PostgreSQL semantics with resettable test isolation.
- Negative: Local development is less self-contained and database credentials require careful handling.
- Follow-up: Document environment setup, protect production/development branches from destructive tests, and keep migrations standard PostgreSQL.

## Validation

Routine migration, integration, and browser tests must pass against disposable standard PostgreSQL, including the isolated database provisioned by CI. A separate smoke check must run migrations and the account journey against an isolated Neon test branch before this ADR is accepted. No connection string may appear in source, logs, frontend bundles, or public artifacts.

## Reconsider When

Revisit if offline development becomes necessary, hosted integration latency materially harms the workflow, Neon branching proves unreliable, or a different PostgreSQL host offers a concrete operational advantage.
