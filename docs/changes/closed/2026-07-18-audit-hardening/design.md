# Design: Audit Hardening

## Context

The private Adventure foundation currently assembles unpublished World context and player backstory for an OpenAI-compatible provider, persists prompt-bearing request and raw response evidence, retries every failure immediately, and lets an interrupted in-flight call consume an attempt. The SPA has strong component-level accessibility but no application-wide title/focus policy, and ready narration can replace a polite pending state without a completion announcement. CI regenerates tracked Tuyau output before verification without proving the checkout was current. The audit also found that process-local quota wording is broader than implementation, core worker policy is difficult to test independently of Lucid, and three useful tests are absent from Epic evidence.

Lorecraft also has no persistent deployment contract: development starts the SPA, API, and worker from a laptop; the available hosted PostgreSQL target is not yet separated into production, development, and disposable validation; and no production images, private HTTPS ingress, migration handoff, rollback, restore drill, health boundary, or runtime supervision are checked in. Replanning adds a real private single-host production deployment while preserving a portable container boundary for a later AWS or similar target.

## Goals / Non-Goals

**Goals:**

- Resolve all validated audit findings without expanding Lorecraft's product capability.
- Make privacy, recovery, accessibility, reproducibility, and durable evidence claims match production behavior.
- Move lifecycle decisions into deterministic policy code while leaving PostgreSQL authoritative for jobs and Adventure state.
- Make Lorecraft privately available without the developer laptop by deploying the SPA gateway, API, and worker to a dedicated host reachable only through an authenticated overlay.
- Keep the production artifacts portable: immutable OCI images, runtime-injected configuration, standard PostgreSQL, an OpenAI-compatible model boundary, and no authoritative local container state.
- Establish isolated Neon production, development, and disposable validation targets plus explicit migration, rollback, and recovery evidence.

**Non-Goals:**

- Add interactive turns, a debug console, provider selection UI, distributed infrastructure, or a new public API.
- Redesign existing screens or introduce a new component system.
- Rewrite the Adventure subsystem or replace Lucid/PostgreSQL.
- Expose Lorecraft publicly, add collaboration, or weaken normal application sign-in because network access is private.
- Add horizontal scaling, zero-downtime release machinery, automatic provider failover, a local PostgreSQL server, or a cloud-specific application contract.
- Add infrastructure-as-code or a monitoring/paging platform for the first private host.

## Planning Interview / Story Refinement

- Scope boundary reviewed: all ten audit findings plus the explicitly accepted private deployment/database-environment expansion; no adjacent product capability.
- User decisions: deliver an actual deployment in this Change; use Docker Compose in a dedicated Ubuntu 24.04 LXC; build portable OCI images; use GHCR with explicit manual promotion; keep Tailscale and Lorecraft sign-in as separate access layers; use Neon for production, development, and disposable validation; start production clean and seed only the existing starter World; keep the existing private model endpoint as the sole production provider; require a recovery drill; keep monitoring minimal; run only `main` images normally; use root-owned host secrets; accept a brief maintenance window; and keep the worker continuously running with a five-second idle poll target.
- Assumptions: privacy-first metadata-only evidence; generic configured-provider notice; single-instance quota remains truthful until a deployment topology changes.
- Deferred scope: raw debug capture, distributed limiter vendor, public/cloud ingress, automated production promotion, multi-host or zero-downtime deployment, provider failover, full observability, local PostgreSQL, infrastructure-as-code, and interactive play.
- Story boundaries challenged: operational tasks remain within the existing user paths; no technical-layer Stories are added.
- Requirements refined: informed processing, evidence minimization, retry/shutdown recovery, topology-accurate quota, route context, and ready announcement.
- Scenario gaps considered: hosted/local provider wording, retryable versus terminal failure, `Retry-After`, shutdown during generation, stale generated output, UUID fallback, navigation focus, async completion, and existing-data cleanup.
- Deployment sizing: initial 4 vCPU, 4 GB RAM, 1 GB swap, and 32 GB disk; resize from observed use.
- Privacy boundary: exact host, LAN, tailnet, and Neon identifiers remain in ignored configuration or private operator records, never public artifacts.
- Open questions that block implementation: none.

## Epic Changes

### Update Epic: Account Identity And Workspace Access

- Target Epic: `docs/epics/lc-001-account-identity-and-workspace-access/epic.md`
- Change Type: modified scope

#### Story Changes

- Modified: `LC-001/S3` gains a Requirement that protected and public route transitions expose a distinct document title and place focus on the destination page heading when navigation replaces the initiating context.
- Added Scenarios: direct navigation/redirect route context and same-origin Vite proxy evidence mapping.
- Planned evidence refinements: private production HTTPS, secure-cookie, same-origin `/api`, registration/sign-in/session restoration, and restored-database access.
- Removed: none.

#### Supersedes / Reconciles

- Reconcile any component-only focus claims that imply complete SPA navigation coverage.
- Add `apps/frontend/vite.config.test.ts` to the appropriate supporting evidence map.

### Update Epic: World Bible Catalog

- Target Epic: `docs/epics/lc-002-world-bible-catalog/epic.md`
- Change Type: modified verification scope

#### Story Changes

- Modified: `LC-002/S1` and `LC-002/S2` adopt the shared route title/heading-focus behavior for catalog and World detail destinations.
- Planned evidence refinement: a clean production seed and an isolated restored database both expose exactly the creator-owned starter World expected by the current seed contract.
- Added/Removed: none.

#### Supersedes / Reconciles

- Update route presentation evidence where prior manual/component checks did not prove application-level navigation context.

### Update Epic: Adventure Play

- Target Epic: `docs/epics/lc-003-adventure-play/epic.md`
- Change Type: modified scope and evidence

#### Story Changes

- Modified `LC-003/S1/R1`: before creation, the creator is told that submitted player details and frozen World context are processed by the configured AI provider; request identity remains a valid UUID even without `crypto.randomUUID`.
- Modified `LC-003/S1/R3`: model-call evidence excludes prompt/model prose, retryable failures back off with bounded jitter and provider guidance, shutdown reschedules without charging a provider failure, and quota wording is explicitly single-process until shared enforcement exists.
- Modified `LC-003/S1/R5`: Adventure routes follow the shared title/focus policy and pending-to-ready completion is announced politely without forced focus.
- Planned `LC-003/S1/R3` evidence refinement: the separately supervised production worker claims within the configured idle-poll bound, reaches the private model provider, survives coordinated shutdown/restart, and publishes one opening through the production database.
- Added/Removed: no Story or capability additions/removals.

#### Supersedes / Reconciles

- Replace the current broad account-wide quota wording with the implemented single-process boundary and a horizontal-deployment verification gap.
- Replace the prompt/raw-response evidence claim with metadata-only evidence.
- Reconcile the stale `2026-07-17` manual-confirmation note and `2026-07-18` verification index language.
- Map `apps/backend/tests/database/adventure_aggregate_migration.spec.ts` and `apps/frontend/src/adventures/tuyauAdventureApi.test.ts` to their existing Scenarios.
- Closed Change history remains historical; update only active current-state claims that are explicitly presented as current and would otherwise contradict the Epic/ADR.

## Technical Options

### Option 1: Targeted hardening with pure policy seams

- Summary: retain the existing job/schema topology, stop writing sensitive bodies, clear legacy evidence through a new migration, extract pure retry/lifecycle/publication decisions and narrow persistence ports, and add focused app/CI accessibility and reproducibility gates.
- User impact: transparent creation, resilient recovery, and accessible context with no changed Adventure workflow.
- Implementation complexity: moderate and sliceable by Requirement.
- Reversibility: high for policy/UI/CI; evidence purging is intentionally irreversible once applied.
- Client surfaces: existing React routes only.
- API / contract shape: no new public route; existing creation payload remains compatible.
- Frontend/backend boundary: processing disclosure is static product truth; provider endpoint details remain backend configuration.
- Data / schema impact: new forward migration removes or neutralizes raw request/response storage and clears existing content.
- Auth / security impact: reduces retained private data; does not weaken owner isolation.
- Testability: pure policy tests plus existing functional/database/E2E suites.
- Operational risk: bounded migration and worker transition risk.
- Fit with project conventions: strongest fit with API-first, provider-neutral, persistence-independent guidance.

### Option 2: Keep raw evidence with configurable expiry and encryption

- Summary: retain encrypted request/response bodies behind privileged access and scheduled expiry.
- User impact: same notice, but more complex privacy explanation.
- Implementation complexity: high; requires key lifecycle, access policy, cleanup jobs, backup semantics, and operations.
- Reversibility: lower once encrypted retention becomes operational dependency.
- Data / schema impact: new ciphertext/key/expiry fields and cleanup process.
- Auth / security impact: materially larger sensitive-data surface.
- Testability: requires time, key, access, purge, and backup-boundary verification.
- Operational risk: substantially higher.
- Fit with project conventions: premature because no user-facing debug requirement exists.

### Option 3: Broad Adventure subsystem rewrite

- Summary: replace the worker and repositories wholesale while addressing the findings.
- User impact: no additional value over Option 1.
- Implementation complexity: high with larger regression surface.
- Reversibility: low.
- Fit with project conventions: unnecessary speculative rewrite.

## Selected Approach

Use Option 1. Introduce pure TypeScript policy modules for failure classification, retry scheduling, shutdown disposition, and publication eligibility. The worker orchestrates those policies through purpose-specific repository/transaction interfaces implemented by Lucid/PostgreSQL adapters; database locking and atomic publication remain in the adapter. Propagate an `AbortSignal` from command shutdown into provider fetch, distinguish operational cancellation from provider failure, honor a valid bounded `Retry-After`, and otherwise use configurable exponential backoff with jitter. Persist only provider/model/settings, timing, status, retry linkage, bounded error metadata, token/finish metadata when available, and content hashes/byte counts where diagnostically useful—never assembled prompts, request messages, raw responses, or authorization material.

Add a forward migration that clears existing prompt/raw-response content and prevents future non-null writes, preferring column removal when no operational consumer exists. Do not run a destructive production migration under `/sdd-apply`; only prepare and verify it against disposable databases until separately authorized.

Add an application-owned route metadata/focus boundary around React Router destinations. Each route provides a Lorecraft-specific title and a programmatically focusable primary `h1`; focus moves on real destination navigation, but not on background query refresh. Keep one persistent polite status near the Adventure Story region that announces the transition from opening-active to ready while leaving the user's current focus unchanged.

CI runs deterministic Tuyau generation and immediately fails on a scoped dirty diff before later gates. The UUID fallback uses standards-compliant random bytes and UUID version/variant bits, or a small app-owned helper with deterministic tests. Quota behavior remains process-local in current code and Epic truth; README/deployment guidance makes shared atomic enforcement mandatory before multiple API instances or paid untrusted usage.

## Deployment Options

### Option 1: Portable containers on a dedicated private host

- Summary: build one SPA gateway image and one backend image, run API and worker as separate services under Docker Compose, and terminate private HTTPS at the host overlay.
- Portability: the same images, commands, health boundaries, environment variables, and external service contracts map to AWS or another container platform.
- Operations: explicit image promotion, coordinated migrations, brief downtime, deterministic image rollback, and provider-managed database recovery.
- Fit: selected; it satisfies current private availability without making homelab topology part of the application.

### Option 2: Native systemd deployment in the LXC

- Summary: install Node.js and a web server on the host and supervise checked-out or copied builds directly.
- Tradeoff: fewer container layers, but host drift, less reproducible rollback, and more work to migrate to a managed container platform.
- Fit: rejected.

### Option 3: Deploy directly to AWS or another public platform

- Summary: provision managed ingress, compute, secrets, and monitoring immediately.
- Tradeoff: strong managed operations, but unnecessary public/provider scope before the private product requires it.
- Fit: deferred.

## Deployment Topology

```text
Authenticated private overlay HTTPS
               |
               v
Host ingress -> 127.0.0.1 frontend gateway
                         | serves SPA
                         | proxies /api
                         v
                    API container ---- pooled PostgreSQL ---- Neon production
                         |
                    database jobs
                         v
                   Worker container ---- private overlay ---- private model

One-shot migration container ---- direct PostgreSQL ---- Neon production
```

- The frontend gateway is the only application service published to host loopback. It serves built static assets, falls back to `index.html` for SPA routes, and proxies `/api` to the internal API service.
- The API and worker use the same immutable backend image with different commands. They communicate through PostgreSQL rather than host-local files or an in-memory queue.
- Tailscale Serve terminates the initial private HTTPS origin and forwards only to the loopback gateway. No application port binds to the LAN or public Internet.
- The initial Compose deployment is single-instance: one gateway, one API, and one worker. Horizontal scaling remains prohibited until shared rate/quota enforcement and the associated evidence exist.
- The worker's production idle poll target is five seconds. This may keep Neon compute active; the accepted tradeoff is responsive, durable processing without another queue or wake-up service.
- Host-specific identifiers and commands belong in private operator records. Public deployment assets expose only generic variables and interfaces.

## Image And Release Contract

- CI builds Linux production images from a clean checkout. Pull requests prove that both images build; authorized branch or manual workflows may publish commit-SHA tags to GHCR.
- The public repository may have private GHCR packages; the host receives a least-scope pull credential when anonymous pulls are unavailable.
- A production deployment selects immutable `main` commit-SHA tags. Mutable tags are informational and never the rollback authority.
- The production host does not clone the repository or compile application source.
- Promotion is explicit over the private overlay. Hosted CI receives no standing route into the private network.
- The deploy command preflights required secrets and image availability, records the currently running SHA, pulls the target images, confirms the database recovery point, stops API and worker, runs the one-shot migration, starts the stack, and executes smoke checks.
- A failed application smoke rolls back to the recorded image SHA. A database rollback is never implied by an image rollback and requires a separately authorized restore decision.

## Database Environment And Recovery Contract

- Neon remains a standard PostgreSQL provider rather than an application API dependency.
- Maintain one clean long-lived production branch, one long-lived development branch, and disposable validation targets. `TEST_DATABASE_URL` and `E2E_DATABASE_URL` resolve to independently identifiable disposable databases or schemas even when they share one temporary Neon branch.
- Production receives migrations and explicit creator/bootstrap data only. Development accounts, Worlds, Adventures, and model evidence are not copied.
- Runtime API and worker traffic use a pooled connection. The migration/recovery command uses a direct connection and must not inherit a pooled URL silently.
- The first production account is created through the normal HTTPS registration flow. The existing idempotent starter seed then installs `Stormbound Chapel` for the configured author; no password or account fixture is introduced.
- Production migration requires a fresh explicit deployment authorization and a pre-migration Neon restore point or branch at the current production position.
- Before deployment completion, restore production into an isolated target, start the same images against that target through an isolated loopback-only stack, and verify sign-in plus the starter World without changing production.
- Destructive automated tests remain fail-closed and must never accept production or development as disposable targets.

## Runtime Health, Logs, And Secrets

- Add an API liveness check that does not query PostgreSQL so continuous container health checks do not create database load.
- Add a database readiness check used by deployment and recovery smoke tests rather than frequent liveness polling.
- The gateway has a static health check; Compose restart policies supervise gateway, API, and worker process exits.
- Existing worker startup, shutdown, claim, retry, success, and failure lifecycle logs remain the bounded production evidence. Container logs use bounded rotation.
- Root owns the production environment file with mode `0600`. Compose injects values at runtime; images and repository artifacts contain no application key, database URL, provider configuration, registry credential, or private network value.
- AWS or another future platform maps the same runtime variables to its secret manager without changing application contracts.
- Minimal monitoring intentionally excludes external uptime, paging, centralized logging, and metrics. Reconsider after real availability needs or incidents.

## Production Acceptance

- Private HTTPS resolves from an authorized tailnet device and no application listener is reachable through the host's LAN address or public Internet.
- Registration, sign-in, sign-out, session restoration, CSRF, and `Secure`/HTTP-only cookie behavior pass through the deployed same-origin proxy.
- The clean production database contains the creator account and exactly one idempotently seeded starter World, with no copied development Adventures or accounts.
- A real Adventure opening is queued by the deployed API, claimed by the deployed worker within the configured polling bound, generated through the configured private endpoint, and durably published.
- The service remains available when the developer laptop hosts no Lorecraft process.
- Image rollback and the isolated Neon restore drill are both executed and recorded.

## Experience Design

- Applicability: required but implementation-ready from established application conventions.
- Confirmed direction: preserve current layouts and visuals; add concise disclosure copy, route title/heading focus, and a polite completion status.
- User confirmation: the user requested remediation; no visual choice remains open.
- Reference artifacts: existing production routes, `docs/style-guide.md`, current Storybook application stories, and the confirmed Adventure walkthrough.

### User Flow And Information Architecture

- Place the AI-processing notice adjacent to the creation form's submission action and before submission.
- Keep all existing routes and navigation hierarchy.

### Responsive Composition

- Disclosure and status content wrap within existing form and Story regions at supported desktop/mobile widths.
- No new pane, dialog, or breakpoint is introduced.

### Component And State Contract

| Component Or Pattern | Strategy | Initial Owner Or Reference | Required Preview States | Follow-Up |
|---|---|---|---|---|
| Adventure processing notice | application-specific | `NewAdventurePage` | playable form, narrow viewport | none |
| Route title and heading focus | application-specific | `AppRoutes` plus route pages | direct load, link navigation, redirect | extend as routes are added |
| Opening completion status | existing application component/pattern | Adventure Story status region | pending, ready transition, failure/retry | none |

### Accessibility And Interaction

- The notice is ordinary readable text associated with the form, not a blocking consent dialog.
- Destination headings use `tabIndex=-1` only where programmatic focus is needed and retain visible focus treatment when focused.
- Completion uses `role=status`/polite live behavior and does not move focus automatically.
- Route focus is suppressed for background data refresh and same-document state changes.

### Visual Direction

- Reuse current typography, spacing, and semantic information treatment; no new visual language.

### Open Design Questions

- None.

## Client And API Boundary

- Current clients: React SPA and separately runnable Adventure worker.
- Plausible future clients: mobile, administrative, automation, and game clients.
- Reusable product capabilities: lifecycle/retry/publication policies and metadata-only model evidence.
- API or typed contract: existing authenticated `/api/v1` JSON routes and Tuyau client remain; no public contract addition is required.
- OpenAPI plan, if HTTP-facing: not applicable; this Change retains the accepted Tuyau alternative and verifies generated cleanliness.
- Backend platform exposed directly to clients?: no.
- Client-specific presentation or local state: route focus, document title, live announcement, and disclosure rendering.
- Rationale: provider configuration, lifecycle, evidence, quota, and persistence stay backend-owned; accessibility presentation stays client-owned.

## Alternatives Considered

- Retain raw evidence behind a debug flag: rejected because a default-off flag still creates an undefined sensitive-data lifecycle when enabled.
- Add Redis immediately: rejected because current deployment is single-instance and no shared limiter provider has been selected.
- Focus the Story region when generation completes: rejected because background completion should not interrupt the user's current task.

## Why This Approach

It removes the highest privacy risk rather than adding an operational security subsystem solely to preserve unused debug content. It improves reliability and architecture through deterministic seams without replacing proven database coordination, makes claims match current deployment truth, and adds accessibility behavior at the application boundary where component-level tests cannot provide it.

## ADRs

- Required: yes.
- `docs/adrs/2026-07-17-provider-neutral-ai-boundary.md`: provider requests may contain private World/player content; normal operation persists metadata-only evidence and must disclose configured-provider processing before submission.
- `docs/adrs/2026-07-12-postgresql-on-neon.md`: long-lived production/development plus disposable validation, pooled runtime connections, direct migration connections, clean production bootstrap, and isolated restore evidence.
- `docs/adrs/2026-07-18-portable-container-deployment.md`: reusable OCI images and process contracts with Compose/private ingress as the first host adapter and explicit `main` image promotion.
- Reconsider when: a concrete privileged debugging requirement changes evidence retention; hosted database isolation becomes unreliable; or a selected cloud platform materially changes the image, ingress, process, or state contract.

## Implementation Constraints

- Do not log, fixture, snapshot, or persist private prompt/model content while adding tests.
- Keep old migrations immutable and use guarded disposable databases for migration verification.
- Do not apply destructive cleanup to production or shared data without explicit authorization.
- Preserve existing Adventure/API identifiers and status compatibility.
- Retry bounds must prevent an unbounded queue; jitter must be injectable/deterministic in tests.
- `Retry-After` parsing must reject invalid or excessive values.
- Shutdown cancellation must not publish partial output or count as a provider failure.
- Generated-client diff checks must ignore unrelated generated/build artifacts and fail only on the tracked Tuyau client boundary.
- No application code is committed directly to `develop`; implementation must branch from `develop` as `change/audit-hardening`.
- Do not publish private hostnames, IP addresses, tailnet names, Neon identifiers, credentials, or private operator paths in repository artifacts or CI logs.
- Container images must run without writable authoritative application volumes and as non-root users where the selected base image supports it.
- Production browser traffic must retain one HTTPS origin and same-origin `/api`; do not solve deployment by enabling a split-origin browser contract.
- The gateway may publish only to host loopback in Compose. API and worker remain internal services.
- API liveness must not query PostgreSQL. Readiness and deploy smoke may query PostgreSQL deliberately.
- Production migrations use the direct database URL, run once with API/worker stopped, and require explicit authorization plus a recovery point.
- The worker poll interval must be configurable and production defaults must be recorded without changing the one-second development default silently.
- GHCR and deployment logs must identify image SHAs but never print injected secrets.

## Verification Strategy

- Focused automated tests:
  - provider adapter proves abort propagation, bounded metadata, and absence of request/raw response content;
  - pure policy tests prove retry classification, capped backoff/jitter, `Retry-After`, shutdown rescheduling, and publication eligibility;
  - worker functional tests prove transient recovery, terminal failure, lease/shutdown behavior, and atomic finalization through the production adapter;
  - migration test proves legacy evidence is cleared/removed and new schema behavior is compatible;
  - frontend route tests prove title/focus behavior, processing notice, ready announcement, and no focus theft;
  - UUID helper test proves format/version/variant and fallback request acceptance;
  - CI/script test or a reproducible command proves stale Tuyau output produces a non-zero gate.
- Broad supporting gates: lint, typecheck, build, Storybook build/tests, full backend/frontend tests, scoped SDD validation, and changed-surface orphan audit.
- Deterministic E2E: desktop/mobile Adventure creation through ready state proves disclosure is present before submission and completion remains usable across navigation.
- Live-provider or external-service playtests: optional; no raw prompt/response inspection is required. Record only bounded metadata and user-visible outcome if run.
- Manual UI confirmation: creation notice readability, route title/focus behavior, and non-disruptive ready announcement at `http://localhost:4310`.
- Debug/log inspection: lifecycle logs contain identifiers/status/timing only; database inspection on a disposable target confirms no raw prompt/model body remains.
- Container contract tests: clean image builds, non-root/runtime configuration, SPA fallback, same-origin `/api` proxy, internal-only API/worker, health checks, graceful shutdown, and no secret material in layers.
- Hosted database evidence: migrations and database suites pass against disposable Neon targets; pooled runtime and direct migration URLs resolve to the intended branch; restored production data passes isolated sign-in/starter-World smoke.
- Production deployment evidence: private HTTPS and secure cookies, inaccessible LAN/public application ports, process restart behavior, production seed idempotency, real private-provider generation, laptop-independent availability, image rollback, and recorded recovery drill.

## Decisions

- Use metadata-only evidence and purge legacy raw evidence through a forward migration.
- Disclose configured-provider processing generically rather than infer local versus hosted topology in the client.
- Extract policy seams without replacing PostgreSQL coordination.
- Keep quota enforcement process-local for the current topology and make shared enforcement a deployment prerequisite.
- Use polite announcement without focus movement for asynchronous completion.
- Use two portable OCI images for three runtime services: gateway, API, and worker.
- Keep Compose, Tailscale Serve, and root-owned secrets as host adapters rather than application dependencies.
- Use isolated Neon production/development/validation targets; keep local PostgreSQL out of the first deployment.
- Build immutable images in GitHub Actions and explicitly promote reviewed `main` SHAs.
- Accept brief maintenance windows and continuously active Neon compute for the initial single-instance deployment.

## Risks / Trade-Offs

- Removing raw evidence reduces post-hoc provider debugging; bounded metadata, normalized failures, hashes/counts, and live reproduction become the supported diagnostic path.
- Backoff increases time to recovery during transient failure but avoids exhausting attempts immediately.
- Route focus can feel disruptive if triggered on background updates; the boundary must key only on destination navigation.
- Persistence extraction can become an overbroad rewrite; phases must remain tied to concrete retry/publication scenarios.
- Production legacy-evidence purge is irreversible and remains separately authorized.
- The worker's continuous database polling prevents effective Neon scale-to-zero and creates a known operating cost; five-second idle polling reduces query frequency without changing that compute posture.
- A single private host is an availability boundary; automatic failover, external alerts, and zero-downtime deployment are intentionally absent.
- The separately hosted private model endpoint is an availability dependency for Adventure generation even when the web/API remain healthy.
- Root-owned host secrets are simpler than a managed vault but rely on host administration and backup discipline.
- Manual promotion reduces accidental deployment and private-network exposure but requires an operator for every release.
