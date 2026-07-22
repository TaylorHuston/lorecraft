# Review: Character Authoring And NPC Cards

## Verdict

ready

## Current Independent Review (2026-07-22)

Reviewed `9d325d9e70bf63167c6ea342780f804041c83f2b` (the `246ba25` candidate plus the safe remediation below) against `develop` at `1d3b5fd2e4474a6fd61fe6d5f2d224b058f349dc`. The historical sections that follow remain evidence of earlier reviews; this section is the current verdict.

### Gate Scorecard

| Gate | Result | Notes |
| --- | --- | --- |
| Change artifacts and status | pass | Active Change is `in_review`; scoped validation has 0 errors and two accepted LC-003 large-story warnings. |
| Epic truth and traceability | pass | LC-002/S2-S3 and LC-003/S1-S3 maps are current; both affected-Epic reverse audits report zero missing implementation or verification references. |
| Requirements and scenarios | pass | Complete authorable Character cards, Adventure-owned mutable NPC state, frozen canon isolation, and current-Scene prompt selection remain aligned. |
| Code and state transitions | pass after remediation | NPC autosave `unauthorized` errors now end the shared session like the other protected Adventure mutations. A route regression proves the stale Adventure surface is removed. |
| Tests and contracts | pass | Frontend suite: 144 tests; Storybook: 84 interaction tests; focused backend unit suite: 18 tests; lint, typecheck, build, and generated-contract check pass. Previously recorded disposable-schema E2E/database and live-provider evidence remains applicable because this review changed no persistence or provider behavior. |
| Rendered UI | pass | Direct Storybook inspection covered the mobile read-only World detail and Debug NPC editor; independent fresh inspection also covered desktop/mobile authoring and Debug cards. No Vite overlay, console error, or horizontal overflow was observed. |
| Security and privacy | pass | Owner scope, production Debug refusal, active-turn conflict, bounded fields, trace permissions/redaction, raw-payload exclusion from artifacts, and frozen-source isolation were independently inspected. |
| Documentation and release truth | pass after remediation | Proposal/design now identify their planning-era assumptions as historical rather than describing already implemented work as future scope. README, CHANGELOG, ADR, and Idea-side current-state guidance remain aligned. |
| Branch and merge readiness | review-ready | Candidate has a clean `develop` merge tree. Owner manual acceptance is still pending, so no merge, release, or Change closeout is authorized. |

### Findings And Remediation

No unresolved BLOCKING, REQUIRED, or SUGGESTION findings remain.

The review found and safely corrected two required issues:

- `apps/frontend/src/adventures/AdventurePage.tsx`: an unauthorized NPC autosave was absent from the shared protected-mutation error chain, leaving a stale authenticated Adventure surface. The chain now includes `updateNpcState.error`.
- `proposal.md` and `design.md`: several planning-era statements still described completed behavior as current/future work. They now explicitly distinguish historical baseline and realized scope.

`AdventureRoutes.test.tsx` now proves that an unauthorized NPC autosave routes to sign-in and removes the Adventure UI. The focused/full frontend and Storybook suites were rerun after the fixes.

### Verification Evidence

| Check | Result |
| --- | --- |
| `npm run lint && npm run typecheck && npm run build && npm run verify:contracts` | pass |
| `npm run test --workspace @lorecraft/frontend` | pass: 144 tests |
| `npm run test:storybook --workspace @lorecraft/frontend` | pass: 84 tests |
| focused backend story-generation/NPC validation suite | pass: 18 tests |
| scoped `sdd validate lorecraft --repo …/lorecraft --change 2026-07-19-character-authoring-and-npc-cards --json` | pass: 0 errors; 2 accepted LC-003 large-story warnings |
| LC-002 and LC-003 changed-surface orphan audits | pass: 0 missing implementation and verification references |
| `git diff --check`; `git merge-tree --write-tree develop HEAD` | pass; clean merge tree `54393748b431749efcf6fb0e933115db5c37eb7b` |

### Rendered UI Verification

| Surface | State | Result |
| --- | --- | --- |
| World detail, mobile fixture | read-only World with Locations, Characters, and no author controls | pass |
| Adventure Debug NPC editor | selected Mira card exposes all ten editable fields and immutable key | pass |
| World authoring and Debug editor | independent desktop/mobile inspection, responsive Story-first layout | pass |

### Remaining Owner Acceptance

Manual confirmation remains `pending user`: author/non-author World mutation boundaries, save/delete/stale-selection recovery, and the live Adventure experience. It is an acceptance gate, not an unresolved technical review finding.

## Historical Review (2026-07-20)

Reviewed code through `90b1328` against `develop` at `1d3b5fd2e4474a6fd61fe6d5f2d224b058f349dc`. The strict-schema remediation described below was uncommitted when this historical record was written; see the 2026-07-21 remediation section for current artifact state.

### Gate Scorecard

| Gate | Result | Notes |
| --- | --- | --- |
| Change artifacts | findings | Current Change files are present and status is `in_review`, but the current strict validator cannot complete affected-Epic validation. |
| Change status | pass | `in_review` agrees with the final review/owner-acceptance stage. |
| Epic truth | findings | The current validator requires stable `#` anchors in legacy and normalized maps; affected LC-002/LC-003 rows are not yet fully compliant. |
| Requirements and Scenarios | pass | Proposal/design and LC-002/S3 plus LC-003/S3 stay aligned with Character authoring, Adventure-owned cards, and source isolation. |
| Story reference traceability | pass | No duplicate Story labels; changed Stories retain primary ownership anchors. |
| Reverse traceability | pass | Epic-scoped audits report zero missing implementation or verification references in the changed candidate inventory. |
| Tests and verification | pass | 143 frontend tests, 84 Storybook interactions, prior isolated schema/database evidence, deterministic E2E, and live opening/Act/Guide/Pass matrix are recorded; the review retry regression passes. |
| Evidence falsification | pass | Direct test review found the failed-autosave retry gap; the new test proves unchanged draft resubmission after a recoverable failure. |
| Pattern conformance | pass | Retry feedback follows the existing named recovery-control pattern without exposing state outside the owner Adventure. |
| Stateful transitions | pass | Draft, pending write, validation, retry, authoritative refresh, and selected-card continuity were independently sampled. |
| Rendered UI verification | pass | Independent Storybook inspection covered authoring, read-only World detail, unavailable/retry, failed turn, and Debug editor at desktop/mobile without overflow, overlay, or console failures. |
| Manual UI confirmation | pending user | Owner confirmation of author/non-author behavior and recovery feel remains required before merge. |
| Code review | pass after remediation | Recoverable autosaves now expose an explicit retry path; no other validated code finding remains. |
| Visual / UX consistency | pass | Dark, reference-first World and Story-first mobile layouts remain intact. |
| Security review | pass | Owner scope, production Debug refusal, trace permissions/redaction, frozen canon isolation, and bounds migration were independently reviewed. |
| Documentation | pass after remediation | README, CHANGELOG, tasks, and affected evidence maps reflect the implemented behavior. |
| Idea repository / current-state truth | pass | Idea README, PRD direction, and visual identity remain aligned. |
| Release communication | pass | CHANGELOG contains user-facing authoring/card and relevant local-Debug privacy notes only. |
| Branch and merge readiness | changes requested | Merge tree is clean; affected Epic strict-validation repair and owner acceptance remain before merge. |
| PRD alignment | pass | Creator-first canon authority and non-canonical, Adventure-owned state remain intact. |

### Findings

#### BLOCKING

- None.

#### REQUIRED

- [ ] `docs/epics/lc-002-world-bible-catalog/epic.md` and `docs/epics/lc-003-adventure-play/epic.md` — `sdd validate` under the current CLI (`0.11.0`) cannot validate the affected Epics: it first encounters a directory read and, when scoped directly to LC-003, reports strict v2 implementation/evidence-anchor and coverage failures. Reconcile the legacy maps to the current validator's stable `path#anchor` contract, then rerun scoped validation before declaring technical readiness.

#### SUGGESTION

- None.

### Verification Evidence

| Command / Scenario | Evidence Type | Result |
| --- | --- | --- |
| scoped `sdd validate` | artifact validation | findings: current CLI cannot complete Change validation (`EISDIR` while validating affected Epic); direct LC-003 validation exposes 138 strict-map errors and two large-Story warnings |
| Epic-scoped `sdd_orphan_audit.py --changed-from develop` | reverse traceability | pass: no missing implementation or verification references |
| `npm run lint && npm run typecheck && npm run build && npm run verify:contracts` | broad supporting gates | pass after formatting remediation |
| `npm run test --workspace @lorecraft/frontend` | focused frontend suite | pass: 143 tests |
| `npm run test:storybook --workspace @lorecraft/frontend` | Storybook interaction suite | pass: 84 tests after the review fixture correction |
| isolated `npm run test:e2e --workspace @lorecraft/frontend` | deterministic E2E | pass: 9 tests; temporary direct schema dropped (recorded prior to this documentation-only review remediation) |

### Rendered UI Verification

| Surface | Viewport | State / interaction | Direct evidence | Console / network | Result |
| --- | --- | --- | --- | --- | --- |
| World authoring/read-only detail | 1440px and 390px | full author form and non-author card | disclosure, complete card hierarchy, no mutation controls for read-only viewer, no overflow | clean | pass |
| Adventure Debug NPC editor | 1440px and 390px | Scene → Mira, edit, retry/recovery control | all ten editable fields, immutable key, disclosure, Story-first tabs, no overflow | clean | pass |
| Adventure/World recovery | desktop/mobile | unavailable retry and failed-turn composer | named recovery controls remain in their local surface | clean | pass |

### Consolidated Remediation

- Safe batch: added explicit Retry save for an unchanged recoverable NPC draft; added its focused regression test; formatted the earlier NPC-state reconciliation files; reconciled stale task/Epic evidence.
- Regression verification: frontend focused/full suite, Storybook, lint, typecheck, build, contracts, diff hygiene, and merge tree pass.
- Residual required work: strict affected-Epic validation repair. Owner manual confirmation remains `pending user` and separately blocks merge/closeout.

## Artifact Remediation (2026-07-21)

The sole required artifact finding from the historical 2026-07-20 review is resolved without changing application behavior:

- LC-002 and LC-003 now use current `sdd-epic-v2` primary implementation anchors and scenario-mapped evidence anchors.
- Scoped Change validation now passes with zero errors. The only warnings are the two existing LC-003 large-story compatibility warnings for integrated Adventure primary paths; they do not represent a new behavior or scope defect. The remediation is committed in `260f52e`.
- The current review verdict remains historical `changes-requested` until a fresh independent `/sdd-review` assesses this committed artifact candidate. Owner manual acceptance remains `pending user` and still blocks merge/closeout.

### Review Bundle

- Source branch: `change/character-authoring-and-npc-cards`
- Target branch: `develop`
- Merge base: `1d3b5fd2e4474a6fd61fe6d5f2d224b058f349dc`
- Initial reviewed source: `0ce798902f7d4d517955f12d29e5044c1afc58a8`; final code watermark: `90b1328`.
- Conflict check: clean (`git merge-tree --write-tree develop HEAD`).
- Dirty state at review start: only the expected `tasks.md` status transition; current safe review artifacts remain uncommitted.

## Prior Review (2026-07-20)

### Historical Review Details

Reviewed `ab036a318eb099dca9b2540d4a265cd01bdfdeca` against `develop` at `1d3b5fd2e4474a6fd61fe6d5f2d224b058f349dc`. The historical review below remains a record of the earlier pre-implementation tree.

### Required findings and safe remediation

- Debug trace sanitization treated every `*token*` key as a credential, so `prompt_tokens`, `completion_tokens`, and `total_tokens` were redacted. The trace now retains only recognized accounting counters while redacting credentials; compatible string counters are normalized into bounded provider metadata.
- The literal private-value guard rejected ordinary narration for any valid three-character value such as `the` or `red`. It now applies only to sufficiently distinctive literals (12+ normalized characters); concise values remain prompt-enforced and are an explicit live-provider quality limitation.
- Autosave replaced the Adventure cache and the editor key used the full NPC JSON, remounting the input and dropping focus. The editor now has a stable character-key identity, with a test covering the authoritative refresh.
- Epic and task truth was stale about guarded database, deterministic E2E, provider smoke/opening/turn, and trace evidence. The maps now classify `story_generator.ts` as the S1/S2 provider-boundary adapter and retain only genuine outstanding verification.

### Current gate scorecard

| Gate | Result | Notes |
|---|---|---|
| Change artifacts, requirements, Epic truth, traceability | pass after remediation | `sdd validate` has 0 errors and two accepted LC-003 scope warnings; no orphaned implementation or verification references. |
| Code/security | pass after remediation | No additional authorization, injection, or production-trace exposure finding. Local raw traces remain development-only, protected, and time-bounded. |
| Focused regression tests | pass | 27 backend unit tests and 16 workbench tests cover the safe fixes. |
| Broad gates | pass except backend aggregate | lint, typecheck, build, frontend tests, Storybook, and contract verification pass; backend aggregate safely stops without disposable database acknowledgement. |
| Rendered UI | partial | Fresh Storybook desktop/mobile Debug and World authoring inspection passed without overlay or overflow; non-author/error matrix rows remain. |
| Live/manual/E2E acceptance | changes requested | Exact frozen-version/post-turn E2E, full Act/Guide/Pass quality, and owner manual acceptance remain required. |
| Branch/merge readiness | not ready | Merge is clean, but no merge/PR authorization exists and required acceptance evidence remains. |

### Regression-focused rereview

- Reinspected each remediated source/test/artifact diff. `git diff --check` passes and the `develop` merge-tree is clean (`537fe808f6bbe50e4d3a66ec65aeb91c4b5ba19a`).
- Focused rerun: 27 backend unit tests covering trace capture, compatible usage metadata, and private-value safety; 16 focused workbench tests covering autosave focus; all pass.
- Broad rerun: lint, typecheck, build, 138 frontend tests, 84 Storybook tests, and contract cleanliness pass. The backend aggregate safety suite passes its 20 checks and then correctly refuses database writes without `ALLOW_TEST_DATABASE_WRITES=1`; no database test was run in this review.
- SDD validation passes with 0 errors and the two intentional LC-003 large-story warnings. Reverse traceability has no missing implementation or verification references; remaining conservative `source_without`/`tests_without` entries are cross-Epic, generated, or support candidates.
- Direct Storybook review confirms the Debug NPC editor has all ten editable fields and no overflow/overlay at desktop width. A delegated independent visual pass also confirmed the 375px Debug card, World authoring, and failed-turn composer recovery; non-author/error matrix rows remain pending.

### Remaining changes-requested items

- Run the exact old/new frozen-version and post-turn NPC-refresh E2E path.
- Run live Act, Guide, and Pass quality checks with the enabled protected trace; the opening and two observed turns do not cover that full matrix.
- Complete owner manual acceptance, including non-author/error states.

## Remediation Status (2026-07-20)

This is the historical independent review of the pre-implementation working tree at `1d3b5fd`. Its safe findings were implemented in `f1b4c4a` and verification was recorded in `c1810ed`:

- default-on, explicitly disableable local Debug/raw capture and matching docs;
- direct private-card reflection guards for openings and turns, including the documented concise-value limitation;
- data-preserving migration rollback guards and focused migration tests;
- Debug route authorization/validation/active-turn coverage; and
- Location-move editor continuity, supporting docs, generated-contract verification, and committed source state.

The remaining gaps are direct database/E2E proof with a schema-isolation-capable direct endpoint, live-provider playtests, and owner manual confirmation. A fresh independent `/sdd-review` is required once those are complete; this historical verdict is not a review of `c1810ed` or later commits.

## Gate Scorecard

| Gate | Result | Notes |
|---|---|---|
| Change artifacts | findings | Replan amended the ADR/design policy; checked-in development defaults, README, and the corresponding implementation/tests still need the planned default-on behavior. |
| Change status | findings | Review began at `in_review`, invalidated the plan, and replan returned the Change to `planned`; implementation and verification remain. |
| Epic truth | findings | `LC-003/S3` records a moved NPC as intentionally no longer selectable, which conflicts with R3's all-fields-editable Debug card. |
| Requirements and Scenarios | findings | R3's location edit loses the only card; data, authorization, migration, and live-provider scenarios lack required proof. |
| Story reference traceability | pass | LC-002/S3 and LC-003/S3 have concrete code anchors; no missing implemented/verified references. |
| Reverse traceability | pass | Changed-from-`develop` audit completed for LC-002 and LC-003; cross-Epic, generated, adapter, test, and supporting candidates were classified. |
| Tests and verification | findings | Lint, typecheck, build, frontend tests, and Storybook tests pass; guarded database and E2E proof remain unavailable, and contract verification is blocked by the uncommitted generated client. |
| Rendered UI verification | pass | Independently inspected current Storybook authoring, editable NPC card, failed-turn composer recovery, and mobile workbench with no overlay, console error, or horizontal overflow. |
| Manual UI confirmation | blocked | Owner confirmation remains pending. |
| Code review | findings | Moving an NPC makes its active editor disappear; both new migrations need data-preserving rollback/upgrade coverage. |
| Visual / UX consistency | findings | The checked-in Idea visual-identity document still calls World detail read-only and says authoring does not exist. |
| Security review | findings | Prompt instruction alone does not enforce the stated never-disclose rule for NPC private knowledge; Debug-route boundary behavior lacks required database-backed coverage. |
| Documentation | findings | ADR, design, README, env example, and Idea visual identity do not agree with default-on raw local tracing / implemented authoring. |
| Idea repository / current-state truth | findings | Repository ownership and active status are correct; visual identity is stale about authoring. |
| Release communication | pass | Changelog describes Character authoring and NPC debug cards without exposing private content. |
| Branch and merge readiness | blocked | `HEAD` equals `develop`; the full implementation is uncommitted in the source working tree, so there is no immutable source commit or clean generated-contract check to integrate. |
| PRD alignment | pass | Creator-first World authority, frozen non-canonical Adventures, and bounded provider evidence remain aligned. |

## Findings

### BLOCKING

- [ ] Repository working tree - The selected source commit is `1d3b5fd2e4474a6fd61fe6d5f2d224b058f349dc`, identical to `develop`; all implementation, generated client, tests, and artifacts are uncommitted. `npm run check:contracts` therefore fails by design and no immutable source diff can be integrated. Recommendation: finish the required remediation and verification, then commit the scoped Change before another integration review.

### REQUIRED

- [ ] `apps/frontend/src/adventures/AdventureWorkbench.tsx:639` and `apps/backend/app/services/adventure_query_service.ts:241` - Autosaving a new `currentLocationKey` removes the selected NPC from the only Scene projection. The card unmounts after refresh, so the user cannot correct the move or edit the remaining advertised editable fields. Recommendation: preserve a usable selected-card editing path through a location move while keeping it unavailable for fresh selection from the current-Scene list; add UI/API coverage.
- [ ] `apps/backend/app/services/story_generation/turn_prompt.ts:68` - `assertNarrationSafeForPublication` protects only private Guide input, although the prompt promises that all private material, including `privateKnowledge`, is never disclosed. An untrusted model can directly reflect an NPC secret into durable player-visible narration. Recommendation: define and implement a defensible private-card disclosure boundary, add narration/extraction tests, and record any residual semantic-leak limitation explicitly.
- [ ] `apps/backend/database/migrations/1784416800000_add_character_initial_state.ts:11` - The down migration blindly drops populated initial-state columns, silently discarding user-authored content. This contradicts the Change's no-silent-truncation constraint. Recommendation: reject data-bearing rollback and add guarded existing-data up/down migration proof.
- [ ] `apps/backend/database/migrations/1784420400000_add_adventure_character_debug_overrides.ts:4` - The new override migration has a rollback guard but no isolated migration test for existing populated Adventure state, upgrade availability, or data-bearing down refusal. The recent missing-column outage makes this upgrade path material. Recommendation: add a guarded migration test before integration.
- [ ] `apps/backend/tests/functional/adventure_npc_debug_state.spec.ts:111` - The Debug edit route is verified only on its happy path; cross-owner non-disclosure, production refusal, active-turn conflict, and invalid frozen Location are unproven despite S3/R3-S2 claiming them. Recommendation: add database-backed functional cases against the guarded disposable database.
- [ ] `apps/backend/.env.example:28` and `README.md:109` - The replan now requires default-on local Debug/raw capture, but checked-in defaults and supporting documentation still implement the earlier opt-in behavior. Recommendation: apply the planned source defaults and tests while preserving explicit disablement, redaction, and production refusal.
- [ ] `/Users/taylor/src/my-life/my-vault/spaces/ideas/lorecraft/visual-identity.md:32` - Current visual identity says World detail must not imply editing behavior and lists read-only detail as a defining screen, but Character authoring is implemented. Recommendation: reconcile the Idea-side current-state guidance with the authoring surface.
- [ ] `docs/changes/2026-07-19-character-authoring-and-npc-cards/tasks.md:62` - Required guarded database, E2E, full live-provider opening/Act/Guide/Pass, and owner manual acceptance evidence remain incomplete. A successful local Act/trace is useful optional confidence evidence, not replacement for the specified matrix. Recommendation: configure a disposable database and run the marked tests/E2E; then complete the traced playtest matrix and manual walkthrough.

### SUGGESTION

- [ ] `apps/backend/app/services/world_character_service.ts` - Return a conflict-specific error for duplicate Character keys rather than `CHARACTER_NOT_FOUND`; it would make API diagnostics clearer without changing the authoring model.

## Verification Evidence

| Command / Scenario | Evidence Type | Requirement / Scenario | Result | What It Proves |
|---|---|---|---|---|
| `sdd validate lorecraft --change 2026-07-19-character-authoring-and-npc-cards --repo . --workspace /Users/taylor --json` | artifact validation | LC-002/S3, LC-003/S3 | pass with two accepted `LARGE_STORY_SCOPE` warnings | Structural SDD validity. |
| `npm run lint` | broad supporting gate | all | pass | Frontend/backend lint and backend generated build path. |
| `npm run typecheck` | broad supporting gate | all | pass | Type correctness. |
| `npm run build` | broad supporting gate | all | pass | Production builds compile. |
| `npm run test --workspace @lorecraft/frontend` | focused automated test | LC-002/S3, LC-003/S3 | pass, 136 tests | Frontend routes, authoring, card/editor, and recovery behavior. |
| `npm run test:storybook --workspace @lorecraft/frontend` | focused automated test | LC-002/S3, LC-003/S3 | pass, 84 tests | Storybook interaction/overflow fixtures. |
| `npm run test --workspace @lorecraft/backend` | guarded database verification | backend scenarios | blocked after 20 database-safety tests | Wrapper correctly refused without `ALLOW_TEST_DATABASE_WRITES=1` and a disposable target; no runtime DB was used. |
| `npm run check:contracts` | integration gate | generated typed contract | blocked | Expected failure while generated client and implementation remain uncommitted. |
| Local trace metadata/permissions inspection | optional confidence evidence | LC-003/S2/R3-S6 | pass | A successful narration/extraction trace had raw request/response entries, 6 accepted updates, 0 ignored, and `0700`/`0600` trace permissions. |

## Rendered UI Verification

| Surface / Fixture | Viewport | State / Interaction | Directly Inspected Evidence | Console / Network | Result |
|---|---|---|---|---|---|
| `Application/Worlds/Detail/Authoring` | desktop | Add Character form | Full required card fields, disclosure, author actions, readable layout | no Vite overlay; no captured errors | pass |
| `Application/Adventures/Workbench/DebugNpcEditor` | desktop | Selected editable NPC card | All ten editable fields, immutable key, autosave disclosure, no horizontal overflow | no overlay; no captured errors | pass |
| `Application/Adventures/Workbench/TurnFailed` | desktop | failed-turn recovery | Retry/Discard in composer dock, not at transcript origin | no overlay; no captured errors | pass |
| `Application/Adventures/Workbench/ReadyMobile` | mobile fixture | Story-first responsive workbench | Story, Player, Scene, and NPC entry render without horizontal overflow | no overlay; no captured errors | pass |

## Review Bundle

- Source branch/ref: `change/character-authoring-and-npc-cards`
- Reviewed source commit: `1d3b5fd2e4474a6fd61fe6d5f2d224b058f349dc` (identical to target; working tree reviewed separately)
- Target branch/ref: `develop` at `1d3b5fd2e4474a6fd61fe6d5f2d224b058f349dc`
- Merge base: `1d3b5fd2e4474a6fd61fe6d5f2d224b058f349dc`
- Source-only commits: none
- Target-only commits: none
- Changed files: no committed source diff; 74 working-tree Change candidates plus generated/supporting artifacts
- Diff stat: committed `develop...HEAD` is empty; working tree contains the reviewed implementation
- Conflict check: clean (`git merge-tree --write-tree develop HEAD`)
- Dirty state: source repo contains the active Change implementation, tests, generated client, docs, and this review record; no unrelated cleanup was performed
- Branch policy: `change/*` to `develop` is correct, but an uncommitted source cannot be integrated
- Reverse-traceability command/result: packaged `sdd_orphan_audit.py --epic LC-002|LC-003 --changed-from develop --format json`; no missing implemented/verified refs, with cross-Epic/support/generated candidates classified.

## Reverse Traceability

- Candidate scope: 74 working-tree candidates across Character authoring, Adventure cards, Debug tracing, generated client, tests, docs, and Epics.
- Epic ownership reconciled: LC-002 has 18 implementation references; LC-003 has 54.
- Support/generated/framework classifications: generated Tuyau registry, route/env wiring, tests, README/changelog, and cross-Epic dependencies are supporting rather than stranded behavior.
- Stranded refactor surfaces checked: routes, validators, generated bindings, migrations, provider adapters, Storybook fixtures, and the failed-turn composer recovery.
- Explicit gaps: migration coverage, Debug API boundary coverage, private-narration safety, location-move editor recovery, and required live/database/manual evidence are tracked above.

## Discovery Wave

| Pass | Reviewer | Result | Notes |
|---|---|---|---|
| Artifact truth / docs / Idea | primary | findings | Default-on raw trace policy and visual-identity claims require reconciliation. |
| Reverse traceability | primary | pass | Both affected Epic audit passes completed. |
| Code diff | primary | findings | NPC move/editor loss and unsafe initial-state rollback found. |
| Verification coverage | primary | findings | Required guarded database/E2E/live matrix incomplete. |
| Security | delegated independent pass + primary validation | findings | Private narration enforcement and Debug-route boundary proof incomplete; no SQL injection, authorization bypass, raw credential leak, or production trace enablement issue found. |
| UI / visual identity | primary | findings | Rendered UI passes; moved-card interaction and stale visual identity remain. |
| Integration readiness | primary | blocked | No committed implementation watermark; contract check cannot pass while dirty. |

## Consolidated Remediation

- Root causes addressed: the ADR/policy decision was replanned; all code, migration/data-safety, guarded-database, and supporting-doc changes remain.
- Safe-fix batch: none. No review-only fix could be safely isolated from the active uncommitted Change.
- Deferred or unsafe findings: every REQUIRED finding above.
- Affected verification union: backend guarded migration/functional tests, frontend moved-card test, prompt-safety tests, E2E, contracts, and docs/ADR validation.
- Regression-focused rereview: not applicable; no remediation batch was made.
- New regressions introduced by remediation: none.

## PR / Merge Readiness

- Source branch: `change/character-authoring-and-npc-cards`
- Reviewed source commit: `1d3b5fd2e4474a6fd61fe6d5f2d224b058f349dc` only; it does not contain the Change
- Target branch: `develop`
- Conflict check: clean
- Commit state: blocked by active source-repo dirty Change
- PR status: none
- Merge status: not authorized and not ready

## Review Log

- 2026-07-19: Full independent review completed. No code, migration, or configuration remediation was applied; this record consolidates the required follow-up work. The Change returned from `in_review` to `proposed` because the requested default-on raw logging policy conflicts with accepted ADR and design constraints.
- 2026-07-19: `/sdd-change --replan` reconciled the default-on local Debug/raw policy, private-narration, Location-move, migration, and verification requirements; Change transitioned to `planned` for a fresh `/sdd-apply`.
- 2026-07-20: Fresh independent re-review began from `b7dc08a` against `develop` at `1d3b5fd2e4474a6fd61fe6d5f2d224b058f349dc`. Artifact, implementation, security, reverse-traceability, and direct desktop/mobile rendered-UI passes completed. Safe corrections reconciled obsolete private-knowledge test expectations and stale active evidence language. The Change returned from `in_review` to `in_progress` because Debug mood/status/memory limits still exceed the accepted 120/320/500 prompt bound without the required existing-data preflight, and create/reset plus all-four-seed initial-state regression coverage is still absent. No validated security finding remains.
