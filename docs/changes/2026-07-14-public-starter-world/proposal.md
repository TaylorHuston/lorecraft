# Proposal: Public Starter World

## Why

Lorecraft's authenticated workspace has no World content. A shared starter World will prove the first creator-facing world-bible path with real structured canon while giving every test account the same stable material to inspect.

## What Changes

- Add a public, read-only World catalog for authenticated accounts.
- Add a read-only World detail view containing structured Locations and Characters.
- Seed `Stormbound Chapel` from the proven MVP material through an explicit idempotent command.
- Assign the configured Lorecraft account as the World's author without exposing account identity in the public response.

## Epic Actions

- Create `LC-002 World Bible Catalog` under `docs/epics/lc-002-world-bible-catalog/epic.md`.
- Reconcile `LC-001/S3/R3`, whose empty-workspace behavior remains valid only when no accessible Worlds exist.

## Scope Decisions

- Public means visible to every authenticated Lorecraft account; anonymous access remains denied.
- The seed contains World metadata, Locations, and Characters.
- Character fields are name, physical description, background, personality, voice, private knowledge, and canonical seed location.
- Private knowledge is intentionally visible to signed-in users during this testing phase.
- The starter World is read-only in the web client. Authoring and editing are deferred.

## Non-Goals

- Anonymous publishing, public bylines, sharing controls, or collaborative editing.
- Adventures, mutable gameplay state, mood, status, memory, inventory, objects, players, exits, or opening narration.
- Dynamic content generation or automatic seeding during application startup.

## Release Communication Impact

- Required: yes. This is the first user-visible World catalog and structured world-bible content.

## Open Questions

- None block implementation. Broader publishing and authoring behavior remain future product work.
