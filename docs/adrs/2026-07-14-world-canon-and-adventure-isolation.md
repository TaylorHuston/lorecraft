# ADR: World Canon And Adventure Isolation

- Status: Accepted
- Date: 2026-07-14
- Related change: `docs/changes/2026-07-16-private-adventure-foundation/`
- Related Epics / Stories: `LC-003/S1`

## Context

Lorecraft treats a World as the authoritative account of fictional canon. Future playable Adventures will begin from that canon but will create events and state that must not silently redefine the World. Existing Adventures must also remain coherent when a creator later edits the source World.

This boundary affects World versioning, Adventure creation and reset behavior, runtime mutation ownership, future rollback, and any workflow that proposes turning Adventure material into canon.

## Decision

A World owns authoritative canon. An Adventure is a non-canonical, mutable branch created from an explicit version of a World and, when temporal canon exists, an explicit point or range in World time.

An Adventure SHALL preserve frozen source semantics: later World edits MUST NOT alter an existing Adventure automatically. Adventure runtime mutations MUST remain Adventure-owned and MUST NOT update source canon. Resetting an Adventure SHALL restore its original source version rather than the latest World state.

The physical storage strategy may use a materialized copy, immutable version references with Adventure-owned state, or another implementation that preserves those semantics. Applying a newer World version to an existing Adventure must be an explicit, reviewable migration. Promoting Adventure material into canon must be a separate creator-approved workflow.

## Options Considered

### Option 1: One Mutable World For Canon And Play

- Summary: Store authored canon and live Adventure state in the same mutable records.
- Pros: Minimal schema and no duplicated baseline data.
- Cons: Blurs authority, lets play alter canon, and makes World edits capable of breaking existing stories.

### Option 2: Adventure Deltas Over The Latest World

- Summary: Store only Adventure overrides while resolving unchanged state from the current World.
- Pros: Reduces baseline duplication and can expose World fixes automatically.
- Cons: Existing Adventures can change unexpectedly; deletion, conflict, reset, and historical-context rules become difficult to reason about.

### Option 3: Frozen World Source With Adventure-Owned State

- Summary: Bind each Adventure to a specific World version and keep all runtime mutations separate.
- Pros: Stable stories, explicit reset semantics, clear mutation authority, and inspectable migration behavior.
- Cons: Requires World versioning, may duplicate data, and makes later World-to-Adventure upgrades a separate capability.

## Consequences

- Positive: Canon cannot be changed accidentally by gameplay, and existing Adventures remain resumable after World edits.
- Positive: World authoring and Adventure runtime behavior have distinct ownership boundaries.
- Negative: Versioning and Adventure-owned state increase schema and migration complexity.
- Negative: Corrections to a World do not automatically repair Adventures created from older versions.
- Follow-up: The first Adventure Change must define the concrete World-version and Adventure-state representation while preserving this ADR's semantics.

## Validation

The Private Adventure Foundation implementation and review must prove that creating an Adventure binds it to an explicit World version, World edits do not change existing Adventures, reset restores the original source version, and source canon remains unchanged. Later mutation work must additionally prove that Adventure mutations cannot change World canon and that any upgrade or canon-promotion path requires an explicit action.

## Reconsider When

- Adventure storage volume makes frozen-source semantics operationally prohibitive.
- Lorecraft introduces a deliberately shared live-world mode where global changes are expected to affect active players.
- A safe explicit upgrade mechanism demonstrates that another storage strategy preserves the same user-visible guarantees with materially lower complexity.
