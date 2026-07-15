# Proposal: UI Cleanup and Reconciliation

## Why

Lorecraft's first complete web paths were built in separate capability changes. They work, but authentication, session states, the World catalog, and World detail still reflect different stages of the visual language. The result does not yet feel like one deliberate creator-first application.

This Change reconciles the entire currently implemented web experience with Lorecraft's official product direction and the shared UI foundation. It preserves the simple navigation and proven behavior while establishing a coherent baseline for future world-bible work.

## Desired Outcome

An account holder can move from sign-in or sign-up through session handling, the World catalog, and read-only World detail without encountering inconsistent composition, typography, controls, state treatment, or responsive behavior. The interface feels like a serious, compact creator tool rather than an MVP, a generic SaaS screen, or a gameplay client.

## What Changes

- Recompose sign-in and sign-up around a cardless, centered authentication layout with only the Lorecraft name as shell identity.
- Reconcile session loading, initial failure, background-refresh failure, and recovery states with the same component and token language.
- Reconcile the populated, empty, loading, error, retry, and sign-out states of the World catalog.
- Reconcile the loaded, loading, unavailable, not-found, retry, navigation, Location, and Character states of World detail.
- Adopt a dark-only Zinc hierarchy, Geist Sans interface typography, Geist Mono for technical metadata, and Burnished Orange interaction and identity accents, while retaining Steel Blue only for semantic information.
- Normalize spacing, control dimensions, focus, motion, icon use, borders, and radii across current surfaces.
- Refresh Storybook coverage and focused browser/component evidence for the reconciled desktop and mobile states.
- Update Lorecraft's private visual identity note so it describes the official creator-first application rather than the archived gameplay MVP.

## Scope Boundaries

### In Scope

- Every currently shipped frontend route and user-visible state under `/sign-in`, `/sign-up`, `/worlds`, and `/worlds/:slug`.
- Existing shared session-loading and session-error surfaces used by those routes.
- Presentation requirements and evidence under `LC-001` and `LC-002`.
- Existing Storybook stories and deterministic frontend/E2E coverage needed to prove the reconciliation.

### Out Of Scope

- A persistent creator-workbench shell, sidebar, or new information architecture.
- World creation, editing, search, filtering, timeline, continuity, AI, or Adventure behavior.
- New authentication capabilities such as recovery, verification, social login, passkeys, or MFA.
- Backend, database, API, session, CSRF, visibility, or World contract changes.
- Light mode.
- New authentication interactions such as password reveal controls.
- Visual reconciliation of the deferred Adventure Storybook prototype; it remains subject only to repository-wide build and regression gates.
- A new general-purpose component library or shared cross-application package.

## Target Repositories

- This repository (role: official-application).

## Epic Actions

### New Epic Directories

- None.

### Existing Epic Directory Updates

- `docs/epics/lc-001-account-identity-and-workspace-access/`
- `docs/epics/lc-002-world-bible-catalog/`

## Epic Story Changes

- Modify `LC-001/S1` to record the durable accessible and responsive presentation of account creation, including the visible confirmation field and actionable validation states.
- Modify `LC-001/S2` to record the durable accessible and responsive presentation of sign-in, pending/error states, and non-destructive session-refresh recovery.
- Modify `LC-001/S3` only where shared protected-session and sign-out states require presentation and focus evidence; authentication semantics remain unchanged.
- Modify `LC-002/S1` to record a coherent, responsive catalog presentation across populated, empty, loading, failure, retry, and sign-out states.
- Modify `LC-002/S2` to record a coherent, responsive read-only detail presentation across loaded, loading, not-found, failure, retry, navigation, Location, and Character states.
- Preserve all existing Story boundaries, backend Requirements, API behavior, and evidence not invalidated by presentation changes.

## Confirmed Decisions

- Reconcile the full currently implemented web experience, not authentication alone.
- Preserve the simple World-list-to-World-detail navigation model.
- Do not add a persistent application shell in this Change.
- Omit the empty upper-right utility area from centered authentication screens.
- Remain dark-mode-only.
- Use `#09090B` for the canvas, `#18181B` for primary work surfaces, and `#27272A` for raised, selected, interactive, or overlay surfaces.
- Use Geist Sans for controls and general interface text, and Geist Mono only for technical metadata.
- Use Burnished Orange for actions, links, focus, Lorecraft identity, and moments of deliberate emphasis; do not retain Verdigris.
- Retain Steel Blue only for semantic information where it needs to remain distinct from interaction.
- Use canonical Burnished Orange `#E58A3A` for those interaction and identity roles.
- Use `2px` row radii, `4px` control/input radii, no more than `6px` for floating panels/dialogs, and `0` for flush structural surfaces.
- Use a `4px` spacing rhythm, restrained motion, Lucide icons for familiar actions, and visible Burnished Orange keyboard focus.

## Success Signals

- All current routes and state variants use one recognizable visual grammar at desktop and mobile widths.
- Authentication no longer uses the decorative split context pane.
- Catalog and detail retain their current information architecture and all current content.
- Existing account and World behavior remains unchanged and deterministic tests continue to pass.
- Storybook exposes the meaningful visual states needed for review without depending on live services.
- World detail communicates empty Location and Character collections without inventing canon or collapsing the document hierarchy.
- Manual review confirms readable hierarchy, responsive behavior, focus visibility, touch targets, and no horizontal overflow.

## Impact

- Product: the existing application becomes a coherent creator-facing baseline.
- Code: frontend tokens, shared route-state presentation, auth, catalog, detail, and Storybook/test files are expected to change; backend code is not.
- Tests: existing behavior evidence remains; visual-state, keyboard, responsive, and regression coverage is refreshed where needed.
- Docs: `LC-001`, `LC-002`, and the private Lorecraft visual identity are reconciled.
- ADRs: none expected because this is a reversible presentation reconciliation within accepted frontend architecture.

## Release Communication Impact

- Required: yes.
- Record / section: `CHANGELOG.md`, under the next release's user-facing `Changed` section.
- Public summary: Lorecraft's account access and World-browsing screens now use a consistent, responsive creator-focused interface.

## Deferred Scope

- Creator-workbench navigation and authoring composition.
- Light mode and any automatic theme selection.
- A fiction-reading typeface or broader brand refresh.
- New product capabilities or data presentation beyond currently accepted Epic truth.

## Assumptions

- Current backend contracts, authorization, session behavior, routes, and World content remain unchanged.
- The existing CSS Modules and centralized token approach remains the project convention.
- Storybook remains the deterministic visual workbench for component and state review.

## Open Questions

- None block planning.
