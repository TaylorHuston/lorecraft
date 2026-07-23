# Review: UI Refinements

## Verdict

changes-requested

## Gate Scorecard

| Gate | Result | Notes |
|---|---|---|
| Change artifacts | findings | Player Debug persistence needs an accepted Scenario and consistent change artifacts. |
| Change status | findings | Returned to `proposed` for the required replan. |
| Epic truth | findings | S1/R5 describes the editor, but has no Scenario or complete ownership/evidence map for its writer. |
| Canonical map authority | findings | The Player service/client/route need one current map. |
| Requirements and Scenarios | findings | Add an accepted Player Debug Scenario, or remove the writer. |
| Story reference traceability | findings | Existing references resolve; Player Debug has no governing Scenario. |
| Reverse traceability | findings | Diff inventory found seven source candidates without ownership; Player service is material. |
| Tests and verification | blocked | Required aggregate and guarded backend functional proof cannot run without acknowledged disposable databases. |
| Verification scope and aggregate candidate | blocked | `ci:required` is mandatory and has no fresh result for this candidate. |
| Semantic anchor ownership | findings | Player Debug needs service, route, client, and test anchors under an accepted Scenario. |
| Evidence falsification | findings | The new writer has no functional owner/busy/frozen-location/non-canon proof. |
| Pattern conformance | findings | Player autosave lacks NPC-equivalent retry and inline validation recovery. |
| Boundary contracts | findings | Player Debug authorization and persistence boundaries lack route/service execution evidence. |
| Stateful transitions | findings | Equal-time transcript rows have no deterministic revision-lineage ordering; Player autosave cannot retry an unchanged draft. |
| Rendered UI verification | findings | Desktop and narrow rendering are clean, but the keyboard-focusable Story pane suppresses visible focus. |
| Manual UI confirmation | findings | Required user walkthrough remains pending. |
| Code review | findings | See required findings below. |
| Visual / UX consistency | findings | Restore a neutral visible Story focus indicator and accessible Player validation feedback. |
| Security review | findings | Code inspection passes owner, CSRF, production guard, frozen-World, and canon-isolation intent; executable API-boundary proof is missing. |
| Documentation | findings | Design non-goal and release wording contradict the Player Debug writer; stale open question remains. |
| Idea repository / current-state truth | pass | The resolved Idea identifies this as the active official application and preserves the non-canonical Adventure boundary. |
| Release communication | findings | “Cosmetic-only” is not accurate for a private development/test API writer; re-evaluate during replan. |
| Branch and merge readiness | findings | `change/ui-refinements` cleanly merges into `develop`, but is not ready to merge. |
| Prospective integration candidate | blocked | Clean prospective tree exists, but required aggregate proof is absent. |
| PRD alignment | pass | The implemented direction remains a private, non-canonical Adventure derived from World canon. |

## Findings

### BLOCKING

- [ ] `docs/epics/lc-003-adventure-play/reviews/*.md:1` - Three historical LC-003 verification reports fail structural validation because they lack the versioned-report schema. A schema-only migration exposes further required metadata/section/lineage fields, so it is not a safe review-only repair. Recommendation: migrate or supersede them through the Epic verification workflow before the next readiness review.
- [ ] `scripts/ci-required.mjs:13` - The required `npm run ci:required` gate is absent for the final code candidate. It requires caller-supplied disposable `TEST_DATABASE_URL` and `E2E_DATABASE_URL`, plus both explicit write acknowledgements. Recommendation: run it after replan/application work with an acknowledged disposable environment, then record the exact commit/tree and meaningful stage results.
- [ ] `docs/changes/2026-07-22-ui-refinements/tasks.md:251` - The verification decision names superseded candidate `585f804`, while the reviewed code candidate is `63f763b`; its aggregate and integration results are pending. Recommendation: replace it with the final post-apply candidate evidence.
- [ ] `docs/epics/lc-003-adventure-play/epic.md:240` - Player Debug persistence has no accepted Requirement/Scenario, despite adding a controller, route, service, client writer, and editor. Recommendation: use `/sdd-change --replan` to add the governing Scenario, contract, ownership, and verification plan, or remove the writer.

### REQUIRED

- [ ] `apps/backend/app/services/adventure_query_service.ts:204` - `created_at, sequence` does not order entries from different revisions when timestamps and per-revision sequence values tie. The owner-turn insertion consequently has no deterministic chronology. Recommendation: order by revision lineage plus entry sequence, and add a tied-timestamp functional regression test.
- [ ] `apps/backend/app/services/adventure_player_debug_state_service.ts:37` - The Player Debug writer has no functional API/service proof for owner isolation, CSRF path, ready/busy rejection, frozen-location rejection, or World/revision non-mutation. Recommendation: add the equivalent of the NPC Debug functional coverage.
- [ ] `apps/frontend/src/adventures/AdventureWorkbench.tsx:830` - A failed Player autosave records the draft as submitted and offers no retry, so an unchanged draft is never retried. Recommendation: match the NPC editor's explicit retry behavior and tests.
- [ ] `apps/frontend/src/adventures/AdventureWorkbench.tsx:858` - Player field failures set `aria-invalid` only; fields have neither descriptive error IDs nor inline error text. Recommendation: provide per-field `aria-describedby` and visible error messages, with focused coverage.
- [ ] `apps/frontend/src/adventures/AdventureWorkbench.module.css:19` - The Story narration scroll region is keyboard focusable but its visible focus indicator is removed. Recommendation: replace the decorative orange glow with a neutral visible `:focus-visible` outline.
- [ ] `docs/changes/2026-07-22-ui-refinements/design.md:17` - “Change database state” is a non-goal although Player Debug writes Adventure Player and timestamp state. Recommendation: clarify the no-new-storage/no-World-canon boundary during replan; also remove the stale “Awaiting first concrete UI refinement” open question and revise release wording.
- [ ] `docs/epics/lc-003-adventure-play/epic.md:343` - Targeted Playwright Adventure proof is still explicitly pending. Recommendation: rerun it in the acknowledged disposable E2E environment after the final candidate is built.

### SUGGESTION

- [ ] `docs/epics/lc-003-adventure-play/epic.md:76` - Revisit the two existing large-Story warnings when a natural Story split is planned; they are warnings, not current blockers.

## Verification Evidence

| Command / Scenario | Evidence Type | Requirement / Scenario | Result | What It Proves |
|---|---|---|---|---|
| `npm run check:contracts` | generated-contract check | candidate-wide | pass | Committed Tuyau artifacts match source. |
| frontend lint, typecheck, build | broad supporting gate | S1-S3 UI/client | pass | Current client compiles and production-builds. |
| backend lint, typecheck, build | broad supporting gate | S1-S3 backend | pass | Current backend compiles and production-builds. |
| `npm run test --workspace @lorecraft/frontend -- --run` | focused automated test | S1-S3 UI | pass (15 files, 152 tests) | Existing frontend behavior, including transcript and settings fixtures. |
| `npm run test:storybook` | component preview test | S1/S2/S3 UI | pass (11 files, 89 tests) | Storybook interaction states. |
| Storybook ReadyDesktop | rendered browser | S1/R5-S2, S1/R5-S4, S2/R5-S6 | findings | Desktop and 390x844 narrow render cleanly; accessibility focus defect remains. |
| `npm run ci:required` | aggregate candidate gate | candidate-wide | blocked | Required disposable environment was not supplied. |
| targeted Adventure Playwright | deterministic E2E | S1/R5-S2, S1/R5-S4 | blocked | Ledger records an earlier stalled run that needs a final rerun. |

## Verification Scope And Candidate Gates

- Project-defined aggregate command: `npm run ci:required`.
- Aggregate gate required: yes; this diff crosses persistence-derived transcript projection, a typed client contract, and client UI.
- Cache/freshness policy: run after the final implementation commit against explicit disposable test and E2E databases; no earlier result is reusable for a behavior change.

| Stage | Exact Commit / Tree | Command | Meaningful Execution / Counts | Result |
|---|---|---|---|---|
| Reviewed source candidate | `63f763b69d44f54a1f9e2c5c0ee4cee06c8c2916` | focused supporting gates above | 152 frontend and 89 Storybook tests | findings |
| Prospective integration candidate | `8c773b5ff7efb09583e17fce567d9a1a31fc6181` | required aggregate not run | source and target content are currently identical | blocked |
| Actual integrated result | not integrated | not applicable | no merge authorized | not applicable |

## Rendered UI Verification

| Surface / Fixture | Viewport | State / Interaction | Tool / Setup | Directly Inspected Evidence | Console / Network | Result |
|---|---|---|---|---|---|---|
| `Application/Adventures/Workbench/ReadyDesktop` | 1280 desktop | transcript, Player/Scene panes, composer | existing Storybook on port 4312 | World heading, author-labelled messages, Return to Worlds, settings, Send/Pass | content present; no Vite overlay or captured console errors | pass |
| same fixture | 390x844 | Story-first tabs and composer | existing Storybook on port 4312 | no horizontal overflow; Story/Player/Scene tabs and actions render | content present; no Vite overlay or captured console errors | pass |
| Story scroll region | both | keyboard focus | source plus rendered surface | focusable narration region has no visible focus style | not applicable | findings |

## Review Bundle

- Source branch/ref: `change/ui-refinements` at `63f763b69d44f54a1f9e2c5c0ee4cee06c8c2916`.
- Target/ref and merge base: `develop` at `458125be450cbbd74b5638a073a5058c7e74d7e2`.
- Changed surface: 28 paths, including Adventure query/projection, Player Debug writer, typed client, workbench, tests, and LC-003/change artifacts.
- Conflict check: clean; prospective integration tree `8c773b5ff7efb09583e17fce567d9a1a31fc6181`.
- Dirty state at review end: review artifacts only.
- Branch policy: `change/*` into non-production `develop`; pair is correct but findings block merge.
- Reverse traceability: diff-scoped LC-003 inventory found no missing existing refs/tests and seven unowned source candidates; Player Debug ownership is a material gap.

## Consolidated Remediation

- Safe review batch: none. A schema-only migration of the three historical Epic reports was rejected because the validator requires their full versioned-report metadata, sections, and lineage, not just the schema marker.
- Deferred or unsafe findings: requirement/scenario and scope replan; transcript ordering, functional test coverage, Player autosave/error recovery, focus behavior, and E2E/aggregate execution.
- Regression-focused rereview: pending after `/sdd-change --replan` and `/sdd-apply` produce the final candidate.
- New regressions introduced by remediation: none.

## PR / Merge Readiness

- Source branch: `change/ui-refinements`.
- Reviewed source commit: `63f763b69d44f54a1f9e2c5c0ee4cee06c8c2916`.
- Target branch: `develop`.
- Tested integration tree: `8c773b5ff7efb09583e17fce567d9a1a31fc6181`; aggregate proof blocked.
- PR and merge status: none; no merge or closeout authorization was requested.

## Review Log

- 2026-07-23: Full source-vs-`develop` review created. Historical Epic report schemas normalized; Change returned to `proposed` pending replan and application work.
