# ADR: PostgreSQL On Neon

- Status: Accepted
- Date: 2026-07-12
- Related change: `docs/changes/closed/2026-07-12-account-workspace-entry/` and `docs/changes/2026-07-18-audit-hardening/`
- Related Epics / Stories: `LC-001/S1`, `LC-001/S2`, `LC-001/S3`, `LC-002/S1`, `LC-002/S2`, and `LC-003/S1`

## Context

The scaffold uses SQLite, while Lorecraft's production-oriented data model will need relational integrity, migrations, concurrent access, and environment isolation. The first account journey needs durable shared storage before World concepts are added.

## Decision

Use standard PostgreSQL through Lucid and the `pg` driver, hosted in a dedicated Neon project. Maintain one long-lived production branch, one long-lived development branch, and disposable validation targets for migration, backend-test, and E2E work. Production starts from a clean migrated schema and receives only explicitly seeded or creator-entered data; development accounts, Adventures, and other working data are not promoted implicitly.

Long-running application processes use a pooled connection string. Schema migrations, recovery checks, and other administrative operations use a direct connection string through an explicit one-shot command. Connection strings remain ignored runtime secrets, and application persistence stays portable rather than depending on Neon-specific data APIs. A local PostgreSQL server is not required while hosted development and disposable validation remain reliable.

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
- Follow-up: Protect production where the selected Neon plan supports it, keep production/development credentials isolated from disposable validation, document pooled runtime versus direct migration connections, and keep migrations standard PostgreSQL.

## Validation

Routine migration, integration, and browser tests must pass against disposable standard PostgreSQL, including the isolated database provisioned by CI. Before initial production deployment, the migration must pass against an isolated Neon validation target, production must be created independently from development data, and an isolated restore target must prove the recovery path. No connection string may appear in source, logs, frontend bundles, or public artifacts.

## Reconsider When

Revisit if offline development becomes necessary, hosted integration latency materially harms the workflow, Neon branching proves unreliable, or a different PostgreSQL host offers a concrete operational advantage.
