---
id: LC-003
status: planned
created: 2026-07-16
modified: 2026-07-16
last_verified:
stories:
  - S1
---

# LC-003 Adventure Play

## Product Context

- Related change: `docs/changes/2026-07-16-private-adventure-foundation/`
- Related ADRs:
  - `docs/adrs/2026-07-14-world-canon-and-adventure-isolation.md`
  - `docs/adrs/2026-07-16-immutable-world-version-snapshots.md`
  - `docs/adrs/2026-07-16-durable-asynchronous-adventure-work.md`

Lorecraft's creator-owned Worlds are authoritative canon. Adventure play lets an account enter that canon through a private, non-canonical reality whose story remains stable when the creator later changes the World. The archived MVP is evidence for useful interactions, but the official application owns a new structured runtime built outward from this isolation boundary.

## Outcome

Accounts can enter an authorized World through private Adventures, receive Game Master narration grounded in frozen canon, shape a persistent narrative, and return later without changing the source World or another account's Adventure.

## Current Scope

- Start from one explicit immutable WorldVersion and one versioned default Starting Point.
- Create one private Adventure-owned player profile.
- Durably generate, persist, list, and resume an opening narration.
- Reset to the original source version and delete only the selected Adventure.
- Keep authorization, source isolation, lifecycle, provider orchestration, and typed API behavior in the AdonisJS backend.
- Present World-contained Adventure discovery and a responsive story-first Adventure route in the React client.

## Deferred Scope

- Act, Pass, Story, Guide, `/look`, `/help`, state extraction, and Game Master mutation.
- Dice, combat, health, inventory, equipment, stats, skills, quests, progression, and rules adjudication.
- Multiple Starting Points, selectable World dates, canonical protagonist templates, and WorldVersion management UI.
- Successful-turn Retry, rollback, branching, WorldVersion upgrades, and promotion of Adventure material into canon.
- Sharing, spectators, collaborative control, and multiplayer.
- Player-facing model controls, streaming, and push delivery.

## Candidate Stories

Candidate Stories are planning signals only. They are not accepted Epic/Story truth until promoted into `## Stories`, and they do not receive `S#` labels until promotion.

| Candidate | Status | Story Shape | Acceptance Signals |
|---|---|---|---|
| `resolve-structured-turns` | proposed | As a player, I want Act, Pass, and Guide to resolve durable Game Master turns, so that I can advance my Adventure. | Atomic asynchronous generation and extraction, one active turn, context rules, accepted mutations, and revision links are proven. |
| `shape-and-inspect-story` | proposed | As a player, I want Story, `/look`, `/help`, and persistent context views, so that I can shape and understand the Adventure before ending a turn. | Utility persistence/context exclusion and Player/Scene knowledge filtering are proven. |
| `revise-adventure-history` | deferred | As a player, I want to Retry, roll back, or branch from completed turns, so that I can revise my story safely. | Complete state restoration and immutable history semantics are defined and proven. |

## Story Index

| Story | Status | Capability | Last Verified | Notes |
|---|---|---|---|---|
| S1 | planned | Start and resume a private Adventure. |  | Implemented by the Private Adventure Foundation Change. |

## Stories

### Story S1: Start And Resume A Private Adventure

Status: planned
Created: 2026-07-16
Modified: 2026-07-16
Last verified:

As a signed-in account holder, I want to start and resume a private Adventure from an accessible World, so that I can enter stable canon as my own player character.

#### Requirements And Scenarios

##### Requirement R1: Account-Owned Adventure Creation

The system SHALL create at most one account-owned Adventure for one accepted creation request and expose it only to its owner.

###### Scenario R1-S1: Valid Player Profile

- WHEN a signed-in account starts an Adventure from a playable accessible World with a non-empty player name and optional profile text
- THEN Lorecraft creates one private Adventure and one Adventure-owned player profile
- AND returns a durable `/adventures/<id>` route in a pending opening state.

###### Scenario R1-S2: Invalid Or Duplicate Submission

- WHEN required input is invalid
- THEN no Adventure or job is created and field-level validation is returned
- AND WHEN the same owner repeats an accepted request with the same creation request identifier
- THEN Lorecraft returns the original Adventure instead of creating a duplicate.

###### Scenario R1-S3: Unauthorized Source Or Adventure

- WHEN an anonymous account, a signed-in account without World access, or a non-owner requests Adventure data or mutation
- THEN Lorecraft returns an authentication or non-disclosing not-found result as appropriate
- AND no private Adventure, player, prompt, or story data is exposed.

##### Requirement R2: Frozen World Source

The system SHALL bind every Adventure to one immutable WorldVersion and one Starting Point contained in that version.

###### Scenario R2-S1: Playable Published Version

- WHEN Adventure creation succeeds
- THEN its WorldVersion snapshot contains the source World metadata, Adventure guidance, Locations, Characters, and default Starting Point used for creation
- AND the Adventure's initial player and Scene location are derived from that Starting Point.

###### Scenario R2-S2: Later Canon Change

- WHEN source World data is changed and a newer WorldVersion becomes current after an Adventure exists
- THEN the existing Adventure continues reading its original snapshot
- AND a newly created Adventure uses the newer current WorldVersion.

###### Scenario R2-S3: World Is Not Playable

- WHEN an accessible World has no current immutable version, no Location, or no default Starting Point with an opening premise
- THEN Adventure creation is unavailable with a clear conflict result
- AND World inspection remains available.

##### Requirement R3: Durable Opening Generation

The system SHALL durably generate and atomically publish one opening narration before marking an Adventure ready.

###### Scenario R3-S1: Successful Opening

- WHEN a worker claims the pending opening job
- THEN the Game Master receives non-editable platform instructions, frozen World guidance, the Starting Point premise, relevant starting canon, and the player profile
- AND successful prose is committed as the root story entry and root revision before the Adventure becomes ready.

###### Scenario R3-S2: Reload Or Worker Restart

- WHEN the browser reloads while the opening is pending or a worker loses its lease
- THEN the persisted Adventure remains pending and the client resumes polling authoritative status
- AND another worker can reclaim stale work without publishing duplicate openings.

###### Scenario R3-S3: Provider Failure And Retry

- WHEN opening generation fails transiently
- THEN Lorecraft retries it once without creating another Adventure or exposing partial prose
- AND after terminal failure the Adventure shows a recoverable failed state whose owner can retry against the same frozen source.

###### Scenario R3-S4: Atomic Publication

- WHEN generation does not produce valid non-empty narration or persistence fails
- THEN no opening story entry or root revision becomes visible
- AND the Adventure does not report ready.

##### Requirement R4: Resume And Lifecycle

The system SHALL list and reopen the owner's Adventures under their source World and keep destructive lifecycle actions Adventure-scoped.

###### Scenario R4-S1: List And Resume

- WHEN an owner returns to the source World or opens `/adventures/<id>`
- THEN the World lists each owned Adventure with player identity, completed turn count, last-played time, and lifecycle state
- AND a ready Adventure renders its opening story, Player context, and initial Scene context from its frozen source.

###### Scenario R4-S2: Reset

- WHEN the owner confirms reset while no opening job is active
- THEN generated story and Adventure-owned runtime state are replaced with initial state from the same WorldVersion and Starting Point
- AND a new opening is queued using the original player profile without changing source canon.

###### Scenario R4-S3: Delete

- WHEN the owner confirms deletion from the source World's Adventure list
- THEN the Adventure and its owned jobs, calls, revisions, story, and player state are removed
- AND the World, WorldVersion, and every other Adventure remain unchanged.

##### Requirement R5: Coherent Adventure Experience

The system SHALL present creation, pending, failure, ready, reset, delete, and resume states through an accessible responsive interface.

###### Scenario R5-S1: Create And Pending States

- WHEN the account starts an Adventure at desktop or mobile width
- THEN required and optional player fields, submission progress, and pending Game Master status remain readable and keyboard operable
- AND repeated submission is prevented without relying only on client state.

###### Scenario R5-S2: Ready Adventure

- WHEN opening generation completes
- THEN the Adventure route clearly distinguishes story, Player context, and Scene context without horizontal overflow
- AND the generated opening is the primary reading focus.

###### Scenario R5-S3: Recoverable And Destructive Actions

- WHEN an opening fails, reset is unavailable during active work, or delete/reset requires confirmation
- THEN the UI presents the correct retry, conflict, or confirmation behavior
- AND focus and status announcements remain coherent after the action.

#### Implemented By

| Path | Role | Recheck Trigger |
|---|---|---|
| Not implemented yet. | All implementation is pending. | Replace during implementation with current source ownership. |

#### Verified By

| Requirement / Scenario | Evidence | Proves | Status |
|---|---|---|---|
| S1/R1-S1 through S1/R5-S3 | Not verified yet. | All accepted behavior awaits implementation and scenario-mapped evidence. | Pending |

#### Verification Gaps

- All `LC-003/S1` Requirements and Scenarios await implementation and scenario-mapped evidence.
- Live-provider narrative quality and final responsive UI acceptance require separate evidence from deterministic tests.

#### Story Notes

- The opening root revision has zero completed player turns.
- Player name is the initial Adventure identity; a separate Adventure title is deferred.
- Reset preserves the creation profile and original frozen source while clearing generated runtime state.

## Cross-Story Concerns

- World canon remains authoritative and immutable from Adventure runtime paths.
- Adventure data is private to its owner even when the source World is public.
- The AdonisJS backend owns authorization, lifecycle, source/state projection, prompt assembly, jobs, and provider adapters for every client.
- Completed narration and state transitions use immutable revision links so later Retry and rollback can be introduced coherently.
- Raw prompt/model evidence is sensitive operational data and never part of the normal player API.

## Open Decisions

- None block `S1`. Candidate Stories require their own promoted Changes before they become accepted Epic truth.

## Completion Criteria

This Epic is healthy when:

- embedded Stories describe only accepted Adventure behavior;
- private Adventure ownership and WorldVersion isolation are enforced by backend and database evidence;
- opening generation survives reloads and stale workers without duplicate publication;
- World discovery, creation, recovery, ready, reset, and delete states have deterministic and manual evidence;
- `Implemented By`, `Verified By`, and `Verification Gaps` remain current; and
- deferred turn controls and history revision are not represented as implemented.

## Notes

- The archived Lorecraft MVP remains reference material and does not own official Epic truth.
- Version-management UI is not required for the first immutable WorldVersion implementation.
