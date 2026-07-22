# Design: Epic Audit Remediation

## Context

The 2026-07-22 LC-001, LC-002, and LC-003 Epic audits found one user-visible defect and cross-Epic traceability drift. LC-002's `WorldCharacterService` returns unfielded 422/404-style custom errors for duplicate keys and invalid same-World Locations, while the typed client can only highlight supplied field names. LC-001 remains a legacy Epic despite material edits, and LC-003 has aggregate or stale scenario references despite dedicated tests already existing.

## Goals / Non-Goals

**Goals:**

- Give a Character author a field-specific error for duplicate keys and invalid Locations without publishing a version or mutating canon.
- Make the active Epics accurate, scenario-mapped, and navigable from current behavior to governing code and exact evidence.
- Preserve known production-only/recovery uncertainty as honest gaps.

**Non-Goals:**

- Alter account, session, World, Adventure, or NPC product semantics beyond the Character validation recovery defect.
- Run production, recovery, live-provider, or destructive database operations.
- Add a new ADR, schema migration, external dependency, API version, or release note.

## Planning Interview / Story Refinement

- Scope boundary reviewed: all active official-repository Epics, including implementation, verification, and artifact findings from their current audits.
- User decision: fix the issues across all Epics in one Change.
- Assumption: a sign-in return to the requested protected route is intentional existing behavior, confirmed by current code and test.
- Deferred scope: production/recovery evidence remains operational work requiring separate explicit authorization.
- Story boundaries challenged: this is reconciliation of existing Stories; no Story moves or new end-user capability is justified.
- Requirements refined: field-specific Character validation; full Character mutation permission/validation proof; direct New Adventure 401 proof; exact scenario labels/evidence.
- Scenario gaps considered: duplicate key, invalid Location, field bounds, anonymous/non-author mutation, update/delete denial, session loss during World load/Adventure creation, and stale evidence labels.
- Open questions that block implementation: none.

## Epic Changes

### Update Epic: LC-001 Account Identity And Workspace Access

- Target Epic: `docs/epics/lc-001-account-identity-and-workspace-access/epic.md`
- Change Type: normalize and reconcile existing scope.

#### Story Changes

- S1: retain signup behavior; classify Storybook state evidence correctly and retain private HTTPS `Secure` cookie verification as an operational gap.
- S2: add a scenario that a successful sign-in resumes the originally requested protected route when present, otherwise opens Worlds; retain recovery/production evidence as gaps.
- S3: add `NewAdventurePage` to protected-request session-loss ownership, add its direct 401 proof, and map route-title/focus tests to S3/R3-S1 or S3/R3-S2 exactly.

#### Supersedes / Reconciles

- Replace legacy `Status` fields with independent `Implementation` and `Verification` state after inspecting current evidence.
- Replace ambiguous `.stories.tsx` automated-test claims with clearly typed deterministic Storybook evidence.
- Reconcile stale `Last verified` fields and “passed” language inside `Verification Gaps` with the accepted browser-session ADR.

### Update Epic: LC-002 World Bible Catalog

- Target Epic: `docs/epics/lc-002-world-bible-catalog/epic.md`
- Change Type: repair S3 Character validation recovery and evidence/status maps.

#### Story Changes

- S3/R2-S2: duplicate key and invalid Location responses SHALL identify `key` or `locationKey`, retain 422 validation status, and leave Character/WorldVersion state unchanged.
- S3/R1-S2 and R2-S2: add exact proof for anonymous/non-author create, update, and delete denial; duplicate key, invalid Location, and field-bound failure; verify no publication on rejected mutation.
- S2: reconcile the Story Index with already recorded database/E2E evidence.

#### Supersedes / Reconciles

- Replace incorrect custom `WORLD_NOT_FOUND`/`CHARACTER_NOT_FOUND` validation responses with structured field errors only for validation cases; preserve true resource non-disclosure/not-found responses.
- Update moved Character Change links and closure/manual-acceptance language in the Epic, related ADR, and closed Change ledger.

### Update Epic: LC-003 Adventure Play

- Target Epic: `docs/epics/lc-003-adventure-play/epic.md`
- Change Type: reconcile evidence, exact labels, and forward maps.

#### Story Changes

- S1/R1-S5, R2, and R4: correct UUID fallback/test references and map frozen-source binding, owner list/resume, and deletion to their governing services.
- S2: replace aggregate `Verified By` claims with scenario-level exact existing evidence and explicit remaining gaps.
- S3/R3: rename obsolete `R3-S4` test anchors to the existing scenarios they actually prove; correct validation labels and evidence references.

#### Supersedes / Reconciles

- Reconcile active-Change/manual-acceptance claims with the locally merged/closed Character Change.
- Update related ADR links to the closed Change path.
- Retain historical user-confirmed evidence only where its scope is accurate; use `accepted gap` for unperformed expanded acceptance.

## Technical Options

### Option 1: One cross-Epic remediation Change

- Summary: repair the user-visible Character error contract and reconcile all directly audited Epic truth in one tracked Change.
- User impact: one coherent recovery improvement and a trustworthy map for future work.
- Implementation complexity: moderate, mostly targeted tests/artifacts.
- Reversibility: high; no data migration or product-scope commitment.
- Testability: focused backend, frontend, Storybook, route, and SDD validation/inventory checks.
- Fit: selected because audit findings overlap the same closed Change/status and verification surfaces.

### Option 2: Separate Change per Epic

- Summary: split LC-001, LC-002, and LC-003 remediation.
- Trade-off: would isolate code, but duplicates cross-Change closure/link reconciliation and leaves known contradictions between passes longer.
- Why not selected: the scoped behavior is small and the audits identify a single truth-reconciliation boundary.

## Selected Approach

Extend the existing Character mutation error payload with a safe field identifier for only duplicate-key and invalid-Location validation failures. Keep resource existence/ownership failures indistinguishable as today. Preserve the frontend's existing field-error model, adding only exact regression coverage needed to ensure it highlights the supplied field and does not show an unanchored “highlighted fields” message.

In parallel, update test titles and Epic evidence maps from current inspected owners. Normalize LC-001 as a complete `sdd-epic-v2` file rather than partially converting it. Reconcile associated ADR and closed-Change language only where repository truth is unambiguous. No new architecture decision is introduced.

## Experience Design

- Applicability: required, limited to existing Character-editor inline validation and protected-route recovery.
- Confirmed direction: preserve the current single editable card fields and inline error treatment; a rejected field receives focus/visible field feedback, not a duplicate form or generic modal.
- User confirmation: the user explicitly requested editable single fields and reported the missing-highlight recovery defect.
- Reference artifacts: current `CharacterEditorForm`, `TextField`, `Textarea`, and existing account/adventure session-loss patterns.

### Component Strategy

| Component Or Pattern | Strategy | Initial Owner Or Reference | Required Preview States | Follow-Up |
|---|---|---|---|---|
| Character editor field error | existing application component | Character editor plus `TextField`/`Textarea` | duplicate key, invalid Location, over-limit field, save recovery | rendered route inspection |
| New Adventure session-loss redirect | existing application component | `NewAdventurePage` and `AppRoutes` | World-load 401, create 401 | focused route test |

### Accessibility And Interaction

- Validation must remain associated with the field, visible at desktop and mobile widths, and preserve the user's other entered values.
- Session loss must replace protected content with the existing sign-in journey without a private-content flash.

## Client And API Boundary

- Current client: React/Tuyau browser client.
- Reusable capability: structured field validation errors on Character mutation routes.
- API or typed contract: retain current `errors: [{ code, message }]` shape and add a `field` member only for validation errors.
- Backend platform exposed directly to clients: no; browser continues through same-origin `/api`.
- Data/schema impact: none.
- Rationale: the client already consumes field identifiers; the smallest compatible server extension restores reliable recovery.

## ADRs

- Required: no.
- ADR path: not applicable.
- Decision summary: this applies existing validation/error and session patterns; it makes no durable architectural choice.

## Implementation Constraints

- Do not expose cross-World or non-author resource existence through the new validation payload.
- Rejected mutations must not create/update/delete Characters or publish a WorldVersion.
- Do not claim production/private HTTPS/recovery evidence without a reproducible, explicitly authorized record.
- Preserve the seed World as read-only source truth.

## Verification Strategy

- Focused automated tests: backend Character mutation response and no-publication cases; frontend API/form mapping; New Adventure 401; exact renamed LC-001/003 test anchors.
- Broad supporting gates: affected frontend/backend suites, typecheck/lint/build as warranted, generated-contract check if route contract output changes.
- Deterministic E2E: Character invalid-save recovery at desktop/mobile if the guarded disposable setup is available.
- Manual UI confirmation: verify duplicate-key and invalid-Location inline recovery in the existing editor; status remains pending user until performed.
- Rendered UI verification: directly inspect the editor validation/error state and New Adventure session-loss route with console/network checks.
- Operational evidence: leave production/recovery checks as gaps; do not attempt them in Apply without explicit authorization.

## Decisions

- One remediation Change owns all current active-Epic audit findings.
- Requested protected-route resumption is recorded as accepted existing behavior.
- Production/recovery claims are normalized to gaps unless the exact current evidence is available.

## Risks / Trade-Offs

- Field-specific errors can reveal more detail if applied to ownership/not-found cases; restrict them to the author’s valid World validation boundary.
- Large evidence-table rewrites can accidentally overstate coverage; every row must cite an inspected exact test title or retain a gap.
