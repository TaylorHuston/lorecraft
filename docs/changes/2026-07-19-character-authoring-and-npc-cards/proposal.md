# Proposal: Character Authoring And NPC Cards

## Why

Lorecraft already stores structured Characters in authoritative World canon and copies their stable identity into immutable WorldVersions, but creators cannot create, edit, or delete them. The World detail route is read-only, private knowledge is withheld, and Adventures reduce present NPCs to name and physical description even though the backend now owns mutable NPC location, mood, status, and memory.

The archived Lorecraft MVP demonstrated a useful NPC Card pattern: stable authored fields ground description, dialogue, behavior, and secrets, while a small Adventure-owned state surface carries durable changes. This Change brings that pattern into the production architecture without restoring the spike's generic fact system, exposing off-scene NPCs to the model, or adding goals, relationships, schedules, autonomous simulation, or other unproven complexity.

The first version must also be token-conscious. Every field is required so a Character Card is intentional and complete, but values may be concise. Lorecraft will send complete cards only for NPCs in the current Scene, enforce compact field limits, and record bounded context-size metadata so later optimization is driven by playtesting rather than speculative retrieval machinery.

## What Changes

- Add owner-only Character create, edit, and delete behavior to an accessible World.
- Keep `Character` as the medium-agnostic World-canon term and use `NPC` for a non-player Character inside an Adventure.
- Use the existing required stable fields: name, physical description, background, personality, voice, private knowledge, and canonical Location.
- Add required initial mood, status, and player-memory fields to World Characters so a published WorldVersion can initialize complete Adventure NPC Cards.
- Treat background as the place for enduring motivation, personality as decision style, status as current circumstance plus immediate objective, and memory as a compact direct-player-interaction summary rather than adding separate goal or motivation fields.
- Automatically publish or reuse a new immutable WorldVersion in the same transaction as every successful Character create, edit, or delete. New Adventures use the new current version; existing Adventures remain frozen.
- Expose complete Character Cards on World detail and complete current-state NPC Cards in the Adventure Scene during this development-stage permanent-debug phase, including private knowledge.
- Allow the Adventure owner to autosave every bounded, displayable NPC card field except its stable key from that Scene debug card; the frozen World Character and starter seed remain unchanged.
- Preserve authorization: every signed-in account with World access may inspect the full debug card for now, but only the World author may mutate Character canon.
- Send complete cards for all and only NPCs present in the current Scene to opening, turn-narration, and state-extraction context.
- Keep normal model-call evidence metadata-only, and default the local development Debug trace and sanitized raw provider request/response capture on for prompt grounding and refinement. Developers may explicitly disable either local capture mode; production remains refused.
- Add focused backend, frontend, Storybook, E2E, rendered-UI, and live-provider playtest evidence for authoring, publication, frozen-source isolation, card presentation, context selection, and prompt-size behavior.

## Target Repositories

- This repository (role: official-application).

## Epic Actions

### New Epic Directories

- None.

### Existing Epic Directory Updates

- `docs/epics/lc-002-world-bible-catalog/epic.md`
  - Normalize the complete legacy Epic to `sdd-epic-v2` because this is a material behavior and evidence update.
  - Modify `LC-002/S2` so accessible World detail exposes complete Character Cards during the debug stage.
  - Add `LC-002/S3`, Manage World Characters.
  - Reconcile the read-only outcome, authoring/private-knowledge deferred scope, Story Index, implementation/evidence maps, cross-Story concerns, and completion criteria.
- `docs/epics/lc-003-adventure-play/epic.md`
  - Modify `LC-003/S1` so WorldVersion publication, Adventure creation, and reset initialize the complete NPC state card.
  - Modify `LC-003/S2` so narration and extraction receive complete current-Scene NPC Cards, bounded normal-operation size metadata, and an explicit local Debug trace while preserving the existing mutation allowlist.
- Add `LC-003/S3`, Inspect Complete NPC Cards.
  - Modify `LC-003/S2` so private card material is enforced as non-player-visible narration, not merely instructed as such.
  - Modify `LC-003/S3` so local Debug mode can edit and autosave every bounded, displayable Adventure-owned NPC card field except its stable key, including a usable selected-card path after Location changes, without changing frozen canon.
  - Reconcile the `shape-and-inspect-story` candidate so NPC card inspection moves into accepted scope while Story, `/look`, and `/help` remain proposed.

## Epic Story Changes

- Modify `LC-002/S2`: expose complete required Character fields, including private knowledge and initial Adventure state, on accessible World detail during the permanent-debug development phase.
- Add `LC-002/S3`: As a World creator, I want to create, edit, and delete complete Character Cards, so that my current canon and future Adventures use the Characters I intend.
- Modify `LC-003/S1`: seed and reset NPC location, mood, status, and memory from the Adventure's immutable WorldVersion instead of empty mutable values.
- Modify `LC-003/S2`: include complete cards for every current-Scene NPC and no off-scene NPCs in both narration and extraction context; enforce private-card non-disclosure in player-visible narration; retain metadata-only normal evidence plus default-on local development diagnostics for refinement.
- Add `LC-003/S3`: As an Adventure owner, I want to open complete cards for NPCs in my current Scene, so that I can inspect the exact canon and mutable state guiding the story during development.

## Scope Decisions

- Confirmed:
  - Creator-facing Character authoring and Adventure-facing NPC cards are one coordinated phase.
  - Every core field is required, but a phrase or short sentence may satisfy fields that do not need detail.
  - No separate motivation or current-goal field; background and status carry those meanings when needed.
  - Full create, edit, and delete are in scope.
  - Each successful mutation automatically publishes or reuses the current immutable WorldVersion.
  - Existing Adventures never change when later World Character canon changes.
- Full cards, including private knowledge and mutable state, are intentionally visible in World and Adventure UI for the current permanent-debug development phase.
- Local Debug mode may edit every bounded, displayable Adventure-owned NPC card field except its stable key; source Character canon remains unchanged, no active turn may race with an edit, and moving an NPC must not strand its active editor.
  - Complete cards for every current-Scene NPC are sent to the model; off-scene NPCs are excluded.
  - Playtesting and bounded size measurements decide whether later targeting, ranking, retrieval, or summarization is justified.
  - Local development defaults Debug JSONL and sanitized raw request/response capture on. Explicit environment overrides may disable either mode; raw bodies never become normal model-call evidence and Debug still refuses production.
- Deferred:
  - Optional or custom Character fields, generic facts, typed relationships, factions, schedules, multiple memories, behavior packages, autonomous offscreen action, and NPC creation during play.
  - Separate motivations, goals, instincts, story roles, tactical statistics, health, inventory, equipment, rules, and combat.
  - Knowledge visibility, spoiler filtering, player-known facts, selective disclosure, and removing the permanent-debug full-card view.
  - Draft/publish workflows, version-management UI, bulk editing/import, Character ordering controls, and applying a newer WorldVersion to an existing Adventure.
  - Dynamic prompt targeting, relevance ranking, retrieval, summarization, or truncation.
- Assumptions:
  - The active `2026-07-18-interactive-adventure-turns` Change will complete its acceptance, integration, and closeout before this Change is promoted or applied.
  - Stable Character keys are generated once at creation and remain immutable; changing display name does not change identity.
  - Character authoring uses the existing World detail route rather than introducing a separate World Builder navigation system in this phase.
  - The existing provider-neutral narration/extraction split and Adventure mutation allowlist remain authoritative.
- User decisions that shaped the Story/Requirement split:
  - Taylor confirmed both creator-facing canon and Adventure behavior should be covered.
  - Taylor asked to use the archived spike as inspiration and to surface complete cards in the UI.
  - Taylor accepted a permanent-debug phase with entire cards exposed.
  - Taylor preferred folding motivation into background and immediate goals into status instead of adding fields.
  - Taylor required all fields while allowing sparse content.
  - Taylor approved full CRUD, automatic WorldVersion publication, and complete current-Scene cards with playtest-led optimization.
  - Taylor confirmed that spike-level Debug logging is required to accurately test and refine Adventure prompting.
  - Taylor requested that local development Debug capture and sanitized raw provider request/response capture are enabled by default.

## Change Folder

- Planned location: promoted; private draft removed
- Active location: `docs/changes/2026-07-19-character-authoring-and-npc-cards/`
- Closed location: `docs/changes/closed/2026-07-19-character-authoring-and-npc-cards/`

## Impact

- Product: Delivers the first creator-owned canon authoring path and makes the exact NPC state guiding Adventure play inspectable.
- Code: Character schema/model/seed/publication; owner-scoped application services, validation, controllers, routes, DTOs, and generated Tuyau contract; World detail editing; Adventure initialization/reset/query projections; prompt assembly, normal operational metadata, and development-only Debug capture; responsive card presentation.
- Tests: Character migration rollback protection and authorization, transactional CRUD/publication, frozen-version isolation, private-card narration protection, selected-card recovery after a Location move, Debug default/disable/production-refusal/file-retention behavior, frontend state/validation/accessibility, deterministic authoring-to-Adventure E2E, rendered desktop/mobile inspection, and live-provider playtests with local trace inspection.
- Docs: Normalize LC-002, reconcile LC-003, update the provider-boundary ADR, and update README/API/privacy/testing guidance, Idea visual identity, and the public changelog where current claims change.
- ADRs: Amend accepted `docs/adrs/2026-07-17-provider-neutral-ai-boundary.md` with the narrow development-only Debug capture exception; relational World, immutable WorldVersion, and World/Adventure isolation decisions otherwise remain unchanged.

## Release Communication Impact

- Required: yes
- Record / section: `CHANGELOG.md` under `[Unreleased]` / `Added`
- Public summary: World creators can now manage complete Character Cards, and Adventures expose full current-Scene NPC Cards grounded in frozen canon and bounded mutable state.

## Open Questions

- None block promotion or implementation. The current World detail/workbench composition plus the archived spike's inline debug-card editor and list-to-card Scene interaction provide a sufficiently concrete experience reference for this phase.
