# ADR: Durable Asynchronous Adventure Work

- Status: Accepted
- Date: 2026-07-16
- Related change: `docs/changes/2026-07-16-private-adventure-foundation/`
- Related Epics / Stories: `LC-003/S1`, especially `R3`

## Context

Local and hosted language models may take longer than a browser request remains reliable. Adventure opening and later turn work must survive reloads, reconnects, worker restarts, and slow providers without exposing partial narration or allowing duplicate state transitions. The runtime must also remain provider-neutral and usable with local OpenAI-compatible endpoints.

## Decision

Persist Adventure model work in PostgreSQL and process it through a separately runnable worker. Workers claim queued work with transactional locking and an expiring lease. Adventure lifecycle state in PostgreSQL is authoritative; browser memory and worker memory are not locks.

The first web client polls persisted status. Worker finalization atomically publishes the completed Adventure result and rejects stale claims. Provider-specific behavior remains behind backend interfaces, and model-call evidence is stored with credentials and authorization material redacted.

## Options Considered

### Option 1: Durable Database Jobs And Polling

- Summary: Persist work beside Adventure lifecycle state, claim it through leased database coordination, and poll initially.
- Pros: Survives reloads and restarts, supports local models, keeps one authority boundary, and allows later push delivery without changing work semantics.
- Cons: Adds a worker process, polling overhead, lease recovery, and database queue maintenance.

### Option 2: One Synchronous HTTP Request

- Summary: Hold the creation or turn request open until all model work completes.
- Pros: Minimal infrastructure and simple immediate response handling.
- Cons: Fragile under slow models, browser reloads, proxy timeouts, and server restarts.

### Option 3: In-Memory Background Promise

- Summary: Return immediately and continue work inside the API process without durable coordination.
- Pros: Small initial implementation.
- Cons: Loses work on restart, cannot coordinate multiple processes safely, and provides weak recovery or inspection.

### Option 4: Managed External Queue Immediately

- Summary: Introduce a queue service as the first work authority.
- Pros: Mature delivery, retries, and scaling features may be available.
- Cons: Adds deployment and local-development dependencies before workload scale justifies them and can split status authority from the Adventure transaction.

## Consequences

- Positive: Slow model work is reload-safe, retryable, serializable, and inspectable.
- Positive: Polling can later be replaced or complemented by SSE or another reconnectable push transport without changing persisted lifecycle semantics.
- Negative: Development and deployment must run and monitor a distinct worker process.
- Negative: Job leases, idempotent finalization, stale-worker rejection, and retention require explicit tests and operations.
- Follow-up: Make normal development startup include the worker and document production worker execution and health expectations.

## Validation

Implementation and review must prove that pending work survives reload, expired leases are reclaimable, only one opening publishes, transient failure retries are bounded, terminal failure is recoverable, stale workers cannot commit after reset or delete, and secrets never enter persisted evidence or logs.

The focused opening-worker suite proves transactional single-claim behavior, lease reclaim and exhaustion, one automatic retry, terminal owner retry, atomic root publication, reset/delete stale-worker rejection, and sanitized evidence/logging. Process startup and browser polling remain implementation work in the related Change.

## Reconsider When

- Work volume or latency makes PostgreSQL queue polling an operational bottleneck.
- A managed queue can preserve atomic Adventure finalization, local development, and database-authoritative lifecycle state with lower operational cost.
- Reconnectable streaming becomes a proven user requirement; transport may change without replacing durable jobs.
