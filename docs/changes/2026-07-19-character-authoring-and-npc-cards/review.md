# Review: Character Authoring And NPC Cards

## Verdict

changes-requested

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
