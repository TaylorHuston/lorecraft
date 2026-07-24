# Review: UI Refinements

## Verdict

changes-requested

The prior `ready` verdict is stale. Owner manual confirmation exposed an orange focus boundary on the programmatically focused outer Story region. Apply has reproduced and remediated the defect with failing-first rendered proof, but the changed CSS/test candidate still requires a fresh aggregate gate and independent `/sdd-review` before integration readiness can be restored.

## Gate Scorecard

| Gate | Result | Notes |
|---|---|---|
| Change artifacts | findings | The accepted neutral Story-focus contract is unchanged, but this review record is invalidated until the manual-feedback remediation receives fresh aggregate and independent review proof. |
| Change status | findings | The Change correctly returned to `in_progress` while the owner-reported focus defect is remediated. |
| Epic truth | pass | LC-003 owns the responsive workbench, owner transcript, Scene privacy, Settings Debug editors, and Return to Worlds behavior. |
| Canonical map authority | pass | LC-003 has one current implementation map and one current verification map per Story. |
| Requirements and Scenarios | pass | The reviewed behavior is governed by LC-003/S1 R5, S2 R3/R5, and S3 R1-R3, including Player Debug Scenario R5-S7 and transcript chronology R5-S6. |
| Story reference traceability | pass | Scoped validation reports 0 errors; the two large-Story warnings are accepted review prompts, not missing references. |
| Reverse traceability | pass | The `develop...HEAD` inventory classified all 34 changed paths: 0 missing implementation refs, 0 missing verification refs, and 0 unowned tests. The generated Tuyau registry index is generated support. |
| Tests and verification | findings | Failing-first and fixed focused Storybook proof pass, but the prior aggregate at `38d4dcc` is stale after CSS/test changes. |
| Verification scope and aggregate candidate | findings | A new uncached aggregate is required on the committed neutral-focus candidate. |
| Semantic anchor ownership | pass | LC-003 points to governing query, Debug service/controller/route/client, page/workbench, presentation, and generated adapter anchors. |
| Evidence falsification | pass | Exact tied-timestamp lineage, Player owner/CSRF/readiness/location/busy/no-mutation, retry/accessibility, route, Storybook, and E2E assertions were inspected and executed. |
| Pattern conformance | pass | Player Debug recovery and field errors match the established NPC editor contract; Debug service/client boundaries match adjacent Adventure patterns. |
| Boundary contracts | pass | Owner scope, non-disclosing not-found behavior, 409/422 meaning, retryability, authoritative refresh, and production refusal survive service, HTTP, generated client, and UI boundaries. |
| Stateful transitions | pass | Reload chronology, active/completed turns, retry/discard, unchanged-draft retry, autosave refresh, dialog navigation, and responsive tab transitions have focused proof. |
| Rendered UI verification | pass | The outer Story focus defect was reproduced as orange `rgb(209, 136, 92)` and directly rechecked at 1280x900 as neutral `rgb(98, 93, 88)` with no overflow or console/runtime errors. |
| Manual UI confirmation | findings | Owner feedback found the focus defect; the remediation still needs owner reconfirmation after fresh review. |
| Code review | findings | The narrow CSS/test remediation is Apply-owned and awaits fresh independent review. |
| Visual / UX consistency | pass | The remediated outer and inner Story focus targets now share the accepted neutral boundary while preserving visible focus. |
| Security review | pass | Owner authorization, CSRF, frozen-source isolation, production Debug refusal, private Guide handling, and no-mutation denial paths pass. One non-exploitable-in-current-architecture dependency advisory remains a suggestion. |
| Documentation | pass | Change artifacts and LC-003 reflect current behavior and evidence; historical Epic reports preserve their audited outcomes and valid lineage. |
| Idea repository / current-state truth | pass | The Idea still identifies this repository as the official app and preserves Adventure-local, non-canonical state boundaries. |
| Release communication | pass | `CHANGELOG.md` now records the responsive workbench, transcript/privacy changes, navigation, and development-only Player/NPC editors. |
| Branch and merge readiness | findings | Integration is not ready while the Change is `in_progress` and the neutral-focus candidate lacks fresh aggregate/review proof. |
| Prospective integration candidate | findings | Prior watermark `7ffbf4e` is superseded by the manual-feedback remediation. |
| PRD alignment | pass | The implementation remains a private creator-first Adventure surface derived from frozen World canon without changing canonical World data. |

## Findings

### BLOCKING

- None.

### REQUIRED

- [ ] `apps/frontend/src/adventures/AdventureWorkbench.module.css:.storyRegion:focus-visible` - Owner manual confirmation found that route/recovery focus could still draw the orange action focus ring around the main Story boundary. Apply has changed the outer region to the neutral `--border-strong` treatment and added computed-style Storybook proof; fresh aggregate and independent review are required before this finding is resolved.

### SUGGESTION

- [ ] `apps/frontend/package.json:29` - `npm audit --omit=dev --audit-level=high` reports GHSA-qwww-vcr4-c8h2 for `react-router@7.18.1`. The advisory applies to React Server Components action execution; Lorecraft is a Vite `BrowserRouter` SPA and does not enable the affected RSC mode, so no current exploit path was found. Recommendation: move to a patched compatible React Router release when available rather than force-downgrading the application.

## Verification Evidence

| Command / Scenario | Evidence Type | Requirement / Scenario | Result | What It Proves |
|---|---|---|---|---|
| `npm run ci:required` | aggregate candidate gate | candidate-wide | pass on `38d4dcc` | Forced build, contracts, guarded migrations, lint, typecheck, all tests, Storybook build/tests, and desktop/mobile E2E pass together. |
| Backend aggregate tests | focused + broad automated | LC-003/S1-S3 | 185/185 pass | Player Debug boundaries/no-mutation, transcript lineage, Adventure lifecycle, privacy, workers, and adjacent regressions. |
| Frontend Vitest aggregate | focused + broad automated | LC-003/S1-S3 | 155/155 pass | Routed Settings/editors, retry/accessibility, transcript, Scene privacy, navigation, and responsive behavior contracts. |
| Storybook browser tests | component preview test | LC-003/S1 R5; S2 R5; S3 R1-R3 | 89/89 pass | Representative component states and interactions remain accessible and coherent. |
| Playwright aggregate | deterministic E2E | LC-003 plus adjacent journeys | 11/11 pass | Adventure desktop/mobile create/play/recover/reset/delete journey and adjacent account/World behavior pass. |
| `sdd validate lorecraft --change 2026-07-22-ui-refinements ... --json` | artifact validation | Change + LC-003 | pass, 0 errors / 2 accepted warnings | Artifact structure, references, and report lineage are valid. |
| `sdd_orphan_audit.py . --epic LC-003 --changed-from develop --format json` | reverse traceability | candidate-wide | pass | 34 candidates, 0 missing refs, 0 unowned tests; generated/support paths classified. |
| `npm run check:contracts` | generated-contract check | Player Debug/detail transport | pass | Committed Tuyau output matches route/controller contracts. |
| `npm audit --omit=dev --audit-level=high` | dependency security scan | dependency surface | findings | One high RSC-specific React Router advisory; affected mode is not used by this SPA. |
| Current Storybook browser walkthrough | rendered verification | UI-bearing candidate | pass | Desktop/mobile ready, Settings, Player/NPC editor, Scene detail, and recovery states render without overflow or console errors. |

## Verification Scope And Candidate Gates

- Project-defined aggregate command: `npm run ci:required`.
- Aggregate gate required: yes.
- Trigger or project-policy reason: the diff crosses persistence-derived query behavior, local Debug mutation boundaries, generated contracts, privacy-sensitive owner projections, responsive UI, and deterministic E2E behavior.
- Cache/freshness policy: the prior run used `--force` and reported 0 cached Turbo tasks, but the owner-feedback CSS and Storybook changes invalidate that candidate.
- Post-gate evidence-record-only changes and affected checks rerun: not applicable to the current remediation because application CSS and executable Storybook evidence changed. A fresh exact-commit aggregate is required.

| Stage | Exact Commit / Tree | Command | Meaningful Execution / Counts | Result |
|---|---|---|---|---|
| Prior aggregate behavior candidate | `38d4dcc54f50daeb2982f5b43683052f7b33bab7` / `38fc1e4009adb9adbe6f761b20f37b59a99a6445` | `npm run ci:required` | 9 stages; 185 backend, 155 frontend, 89 Storybook, 11 E2E; 0 cached tasks | historical pass; stale for current CSS/test candidate |
| Neutral Story-focus remediation | commit pending | focused Storybook, frontend route/workbench tests, lint/typecheck, and direct browser inspection | failing-first outline assertion then 20/20 Storybook and 42/42 frontend tests; neutral computed outline; clean browser | focused pass; aggregate pending |
| Prospective integration candidate | pending final committed source | `git merge-tree --write-tree develop HEAD` after aggregate | target currently has 0 target-only commits | blocked on fresh aggregate and independent review |
| Actual integrated result | pending | no integration authorized | not integrated | not applicable |

## Boundary And Conservation Review

- Boundary Contract Matrix status and exact proof: pass; functional Player Debug API tests and adapter/UI tests preserve authorization, status/reason, field errors, retry, and authoritative detail refresh.
- Capability identifier issuer, scope, lifetime, and invalid-reuse proof: no new capability identifier is introduced. Existing Adventure IDs remain server-issued UUIDs, owner-scoped, and non-disclosing on malformed/cross-owner use.
- Content-budget and provider-visible provenance conservation: pass; Guide text is owner-visible but remains excluded from normal generation history and raw model evidence, with query/context/privacy tests.
- Filesystem ancestor/confinement validation before mutation and fail-closed no-write proof: not applicable; the reviewed diff adds no filesystem mutation boundary.

## Rendered UI Verification

| Surface / Fixture | Viewport | State / Interaction | Tool / Setup | Directly Inspected Evidence | Console / Network | Result |
|---|---|---|---|---|---|---|
| `Application/Adventures/Workbench--ReadyDesktop` | 1280x900 | three panes, transcript, composer, focus | Storybook + `agent-browser` | Player/Story/Scene composition, pinned title, Action/Pass/Guide treatments, fade/spacing, and controls inspected | clean console; fixture network not applicable | pass |
| Ready desktop Settings | 1280x900 | Adventure, Player, NPC cards/editor | Storybook + `agent-browser` | Stable modal, full-height workspace, enabled Player fields, NPC cards/editor, and no horizontal overflow | clean console | pass |
| `ReadyMobile` | 390x844 | Story/Player tabs and Settings Player editor | Storybook + `agent-browser` | Mobile tabs, Return/Settings controls, composer, two-column Settings tabs, scrollable Player fields, and 390/390 document width | clean console | pass |
| Ready mobile Scene detail | 390x844 | select Mira and return | Storybook + `agent-browser` | Only name, physical description, and Status are visible; no Debug/private fields | clean console | pass |
| `TurnFailedMobile` | 390x844 | recoverable failed turn | Storybook + `agent-browser` | Story chronology and Retry/Discard recovery remain available without overflow | clean console | pass |
| `OpeningFailedMobile` | 390x844 | failed opening | Storybook + `agent-browser` | Failure explanation and Try again action render coherently | clean console | pass |

## Review Bundle

- Source branch/ref: `change/ui-refinements` at committed baseline `cdbd0cd`; neutral-focus remediation is an uncommitted Apply candidate.
- Reviewed source commit: prior watermark `7ffbf4e` is superseded; a new watermark requires the committed remediation, fresh aggregate, and independent review.
- Target branch/ref: `develop` at `458125be450cbbd74b5638a073a5058c7e74d7e2`.
- Merge base: `458125be450cbbd74b5638a073a5058c7e74d7e2`.
- Source-only commits: 45 before the remediation commit.
- Target-only commits: 0.
- Changed files: 34 committed candidate paths plus intended edits within the existing Workbench Storybook/CSS and SDD paths.
- Diff stat: pending committed remediation.
- Conflict check: pending final source commit; target has not advanced.
- Prospective integration tree: pending final source commit.
- Source and target refs used for candidate proof: prior source `7ffbf4e`, current baseline `cdbd0cd`, target/merge base `458125b`.
- Dirty state: intended Storybook, CSS, Change ledger/review, and LC-003 remediation only.
- Branch policy: local Apply commits allowed; no push, PR, merge, close, deployment, or release authorized.
- Reverse-traceability command/result: fresh diff-scoped LC-003 audit required after the remediation commit.

## Reverse Traceability

- Candidate scope: complete `develop...change/ui-refinements` diff.
- Epic ownership reconciled: LC-003/S1, S2, and S3 maps own all behavior-bearing source/test changes.
- Support/generated/framework classifications: changelog and routes are support/adapters; Tuyau schema/tree/index are generated contracts, with the registry index intentionally not a direct Scenario owner.
- Stranded refactor surfaces checked: old Scene Debug presentation, transcript ordering, settings editor placement, pass confirmation, route navigation, adapters, generated bindings, tests, and Storybook fixtures.
- Explicit gaps or tracked cleanup: no required traceability gap; only the React Router RSC advisory suggestion remains.

## Discovery Wave

| Pass | Reviewer | Result | Notes |
|---|---|---|---|
| Artifact truth | main review | pass | Change, LC-003, PRD, Idea, ADRs, historical reports, README, changelog, and guidance inspected. |
| Reverse traceability | packaged audit + main review | pass | Every changed source/test path classified. |
| Code diff | main review | pass | Complete application diff and high-risk backend/frontend boundaries inspected. |
| Verification coverage | main review | pass | Exact test anchors inspected; full required gate executed. |
| Evidence falsification | main review | pass | Lineage and Player no-mutation/security claims matched exact assertions. |
| Pattern conformance | main review | pass | Player/NPC editor and Adventure API/query sibling contracts compared. |
| Boundary contracts | main review | pass | Domain/HTTP/generated-client/UI semantics preserved. |
| Stateful transitions | main review | pass | Retry, failure, reload, pending, navigation, and editor transitions covered. |
| Security / authority / budget / mutation safety | main review + dependency scan | pass with suggestion | App boundaries pass; RSC-only dependency advisory recorded. |
| UI / visual identity | current rendered browser review | pass | Desktop/mobile representative states inspected directly. |
| Docs / Idea truth / release communication / PRD | main review | pass after remediation | Missing changelog coverage was added in `38d4dcc`. |
| Integration readiness | main review | findings | Prior reviewed source is superseded; fresh aggregate and independent review are required. |

## Consolidated Remediation

- Root cause: `.storyRegion:focus-visible` retained the orange `--focus-ring` even though `.storyContent:focus-visible` had been changed to the accepted neutral `--border-strong`. Route/recovery programmatic focus targets the outer region, making the orange boundary appear intermittently.
- Apply fix: both Story focus targets now share the neutral selector; `ReadyDesktop` programmatically focuses the outer region and asserts its computed outline color.
- Focused proof: failing-first Storybook received orange `rgb(209, 136, 92)`; fixed Storybook passes 20/20, route/workbench tests pass 42/42, lint/typecheck pass, and clean 1280x900 browser inspection receives neutral `rgb(98, 93, 88)` without overflow or console/runtime errors.
- Deferred or unsafe findings: React Router's RSC-specific advisory remains deferred until a patched compatible release; current architecture does not use RSC mode.
- Affected verification union: full `ci:required`, scoped SDD validation, reverse traceability, merge-tree check, and fresh independent rendered/code review remain required after commit.
- Regression-focused rereview: pending final committed and aggregate candidate.

## PR / Merge Readiness

- Source branch: `change/ui-refinements`.
- Reviewed source commit: prior `7ffbf4e` watermark is stale; replacement pending.
- Target branch: `develop`.
- Reviewed integration tree/ref: pending final remediation candidate.
- Source/target refs rechecked: target remains `458125b` with 0 target-only commits.
- Actual integrated tree matches tested tree: not applicable; no integration performed.
- Required aggregate rerun after drift: required because application CSS and executable Storybook evidence changed.
- Conflict check: pending final source commit.
- Commit state: remediation commit pending.
- PR status: not created.
- Merge status: not performed; blocked on fresh aggregate, independent review, owner reconfirmation, and explicit authorization.

## Suggested Manual UI Testing

1. Open a ready Adventure at desktop width. Confirm the Player / Story / Scene layout, pinned World title, transcript spacing and Action/Pass/italic Guide ordering, public-only Scene NPC detail, and Player Return to Worlds navigation.
2. Open Settings. Confirm Player and current-Scene NPC edits autosave locally, rejected edits expose usable errors/retry, modal height stays stable, and no World canon changes.
3. Repeat at a narrow viewport using Story / Player / Scene tabs. Confirm the composer and Settings tabs do not overflow and Return to Worlds reaches `/worlds`.

Status: `pending user`. The owner found the orange Story-boundary defect; after Apply and fresh independent review, reconfirm that the main narration boundary remains neutral when clicked, routed to, or restored by recovery focus.

## Review Log

- 2026-07-23: Earlier independent review recorded `changes-requested`; the Change was replanned and remediated through Apply.
- 2026-07-24: Full independent discovery completed against source `8ab3bf9` and unchanged target `458125b`; direct desktop/mobile rendering passed.
- 2026-07-24: Added missing release communication in `38d4dcc`.
- 2026-07-24: Fresh uncached `ci:required` passed on `38d4dcc`; final verdict is `ready`, with owner manual confirmation still `pending user`.
- 2026-07-24: Rechecked source `7ffbf4e` after the dev-server handoff. Its post-aggregate diff was evidence-only; validation, contracts, reverse traceability, merge-tree, and cleanliness checks passed.
- 2026-07-24: Owner manual confirmation then found an orange outer-Story focus boundary. The prior `ready` verdict and aggregate watermark are stale; Apply reproduced the selector mismatch and began neutral-focus remediation with failing-first rendered proof.
