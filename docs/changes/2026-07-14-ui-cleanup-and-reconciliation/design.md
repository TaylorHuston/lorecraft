# Design: UI Cleanup and Reconciliation

## Context

Lorecraft is an AdonisJS API with a Vite React client. The current client has four routes: sign-in, sign-up, the authenticated World catalog, and read-only World detail. Authentication uses a split-pane layout; catalog and detail use separate page-level compositions; route-level session states use a third treatment. The behavior is established and well tested, but the surfaces do not yet read as one application.

The official product is now a creator-first world bible, while the private Lorecraft visual identity still describes the archived gameplay MVP. This Change reconciles current UI and private design guidance without expanding product capability or changing the existing list-to-detail information architecture.

## Goals / Non-Goals

**Goals:**

- Make every currently shipped route and state feel like one creator-focused application.
- Establish a stable dark visual foundation for near-term world-bible work.
- Preserve accessible labels, focus behavior, errors, pending states, recovery, navigation, and responsive behavior.
- Keep visual states deterministic and inspectable in Storybook.

**Non-Goals:**

- Introduce a creator-workbench shell, sidebar, dashboard, or new route hierarchy.
- Change authentication, World data, permissions, API contracts, or server behavior.
- Add authoring or other new product capabilities.
- Implement light mode or a shared design-system package.

## Planning Interview / Story Refinement

- Scope boundary: full reconciliation means all current web routes and their shared session states, not a new shell or new functionality.
- Navigation: preserve the simple World catalog leading to World detail.
- Authentication: use a centered, cardless composition; omit an upper-right utility with no real destination; retain visible password confirmation.
- Authentication interactions: preserve the current password-field behavior; password reveal controls remain deferred rather than entering through visual cleanup.
- Theme: dark-only for this Change.
- Identity: Steel Blue owns interaction and focus; Burnished Orange is a sparse Lorecraft identity accent.
- Epic ownership: account and session presentation remains under `LC-001`; catalog and structured detail presentation remains under `LC-002`.
- Deferred: light mode, authoring composition, persistent navigation, and new capabilities.
- Open questions that block implementation: none.

## Epic Changes

### Update Epic: LC-001 Account Identity And Workspace Access

- Target Epic: `docs/epics/lc-001-account-identity-and-workspace-access/epic.md`
- Change type: modified presentation Requirements, Scenarios, implementation map, and evidence.

#### Story S1: New User Enters Their Workspace

Add or refine a presentation Requirement without changing account semantics:

##### Requirement R3: Accessible Account Creation Presentation

The system SHALL present account creation as a focused, responsive Lorecraft form with persistent field labels, visible password confirmation, clear validation and pending states, and keyboard-visible focus.

###### Scenario R3-S1: Account Creation At Supported Viewports

- WHEN a visitor opens sign-up at desktop or mobile width
- THEN the Lorecraft identity and complete account form remain readable without horizontal overflow
- AND Email, Password, and Confirm password remain visibly labeled and operable.

###### Scenario R3-S2: Validation And Pending Feedback

- WHEN sign-up validation fails or submission is pending
- THEN field and form feedback remains associated with the relevant controls
- AND the current form values and layout remain stable enough to recover without re-entry caused by presentation changes.

#### Story S2: Returning User Resumes Their Workspace

Add or refine a presentation Requirement without changing session semantics:

##### Requirement R3: Focused Sign-In And Session Recovery

The system SHALL present sign-in and public session-refresh recovery as focused, responsive states with actionable feedback and visible keyboard focus.

###### Scenario R3-S1: Sign-In At Supported Viewports

- WHEN a visitor opens sign-in at desktop or mobile width
- THEN the Lorecraft identity, credentials, account-navigation link, and submission action remain readable and operable without horizontal overflow.

###### Scenario R3-S2: Background Session Check Fails

- WHEN a background session check fails while an unfinished public form remains mounted
- THEN a visually distinct but non-destructive recovery notice is presented
- AND its retry action is keyboard and touch accessible without obscuring the form.

#### Story S3: User Controls Protected Workspace Access

Preserve existing Requirements. Reconcile only shared session-loading, session-failure, sign-out pending/failure, focus, and recovery presentation plus their implementation/evidence maps.

### Update Epic: LC-002 World Bible Catalog

- Target Epic: `docs/epics/lc-002-world-bible-catalog/epic.md`
- Change type: modified presentation Requirements, Scenarios, implementation map, and evidence.

#### Story S1: Browse Available Worlds

Add a presentation Requirement without changing catalog semantics:

##### Requirement R2: Coherent World Catalog Presentation

The system SHALL present the World catalog and its loading, failure, empty, populated, retry, and sign-out states through one responsive Lorecraft interface.

###### Scenario R2-S1: Populated Catalog

- WHEN an authenticated account has accessible Worlds
- THEN each World's name, description, visibility, and read-only state remain scannable at desktop and mobile widths
- AND the World name remains the clear navigation action.

###### Scenario R2-S2: Empty Or Loading Catalog

- WHEN the catalog is loading or contains no accessible Worlds
- THEN the interface communicates that state without layout instability
- AND it does not present unavailable creation behavior.

###### Scenario R2-S3: Recoverable Catalog Or Sign-Out Failure

- WHEN catalog loading or sign-out fails recoverably
- THEN the interface presents an actionable error without hiding available context
- AND any retry action has visible focus and a touch-accessible target.

#### Story S2: Inspect Structured World Canon

Add a presentation Requirement without changing detail semantics:

##### Requirement R2: Readable Structured World Detail

The system SHALL present World metadata, Locations, Characters, navigation, and detail-state feedback in a readable responsive hierarchy.

###### Scenario R2-S1: Structured Detail At Supported Viewports

- WHEN a signed-in account opens an accessible World at desktop or mobile width
- THEN World identity, description, Locations, and all accepted Character fields remain readable without horizontal overflow
- AND the read-only state and return navigation remain clear.

###### Scenario R2-S2: Missing Or Unavailable World

- WHEN World detail is missing, loading, or temporarily unavailable
- THEN the state is clearly distinguished from loaded canon
- AND available retry or return navigation remains keyboard and touch accessible.

###### Scenario R2-S3: Empty Structured Collections

- WHEN an accessible World contains no Locations, no Characters, or neither collection
- THEN each empty collection is communicated explicitly without inventing canonical content
- AND the World identity and document hierarchy remain stable and readable.

### Reconciliation Rules

- Preserve existing Story labels and Requirement/Scenario IDs; append new local IDs without renumbering accepted behavior.
- Do not rewrite backend Requirements as visual Requirements.
- Update `Implemented By` only for files materially changed by the reconciliation.
- Add scenario-mapped Storybook, component, E2E, accessibility, responsive, and manual evidence without deleting still-valid backend evidence.
- Update modified and verification dates only when the corresponding work and evidence exist.

## Technical Options

### Option 1: Bounded Reconciliation In Existing Components

- Summary: normalize tokens and global interaction rules, then recompose each existing route/state using its current semantic components and CSS Modules.
- User impact: coherent UI with no navigation or behavior change.
- Complexity: moderate and bounded to the frontend.
- Reversibility: high; route and API contracts remain untouched.
- Testability: strong through current component tests, Storybook, and E2E paths.
- Fit: matches current architecture and project styling guidance.

### Option 2: Introduce A Persistent Creator-Workbench Shell

- Summary: redesign authenticated routes around persistent navigation and content regions.
- User impact: may better anticipate authoring, but changes information architecture before authoring workflows exist.
- Complexity: high; requires new shell behavior, responsive navigation, and broader Story decisions.
- Reversibility: moderate because later routes would build on it.
- Testability: feasible but materially expands the state matrix.
- Fit: plausible future direction, premature for current read-only scope.

### Option 3: Global CSS Override Without Component Recomposition

- Summary: change tokens and broad selectors while retaining current markup and local exceptions.
- User impact: superficial consistency, with unresolved composition and accessibility differences.
- Complexity: initially low but creates cascade and maintenance risk.
- Reversibility: moderate.
- Testability: weak because visual behavior depends on broad overrides.
- Fit: conflicts with semantic CSS Modules and shallow selector guidance.

## Selected Approach

Use Option 1. Update the centralized token layer first, including semantic surface, text, action, identity, focus, radius, spacing, control-height, and motion roles. Recompose existing auth, route-state, catalog, and detail components only where their current markup prevents the agreed hierarchy or state treatment. Keep component-specific layout in CSS Modules and keep behavior, API calls, query ownership, routes, and server contracts unchanged.

Authentication becomes a constrained, centered, cardless composition with Lorecraft as the only shell identity. Catalog remains a compact list rather than decorative cards. World detail remains a readable document-like hierarchy rather than becoming an editor or dashboard. Shared loading and error states use the same typography, controls, focus, and spacing language as those pages.

Update Storybook stories so each meaningful deterministic state can be reviewed in isolation. Prefer stable mocked dependencies and interaction assertions over screenshot-only confidence. Use existing E2E flows to confirm complete desktop/mobile journeys and add only focused checks that protect newly accepted presentation behavior.

Bundle Geist Sans and Geist Mono through app-local assets or an installed package so the application and Storybook load the same files without a runtime font-service dependency. The CSS family declaration alone is not sufficient evidence that Geist is active.

The Adventure workbench under `src/prototypes/adventure/` remains a deferred design probe, not a current application surface. Global token changes must leave its Storybook stories buildable and testable, but this Change must not restyle the prototype, add prototype-specific exceptions, or treat it as visual acceptance scope.

## Current State Matrix

| Surface          | States in scope                                                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sign up          | default, validation errors, pending/submission behavior, account navigation, responsive layout                                                                       |
| Sign in          | default, invalid credentials, pending/submission behavior, account navigation, responsive layout                                                                     |
| Session boundary | initial loading, initial connection failure, background refresh failure, retry, protected revalidation                                                               |
| World catalog    | loading, populated, empty, load failure, retrying, sign-out pending, sign-out failure                                                                                |
| World detail     | loading, loaded, empty Locations, empty Characters, both collections empty, not found, unavailable, retrying, return navigation, responsive Locations and Characters |

## Client And API Boundary

- Current client: Vite React web SPA.
- Plausible future clients: mobile, alternate web, CLI/automation, administrative tools, and Adventure clients.
- Reusable product capabilities: unchanged account/session and read-only World APIs.
- API or typed contract: unchanged AdonisJS/Tuyau contract.
- Frontend/backend boundary: React owns presentation and client-local state; AdonisJS remains authoritative for validation, authentication, authorization, visibility, and World data.
- Client-specific state: form values, query loading/error state, responsive layout, focus, and visual feedback.
- Rationale: this Change is presentation-only and must not move durable behavior into the client.

## ADRs

- Required: no.
- Decision summary: no durable architecture boundary changes; existing CSS Modules, token ownership, React client, and Storybook decisions remain in force.
- Reconsider when: Lorecraft adopts a persistent shell, multiple clients share a real component contract, or theme selection becomes product behavior.

## Implementation Constraints

- Dark-only canvas `#09090B`, primary surface `#18181B`, and raised/interactive surface `#27272A`.
- Steel Blue `#5D8DB8` for actions, links, focus, information, and neutral technical emphasis.
- Burnished Orange `#E58A3A` as a sparse app-owned identity accent; no Verdigris.
- Geist Sans for interface text; Geist Mono only for paths, IDs, timestamps, commands, code, logs, structured values, and genuinely technical metadata. Load both deterministically from app-local assets or an installed dependency in the application and Storybook; do not depend on a runtime font CDN.
- `2px` row, `4px` control/input, maximum `6px` floating-panel, and `0` structural radii.
- `4px` spacing rhythm; `28px` dense controls, `32px` normal toolbar controls, `36px` standard inputs/buttons, and at least `44px` touch hit areas.
- `2px` Steel Blue `:focus-visible` ring with `2px` offset, distinct from hover and selection.
- `150ms` direct-control and `200ms` panel/disclosure motion; reduced motion removes nonessential transitions.
- Lucide for familiar actions when an icon improves comprehension; do not add icon-only controls without accessible names.
- Use spacing and tonal contrast before borders. Use no shadows, decorative gradients, or atmospheric backgrounds.
- Preserve semantic HTML, persistent labels, alert/status roles, current focus recovery, and native control behavior.
- Do not hide interaction behind hover, create horizontal overflow, or obscure content with fixed notices.
- Do not expose private planning paths or private visual notes in the public repository.

## Verification Strategy

### Focused Automated Tests

- Preserve account and World behavior tests; update presentation assertions only where accepted markup changes require it.
- Add focused assertions for persistent labels, confirm-password visibility, state roles, retry availability, navigation, and no loss of accepted content.
- Use the existing Storybook `@storybook/addon-a11y` error gate for every in-scope application story and retain scenario-mapped evidence that those stories pass without reported violations.

### Storybook

- Cover every state in the matrix that can be deterministic without a live backend.
- Include desktop and mobile viewport review for auth, populated/empty catalog, loaded detail, and primary recovery states.
- Include empty Location, empty Character, and fully empty structured-detail stories without fabricating canon.
- Keep interaction tests for validation, retry, sign-out failure, and important keyboard-visible controls where deterministic.
- Keep deferred Adventure prototype stories buildable and testable, but exclude them from visual reconciliation and acceptance evidence.

### Deterministic E2E

- Run the account journey and starter-World journey at the established desktop and mobile sizes.
- Assert route transitions, visible content, successful recovery paths where controlled, and absence of horizontal document overflow on representative pages.

### Broad Supporting Gates

- Root lint, test, typecheck, build, Storybook test/build, and scoped E2E commands required by the repository.

### Manual UI Confirmation

- Review sign-up, sign-in, session failure/retry, populated and empty catalog, and loaded/missing detail at desktop and mobile widths.
- Confirm hierarchy, density, contrast, focus visibility, touch targets, responsive wrapping, no horizontal overflow, and continuity between routes.

## Risks / Trade-Offs

- A full visual pass can accidentally alter proven behavior through markup changes. Mitigate by preserving component boundaries and running focused behavior tests after each surface group.
- Updating global tokens can affect every surface at once. Implement and verify the token foundation before local exceptions, then inspect all Storybook states.
- Adding presentation Requirements can over-specify styling. Keep Epic truth at the observable accessibility, responsiveness, state clarity, and content-hierarchy level; keep exact color and spacing values in this design and project visual guidance.
- The current simple navigation will eventually need reconsideration for authoring, but introducing that structure now would design around unimplemented workflows.

## Decisions

- Reconcile all current web surfaces and states.
- Preserve simple navigation and current route structure.
- Use a centered cardless auth composition with no empty utility area.
- Stay dark-mode-only.
- Use Steel Blue for interaction and Burnished Orange for restrained identity.
- Keep CSS Modules and centralized semantic tokens.
- Update both `LC-001` and `LC-002` without changing capability boundaries.
- Refresh the private visual identity to the official creator-first product.
