# ADR: Disposable Database Targets For Automation

- Status: Accepted
- Date: 2026-07-14
- Related change: `docs/changes/closed/2026-07-12-account-workspace-entry/` and `docs/changes/2026-07-14-public-starter-world/`
- Related Epics / Stories: `LC-001/S1`, `LC-001/S2`, `LC-001/S3`, `LC-002/S1`, and `LC-002/S2`

## Context

Lorecraft uses hosted PostgreSQL during development and runs migrations, database-backed tests, and browser journeys that may create, modify, or delete data. A mistaken target could damage shared development or production data. Relying on command names or operator memory is insufficient because the same PostgreSQL driver and migration tooling serve every environment.

## Decision

Automated tests, E2E journeys, migration verification, reset workflows, and other destructive validation SHALL use an explicitly configured disposable PostgreSQL database, branch, or schema that is separate from the normal application database.

Destructive automation SHALL fail closed unless the target is separately configured, an explicit write-acknowledgement flag is present, the effective database or schema name is recognizably test-oriented, and the target does not resolve to the configured application database. CI SHALL provision isolated disposable PostgreSQL. Hosted-provider smoke tests SHALL use an isolated branch, database, or schema.

This decision governs automated validation and reset behavior. It does not replace the separate review, backup, and deployment controls required for intentional production migrations.

## Options Considered

### Option 1: Trust The Operator And Environment Name

- Summary: Run destructive commands against whichever database URL is active.
- Pros: Minimal scripts and configuration.
- Cons: A stale shell variable or copied command can destroy shared data with no independent guard.

### Option 2: Use SQLite Or Mocks For All Automated Tests

- Summary: Avoid PostgreSQL writes by testing against a different local store or mocked adapters.
- Pros: Fast, self-contained tests with no hosted dependency.
- Cons: Does not validate PostgreSQL constraints, migrations, transactions, or driver behavior used in production.

### Option 3: Require Explicit Disposable PostgreSQL Targets

- Summary: Keep production-relevant database behavior while adding independent target and acknowledgement guards.
- Pros: High-fidelity verification with a fail-closed boundary against normal application data.
- Cons: More environment configuration and disposable-database lifecycle work.

## Consequences

- Positive: Database-backed verification exercises PostgreSQL without trusting a single connection string or command name.
- Positive: Local and CI failures occur before destructive work when isolation is ambiguous.
- Negative: Contributors must provision and configure additional test and E2E targets.
- Negative: Hosted test branches or schemas add operational setup and may introduce network latency.
- Follow-up: Keep guard scripts, CI configuration, environment examples, and testing documentation synchronized when database workflows change.

## Validation

Guard tests must prove rejection when acknowledgement is absent, the target matches the application database, or the effective database or schema lacks a test-oriented identifier. Backend and E2E suites must pass against disposable PostgreSQL, and CI must provision an isolated service. Before production deployment, hosted behavior must also be smoke-tested against an isolated Lorecraft database branch or schema.

## Reconsider When

- The project adopts a provider-managed ephemeral database workflow that offers stronger equivalent isolation automatically.
- Database-backed tests can run transactionally with proven isolation and no schema-level side effects.
- Lorecraft changes persistence technology and these PostgreSQL-specific guards no longer represent the destructive boundary.
