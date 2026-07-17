---
status: in_progress
---
# Tasks: Private Adventure Foundation

## Resume Here

- Last completed action: `/sdd-apply` Discovery passed and created the policy-compliant implementation branch
- Next action: complete Task 4.1 as the first RED-to-GREEN frozen-source database slice, then continue publication behavior vertically
- Active branch/ref: `change/private-adventure-foundation` from local `develop` at `2037271`
- Expected dirty files: this Change's task ledger plus scoped backend migrations, World/Starting Point/WorldVersion models and services, seed data, and focused tests
- Known blockers: none

## Task Checklist

### 1. Planning Quality

- [x] 1.1 Bound this Change to starting, opening, resuming, resetting, and deleting a private Adventure.
- [x] 1.2 Keep versioning, worker, API, and UI work under one user-path Story rather than splitting by technical layer.
- [x] 1.3 Define observable creation, isolation, async recovery, lifecycle, authorization, responsive, and failure Scenarios.
- [x] 1.4 Record turn controls, utilities, mutation, rules, sharing, and history editing as deferred Candidate Stories.
- [x] 1.5 Define scenario-mapped backend, frontend, E2E, live-provider, debug, and manual evidence expectations.
- [x] 1.6 Complete `/sdd-design`: confirm desktop/mobile composition, creation flow, shell lifecycle states, disclosure boundaries, accessibility, prototype exclusions, and final manual acceptance scope.
- [x] 1.7 Set this private Change to `planned` after scoped validation succeeds.

### 2. Promotion And Repository Preflight

- [x] 2.1 Remove the unnecessary Deep Steel Blue SDD artifacts and merge its final maintenance delta into `develop`.
- [x] 2.2 Fetch `origin/develop`, confirm the official repository is clean, and preserve the local unpushed maintenance commit as the promotion base.
- [x] 2.3 Promote the private folder to `docs/changes/2026-07-16-private-adventure-foundation/` and remove the private duplicate.
- [x] 2.4 At `/sdd-apply` start, create `change/private-adventure-foundation` from current `develop` before editing application code.
- [ ] 2.5 Re-read repository guidance and current AdonisJS/Lucid/Tuyau documentation for version-sensitive worker, transaction, JSONB, and route APIs.

### 3. Epic And ADR Artifacts

- [x] 3.1 Create `docs/epics/lc-003-adventure-play/epic.md` from the canonical Epic scaffold.
- [x] 3.2 Add accepted `LC-003/S1` Requirements and Scenarios plus unnumbered Candidate Stories from `design.md`.
- [x] 3.3 Update `LC-002` deferred scope to point to `LC-003` without changing its implemented Stories or evidence.
- [x] 3.4 Add Proposed ADR `docs/adrs/2026-07-16-immutable-world-version-snapshots.md` comparing snapshot, normalized-version, and per-Adventure copy options.
- [x] 3.5 Add Proposed ADR `docs/adrs/2026-07-16-durable-asynchronous-adventure-work.md` covering persisted jobs, leases, polling, process topology, and later push delivery.
- [x] 3.6 Update the accepted World/Adventure isolation ADR with this implementing Change and planned validation evidence; do not rewrite its decision.

### 4. Frozen Source Foundation

- [x] 4.1 RED-to-GREEN, one invariant at a time: add migration/database tests and implementation for World Adventure guidance, same-World Starting Point references, one default Starting Point, immutable version identity, and current-version ownership.
- [x] 4.2 RED-to-GREEN, one behavior at a time: add publication tests and implementation proving deterministic ordering/hash behavior, identical-content reuse, changed-content version creation, and immutable existing snapshots.
- [x] 4.3 Complete the relational `world_starting_points`, World Adventure guidance/current-version fields, and immutable schema-versioned `world_versions` JSONB snapshot models after the invariant cycles pass.
- [x] 4.4 Complete the provider-independent WorldVersion publication service after its behavior cycles pass; validate all stable-key references before insert and never update an existing version.
- [ ] 4.5 Extend Stormbound Chapel with Adventure guidance, a default Chapel Starting Point, and creator-authored opening premise; publish after explicit seed reconciliation only.
- [ ] 4.6 Verify repeated seed installation remains exact and does not alter Adventures already bound to an older version.
- [ ] 4.7 Map Phase 4 implementation and publication/preservation evidence for `LC-003/S1 R2`; leave Adventure-binding and creation-conflict portions of `R2-S1..R2-S3` explicit until Tasks 5 and 7 can prove them, and update the relational World aggregate ADR consequences if snapshot boundaries need clarification.

### 5. Adventure Aggregate And Authorization

- [ ] 5.1 RED-to-GREEN, one behavior at a time: add domain/service tests and implementation for valid creation, profile validation, owner-scoped idempotency, inaccessible/unplayable Worlds, and atomic rollback on failure.
- [ ] 5.2 RED-to-GREEN alongside each aggregate behavior: add only the database invariants needed for Adventure-to-WorldVersion ownership, one player per Adventure, revision/story immutability, job/call ownership, cascade boundaries, and safe migrations.
- [ ] 5.3 Implement UUID-backed Adventures, one-to-one player profiles, root revisions, story entries, durable jobs, and model-call evidence records.
- [ ] 5.4 Implement Adventure creation from the current accessible WorldVersion and default Starting Point in one transaction, including the initial player Location and pending opening job.
- [ ] 5.5 Implement owner-filtered list/read projections that combine frozen source with Adventure-owned player state and never return raw snapshots, private prompt evidence, or another owner's data.
- [ ] 5.6 RED then implement reset and delete domain behavior, including same-version reset, pending-work conflict, stale-job invalidation, and source/other-Adventure isolation.
- [ ] 5.7 Map implementation and evidence for `LC-003/S1 R1`, `R2`, and `R4` as each Scenario passes.

### 6. Durable Opening Generation

- [ ] 6.1 RED: define a deterministic `StoryGenerator` contract test for successful prose, invalid/empty output, timeout, provider failure, and metadata/redaction behavior.
- [ ] 6.2 Implement structured opening prompt assembly from platform instructions, frozen World guidance, Starting Point premise, player profile, starting Location, and Characters present.
- [ ] 6.3 Implement the OpenAI-compatible story adapter with server-only base URL/key/model/settings, bounded timeout, normalized errors, and no extraction/JSON-mode responsibility.
- [ ] 6.4 RED: add worker tests for row claiming, one active job, lease expiry/reclaim, one automatic retry, terminal failure, owner retry, stale-worker rejection, and deletion/reset races.
- [ ] 6.5 Implement the separately runnable worker and atomic finalization of model call, root revision, opening story entry, Adventure head, and ready status.
- [ ] 6.6 Add structured correlated local logs for opening lifecycle while ensuring secrets and authorization headers are absent.
- [ ] 6.7 Wire root development/test process startup so frontend, API, and worker run together; document the separate production worker command and health expectations.
- [ ] 6.8 Map implementation and evidence for `LC-003/S1 R3/R3-S1..R3-S4`.

### 7. Typed API Boundary

- [ ] 7.1 RED: add functional tests for World playability/Adventure summaries, create/read/retry/reset/delete routes, anonymous denial, cross-account non-disclosure, CSRF, validation, idempotency, and busy/unplayable conflicts.
- [ ] 7.2 Add Vine validators and thin controllers over Adventure application services under authenticated `/api/v1` routes.
- [ ] 7.3 Extend the World detail DTO with playability and current-owner Adventure summaries; keep author account data and raw version data minimized.
- [ ] 7.4 Add typed Tuyau client contracts, runtime response validators, account-scoped query keys, and stable error mapping for `404`, `409`, `422`, and network failures.
- [ ] 7.5 Confirm future clients can reuse lifecycle APIs without depending on React presentation behavior.

### 8. World And Adventure Experience

- [ ] 8.1 RED: extend route/component tests for World Adventures empty/populated states, creation validation, pending polling, reload, failure/retry, ready projection, reset conflict, delete, and session loss.
- [ ] 8.2 Add the compact World-contained Adventures section with player identity, zero completed turns, last-played time, lifecycle status, row-level resume, New Adventure, and separate confirmed delete action.
- [ ] 8.3 Add `/worlds/:slug/adventures/new` with preserved World identity, required name, optional physical description/backstory, associated validation, one idempotent submission, Cancel, and safe navigation.
- [ ] 8.4 Adapt the selected Adventure workbench prototype into real feature components while removing its composer, action controls, Director observation, change badge, editable Player data, and spoiler-bearing NPC fields.
- [ ] 8.5 Add `/adventures/:id` with populated Player/Scene regions during pending and failure states, Story-local preparation/failure/ready content, filtered NPC disclosure, compact navigation, and reset menu.
- [ ] 8.6 Add persistent desktop Player/Story/Scene regions and mobile bottom tabs with Story default, keyboard navigation, focus management, restrained status announcements, confirmation behavior, touch targets, reduced motion, and overflow checks.
- [ ] 8.7 Add Storybook stories for World Adventure list, creation form states, pending populated shell, terminal failure/retry, ready desktop, mobile Story/Player/Scene, empty NPC scene, and destructive confirmations; run configured accessibility checks.
- [ ] 8.8 Map implementation and evidence for `LC-003/S1 R4` and `R5`.

### 9. End-To-End And Operational Verification

- [ ] 9.1 Add a deterministic fake OpenAI-compatible endpoint or injected test adapter that exercises the production async boundary without an external model.
- [ ] 9.2 Extend Playwright setup to start the worker and use disposable data; ensure every test-created Adventure is deleted or database-isolated after the run.
- [ ] 9.3 E2E: create from Stormbound Chapel, reload while pending, observe exactly one opening, resume from World detail, and verify zero completed turns plus stable Player/Scene context.
- [ ] 9.4 E2E: prove source version isolation, same-version reset, delete isolation, anonymous denial, and cross-account non-disclosure.
- [ ] 9.5 E2E: verify desktop/mobile layout, keyboard path, status announcements, touch targets, and no horizontal overflow.
- [ ] 9.6 Live-provider playtest: verify the opening follows the authored premise and frozen starting context with a configured local or compatible model.
- [ ] 9.7 Inspect one successful and one failed opening unit for redacted exact request/response, provider/model/settings, retry, timing, and final status.
- [ ] 9.8 Run `npm run lint`, `npm run test`, `npm run typecheck`, `npm run build`, `npm run test:storybook`, and `npm run test:e2e`; record what each command actually exercised.
- [ ] 9.9 Keep the dev servers and worker running after verification unless the user asks to stop them.

### 10. Documentation, Review, And Closeout

- [ ] 10.1 Update README capability boundaries, environment setup, explicit starter publication/seed operation, and frontend/API/worker runtime commands without exposing private planning paths or secrets.
- [ ] 10.2 Add only user-facing capability to `CHANGELOG.md`: private Adventure creation/resume and generated frozen-source openings.
- [ ] 10.3 Update `LC-003/S1 Implemented By`, scenario-mapped `Verified By`, and real `Verification Gaps`; update ADR statuses based on implementation evidence.
- [ ] 10.4 Run scoped `sdd validate` and resolve deterministic artifact drift before review.
- [ ] 10.5 Request user manual confirmation of World discovery, creation, pending/recovery, ready story/Player/Scene, reset/delete placement, and desktop/mobile presentation.
- [ ] 10.6 Run independent `/sdd-review`; address findings or record explicitly accepted non-blocking deferrals.
- [ ] 10.7 Confirm proposal/design/tasks/Epic/ADR/README/CHANGELOG truth matches implementation and no candidate Story is described as implemented.
- [ ] 10.8 Keep Change status `in_review` through review and authorized PR/merge, then close through `sdd change close` rather than editing a closed status manually.

## Implementation Ledger

| Date | Slice | Agent / Guidance | Files / Areas | Result | Commit / Ref |
|---|---|---|---|---|---|
| 2026-07-16 | LC-003/S1 planning | main agent, `/sdd-change --plan` | private proposal/design/tasks | Planned; implementation not started | private plan |
| 2026-07-16 | LC-003/S1 promotion | main agent, `sdd change promote` and `sdd epic create` | active Change, LC-003, LC-002, ADRs | Promoted and reconciled; implementation not started | `develop` |
| 2026-07-16 | LC-003/S1 apply Discovery | main orchestrator; delegated backend discovery; `tdd` and current framework guidance selected | repository policy, Change/Epic/ADRs, backend schema and tests | Scoped validation passed; implementation branch created; frozen-source foundation selected as first vertical slice | `change/private-adventure-foundation` |
| 2026-07-16 | LC-003/S1 R2 migration invariants | delegated backend implementation; orchestrator-verified | frozen-source migration and database tests | Same-World Starting Points, one default, immutable UUID WorldVersion identity, and current-version ownership implemented; publication remains pending | `605c881` |
| 2026-07-16 | LC-003/S1 R2 deterministic publication | delegated backend implementation; orchestrator lint correction and verification | World/StartingPoint/WorldVersion models, publication service, focused functional tests | Ordered schema-v1 snapshots, stable-key validation, canonical SHA-256 identity, identical-content reuse, changed-content version creation, and old-snapshot preservation pass | `889460b` |

## Verification Ledger

| Date | Check | Evidence Type | What It Proves | Result |
|---|---|---|---|---|
| 2026-07-16 | `sdd validate lorecraft --change 2026-07-16-private-adventure-foundation --json` | artifact validation | Private Change structure, planned status, and references | Passed; 0 errors, 0 warnings |
| 2026-07-16 | Scoped Change and `LC-003` validation after promotion | artifact validation | Canonical Change, Epic, Story, ADR links, and repository references | Passed; 0 errors, 0 warnings |
| 2026-07-16 | Scoped Change validation after `/sdd-design` | artifact validation | Confirmed experience contract remains structurally valid and implementation-ready | Passed; 0 errors, 0 warnings |
| 2026-07-16 | `sdd validate lorecraft --change 2026-07-16-private-adventure-foundation --repo spaces/code/lorecraft --workspace /Users/taylor/src/my-life/my-vault --json` | artifact validation | Active Change and Epic structure before implementation | Passed; 0 errors, 0 warnings |
| 2026-07-16 | Focused frozen-source migration suite against isolated scratch Neon schema | focused database test | `LC-003/S1 R2` same-World Starting Point/default constraints, UUID version identity, insert-only rows, and same-World current-version ownership | Passed; 2 tests |
| 2026-07-16 | Existing World migration/seed/catalog regression suite against isolated scratch Neon schema | focused database and functional tests | Pre-change World integrity, seed provenance, exact reconciliation, authorization, and catalog behavior remain green | Passed; 11 tests |
| 2026-07-16 | WorldVersion publication suite against isolated scratch Neon schema | focused functional test | `LC-003/S1 R2` deterministic ordering/hash, stable-key rejection, identical reuse, changed-content insertion, and old-snapshot preservation | Passed; 4 tests |
| 2026-07-16 | Backend lint, typecheck, and `git diff --check` after publication slice | broad supporting gates | Publication implementation is formatted and type-safe | Passed |

## Manual Feedback

| Date | Feedback | Classification | Action / Artifact Updates | Status |
|---|---|---|---|---|
| 2026-07-16 | World/Adventure isolation and core Adventure behavior resolved during exploration. | requirement refinement | Incorporated into proposal and design; turn loop staged as later candidates. | resolved |

## Planning Updates

| Date | Discovery | Classification | Planning Updates | Next Apply Starting Point |
|---|---|---|---|---|
| 2026-07-16 | Official checkout contains an unrelated Change in review and dirty UI files. | technical constraint | Kept planning private; added clean-branch promotion preflight. | Task 2.1 |
| 2026-07-16 | Deep Steel Blue was reclassified as maintenance and removed as an SDD Change. | in-scope refinement | Cleared the promotion gate and updated Resume Here plus preflight truth. | Task 2.4 |
| 2026-07-16 | Phase 4 grouped all RED work before implementation and implied it could fully verify Adventure-binding Scenarios before the Adventure aggregate exists. | implementation-planning correction | Reframed Tasks 4.1-4.4 as vertical RED-to-GREEN cycles and made Task 4.7 preserve the remaining `R2` evidence gap for Tasks 5 and 7. | Task 4.1 |

## Design Updates

| Date | Feedback / Discovery | Classification | Reference / Target | Preserve / Change / Non-Goals | Artifact Updates | Next Apply Starting Point |
|---|---|---|---|---|---|---|
| 2026-07-16 | Existing Adventure workbench prototype supplies composition evidence but not production behavior. | experience refinement | `apps/frontend/src/prototypes/adventure/` | Preserve story-first Player/Story/Scene hierarchy; replace fake state and avoid exact MVP recreation. | `design.md` Experience Design | Task 8.1 |
| 2026-07-16 | Taylor confirmed the production Adventure direction one decision at a time. | experience refinement | stable prototype Storybook IDs and current World detail | Preserve three-region desktop and bottom-tab mobile composition; add dedicated creation, populated pending/failure shells, read-only filtered context, no composer, and compact navigation. Exact top-nav polish remains safely deferrable. | `design.md` Experience Design and Tasks 8.2-8.7 | Task 2.4, then Task 4.1 |

## Manual UI Confirmation

- Status: pending user
- App URL / route: `http://localhost:4310/worlds/stormbound-chapel`, `/worlds/stormbound-chapel/adventures/new`, and generated `/adventures/<id>`
- Required setup or test data: authenticated account, explicitly installed/versioned Stormbound Chapel, configured live model for narrative-quality check
- Steps for the user: create from the compact World Adventure list; review dedicated form validation; inspect the populated pending shell; reload and recover; inspect terminal failure/retry; verify ready Story/Player/Scene disclosure; use mobile bottom tabs; reset from the Adventure menu; delete from World detail
- Expected result: the shell remains story-first and stable across lifecycle states, no deferred controls or hidden NPC knowledge leak, the frozen Adventure survives reload, and reset/delete remain clearly separated
- Feedback that would change artifacts: different discovery placement, creation route, panel composition, disclosure boundary, pending/failure treatment, reset/delete placement, or mobile navigation

## Blockers / Open Questions

- No planning questions remain.
- No operational or planning blocker remains.

## Closeout

- Change status: in_progress; implementation started with the frozen-source foundation
- Epic files updated: `LC-003` created; `LC-002` deferred ownership reconciled
- Story labels/references and Requirement/Scenario IDs current: planned `LC-003/S1`; candidates intentionally unnumbered
- Implemented By maps current: pending
- Scenario-mapped Verified By maps current: pending
- Superseded earlier Epic truth reconciled: yes; `LC-002` now points Adventure ownership to `LC-003`
- ADR status: two Proposed ADRs created; isolation ADR linked to this Change
- Release communication current: planned README and CHANGELOG updates
- `sdd-review` verdict: pending implementation
- Review record: none
- `review.md` findings resolved: not applicable yet
- Planning updates resolved: yes
- Manual UI confirmation status: pending user after implementation
- PR / merge state: local `change/private-adventure-foundation`; no PR
- Deferred scope accepted: yes, recorded in proposal/design
- Change moved to `docs/changes/closed/`: no
