# ADR: Revision-Linked Adventure State Mutations

- Status: Accepted
- Date: 2026-07-18
- Related change: `docs/changes/2026-07-18-interactive-adventure-turns/`
- Related Epics / Stories: `LC-003/S2`, especially `R2` and `R4`

## Context

Interactive Adventure turns must update current Player and NPC state while preserving enough immutable provenance to keep completed narration and consequences aligned. Current reads need to remain efficient, but future successful-turn Retry, rollback, and branching must not be made impossible by mutating state without history.

The accepted immutable Adventure revision ADR requires turn outcomes to append revisions and advance the head atomically. It deliberately leaves state restoration and snapshots for later. The interactive-turn Change now needs a durable state boundary that satisfies current reads and future lineage without adopting full event sourcing or duplicating a complete state snapshot on every turn.

## Decision

Keep current Adventure-owned Player and NPC state in normalized materialized records for efficient reads. For every completed turn, append immutable, revision-linked structured mutation outcomes that identify accepted and rejected proposals and contain enough bounded prior/result information or deterministic operation data to reconcile how the resulting revision changed Adventure state.

Apply accepted mutations, append the completed revision and narration, store mutation outcomes, advance the Adventure head, and increment its turn count in one PostgreSQL transaction. Frozen WorldVersion content remains unchanged and supplies stable Character and Location material. Full per-revision state snapshots are deferred; they may be added later as restoration accelerators without replacing mutation provenance.

## Options Considered

### Option 1: Materialized Current State Plus Revision-Linked Mutations

- Summary: update normalized current state atomically while appending immutable structured mutation outcomes.
- Pros: efficient current reads, durable provenance, bounded duplication, and a path to later replay/snapshots/branching.
- Cons: requires reconciliation invariants and future replay logic; current state and mutation history can drift if transactions are bypassed.

### Option 2: Full State Snapshot Per Revision

- Summary: persist a complete Adventure state JSON snapshot for every completed turn.
- Pros: simple point-in-time reads and restoration.
- Cons: duplicates private state, requires snapshot schema evolution immediately, and makes a broad JSON contract authoritative before rollback/branching needs are accepted.

### Option 3: Mutable Current State Without Mutation History

- Summary: update current rows and retain only completed narration/revision identity.
- Pros: smallest immediate schema and write path.
- Cons: loses consequence provenance and makes later Retry, rollback, branching, and diagnosis unreliable or impossible for existing histories.

### Option 4: Full Event Sourcing

- Summary: make commands/events the sole source and rebuild all Adventure state from projections.
- Pros: strongest replay and audit model.
- Cons: adds event schema, projection, migration, replay, and operational complexity beyond the first playable loop.

## Consequences

- Positive: current Player and Scene projections stay fast and relational.
- Positive: completed narration, structured consequences, and revision lineage remain inspectably aligned.
- Positive: later snapshots can optimize restoration without discarding mutation history.
- Negative: every state-changing path, including reset and repair tools, must preserve reconciliation invariants.
- Negative: future rollback/branching work still needs replay, snapshot, lineage-selection, and retention semantics.
- Follow-up: the interactive-turn Change must define bounded mutation schemas, immutable constraints, transactional finalization, reset behavior, and deterministic reconciliation evidence.

## Validation

Implementation must prove through database constraints and service tests that one successful turn atomically appends its revision/narration/mutation outcomes and advances current state/head/count; failure or stale finalization changes none of them; rejected proposals do not affect current state; reset rebuilds current state from the same frozen source; source World and other Adventures remain unchanged; and current state can be reconciled to the active linear mutation history. Deterministic E2E must show Player/Scene updates only after committed turns.

## Reconsider When

- Replaying or reconciling mutation history becomes too slow or operationally fragile.
- Successful-turn Retry, rollback, or branching requires frequent point-in-time restoration.
- Mutation volume justifies periodic snapshots or compaction.
- Proven requirements justify a formal event-sourced aggregate.
