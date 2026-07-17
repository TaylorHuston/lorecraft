# ADR: Relational World Aggregate

- Status: Accepted
- Date: 2026-07-14
- Related change: `docs/changes/2026-07-14-public-starter-world/`
- Related Epics / Stories: `LC-002/S1`, `LC-002/S2`, and `LC-003/S1 R2`

## Context

Lorecraft's first structured canon capability introduces Worlds, Locations, Characters, authorship, visibility, stable concept keys, and relationships between concepts. The data model must preserve referential integrity and support targeted authoring, querying, temporal history, provenance, and continuity analysis as those capabilities arrive.

The initial implementation had to choose between storing each World as one document, introducing a fully generic concept system immediately, or establishing a relational core for concepts that have proven product value.

## Decision

Treat each World as an aggregate boundary for its canon. Model proven first-class concepts in normalized PostgreSQL tables with explicit foreign keys, uniqueness constraints, and database-enforced invariants where practical.

Concepts SHALL have stable identities scoped to their World in addition to persistence-layer primary keys. Relationships between World-owned concepts MUST NOT cross World boundaries accidentally. Freeform text may live inside structured records, but a single World JSON document, an entity-attribute-value system, or a universal graph SHALL NOT replace explicit first-class models before a concrete requirement justifies that complexity.

This decision does not make the current Character fields permanent and does not prohibit later JSONB metadata, creator-defined concepts, graph projections, search indexes, or other specialized read models. Those additions must preserve the World boundary and authoritative relational invariants.

## Options Considered

### Option 1: One JSON Document Per World

- Summary: Store the complete World and all nested concepts in one document.
- Pros: Simple initial persistence and flexible nested content.
- Cons: Weak targeted integrity, awkward concurrent edits, coarse migrations, and difficult relationship or temporal queries.

### Option 2: Normalized First-Class Concepts

- Summary: Add explicit relational models as product concepts become concrete.
- Pros: Strong integrity, focused migrations, efficient targeted queries, and clear ownership boundaries.
- Cons: Requires more schema work and can become rigid if every possible concept is modeled prematurely.

### Option 3: Generic Entity-Attribute-Value Or Graph Core

- Summary: Represent all concepts and properties through a universal schema from the beginning.
- Pros: Maximum theoretical extensibility and uniform relationship representation.
- Cons: Higher query, validation, migration, typing, and authoring complexity before custom concepts are understood.

## Consequences

- Positive: PostgreSQL can enforce World ownership, stable identity, and relationship integrity close to the data.
- Positive: New first-class concepts can be introduced deliberately as their behavior becomes known.
- Negative: Schema changes require migrations, and premature concept modeling can still create rigidity.
- Negative: Creator-defined concepts will require an additive extension strategy rather than fitting automatically into the initial tables.
- Follow-up: Future concept, relationship, temporal, and provenance Changes must state whether they extend the relational aggregate or introduce a justified projection or extension mechanism.

## Validation

The current implementation validates this decision through normalized `worlds`, `locations`, `characters`, and `world_starting_points` tables; World-scoped stable-key constraints; same-World Character and Starting Point Location integrity; PostgreSQL-backed migration and functional tests; and intentional API DTOs that do not expose persistence records directly. Immutable JSONB WorldVersions are derived publication artifacts for frozen Adventure provenance. They do not replace the relational authoring aggregate and can be created only after stable-key references are validated.

## Reconsider When

- Creator-defined concepts become common enough that table-per-concept development is the primary product bottleneck.
- Relationship traversal or continuity analysis cannot be served acceptably through PostgreSQL and derived indexes.
- Real authoring workflows demonstrate that a document, graph, or hybrid model provides materially better integrity and usability without creating parallel sources of truth.
