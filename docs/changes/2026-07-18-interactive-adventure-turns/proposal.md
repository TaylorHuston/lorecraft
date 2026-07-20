# Proposal: Interactive Adventure Turns

## Why

Lorecraft can create and resume a private Adventure with a durable generated opening, but the player cannot yet interact with the Game Master. The archived MVP proved that explicit Act, Pass, and Guide actions can support a clearer narrative loop than a generic chat box. The production application now has the frozen-canon, immutable-revision, durable-worker, responsive-workbench, and private-deployment foundations needed to implement that loop without carrying forward the spike's prototype persistence or security compromises.

## What Changes

- Add one complete resolving-turn path to a ready Adventure.
- Let the player Act with explicit intent, Pass without adding intent, or privately Guide the next Game Master response.
- Process each turn durably and asynchronously so reloads, worker restarts, retries, and concurrent tabs cannot create partial or duplicate outcomes.
- Generate narration and then separately extract bounded structured consequences.
- Allow only player/NPC movement among frozen Locations plus NPC mood, status, and summarized-memory changes.
- Publish narration, accepted mutations, revision history, and the new Adventure head atomically.
- Keep prior story visible while a turn resolves, expose clear pending/failure/retry/discard states, and update Player and Scene context after completion.
- Preserve metadata-only model-call evidence and the existing private, owner-only Adventure boundary.

## Target Repositories

- This repository (role: official-application).

## Epic Actions

### New Epic Directories

- None.

### Existing Epic Directory Updates

- `docs/epics/lc-003-adventure-play/epic.md`
  - Add Story `LC-003/S2`, Resolve A Structured Game Master Turn.
  - Move the `resolve-structured-turns` candidate into accepted Story scope.
  - Reconcile Current Scope, Deferred Scope, Candidate Stories, Story Index, cross-Story concerns, and completion criteria.

## Epic Story Changes

- Add `LC-003/S2`: As a player, I want Act, Pass, or Guide to resolve a durable Game Master turn, so that my private Adventure can progress through narration and bounded persistent consequences.
- Keep `LC-003/S1` behavior stable; extend only its reset/query evidence where interactive state makes those existing guarantees broader.
- Leave the `shape-and-inspect-story` candidate proposed. Story inserts, `/look`, and `/help` remain a following phase.
- Leave `revise-adventure-history` deferred. Successful-turn Retry, rollback, and branching remain out of scope.

## Scope Decisions

- Confirmed:
  - This Change owns Act, Pass, and Guide as one coherent resolving-turn path.
  - Story inserts, `/look`, and `/help` are not bundled into this Change.
  - Narration and structured state consequences become visible together or not at all.
  - Current Adventure state remains materialized for efficient reads; immutable revision-linked mutation records preserve how each completed turn changed it.
  - Production model-call evidence remains metadata-only. Raw prompts and raw provider responses are not retained or logged.
  - The current polling worker topology, owner-only authorization, typed Tuyau boundary, and responsive Adventure shell remain in use.
- Deferred:
  - Story inserts, `/look`, `/help`, broad slash-command parsing, and player-facing NPC inspection.
  - Successful-turn Retry, rollback, branching, snapshots, and Adventure upgrades to newer WorldVersions.
  - Streaming, push delivery, model controls, rules adjudication, dice, combat, health, inventory, statistics, skills, quests, and progression.
  - Sharing, spectators, collaborative control, and multiplayer.
- Assumptions:
  - A failed uncommitted turn may be retried with the same input or discarded without changing story or state.
  - Stable Character and Location facts continue to come from the frozen WorldVersion; only Adventure-owned mutable fields are materialized.
  - The same configured OpenAI-compatible endpoint may perform narration and extraction initially, but the application contracts remain separate.
- User decisions that shaped the Story/Requirement split:
  - Taylor approved making the immediate phase the Act/Pass/Guide playable-turn core and leaving Story plus utilities for the following phase on 2026-07-18.

## Change Folder

- Planned location: promoted; private draft removed
- Active location: `docs/changes/2026-07-18-interactive-adventure-turns/`
- Closed location: `docs/changes/closed/2026-07-18-interactive-adventure-turns/`

## Impact

- Product: turns the existing Adventure opening into the first genuinely playable narrative loop.
- Code: Adventure turn persistence, mutation records, current NPC state, worker orchestration, generation/extraction adapters, API routes/contracts, query projections, and the Adventure composer/state UI.
- Tests: database invariants, policy/service tests, provider parsing, authorization/contract tests, frontend component and accessibility tests, deterministic E2E, live-provider playtest, and production-path acceptance after release.
- Docs: update LC-003, README Adventure/privacy/operations guidance, API/deployment notes affected by the expanded worker, and the changelog.
- ADRs: add the proposed revision-linked Adventure state mutation ADR and update existing asynchronous-work, immutable-revision, provider-boundary, and canon-isolation ADR links/evidence without changing their accepted decisions.

## Release Communication Impact

- Required: yes
- Record / section: `CHANGELOG.md` under `[Unreleased]` / `Added`
- Public summary: Players can now advance private Adventures with Act, Pass, and Guide turns whose narration and bounded Adventure state changes persist safely across reloads.

## Open Questions

- None block promotion or implementation.
