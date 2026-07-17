# ADR: Immutable World Version Snapshots

- Status: Accepted
- Date: 2026-07-16
- Related change: `docs/changes/closed/2026-07-16-private-adventure-foundation/`
- Related Epics / Stories: `LC-003/S1`, especially `R2`

## Context

Lorecraft authors World canon through normalized relational models, while Adventures require an exact immutable source that later World edits cannot change. The storage boundary must preserve source provenance and reset semantics without duplicating every stable World record into every Adventure or forcing parallel version tables for every future concept.

## Decision

Keep the editable World aggregate relational. Publish each playable source state as an insert-only, schema-versioned, validated JSONB WorldVersion snapshot with deterministic ordering and content identity. Each Adventure references one WorldVersion and stores mutable Adventure state separately in relational records.

Normal APIs and seed paths SHALL NOT update an existing WorldVersion. Corrected canon creates a new version. API clients receive intentional projections rather than raw snapshot JSON.

## Options Considered

### Option 1: Immutable JSONB Snapshot Plus Relational Adventure State

- Summary: Serialize validated World metadata, guidance, Locations, Characters, and Starting Points into one reusable immutable version.
- Pros: Exact freeze boundary, simple provenance, deterministic reset, concept evolution through explicit snapshot schema versions, and no per-Adventure canon duplication.
- Cons: Internal stable-key relationships lack database foreign keys and require publication-time validation.

### Option 2: Fully Normalized Version Tables

- Summary: Add version-specific tables for every canonical concept and relationship.
- Pros: Strong relational constraints and targeted historical queries.
- Cons: Every new concept requires parallel authoring/version schemas and publication logic before that complexity is justified.

### Option 3: Full Canon Copy Per Adventure

- Summary: Copy all World rows into Adventure-owned tables when play begins.
- Pros: Straightforward independent mutation at small scale.
- Cons: Repeats stable canon for every Adventure, scales poorly, and weakens explicit shared source-version identity.

## Consequences

- Positive: Existing Adventures remain stable, many Adventures can share one source version, and reset has an exact origin.
- Positive: The accepted relational World authoring model remains intact.
- Negative: Snapshot publication needs schema validation, deterministic serialization, and migration rules for readers.
- Negative: Queries across historical snapshot contents may later require projections or normalized indexes.
- Follow-up: Implement publication tests for referential integrity, content identity, immutability, version reuse, and changed-content version creation.

## Validation

The frozen-source migration, publication, creation, query, lifecycle, API, and browser suites prove deterministic identity, same-World references, changed-content version creation, preservation of earlier snapshots, Adventure binding, old-version reads, same-version reset, and exact Stormbound seed reuse. Raw snapshots remain internal while the player-facing API exposes minimized frozen projections.

## Reconsider When

- WorldVersion snapshots become too large to validate or load within acceptable limits.
- Historical continuity queries require targeted versioned relations that projections cannot serve reliably.
- A normalized or hybrid version model can preserve the same immutable source identity with materially lower operational complexity.
