---
status: in_review
---

# Tasks: Audit Hardening

## Resume Here

- Last completed action: merged reviewed `fix/adventure-heading-order` locally into `develop` at `76239fade23bdb171895406080dafb478fb6cc79`; local UI remains user confirmed and private production acceptance remains pending.
- Next action: commit the prepared public release communication, push `develop`, and open the production release PR to `main`.
- Active branch/ref: `develop` at merge commit `76239fa`.
- Expected dirty files: audit report, active Change, affected Epics/ADRs/README, bounded backend/frontend/CI files, and new portable deployment assets. Private host inventory and secrets remain outside the repository.
- Known blockers: disposable validation and clean production migration are complete. GHCR publication, private-host LXC provisioning, Tailscale Serve mutation, deployment, restore drill, and production acceptance remain explicit execution-time gates. The legacy default `production` branch remains untouched; `production-clean` is the migrated empty production candidate.

## Task Checklist

### 1. Planning Quality

- [x] 1.1 Confirm all ten audit findings are in scope without adding adjacent product capability.
- [x] 1.2 Keep remediation within existing user-path Stories rather than create technical-layer Stories.
- [x] 1.3 Define observable disclosure, recovery, route-context, and completion Scenarios plus technical privacy/reproducibility constraints.
- [x] 1.4 Record metadata-only evidence, generic provider disclosure, single-instance quota truth, and production purge authorization as explicit decisions/constraints.
- [x] 1.5 Define scenario-mapped focused, broad, E2E, manual, and debug evidence.
- [x] 1.6 Record that existing UI conventions make the narrow accessibility/disclosure work implementation-ready without `/sdd-design`.
- [x] 1.7 Set `status: planned` after semantic review and scoped validation.
- [x] 1.8 Reopen the Change through `/sdd-change --replan` and classify the actual private deployment as an explicit scope expansion.
- [x] 1.9 Confirm deployment topology, database environments, inference host, release source, secrets, maintenance, recovery, monitoring, and operating-cost decisions with the user.
- [x] 1.10 Record the portable container boundary in `docs/adrs/2026-07-18-portable-container-deployment.md` and refine the accepted Neon ADR.

### 2. Epic And ADR Artifacts

- [x] 2.1 Update `LC-001/S3`, `LC-002/S1`, `LC-002/S2`, and `LC-003/S1` before behavior implementation.
- [x] 2.2 Preserve current Story labels and add/refine local Requirement/Scenario IDs without renumbering completed behavior unnecessarily.
- [x] 2.3 Reconcile LC-003 metadata evidence, quota topology, manual confirmation, verification dates, and earlier current-state wording.
- [x] 2.4 Map `adventure_aggregate_migration.spec.ts`, `tuyauAdventureApi.test.ts`, and `vite.config.test.ts` into scenario evidence.
- [x] 2.5 Update `docs/adrs/2026-07-17-provider-neutral-ai-boundary.md` with metadata-only retention and configured-provider disclosure.

### 3. Privacy And Creation Boundary — `LC-003/S1 R1`

- [x] 3.1 RED: prove Adventure creation presents configured-provider processing before submission.
- [x] 3.2 RED: prove fallback creation request IDs are valid UUIDs with correct version/variant and remain accepted by the backend.
- [x] 3.3 Implement concise form-adjacent disclosure and the standards-compliant UUID helper/fallback.
- [x] 3.4 Update frontend route evidence and manual checklist for desktop/mobile readability; no new component preview was needed.

### 4. Metadata-Only Evidence — `LC-003/S1 R3`

- [x] 4.1 RED: characterize provider and worker evidence and prove prompt messages/raw provider bodies cannot reach persistence or logs.
- [x] 4.2 Replace request/raw-response evidence with bounded provider/model/settings/timing/status/failure/token/hash/count metadata.
- [x] 4.3 Add a forward migration that clears/removes legacy sensitive evidence while preserving accepted narration and job/history integrity; verified through migration up/down/up and database suites on disposable Neon.
- [x] 4.4 Update README operational/privacy guidance and the provider-neutral ADR.

### 5. Recovery Policy And Persistence Boundary — `LC-003/S1 R3`

- [x] 5.1 RED: add pure policy tests for retryable/terminal classification, capped exponential backoff with deterministic jitter, bounded `Retry-After`, and shutdown cancellation.
- [x] 5.2 Extract persistence-independent retry scheduling/classification plus an `AdventureOpeningRepository` port for claim, interruption, publication, and failure operations.
- [x] 5.3 Implement the Lucid/PostgreSQL repository adapter while preserving row locks, leases, stale-worker rejection, and atomic publication paths.
- [x] 5.4 Propagate shutdown cancellation to provider fetch and reschedule operational interruption without consuming a provider failure attempt.
- [x] 5.5 Verify transient outage, terminal error, interrupted worker, expired lease, stale generation, reset/delete race, and successful publication through focused production-path tests on disposable Neon.

### 6. Quota And Deployment Truth — `LC-003/S1 R3-S5`

- [x] 6.1 Refine Epic wording/evidence to the current process-local account burst limit.
- [x] 6.2 Document shared atomic enforcement as a hard prerequisite before horizontal API or paid untrusted provider-backed deployment.
- [x] 6.3 Preserve the current single-process functional proof and record the distributed-enforcement gap honestly.

### 7. Route And Async Accessibility — `LC-001/S3`, `LC-002/S1-S2`, `LC-003/S1 R5`

- [x] 7.1 RED: prove distinct route titles and destination-heading focus for direct loads, link navigation, and redirects without triggering on background refresh.
- [x] 7.2 Implement application-owned route metadata/focus behavior across auth, workspace, World, creation, and Adventure routes.
- [x] 7.3 RED: prove opening active-to-ready is announced politely while current user focus remains unchanged.
- [x] 7.4 Implement a persistent Story status boundary and update route/workbench evidence.

### 8. Generated Contract Reproducibility

- [x] 8.1 Add a deterministic Tuyau generation/cleanliness command and CI step scoped to `apps/backend/.adonisjs/client`.
- [x] 8.2 Prove a stale tracked client fails the gate and a current checkout passes without masking unrelated changes.
- [x] 8.3 Update CI/current-state documentation for contributor expectations.

### 9. Deployment Epic And ADR Readiness

- [x] 9.1 Reconcile LC-001 registration/sign-in/session evidence and gaps for private HTTPS, secure cookies, same-origin `/api`, and restored-database access before deployment code changes.
- [x] 9.2 Reconcile LC-002 starter-World evidence for clean production bootstrap and isolated restore verification.
- [x] 9.3 Reconcile LC-003 deployed worker, five-second production poll target, private provider, coordinated shutdown, and production-path generation evidence.
- [x] 9.4 Confirm the portable-container ADR, Neon ADR, browser-session ADR, durable-worker ADR, and provider-neutral ADR remain mutually consistent after implementation.

### 10. Neon Environment And Recovery Boundary

- [x] 10.1 Inspect the linked Neon project without exposing identifiers or credentials; define long-lived production/development and disposable validation targets with independently identifiable test/E2E databases or schemas.
- [x] 10.2 Add explicit pooled runtime and direct migration connection configuration, validation, examples, and fail-closed commands without weakening existing database safety guards.
- [x] 10.3 Provision an isolated disposable Neon validation target after explicit provider authorization; run migration up/down/up, backend functional/database suites, and desktop/mobile E2E against it.
- [x] 10.4 Create the clean production target after explicit provider authorization, apply migrations through the direct connection, and prove no development accounts, Adventures, or model evidence were copied.
- [ ] 10.5 Create the production account through the normal HTTPS flow, run the existing idempotent starter seed for that creator, and prove exactly one `Stormbound Chapel` World exists.
- [ ] 10.6 Establish the pre-migration recovery-point command and complete an isolated restore drill using the same application images; verify sign-in and starter-World access without mutating production.

### 11. Portable Images And Private Runtime

- [x] 11.1 RED: add container contract checks for clean image builds, SPA fallback, same-origin `/api`, internal-only API/worker, runtime configuration, non-root execution where supported, and absence of secrets in image layers.
- [x] 11.2 Build one production frontend gateway image and one production backend image used by distinct API and worker services.
- [x] 11.3 Add API liveness without database access, deliberate database readiness, gateway health, graceful shutdown, Compose restart policies, and bounded container-log rotation.
- [x] 11.4 Add generic production Compose and environment templates: publish only the gateway to host loopback, keep API/worker on the container network, inject root-owned host secrets, and store no authoritative local application data.
- [x] 11.5 Set the production worker idle poll target to five seconds through deployment configuration while preserving explicit environment behavior elsewhere.

### 12. Image Delivery, Promotion, And Rollback

- [x] 12.1 Extend GitHub Actions so pull requests prove production images build and authorized branch/manual runs publish immutable commit-SHA images to GHCR without exposing secrets.
- [x] 12.2 Add an explicit production deploy command that preflights the selected reviewed `main` SHA, required secrets, direct/pooled database targets, image availability, and current rollback SHA.
- [x] 12.3 Implement the coordinated release sequence: confirm recovery point, stop API/worker, run one migration job, start the stack, execute health/smoke checks, and retain the previous image SHA for rollback.
- [x] 12.4 Prove application image rollback independently from database recovery and document when a forward fix or separately authorized restore is required.

### 13. Dedicated Private Production Host

- [ ] 13.1 After explicit infrastructure authorization, provision one unprivileged Ubuntu 24.04 LXC with 4 vCPU, 4 GB RAM, 1 GB swap, 32 GB disk, Docker nesting, Tailscale device access, automatic host start, and no repository-hosted private identifiers.
- [ ] 13.2 Install Docker/Compose and Tailscale at the host layer; store production configuration in a root-owned `0600` environment file and authenticate GHCR with least-scope pull access when required.
- [ ] 13.3 Configure Tailscale Serve for the private HTTPS origin forwarding only to the loopback gateway; prove no application listener is reachable through LAN or public interfaces.
- [ ] 13.4 After merge/release authorization, deploy the selected immutable `main` image SHA and record the running version in the private operator inventory.
- [ ] 13.5 Verify registration, sign-in/out, session restoration, CSRF, secure/HTTP-only cookies, starter World, real Adventure generation through the configured private provider, worker restart behavior, and availability with no Lorecraft process running on the developer laptop.
- [ ] 13.6 Record minimal operational commands for status, logs, restart, update, rollback, database recovery, and secret rotation; keep private values outside public artifacts.

### 14. Verification And Reconciliation

- [x] 14.1 Run focused backend unit/functional/database, frontend route/workbench/config, container contract, health, deployment-command, and CI image tests for every Scenario.
- [ ] 14.2 Run lint, typecheck, production image builds, full tests, Storybook build/browser tests, and deterministic desktop/mobile E2E with guarded disposable databases.
- [ ] 14.3 Inspect images, logs, disposable/production rows, and network listeners to prove secrets and sensitive prompt/model bodies are absent and application ports are private.
- [x] 14.4 Run `sdd-orphan-audit` in changed-surface JSON mode from the `develop` merge base and one pass per affected Epic; classify every candidate.
- [ ] 14.5 Reconcile Epic `Implemented By`, scenario-mapped `Verified By`, `Verification Gaps`, dates, supporting docs, ADR status, public release communication, and private operator inventory.
- [x] 14.6 Run scoped `sdd validate lorecraft --change 2026-07-18-audit-hardening --repo /Users/taylor/src/my-life/spaces/lorecraft --workspace /Users/taylor --json`.

### 15. Review, Release, And Closeout

- [x] 15.1 Run the complete `/sdd-apply` implementation self-check and remediate safe in-scope findings as one batch.
- [x] 15.2 Run `/sdd-review` as the independent local PR gate and resolve findings before any production promotion.
- [ ] 15.3 Record manual UI and private deployment confirmation as `pending user`, `user confirmed`, or `accepted gap` after the walkthrough.
- [x] 15.4 Add only user-facing privacy, recovery, accessibility, and availability changes to the project-defined release communication; omit private topology and SDD bookkeeping.
- [ ] 15.5 Use the project release workflow to promote reviewed code through `main`; obtain fresh explicit authorization for image publication, Neon production mutation, host provisioning, migration, and deployment.
- [ ] 15.6 Keep `status: in_review` until the authorized production deployment, recovery drill, manual confirmation, PR/merge, and closeout work are complete; do not write a `closed` status.

## Implementation Ledger

| Date       | Slice                                        | Agent / Guidance                                                   | Files / Areas                                                                                                      | Result                                                                                                                                                                                | Commit / Ref   |
| ---------- | -------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 2026-07-18 | Planning                                     | `sdd-change`                                                       | audit, current code, Epics, ADRs, CI, private Change artifacts                                                     | Implementation-ready plan created                                                                                                                                                     | private plan   |
| 2026-07-18 | Discovery and Epic truth                     | main orchestrator; security finding guidance                       | active Change, LC-001/002/003, provider-neutral ADR, README                                                        | Promoted, branched, transitioned, and established Scenario/security invariants before code edits                                                                                      | uncommitted    |
| 2026-07-18 | LC-003/S1 R1 and R5; LC-001/S3; LC-002/S1-S2 | delegated frontend slice                                           | route presentation, creation notice/UUID, Adventure status, focused tests                                          | Implemented; 119 frontend tests, lint, and typecheck pass                                                                                                                             | uncommitted    |
| 2026-07-18 | LC-003/S1 R3                                 | delegated backend slice; security finding guidance                 | generator evidence, worker, policy, migration, focused tests                                                       | Implemented metadata-only evidence, bounded retry guidance/backoff, and shutdown recovery; DB proof pending                                                                           | uncommitted    |
| 2026-07-18 | Generated contract gate                      | delegated CI slice                                                 | root scripts, CI, README                                                                                           | Stale generated output fails and clean output passes                                                                                                                                  | uncommitted    |
| 2026-07-18 | Apply self-check remediation                 | main plus delegated backend                                        | provider status policy, pre-abort, finish metadata, contract untracked detection, repository port, deployment docs | All safe findings remediated; DB proof remains                                                                                                                                        | uncommitted    |
| 2026-07-18 | Replanning                                   | `sdd-change --replan`; Neon and ADR guidance                       | active Change, Neon ADR, portable deployment ADR, read-only private-host capacity check                            | Actual private production deployment and database-environment scope made implementation-ready; application code unchanged                                                             | uncommitted    |
| 2026-07-18 | Deployment Epic readiness                    | delegated SDD artifact slice; orchestrator verified                | LC-001, LC-002, LC-003 and five related ADR boundaries                                                             | Added explicit private-production, clean-seed/restore, deployed-worker, and coordinated-restart Scenarios with honest unimplemented/unverified gaps                                   | uncommitted    |
| 2026-07-18 | Neon connection and migration boundary       | delegated Neon/PostgreSQL slice; orchestrator reran focused checks | backend env, database safety, guarded production migration command, README                                         | Pooled runtime/direct migration targets are identity-checked and production migration fails closed; unused serverless driver removed                                                  | uncommitted    |
| 2026-07-18 | Portable runtime and image delivery          | delegated container slice plus orchestrator integration            | backend/frontend images, Compose, health routes, migration service, GHCR workflow                                  | Added loopback-only private runtime contracts, guarded one-shot migrations, and immutable SHA image builds; real Docker/GHCR execution remains pending                                | uncommitted    |
| 2026-07-18 | Neon environment provisioning                | main orchestrator using Neon CLI after explicit authorization      | linked Neon project                                                                                                | Preserved prior data in development, created expiring disposable validation, and created a clean schema-only production candidate; no migration or deletion                           | provider state |
| 2026-07-18 | Disposable Neon validation                   | main orchestrator after explicit authorization                     | validation schema, migrations, backend, browser E2E                                                                | Up/down/up passed; remote latency exposed and drove a shutdown-after-claim cancellation fix; full backend and desktop/mobile E2E passed                                               | uncommitted    |
| 2026-07-18 | Initial production migration                 | main orchestrator after explicit authorization                     | production candidate and recovery branch                                                                           | Snapshotted the empty schema-only candidate, rebuilt public from migrations, and retained zero application rows                                                                       | provider state |
| 2026-07-18 | Release and rollback command                 | main orchestrator                                                  | Compose, production template, release command/tests, README                                                        | Added immutable SHA deployment, recovery acknowledgement, coordinated writers/migration/start, health verification, retained rollback SHA, and explicit no-database-rollback boundary | uncommitted    |
| 2026-07-18 | Adventure state heading order               | main orchestrator; release-gate feedback                           | `AdventureWorkbench` pending/failure markup, styles, focused tests                                                  | Replaced skipped `h3` state titles with `h2` headings beneath the Story `h1`; added semantic-level assertions                                                                          | `47dbaea`      |

## Verification Ledger

| Date       | Check                                                                                                                                           | Evidence Type                                | What It Proves                                                                                                                                                                                                                                                                                   | Result                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| 2026-07-18 | Current audit gates recorded in `docs/audits/2026-07-18-code-audit.md`                                                                          | audit baseline                               | Establishes the ten validated findings and existing green non-database gates                                                                                                                                                                                                                     | baseline only; implementation pending                                                                     |
| 2026-07-18 | `sdd validate lorecraft --change 2026-07-18-audit-hardening --repo /Users/taylor/src/my-life/spaces/lorecraft --workspace /Users/taylor --json` | structural planning gate                     | Planned Change structure and declared Epic paths                                                                                                                                                                                                                                                 | passed; 0 errors, 0 warnings                                                                              |
| 2026-07-18 | Backend generator/policy focused tests                                                                                                          | focused automated test                       | LC-003/S1 R3-S6..R3-S8 metadata, retry guidance, backoff, and cancellation                                                                                                                                                                                                                       | 13 passed                                                                                                 |
| 2026-07-18 | Frontend Vitest                                                                                                                                 | focused/broad automated test                 | LC-001/S3 R3, LC-002 route context, LC-003/S1 R1-S4..S5 and R5-S5..S6                                                                                                                                                                                                                            | 15 files, 119 passed                                                                                      |
| 2026-07-18 | Backend and frontend lint/typecheck                                                                                                             | broad supporting gate                        | Changed TypeScript surfaces compile and satisfy repository lint                                                                                                                                                                                                                                  | passed                                                                                                    |
| 2026-07-18 | `npm run verify:contracts` plus deliberate stale sentinel                                                                                       | generated-contract gate                      | Current Tuyau output is clean and stale output exits non-zero without unrelated-diff interference                                                                                                                                                                                                | passed; deliberate stale check failed as expected                                                         |
| 2026-07-18 | Guarded backend migration attempt                                                                                                               | database verification                        | New metadata migration and production worker path                                                                                                                                                                                                                                                | blocked before connection: `DATABASE_URL` unavailable; no database mutation occurred                      |
| 2026-07-18 | `node ace test unit`                                                                                                                            | focused automated test                       | Provider metadata/security, retry/backoff, cancellation, repository-port orchestration, migration harness, and prompt assembly                                                                                                                                                                   | 22 passed                                                                                                 |
| 2026-07-18 | `npm run lint`, `npm run typecheck`, `npm run build`                                                                                            | broad supporting gates                       | Both workspaces lint, typecheck, and production-build successfully                                                                                                                                                                                                                               | passed                                                                                                    |
| 2026-07-18 | `npm run build:storybook`                                                                                                                       | broad UI supporting gate                     | Updated frontend components compile in the component workbench                                                                                                                                                                                                                                   | passed; existing chunk-size warning only                                                                  |
| 2026-07-18 | Changed-surface orphan inventory from `develop`, plus LC-001/002/003 passes                                                                     | reverse traceability                         | 65 candidates: 23 source, 14 tests, 12 support, remainder docs/config; no missing references. Deployment health/Compose/release/image paths are LC-001/LC-003 support, generated Tuyau is contract output, database guards are data-safety support, and `.neon` is excluded private-local state. | passed/classified                                                                                         |
| 2026-07-18 | Final scoped `sdd validate`                                                                                                                     | structural SDD gate                          | Active Change and all three affected Epics remain structurally coherent                                                                                                                                                                                                                          | passed; 0 errors, 0 warnings                                                                              |
| 2026-07-18 | Read-only private-host capacity/template inspection                                                                                             | planning evidence                            | Dedicated LXC feasibility and initial sizing                                                                                                                                                                                                                                                     | Capacity and Ubuntu 24.04 template confirmed; no mutation                                                 |
| 2026-07-18 | Replan scoped `sdd validate`                                                                                                                    | structural planning gate                     | Expanded proposal/design/tasks, declared Epic actions, and active Change structure                                                                                                                                                                                                               | passed; 0 errors, 0 warnings                                                                              |
| 2026-07-18 | Post-Epic-reconciliation scoped `sdd validate`                                                                                                  | structural SDD gate                          | New deployment Scenario IDs and evidence/gap mappings across LC-001/002/003                                                                                                                                                                                                                      | passed; 0 errors, 0 warnings                                                                              |
| 2026-07-18 | `node --test apps/backend/scripts/database-safety.test.mjs`                                                                                     | focused automated test                       | Disposable database guards plus production pooled/direct URL, target identity, environment, and acknowledgement policy                                                                                                                                                                           | 20 passed                                                                                                 |
| 2026-07-18 | Scoped backend ESLint for database configuration slice                                                                                          | focused supporting gate                      | Database safety, production migration runner, and env schema satisfy repository lint                                                                                                                                                                                                             | passed                                                                                                    |
| 2026-07-18 | Read-only `neon branches list -o json` with sanitized summary                                                                                   | provider discovery                           | Linked Neon project currently has one ready default, unprotected branch; production and disposable validation creation remain external tasks                                                                                                                                                     | passed; no provider mutation and no identifiers/credentials emitted                                       |
| 2026-07-18 | `npm run test:containers`, `npm run test:images`, and database safety tests                                                                     | focused deployment automation                | Six runtime/Compose contracts, immutable image workflow, and twenty database target/migration guards                                                                                                                                                                                             | passed; Docker itself is unavailable locally                                                              |
| 2026-07-18 | Sanitized Neon branch and row-count inspection                                                                                                  | provider verification                        | Development, disposable validation, and clean production isolation                                                                                                                                                                                                                               | all new branches ready; production candidate has 0 users, Worlds, Adventures, and model-call rows         |
| 2026-07-18 | Guarded migration up/down/up on `validation_disposable`                                                                                         | destructive disposable-database verification | All ten migrations, including metadata minimization, apply and reverse cleanly                                                                                                                                                                                                                   | passed                                                                                                    |
| 2026-07-18 | Full backend suite against disposable Neon                                                                                                      | production-path automated verification       | Unit, migration, auth, catalog, Adventure lifecycle, retry, cancellation, and persistence behavior                                                                                                                                                                                               | passed; 112/112 after shutdown-race remediation                                                           |
| 2026-07-18 | Playwright desktop/mobile against disposable Neon                                                                                               | browser E2E                                  | Signup/workspace, starter World, and full Adventure lifecycle through same-origin proxy                                                                                                                                                                                                          | passed; 7/7                                                                                               |
| 2026-07-18 | Guarded production migration and sanitized row inspection                                                                                       | production database verification             | Direct migration target, ten migration ledger rows, and absence of copied development data                                                                                                                                                                                                       | passed; 0 users, Worlds, Adventures, and model calls                                                      |
| 2026-07-18 | Deployment, container, and image workflow contract tests                                                                                        | focused release automation                   | Release/rollback plan, migration credential isolation, private Compose topology, immutable GHCR images                                                                                                                                                                                           | passed; 3 deployment, 6 container, and 1 image workflow tests; real Docker execution remains pending host |
| 2026-07-18 | `AdventureWorkbench.test.tsx` RED/GREEN and `npm run test:storybook`                                                                             | focused UI and browser accessibility         | `LC-003/S1 R5` pending and failed state headings follow the Story-region hierarchy at desktop/mobile sizes                                                                                                                                                                                        | RED: 2 semantic-level assertions failed; GREEN: 5/5 focused and 78/78 Storybook tests passed              |
| 2026-07-18 | Full frontend test, lint, typecheck, and build                                                                                                    | broad supporting gate                        | The semantic heading fix introduces no frontend behavior, static-analysis, type, or production-build regression                                                                                                                                                                                   | passed; 119 tests                                                                                         |
| 2026-07-18 | Changed-surface orphan inventory from `develop`, scoped to LC-003                                                                                 | reverse traceability                         | Both changed source files and the focused test remain owned by LC-003; no changed source/test traceability gaps. The reported `github/workflows/images.yml` missing reference is a parser false positive for the existing correct `.github/workflows/images.yml` path.                                                                 | passed/classified; `.neon` remains excluded private-local state                                            |
| 2026-07-18 | Release gate: lint, typecheck, build, contracts, Storybook build/browser, deployment contracts, disposable migrations/tests, and desktop/mobile E2E | production release verification | Reviewed `develop` candidate compiles, generated contracts are clean, guarded database behavior passes from a fresh schema, and browser journeys cover desktop/mobile production boundaries | passed; backend 112, frontend 119, Storybook 78, E2E 7, container 6, image 1, deployment 5 |

## Manual Feedback

- 2026-07-18 release-gate feedback: classified as a `defect` in existing `LC-003/S1 R5` accessibility behavior. Storybook axe reported `heading-order` violations for desktop/mobile pending and failure states because `AdventureWorkbench` rendered state titles as `h3` directly beneath the Story `h1`. No Requirement refinement or scope expansion is needed.

| Date       | Feedback                                                       | Classification                           | Action / Artifact Updates                                                                                                                                                                                                                                     | Status   |
| ---------- | -------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 2026-07-18 | User requested planning for all audit fixes                    | requirement refinement                   | Scope all validated findings into one hardening Change                                                                                                                                                                                                        | resolved |
| 2026-07-18 | User requested actual private deployment in the current Change | scope expansion                          | Add portable images, private host, isolated Neon environments, release/recovery, and production verification                                                                                                                                                  | resolved |
| 2026-07-18 | User confirmed deployment decisions one at a time              | architecture and operational constraints | Docker Compose LXC; GHCR/manual promotion; layered auth; Neon-only environments; clean starter seed; required restore drill; minimal monitoring; existing private provider; `main` production images; host secrets; maintenance window; always-running worker | resolved |
| 2026-07-18 | Release gate found skipped Adventure state heading levels      | defect                                   | Added level-specific assertions; changed pending/failure titles from `h3` to `h2`; reran focused and Storybook accessibility suites                                                                                              | resolved |

## Planning Updates

| Date       | Discovery                                                                                                                         | Classification      | Planning Updates                                                | Next Apply Starting Point                                                                                                     |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-18 | Audit findings require one coordinated hardening pass across Adventure and application boundaries                                 | in-scope refinement | proposal, design, tasks                                         | promote, branch, then `LC-003/S1 R1`                                                                                          |
| 2026-07-18 | Laptop-only operation and missing isolated database targets prevent production-path verification and durable private availability | scope expansion     | proposal, design, tasks, PostgreSQL ADR, portable container ADR | `/sdd-apply` Task 9.1: reconcile deployment Scenarios into LC-001/002/003, then resume blocked database proof through Task 10 |

## Design Updates

| Date       | Feedback / Discovery                                                                     | Classification           | Reference / Target                             | Preserve / Change / Non-Goals                                          | Artifact Updates | Next Apply Starting Point        |
| ---------- | ---------------------------------------------------------------------------------------- | ------------------------ | ---------------------------------------------- | ---------------------------------------------------------------------- | ---------------- | -------------------------------- |
| 2026-07-18 | Route focus and completion announcement are missing while visual composition is accepted | accessibility correction | existing app routes and Adventure Story region | preserve layouts/visuals; add notice, route context, polite completion | design/tasks     | `LC-003/S1 R1`, then route slice |

## Manual UI Confirmation

- Local UI status: user confirmed 2026-07-18
- Private production status: pending user
- App URL / route: `http://localhost:4310` during implementation and the private production HTTPS origin resolved during deployment; sign-in, a playable World, `/worlds/:slug/adventures/new`, and the resulting `/adventures/:id`.
- Required setup or test data: running frontend/API/worker, authenticated account, playable Stormbound Chapel, deterministic or configured provider.
- Steps for the user:
  1. Confirm the creation form plainly explains that player details and frozen World context go to the configured AI provider before selecting **Start Adventure**.
  2. Navigate among workspace, World, creation, and Adventure routes; confirm the browser title changes and keyboard/screen-reader context begins at the destination heading.
  3. While an opening is pending, leave focus on another available control; confirm completion is announced without moving focus and the opening remains readable.
  4. At the private production origin, confirm normal registration/sign-in, the secure session, and exactly one creator-owned starter World.
  5. Create a production Adventure and confirm the separately deployed worker publishes one real opening through the configured private provider.
  6. Confirm the production app remains available when the developer laptop runs no Lorecraft process.
- Expected result: disclosure is concise and readable at desktop/mobile widths; route context is clear; asynchronous completion is announced but non-disruptive; private HTTPS/session behavior is correct; and the production stack is independent of the laptop.
- Feedback that would change artifacts: unclear provider wording is a requirement refinement; unexpected focus movement or silent completion is a defect; a requested consent choice/provider selector is scope expansion.
- Confirmation: Taylor approved the local Adventure UI after creating an Adventure through the configured provider, observing the pending state recover to ready, and reviewing the generated opening with Player and Scene context. Private HTTPS, session-cookie, host-independence, and recovery checks remain pending deployment.
- Heading remediation confirmation: no repeat manual walkthrough is required because the visible copy and styling are unchanged; level-specific DOM assertions and the desktop/mobile Storybook accessibility gate directly verify the semantic correction.

## Blockers / Open Questions

- No unresolved planning decision.
- Neon validation/production migration, GHCR publication, private-host provisioning, Tailscale node/Serve mutation, and deployment require explicit execution-time authorization. Branch creation is complete.
- Applying legacy-evidence cleanup to any existing shared development data remains separately destructive; the new clean production target contains no legacy evidence to purge.

## Closeout

- Change status: `in_review`; release-gate accessibility remediation is implemented, verified, and awaiting a refreshed independent review
- Epic files updated: LC-001/002/003 Requirements, Scenarios, implementation maps, evidence, and honest production gaps are current
- Story labels/references and Requirement/Scenario IDs current: yes; no duplicate or missing references found
- Implemented By maps current: yes; deployment/runtime support is mapped to LC-001/LC-003 and database environment behavior to the accepted PostgreSQL ADR
- Scenario-mapped Verified By maps current: local and disposable-Neon evidence current; live private-production and restore evidence remains a gap
- Superseded earlier Epic truth reconciled: yes for audit/database work; production-only gaps remain explicit
- ADR status: accepted provider-neutral, Neon, browser-session, durable-worker, and portable-container decisions are consistent
- Release communication current: prepared in `CHANGELOG.md` under `[Unreleased]`; release commit pending
- `sdd-review` verdict: ready at refreshed source watermark `0c026d6a7180d3549a3a1414f0e23ef49da1ceb1`; private-production acceptance remains pending
- Review record: `docs/changes/2026-07-18-audit-hardening/review.md`
- `review.md` findings resolved: yes; regression verification and commit-based conflict/contract checks passed
- Planning updates resolved: yes
- Manual UI confirmation status: local UI user confirmed 2026-07-18; private production pending user
- PR / merge state: no PR required; locally merged `change/audit-hardening` into `develop` at `92895f7`
- Deferred scope accepted: yes, including public/cloud ingress, auto-deploy, zero-downtime/multi-host operation, provider failover, infrastructure-as-code, and external monitoring
- Change moved to `docs/changes/closed/`: no
