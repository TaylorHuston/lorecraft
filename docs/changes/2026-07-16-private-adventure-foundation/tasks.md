---
status: planned
---
# Tasks: Private Adventure Foundation

## Resume Here

- Last completed action: confirmed and recorded the production Adventure experience contract through `/sdd-design`
- Next action: invoke `/sdd-apply`; create `change/private-adventure-foundation` from current `develop`, then start Task 4.1 with failing database tests
- Active branch/ref: `develop` for promotion documentation; implementation branch not created
- Expected dirty files: none after the design-readiness commit; application files begin only on `change/private-adventure-foundation`
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
- [ ] 2.4 At `/sdd-apply` start, create `change/private-adventure-foundation` from current `develop` before editing application code.
- [ ] 2.5 Re-read repository guidance and current AdonisJS/Lucid/Tuyau documentation for version-sensitive worker, transaction, JSONB, and route APIs.

### 3. Epic And ADR Artifacts

- [x] 3.1 Create `docs/epics/lc-003-adventure-play/epic.md` from the canonical Epic scaffold.
- [x] 3.2 Add accepted `LC-003/S1` Requirements and Scenarios plus unnumbered Candidate Stories from `design.md`.
- [x] 3.3 Update `LC-002` deferred scope to point to `LC-003` without changing its implemented Stories or evidence.
- [x] 3.4 Add Proposed ADR `docs/adrs/2026-07-16-immutable-world-version-snapshots.md` comparing snapshot, normalized-version, and per-Adventure copy options.
- [x] 3.5 Add Proposed ADR `docs/adrs/2026-07-16-durable-asynchronous-adventure-work.md` covering persisted jobs, leases, polling, process topology, and later push delivery.
- [x] 3.6 Update the accepted World/Adventure isolation ADR with this implementing Change and planned validation evidence; do not rewrite its decision.

### 4. Frozen Source Foundation

- [ ] 4.1 RED: add migration/database tests for World Adventure guidance, same-World Starting Point references, one default Starting Point, immutable version identity, and current-version ownership.
- [ ] 4.2 RED: add publication tests proving deterministic ordering/hash behavior, identical-content reuse, changed-content version creation, and immutable existing snapshots.
- [ ] 4.3 Implement relational `world_starting_points`, World Adventure guidance/current-version fields, and immutable schema-versioned `world_versions` JSONB snapshots.
- [ ] 4.4 Implement a provider-independent WorldVersion publication service that validates all stable-key references before insert and never updates an existing version.
- [ ] 4.5 Extend Stormbound Chapel with Adventure guidance, a default Chapel Starting Point, and creator-authored opening premise; publish after explicit seed reconciliation only.
- [ ] 4.6 Verify repeated seed installation remains exact and does not alter Adventures already bound to an older version.
- [ ] 4.7 Map implementation and evidence for `LC-003/S1 R2/R2-S1..R2-S3` and update the relational World aggregate ADR consequences if snapshot boundaries need clarification.

### 5. Adventure Aggregate And Authorization

- [ ] 5.1 RED: add domain/service tests for valid creation, profile validation, owner-scoped idempotency, inaccessible/unplayable Worlds, and atomic rollback on failure.
- [ ] 5.2 RED: add database tests for Adventure-to-WorldVersion ownership, one player per Adventure, revision/story immutability, job/call ownership, cascade boundaries, and safe migrations.
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

## Verification Ledger

| Date | Check | Evidence Type | What It Proves | Result |
|---|---|---|---|---|
| 2026-07-16 | `sdd validate lorecraft --change 2026-07-16-private-adventure-foundation --json` | artifact validation | Private Change structure, planned status, and references | Passed; 0 errors, 0 warnings |
| 2026-07-16 | Scoped Change and `LC-003` validation after promotion | artifact validation | Canonical Change, Epic, Story, ADR links, and repository references | Passed; 0 errors, 0 warnings |
| 2026-07-16 | Scoped Change validation after `/sdd-design` | artifact validation | Confirmed experience contract remains structurally valid and implementation-ready | Passed; 0 errors, 0 warnings |

## Manual Feedback

| Date | Feedback | Classification | Action / Artifact Updates | Status |
|---|---|---|---|---|
| 2026-07-16 | World/Adventure isolation and core Adventure behavior resolved during exploration. | requirement refinement | Incorporated into proposal and design; turn loop staged as later candidates. | resolved |

## Planning Updates

| Date | Discovery | Classification | Planning Updates | Next Apply Starting Point |
|---|---|---|---|---|
| 2026-07-16 | Official checkout contains an unrelated Change in review and dirty UI files. | technical constraint | Kept planning private; added clean-branch promotion preflight. | Task 2.1 |
| 2026-07-16 | Deep Steel Blue was reclassified as maintenance and removed as an SDD Change. | in-scope refinement | Cleared the promotion gate and updated Resume Here plus preflight truth. | Task 2.4 |

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

- Change status: planned; implementation not started
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
- PR / merge state: promotion documentation on local `develop`; no implementation branch or PR
- Deferred scope accepted: yes, recorded in proposal/design
- Change moved to `docs/changes/closed/`: no
