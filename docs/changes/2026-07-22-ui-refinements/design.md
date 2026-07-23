# Design: UI Refinements

## Context

Lorecraft is running locally for iterative inspection. The first request targets the existing Adventure desktop workbench: it already renders Player, Story, and Scene as three columns, but a contextual header consumes vertical space above it.

## Goals / Non-Goals

**Goals:**

- Improve a named existing UI surface without broadening product behavior.
- Preserve responsive, accessible interaction and current visual conventions.
- Inspect actual rendering rather than relying only on source or test exits.
- Make Adventure mode a full-height three-column desktop workbench without a top navigation bar while retaining Return to World and Adventure settings in contextual Player-pane controls.

**Non-Goals:**

- Redesign product flows or introduce new World, Character, or Adventure capabilities.
- Change database state, authorization, API contracts, provider behavior, or deployment configuration.

## Technical Approach

- Locate the owning frontend route/component and its closest existing test, Storybook state, or E2E coverage after each request.
- Make the smallest safe presentation change.
- Use rendered verification at an appropriate viewport and record the exact surface in `tasks.md`.
- Update Epic truth only when a request changes accepted behavior or its scenario-mapped evidence.
- Remove the Adventure-page header. Pass its contextual settings action into the workbench and render Return to World plus Settings inside the Player pane. The existing narrow View tabs remain the navigation model below the desktop breakpoint.

## Affected Epic Truth

| Epic | Story | Requirement / Scenario | Impact | Needed Update |
|---|---|---|---|---|
| LC-003 Adventure Play | S1, S3 | S1/R5-S2, S1/R5-S4, S3/R1-S1, S3/R2-S1, S3/R3-S1 | Existing Player / Story / Scene composition becomes the complete desktop shell; contextual settings adds a current-Scene NPC card drill-down without expanding the save boundary. | Update implementation/evidence anchors after focused tests and rendered inspection. |

## Experience Design

- Current direction: use three persistent desktop panes—Player at left, Story dominant in the center, and Scene at right—without a top navigation bar. Return and Settings are contextual Player-pane controls, not global navigation. The frozen World name is a pinned, large Story-column heading; it is a presentation label rather than a new Adventure title field, and a soft background gradient lets narration visually recede beneath it as the story scrolls. The composer omits the repeated provider disclosure and keeps concise Send and Pass actions right-aligned like a chat composer. Adventure Settings opens a large two-pane workspace: a left keyboard-operable section navigator (Adventure Settings, NPCs, Locations) and a right detail panel. The NPC section lists square initial-avatar cards for every NPC projected into the current Scene; a card opens the existing full local Debug editor. Prompt instructions and Location tools remain explicit placeholders, and no new production NPC mutation boundary is introduced.
- Responsive/accessibility baseline: retain semantic Link/Button controls, visible focus, 44px action targets, Story-first keyboard-operable narrow tabs, clear pending/error feedback, and no horizontal overflow.
- Rendered evidence: inspect the Adventure ready state at desktop and narrow viewports through the existing Storybook fixture and local route; record the exact surface, result, and console/network outcome in `tasks.md`.

## Alternatives / Deferred

- A broad navigation or visual-system redesign is deferred to `/sdd-change --plan` and, if experience uncertainty is material, `/sdd-design --plan`.

## Open Questions

- Awaiting the first concrete UI refinement.
