# Proposal: Public Starter World

## Why

Lorecraft's authenticated workspace has no World content. A shared starter World will prove the first creator-facing world-bible path with real structured canon while giving every test account the same stable material to inspect.

## What Changes

- Add a public, read-only World catalog for authenticated accounts.
- Add a read-only World detail view containing structured Locations and Characters.
- Seed `Stormbound Chapel` from the proven MVP material through an explicit idempotent command.
- Assign the configured Lorecraft account as the World's author without exposing account identity in the public response.

## Target Repositories

- `spaces/code/lorecraft` - official application repository containing the API, web client, persistence, tests, and canonical SDD artifacts.

## Epic Actions

### New Epic Directories

- Create `LC-002 World Bible Catalog` under `docs/epics/lc-002-world-bible-catalog/epic.md`.

### Existing Epic Directory Updates

- Reconcile `LC-001/S3` so it owns authenticated workspace access while LC-002 owns World-catalog empty-state behavior.

## Epic Story Changes

- Add `LC-002/S1` for browsing accessible Worlds and its authenticated, anonymous, and empty-catalog Scenarios.
- Add `LC-002/S2` for inspecting structured World canon and its detail, not-found, and repeat-installation Scenarios.
- Remove duplicate empty-catalog Requirement ownership from `LC-001/S3`; retain the protected workspace and session boundaries there.

## Scope Decisions

- Public means visible to every authenticated Lorecraft account; anonymous access remains denied.
- The seed contains World metadata, Locations, and Characters.
- Character fields are name, physical description, background, personality, voice, private knowledge, and canonical seed location.
- Private knowledge is intentionally visible to signed-in users during this testing phase.
- The starter World is read-only in the web client. Authoring and editing are deferred.
- Assumption: the configured seed author account already exists before the explicit command runs.
- User decision: private Character knowledge remains visible to authenticated readers during this testing phase.

## Non-Goals

- Anonymous publishing, public bylines, sharing controls, or collaborative editing.
- Adventures, mutable gameplay state, mood, status, memory, inventory, objects, players, exits, or opening narration.
- Dynamic content generation or automatic seeding during application startup.

## Change Folder

- Planned location: not applicable; the Change was promoted directly through the established SDD workflow.
- Former active location: `docs/changes/2026-07-14-public-starter-world/`
- Closed location: `docs/changes/closed/2026-07-14-public-starter-world/`

## Impact

- Product: authenticated accounts gain a shared read-only World to browse and inspect.
- Code: adds the first World catalog persistence, API, typed client, and creator-facing read views.
- Tests: adds database, API, frontend, Storybook, and populated browser evidence for LC-002.
- Docs: creates LC-002 and updates public release communication.
- ADRs: records the relational World aggregate and disposable database automation decisions.

## Release Communication Impact

- Required: yes. This is the first user-visible World catalog and structured world-bible content.
- Record / section: `CHANGELOG.md` under Unreleased.
- Public summary: signed-in accounts can browse the shared read-only starter World and inspect its structured Locations and Characters.

## Open Questions

- None block implementation. Broader publishing and authoring behavior remain future product work.
