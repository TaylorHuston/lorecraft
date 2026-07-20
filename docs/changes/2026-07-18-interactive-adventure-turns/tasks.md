---
status: in_review
---

# Tasks: Interactive Adventure Turns

## Resume Here

- Last completed action: independent review remediated provider disclosure, composer semantics, and Ember action consistency against the current working tree
- Next action: commit the reviewed feature/UI work, refresh the review watermark, then complete the live-provider/manual acceptance walkthrough before any merge or closeout
- Active branch/ref: `change/interactive-adventure-turns` from `d389ccd` (`develop` at branch creation)
- Expected dirty files: reviewed Ember/workbench feature UI, its focused tests/docs/tooling, and review artifacts; `.neon` remains unrelated and untracked
- Known review findings: direct private-context disclosure, reset-after-turn proof, browser recovery/concurrency, HTTP recovery, and Idea-side current-state drift are resolved. Live-provider Act/Guide behavior and owner manual desktop/mobile confirmation remain acceptance evidence, not automated review gaps.

## Task Checklist

### 1. Planning Quality

- [x] 1.1 Confirm Act, Pass, and Guide as this Change's complete resolving-turn boundary.
- [x] 1.2 Challenge `LC-003/S2` for user-path fit and document why generation, extraction, mutation, and lifecycle UI should not be split into technical Stories.
- [x] 1.3 Define observable happy, validation, permission, concurrency, recovery, integration, security, responsive, and accessibility Scenarios.
- [x] 1.4 Keep Story, `/look`, `/help`, history revision, streaming, rules, model controls, and multiplayer explicitly deferred.
- [x] 1.5 Define how future `Verified By` evidence will map to every `LC-003/S2` Scenario.
- [x] 1.6 Record the accepted workbench/prototype direction and component strategies; no additional `/sdd-design --plan` blocker remains.
- [x] 1.7 Set `status: planned` after proposal, design, tasks, ADR candidate, and validation are coherent.

### 2. Promotion And Epic Truth

- [x] 2.1 Promote `2026-07-18-interactive-adventure-turns` into the Lorecraft repository and remove duplicate private planned truth through the managed command.
- [x] 2.2 Create `change/interactive-adventure-turns` from current `develop` and record the branch/ref.
- [x] 2.3 Add and maintain `LC-003/S2` with the planned R1-R5 Scenarios and current implementation/verification truth.
- [x] 2.4 Reconcile LC-003 Current/Deferred Scope, Candidate Stories, Story Index, cross-Story concerns, and S1 reset/detail mappings without changing accepted S1 opening behavior.

### 3. Architecture Decisions

- [x] 3.1 Carry `docs/adrs/2026-07-18-revision-linked-adventure-state-mutations.md` with the implementation branch and keep it Proposed until evidence passes.
- [x] 3.2 Reconcile links/evidence in durable async work, immutable Adventure revisions, provider-neutral AI, and World/Adventure isolation ADRs.
- [x] 3.3 Accept the new ADR only after transactional lineage/current-state reconciliation and deterministic recovery are verified.

### 4. Implementation

- [x] 4.1 Implement `LC-003/S2/R1` through BDD/TDD: validated, owner-only, idempotent Act/Pass/Guide turn submission and typed API contracts.
- [x] 4.2 Implement `LC-003/S2/R2`: durable turn/job lifecycle, one active turn, leased recovery, atomic finalization, retry/discard, and stale-work rejection.
- [x] 4.3 Implement `LC-003/S2/R3`: bounded context assembly plus separate narration and extraction contracts/adapters with metadata-only evidence.
- [x] 4.4 Implement `LC-003/S2/R4`: Adventure-owned NPC current state, allowlisted mutation policy, immutable revision-linked outcomes, isolation, and reset/delete reconciliation.
- [x] 4.5 Implement `LC-003/S2/R5`: production Act/Guide composer, deliberate Pass confirmation, pending/completed/failed states, polling, context refresh, focus, announcements, and responsive behavior.
- [x] 4.6 Update generated Tuyau contracts, runtime DTO validation, README privacy/worker/API guidance, and affected deployment health/configuration docs.
- [x] 4.7 Add the user-facing interactive-turn entry to `CHANGELOG.md` without SDD/process or private topology details.
- [x] 4.8 Replace LC-003/S2 `Implemented By` gaps with behavior-mapped current symbols after implementation.

### 5. Verification

- [x] 5.1 Run focused migration/database invariants against disposable Neon, including up/down/up and data-bearing downgrade refusal where required.
- [x] 5.2 Run backend unit/functional coverage for R1-R4, security, metadata minimization, cancellation, concurrency, and reset/delete.
- [x] 5.3 Run frontend component/API coverage for R5 and relevant R1/R2 lifecycle states.
- [x] 5.4 Run deterministic E2E for Act, Pass, Guide, reload/restart, concurrent tabs, state updates, failure recovery, reset, cross-account isolation, and desktop/mobile layouts.
- [x] 5.5 Run broad repository gates: lint, typecheck, tests, contracts, builds, Storybook, and worker/container/deployment checks affected by the change.
- [ ] 5.6 Run live-provider Act and Guide playtests while recording only visible behavior and bounded metadata.
- [ ] 5.7 Obtain user manual UI confirmation for ready/pending/completed/failed desktop and mobile flows.
- [x] 5.8 Update LC-003/S2 `Verified By` with scenario-mapped evidence and leave any real gaps explicit.
- [x] 5.9 Run scoped `sdd validate` and resolve deterministic errors/warnings before review handoff.

### 6. Review, Release, And Closeout

- [x] 6.1 Run `sdd-review` as the independent local gate for behavior, security, data lineage, provider privacy, docs, ADRs, and branch readiness.
- [x] 6.2 Address findings or record explicitly accepted non-blocking risks; keep status `in_review` during closeout.
- [x] 6.3 Confirm release communication, Epic truth, ADR status, generated contracts, and manual confirmation agree with implementation reality.
- [ ] 6.4 Merge according to the repository's develop-integration policy only after review and explicit user authorization.
- [ ] 6.5 Use `sdd-release` for an explicitly authorized main/deployment handoff; run production migration and authenticated Tailscale acceptance only in that workflow.
- [ ] 6.6 Close the Change only after review, merge, acceptance, deferred-scope confirmation, and status reconciliation are complete.

## Implementation Ledger

| Date       | Slice                   | Agent / Guidance                                       | Files / Areas                                                                                                                                                       | Result                                                                                                                      | Commit / Ref                                          |
| ---------- | ----------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 2026-07-18 | Planning                | `sdd-change --plan`; `sdd-adr`                         | private Change plan; proposed revision-linked mutation ADR                                                                                                          | Act/Pass/Guide phase planned; implementation not started                                                                    | `develop` planning state                              |
| 2026-07-19 | Promotion and Discovery | `sdd-apply`; backend, frontend, and artifact discovery | promoted Change, current `LC-003`, existing opening worker/query/UI seams                                                                                           | Change promoted; no scope blocker; legacy Epic normalization and lineage-aware detail projection are required before review | `change/interactive-adventure-turns` (`d389ccd` base) |
| 2026-07-19 | S2 implementation       | `sdd-apply`; backend/frontend implementation slices    | durable turns/jobs, turn worker, separate narrator/extractor, allowlisted mutation state, owner recovery, workbench, deployment supervision, generated Tuyau routes | Implemented; guarded disposable-Neon database and deterministic E2E verification completed; review-recorded manual/live gaps remain | `a6a911f`                                           |
| 2026-07-19 | Review remediation | `sdd-apply`; independent rerun | narrator publication boundary, reset lineage proof, HTTP and browser recovery/concurrency tests, LC-003 truth, and Idea-side current-state notes | Direct Guide reflection is rejected before publication; deterministic recovery/reset evidence and current-state documentation are reconciled; live-provider/manual acceptance remains pending | `ff1d2ec` |

## Verification Ledger

| Date       | Check                                                                                                                                                       | Evidence Type              | What It Proves                                                                                                                             | Result                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| 2026-07-18 | `sdd validate lorecraft --change 2026-07-18-interactive-adventure-turns --workspace /Users/taylor --json`                                                   | structural SDD gate        | private Change artifact shape and planned Epic references                                                                                  | passed; 0 errors, 0 warnings                                                                                |
| 2026-07-19 | `sdd validate lorecraft --change 2026-07-18-interactive-adventure-turns --repo /Users/taylor/src/my-life/spaces/lorecraft --workspace /Users/taylor --json` | structural SDD gate        | promoted Change and target Epic routing                                                                                                    | passed; 0 errors; expected `LEGACY_EPIC_SCHEMA` warning to be resolved by the required S2 normalization     |
| 2026-07-19 | focused backend unit suite                                                                                                                                  | executable tests           | bounded context, private-history exclusions, extractor validation, and mutation allowlist/rejections                                       | passed; 10 tests                                                                                            |
| 2026-07-19 | backend lint/typecheck plus deployment container/release contracts                                                                                          | static and executable gate | backend code shape, worker Compose topology, and deployment contract remain valid                                                          | passed; 16 deployment contract tests                                                                        |
| 2026-07-19 | focused frontend suite, lint, and typecheck                                                                                                                 | executable/static gate     | Act/Guide/Pass controls, lifecycle feedback, polling, typed API guards, and responsive workbench states                                    | passed; 38 tests                                                                                            |
| 2026-07-19 | local development smoke                                                                                                                                     | browser and HTTP           | web (4310), API (4311), opening worker, and turn worker start together; sign-in UI has content with no framework overlay or console errors | passed                                                                                                      |
| 2026-07-19 | broad lint/typecheck/build, Storybook, and database-safety gates                                                                                            | static and executable gate | source formatting/types, production bundles, Storybook states, and guarded disposable-target policy                                        | passed; Storybook 81 tests, database safety 20 tests                                                        |
| 2026-07-19 | `sdd_orphan_audit.py --epic LC-003 --changed-from d389ccd`                                                                                                  | reverse traceability audit | changed behavior-bearing source/tests map to S2 implementation or verification evidence                                                    | no missing references; only generated Tuyau registry is intentionally excluded from hand-authored ownership |
| 2026-07-19 | guarded disposable-Neon backend suite                                                                                                                        | executable database tests  | migrations, constraints, API authorization/idempotency, worker lifecycle, state isolation/reset/delete, and transactional mutation provenance | passed |
| 2026-07-19 | deterministic Playwright Adventure journey                                                                                                                   | executable E2E             | Act, private Guide, confirmed Pass, post-commit Player/Scene update, reload/reset, owner isolation, and desktop/mobile presentation            | passed (3 tests) |
| 2026-07-19 | scoped SDD validation and LC-003 reverse audit                                                                                                              | structural/reverse trace   | Change and Epic are structurally valid and behavior-bearing implementation/tests have current ownership and verification mappings               | passed; 0 errors; two intentional large-story-scope warnings |
| 2026-07-19 | independent `sdd-review` artifact rerun                                                                                                                     | structural/reverse trace   | Post-review artifact validity, current code ownership, and generated-contract synchronization                                                        | passed; 0 errors; two intentional large-story-scope warnings; 0 missing refs; contract check passed |
| 2026-07-19 | frontend full suite, lint, typecheck, build, and Storybook                                                                                                  | executable/static gate     | Current frontend behavior, static correctness, production bundles, and documented component states                                                   | passed; 127 frontend tests and 81 Storybook tests |
| 2026-07-19 | root `npm run test` without disposable test environment                                                                                                     | guard verification         | Backend test safety fails closed when a write acknowledgement or isolated target is absent                                                           | safety suite passed (20 tests); backend functional/database suite intentionally not run |
| 2026-07-19 | guarded disposable-Neon backend rerun | executable database tests | Direct reflected Guide text produces no published narration, Story entry, revision, extractor request, or model-call evidence; reset rebuilds all player/NPC state and lineage; owner retry/discard contract works | passed |
| 2026-07-19 | deterministic Playwright rerun | executable E2E | Pending reload and same-owner concurrent submission preserve one active turn; failed turns retry and discard while Player/Scene state remains stable on desktop and mobile | passed (3 projects) |
| 2026-07-19 | Ember theme token update | executable/static/browser verification | The shared Ember charcoal/copper token mapping, readable text contrast, production bundle, and Storybook states remain valid | passed; 129 frontend tests, 81 Storybook tests, lint, typecheck, build, and local rendered UI inspection |
| 2026-07-19 | Refreshed Ember controls | executable/static/browser verification | Current Ember tokens, button and icon variants, text controls, semantic error contrast, and local action exceptions match the refreshed UI Foundations grammar | passed; 129 frontend tests, 81 Storybook tests, lint, typecheck, build, and rendered sign-in plus Controls Storybook inspection via `agent-browser` |
| 2026-07-19 | Worlds action controls | executable/browser verification | The authenticated World library applies the refreshed primary, secondary, and destructive Ember treatments to New Adventure, Resume, Sign out, and Delete | passed; 129 frontend tests and rendered `/worlds` inspection with computed tokens via the browser checker |
| 2026-07-19 | Story header removal | executable/browser verification | The redundant Chronicle/Story heading is removed without changing the Story region's accessible name, route-focus target, scroll behavior, or composer docking | passed; 25 focused frontend tests and rendered Workbench Storybook inspection via `agent-browser` |
| 2026-07-19 | Composer tab restoration | executable/browser verification | Act and Guide retain their intentional bordered, attached-tab treatment despite ordinary buttons becoming borderless in refreshed Ember | passed; 25 focused frontend tests and rendered Workbench Storybook inspection via `agent-browser` |
| 2026-07-19 | Composer tab hover removal | executable verification | Act and Guide retain their resting or selected visual state on hover and press, without inheriting the shared ghost-button interaction effect | passed; 11 focused Workbench tests |
| 2026-07-19 | review remediation: composer privacy and semantics | executable/static/browser verification | The pre-submit provider notice is visible for Act and Guide; the tab-styled controls use keyboard-operable semantic toggle buttons rather than incomplete tab semantics | passed; focused Workbench test, frontend lint/typecheck/build, Storybook, and direct desktop/mobile inspection |
| 2026-07-19 | review remediation: Ember return control | executable/browser verification | Return to World now uses the refreshed borderless raised-secondary Ember treatment at desktop and mobile widths | passed; direct desktop/mobile inspection |

## Manual Feedback

| Date       | Feedback                                                                               | Classification         | Action / Artifact Updates                                       | Status   |
| ---------- | -------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------- | -------- |
| 2026-07-18 | Immediate phase should implement Act, Pass, and Guide; Story and utilities can follow. | requirement refinement | proposal/design/tasks use one LC-003/S2 resolving-turn boundary | resolved |

## Planning Updates

| Date       | Discovery                                                                               | Classification      | Planning Updates                                  | Next Apply Starting Point                           |
| ---------- | --------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------- | --------------------------------------------------- |
| 2026-07-18 | Initial plan created from the resolved Adventure exploration and archived MVP evidence. | in-scope refinement | created proposal, design, tasks, and proposed ADR | `/sdd-apply` begins after promotion at LC-003/S2/R1 |

## Design Updates

| Date       | Feedback / Discovery                                                                 | Classification        | Reference / Target                             | Preserve / Change / Non-Goals                                                                    | Artifact Updates | Next Apply Starting Point                     |
| ---------- | ------------------------------------------------------------------------------------ | --------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------- | --------------------------------------------- |
| 2026-07-18 | Existing Adventure workbench and prototype already settle the composition direction. | experience refinement | production workbench plus checked-in prototype | preserve Story-first shell; add real Act/Guide/Pass lifecycle; no Story/utilities/debug controls | design.md        | `/sdd-apply` R5 after backend contracts exist |

## Manual UI Confirmation

- Status: pending user
- App URL / route: development `/adventures/<owned-ready-adventure-id>`
- Required setup or test data: signed-in owner, seeded Stormbound Chapel, ready Adventure, deterministic and live-provider test paths
- Steps for the user: submit Act, Pass, and Guide; observe pending/completion; reload while pending; retry/discard a forced failure; inspect Player/Scene changes on desktop and mobile
- Expected result: one coherent chronological narration per successful turn, current context updates only from accepted bounded mutations, prior state survives failures, controls remain clear and accessible without overflow
- Feedback that would change artifacts: action semantics, hidden Guide behavior, Pass safety, pending/failure recovery, story/context hierarchy, or responsive composition differs from the accepted plan

## Blockers / Open Questions

- Live-provider Act/Guide behavior and owner manual desktop/mobile confirmation remain acceptance evidence. No raw prompt, Guide, or provider body will be retained.

## Closeout

- Change status: review-ready on `change/interactive-adventure-turns`; deterministic remediation is complete and acceptance remains pending
- Epic files updated: `LC-003` uses `sdd-epic-v2`; S2 maps current implementation and explicit verification gaps
- Story labels/references and Requirement/Scenario IDs current: `LC-003/S2` R1-R5
- Implemented By maps current: yes
- Scenario-mapped Verified By maps current: yes; live-provider/manual acceptance remains explicit
- Superseded earlier Epic truth reconciled: yes
- ADR status: revision-linked Adventure state mutations is Accepted after transaction/recovery evidence; related accepted ADR links are reconciled
- Release communication current: README and CHANGELOG updated; release not started
- `sdd-review` verdict: ready pending the recorded live-provider/manual acceptance walkthrough
- Review record: `docs/changes/2026-07-18-interactive-adventure-turns/review.md`
- `review.md` findings resolved: private-context publication boundary, reset lifecycle, HTTP/browser recovery, and Idea-side documentation are reconciled; provider/manual acceptance remains pending
- Planning updates resolved: yes
- Manual UI confirmation status: pending user after implementation
- PR / merge state: not started
- Deferred scope accepted: Story, `/look`, `/help`, successful-turn history revision, streaming, rules, model controls, and multiplayer
- Change moved to `docs/changes/closed/`: no
