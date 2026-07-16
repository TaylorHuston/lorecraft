# Proposal: Private Adventure Foundation

## Why

Lorecraft can currently authenticate accounts and expose read-only structured World canon, but a user cannot enter that canon as a player. The archived MVP proved that isolated Adventures, generated narration, persistent player and scene context, and provider-neutral model calls are viable. The official application now needs the first durable Adventure path without importing the prototype's entire runtime in one batch.

This Change establishes the boundary on which later turns and state mutation depend: an account starts a private Adventure from an explicit immutable World version, receives a generated opening based on a creator-authored starting premise, and can leave and resume the same Adventure without later World edits changing it.

## What Changes

- Add the first Adventure Epic, `LC-003 Adventure Play`, with one accepted Story for starting and resuming a private Adventure.
- Make a World playable through one default Starting Point containing a starting Location and opening premise.
- Publish immutable WorldVersion snapshots from the relational World aggregate and bind each Adventure to one version.
- Let an authenticated account create an Adventure from an accessible World by providing a required player name and optional physical description and backstory.
- Generate the Adventure opening through a provider-neutral Game Master interface using durable asynchronous backend work.
- Add account-owned Adventure list, creation, pending, failed, ready, resume, reset, and delete paths.
- Render the opening story plus persistent Player and Scene context at `/adventures/<id>`.
- Preserve exact request, response, model, timing, retry, and failure evidence for opening generation with secrets redacted.
- Extend the Stormbound Chapel seed with Adventure guidance and a default Starting Point, and publish a version only when its canonical snapshot changes.

## Target Repositories

- This repository (role: official-application).

## Epic Actions

### New Epic Directories

- Created `docs/epics/lc-003-adventure-play/epic.md` during promotion.
- Accept `LC-003/S1 Start And Resume A Private Adventure` as the only Story owned by this Change.
- Record later turn resolution, story-shaping utilities, and history revision as Candidate Stories without assigning `S#` labels prematurely.

### Existing Epic Directory Updates

- Update `docs/epics/lc-002-world-bible-catalog/epic.md` so its deferred Adventure boundary points to `LC-003` instead of treating Adventures as an unowned future area.
- Do not otherwise change the implemented truth or evidence for `LC-002`.

## Epic Story Changes

- Added: `LC-003/S1 Start And Resume A Private Adventure`.
- Candidate only: resolve structured Game Master turns with Act, Pass, and Guide.
- Candidate only: add player-authored Story entries and `/look` and `/help` utilities.
- Candidate only: expose Player, Scene, NPC, and turn diagnostics as state mutation is introduced.
- Candidate only: successful-turn Retry, rollback, snapshots, and branching.
- No existing Story moves between Epics.

## Scope Decisions

- Confirmed:
  - An Adventure is private to its creating account, even when its source World is public.
  - Each Adventure references one explicit immutable WorldVersion and one versioned Starting Point.
  - Later source edits do not affect an existing Adventure, and Adventure data never mutates source canon.
  - The first playable World has one default Starting Point; multiple starting locations and dates remain future-compatible.
  - The creator supplies the premise and World-specific Adventure guidance; the Game Master renders the opening narration.
  - The player character is Adventure-owned, requires a name, and may have an optional physical description and backstory.
  - Opening generation is durable asynchronous work. Reloading or changing tabs does not lose it.
  - Adventures are discovered under their source World and resume at `/adventures/<id>`.
  - Reset reuses the original WorldVersion, Starting Point, and player profile; delete removes only the Adventure.
  - The relational World aggregate remains authoritative for authoring; immutable versions are validated snapshots used by Adventures.
  - No transcript-only Adventure runtime will be introduced.
- Deferred:
  - Act, Pass, Story, Guide, `/look`, `/help`, state extraction, mutation, turn numbering, and completed-turn revisions beyond the opening root revision.
  - Dice, combat, inventory, health, stats, skills, quests, progression, and rules adjudication.
  - Successful-turn Retry, rollback, branching, version upgrades, and promoting Adventure events into canon.
  - Multiple Starting Points, selectable dates, canonical protagonist templates, sharing, spectators, and multiplayer.
  - Creator-facing World version management and World authoring UI.
  - Player-facing model or generation controls, streaming, and push delivery.
- Assumptions:
  - The player's name is sufficient Adventure identity in the World list; a separate Adventure title is not required yet.
  - Reset preserves the original player profile but clears generated story and Adventure-owned runtime state before regenerating the opening.
  - A failed opening can be retried against the same frozen source without creating another Adventure.
  - Stormbound Chapel is the first playable World; other Worlds without a published version and default Starting Point remain inspectable but cannot start an Adventure.
- User decisions that shaped the Story/Requirement split:
  - Epics should represent user paths rather than technical architecture.
  - The complete Adventure runtime should arrive through staged Changes, not one undifferentiated implementation batch.
  - Frozen-source isolation, durable async work, provider neutrality, revision links, and a single structured runtime are foundation constraints rather than optional later refactors.

## Change Folder

- Planned location: promoted; private draft removed
- Active location: `docs/changes/2026-07-16-private-adventure-foundation/`
- Closed location: `docs/changes/closed/2026-07-16-private-adventure-foundation/`

## Impact

- Product: Adds the first official path from World canon into a private, resumable Adventure and stops at the opening decision point.
- Code: Adds World versioning and Starting Points, Adventure persistence and authorization, a durable opening worker, provider-neutral generation, typed APIs, Adventure routes, and responsive UI states.
- Tests: Requires migration, service, worker, API, typed-client, component, Storybook, deterministic E2E, and manual live-model evidence.
- Docs: Adds `LC-003`, updates `LC-002`, documents runtime configuration and worker operation, and updates README capability boundaries.
- ADRs: Adds immutable WorldVersion snapshot and durable asynchronous Adventure work decisions; updates the existing World/Adventure isolation ADR's implementation evidence.

## Release Communication Impact

- Required: yes
- Record / section: `CHANGELOG.md` under the next release's user-facing `Added` section; update README current capabilities and local runtime instructions.
- Public summary: Accounts can begin and resume private Adventures from a frozen version of Stormbound Chapel, with an AI-generated opening that survives reloads and remains isolated from later World changes.

## Open Questions

- None block implementation. Later candidate Stories remain intentionally unaccepted until this foundation is verified.
