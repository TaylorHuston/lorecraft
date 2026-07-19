# ADR: Immutable Adventure Revisions

- Status: Accepted
- Date: 2026-07-17
- Related changes: `docs/changes/closed/2026-07-16-private-adventure-foundation/` and `docs/changes/2026-07-18-interactive-adventure-turns/`
- Related Epics / Stories: `LC-003/S1/R3`, `LC-003/S2/R2`, and future history-revision candidates

## Context

An Adventure must preserve completed narration and state transitions well enough to support future turns, Retry, rollback, and branching without silently rewriting prior story history. The Private Adventure Foundation already creates an opening revision, links story entries to it, and points the Adventure at a head revision. Reset remains an explicit destructive generation replacement.

The durable boundary must be recorded now without prematurely deciding the user-facing semantics of Retry, rollback, branching, or state restoration.

## Decision

Represent completed Adventure outcomes as immutable, Adventure-owned revisions. Each revision has a stable identity, sequence, optional parent revision, kind, and revision-owned story entries. The Adventure points to its current head revision.

Within one Adventure generation, completed revisions and their story entries SHALL NOT be edited in place. Later turn work appends a new revision and advances the head atomically. A future Retry or branch may create another child from an earlier parent, and rollback may select or derive from an earlier revision, but those user-facing semantics require their own accepted Change.

Reset is a separate lifecycle operation that replaces the Adventure generation from its original frozen World source. This ADR does not require old reset generations to remain user-accessible or retained indefinitely.

## Options Considered

### Option 1: Immutable Revisions With A Head Pointer

- Summary: Append completed outcomes as parent-linked revisions and identify the current accepted lineage through the Adventure head.
- Pros: Preserves prior outcomes, supports atomic publication, and leaves a coherent path to Retry, rollback, and branching.
- Cons: Requires lineage-aware reads, state restoration rules, cleanup policy, and careful concurrency control.

### Option 2: Mutable Current Transcript And State

- Summary: Update the current story and state records in place after every generation.
- Pros: Simple reads and fewer persistence records.
- Cons: Destroys provenance, makes rollback unreliable, and allows partial or concurrent writes to corrupt accepted history.

### Option 3: Full Event Sourcing

- Summary: Store every command and domain event, then rebuild all Adventure state from the event stream.
- Pros: Maximum auditability and temporal reconstruction.
- Cons: Adds event-schema, projection, replay, and migration complexity before Lorecraft has proven those needs.

## Consequences

- Positive: Accepted story history has stable provenance and can support later revision controls without replacing the persistence foundation.
- Positive: Story publication and head advancement can remain one atomic backend operation.
- Negative: Future mutable state must be revision-addressable or reproducibly restorable; a head pointer alone does not solve rollback.
- Negative: Retention, compaction, branch presentation, and abandoned-revision cleanup remain explicit future decisions.
- Follow-up: The structured-turn Change must define revision-linked state output and atomic head advancement. The history-revision Change must define Retry, rollback, branch selection, and retention semantics.

## Validation

The Adventure aggregate and opening-worker tests prove that the opening creates sequence-zero narration and one root revision atomically, assigns the Adventure head only after successful generation, exposes no partial revision after failure, and invalidates stale finalization after Reset or deletion. Future turn and history Changes must add deterministic lineage and state-restoration evidence before exposing those controls.

## Reconsider When

- Revision-linked state cannot restore an Adventure accurately or efficiently.
- Branch volume or retention cost makes the parent-linked model operationally unsuitable.
- Proven requirements justify full event sourcing or a snapshot-plus-event hybrid.
- Product decisions require Reset generations to remain recoverable rather than destructive.
