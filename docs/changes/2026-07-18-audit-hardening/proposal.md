# Proposal: Audit Hardening

## Why

The 2026-07-18 repository audit found ten medium- and low-severity weaknesses around private AI evidence, provider transparency, worker recovery, generated contracts, quota claims, accessibility, application boundaries, and SDD traceability. None is a current critical vulnerability, but together they make the private Adventure foundation less safe, reproducible, resilient, accessible, and maintainable than Lorecraft's product and repository principles require.

Implementation also exposed a deployment and database-environment gap: Lorecraft still runs from a developer laptop, the available Neon target has not been separated into development, production, and disposable validation environments, and the repository has no production image, private ingress, migration, rollback, recovery, or runtime-health contract. The first persistent deployment must remain private while keeping the application portable to AWS or a similar container platform.

## What Changes

- Stop retaining prompt-bearing model requests and raw provider responses; keep only bounded metadata, normalized failure data, and the accepted opening narration already owned by the Adventure.
- Tell the creator before Adventure creation that their submitted profile and frozen World context are processed by the configured AI provider.
- Make transient provider failure and worker shutdown recover without immediately consuming the terminal attempt budget.
- Fail CI when tracked Tuyau client output is stale after deterministic generation.
- Align the account generation-burst guarantee with the current single-process limiter and establish a deployment gate for shared atomic enforcement before horizontal or paid multi-user operation.
- Give SPA routes distinct document titles and predictable page-heading focus, and announce an opening's active-to-ready transition without stealing focus.
- Extract Adventure lifecycle, retry, and publication decisions from Lucid transaction details behind narrow persistence ports.
- Reconcile stale Epic evidence dates/manual-confirmation wording and map the three behavior tests identified by the audit into durable Epic evidence.
- Use a standards-compliant creation request ID fallback when `crypto.randomUUID` is unavailable.
- Package the SPA gateway, API, and separately runnable worker as immutable OCI images, using one reusable backend image for the API and worker commands.
- Add a production Compose adapter whose only host-published application surface is the SPA gateway on loopback; terminate private HTTPS through the host's authenticated overlay ingress.
- Build commit-SHA images in GitHub Actions, publish them to GHCR, and make promotion of reviewed `main` images an explicit operator action with deterministic rollback.
- Separate Neon into long-lived production and development environments plus disposable validation targets; use pooled runtime and direct migration connections without introducing local PostgreSQL.
- Provision and verify a dedicated private single-host production runtime, seed only the existing starter World after the production account is created, and prove database recovery through an isolated restore target.

## Target Repositories

- This repository (role: official-application).

## Epic Actions

### New Epic Directories

- None.

### Existing Epic Directory Updates

- `docs/epics/lc-001-account-identity-and-workspace-access/epic.md`
  - Extend protected route presentation to cover route titles and page-heading focus.
  - Map `apps/frontend/vite.config.test.ts` as supporting same-origin contract evidence.
  - Add production HTTPS, same-origin proxy, secure-cookie, private reachability, and restored-database sign-in verification obligations without making the host provider part of product behavior.
- `docs/epics/lc-002-world-bible-catalog/epic.md`
  - Reconcile route title/focus behavior for catalog and World detail paths.
- `docs/epics/lc-003-adventure-play/epic.md`
  - Refine Adventure creation disclosure, sensitive evidence, recovery, quota, route context, and async completion behavior.
  - Map the aggregate-migration and Tuyau adapter tests into scenario evidence.
  - Reconcile stale manual-confirmation and verification-date claims.
  - Add deployed API/worker supervision, bounded idle polling, private provider reachability, and production-path opening evidence.

## Epic Story Changes

- Modify `LC-001/S3` rather than create a UI-detail Story: protected workspace navigation gains a route-context Requirement and Scenarios.
- Modify `LC-002/S1` and `LC-002/S2` to include catalog/detail route-context evidence without changing their capability boundaries.
- Modify `LC-003/S1`:
  - `R1` gains informed AI-processing disclosure and portable idempotency identity.
  - `R3` is refined for metadata-only operational evidence, retryable failure backoff, shutdown-safe rescheduling, and truthful quota topology.
  - `R5` gains route title/heading focus and non-disruptive ready-state announcement.
- Refine `LC-001/S1`, `LC-001/S2`, and `LC-001/S3` evidence/gaps so the initial private production topology proves registration, sign-in, session restoration, HTTPS cookie behavior, and same-origin API access.
- Refine `LC-002/S1` evidence so the clean production seed and restored starter World are verified through the deployed application.
- Refine `LC-003/S1/R3` evidence so the deployed worker, five-second idle poll target, private model endpoint, coordinated shutdown, and recovery path are production-proven.
- No Story moves, splits, removals, or new Epic-scoped labels are planned.

## Scope Decisions

- Confirmed:
  - All ten validated audit findings are in scope.
  - Privacy defaults to metadata-only model-call evidence. Raw prompts and raw provider responses are not retained for optional debugging.
  - The creation notice describes the configured AI provider generically, so it remains truthful for local and hosted endpoints without exposing deployment configuration to the browser.
  - Current single-instance operation remains supported; distributed quota infrastructure is a deployment prerequisite, not a dependency added speculatively in this Change.
  - Existing migrations remain immutable; any schema/data cleanup uses a new migration.
  - The current Change will deliver an actual private production deployment, not only deployment files or a runbook.
  - The production target is a dedicated unprivileged Ubuntu 24.04 LXC using Docker Compose, with an initial allocation of 4 vCPU, 4 GB RAM, 1 GB swap, and 32 GB disk.
  - The LXC is the repository's production target and normally runs only immutable images built from `main`.
  - Tailscale Serve provides the private HTTPS browser origin. Normal Lorecraft sign-in remains required, and no application port is exposed on the LAN or public Internet.
  - The existing private Tailscale-only `gemma4:31b` endpoint remains the sole production inference provider for this deployment.
  - Production starts with a clean migrated database. Only the creator's production account and the existing `Stormbound Chapel` starter World are bootstrapped; development accounts, Adventures, and other data are not copied.
  - Development, production, and disposable validation stay on Neon. A local PostgreSQL service is not introduced.
  - A short coordinated maintenance window is acceptable for deployments that migrate the schema.
  - Minimal monitoring means container restart policies, web/API health checks, worker supervision and lifecycle logs, bounded log rotation, and a post-deployment smoke test; external alerting is deferred.
  - A tested isolated Neon restore is required before deployment completion.
  - The continuously running worker may keep Neon compute active. Production uses a five-second idle poll target and accepts that operating-cost tradeoff until event-driven wake-up is justified.
- Deferred:
  - A user-facing model-call debug viewer.
  - Configurable raw-content capture, encryption, retention windows, or backup lifecycle.
  - Horizontal API deployment or a specific shared limiter vendor.
  - Automatic model-provider failover or changing the production story model.
  - Zero-downtime, blue/green, or multi-host deployment.
  - Terraform or another infrastructure-as-code layer for the private host.
  - Uptime Kuma, paging, centralized logs, metrics, or public status reporting.
  - Automatic production deployment from GitHub Actions; promotion remains explicit and private-network access is not granted to hosted CI.
  - Interactive Adventure turns and other deferred Adventure capability.
- Assumptions:
  - The accepted opening narration remains durable product content and is not classified as raw operational evidence.
  - Existing stored prompt/response evidence may be cleared by a new migration in development and test environments. Applying a destructive cleanup to production data requires separate explicit authorization.
  - Existing UI conventions are sufficient; no visual redesign or separate `/sdd-design` pass is required.
  - The production host can reach Neon over the Internet and the model provider through the private overlay.
  - Exact host identifiers, private network values, tailnet names, Neon resource IDs, and credentials remain outside this public repository.
- User decisions that shaped the Story/Requirement split:
  - The user asked to plan the complete validated audit remediation set rather than only the first privacy group.
  - During replanning, the user selected an actual private deployment, Docker Compose, portable OCI images, a clean dedicated Neon production target, GHCR build with manual promotion, layered Tailscale plus Lorecraft authentication, required recovery drill, minimal monitoring, the existing private model endpoint as sole provider, `main` as the production image source, host-managed secrets, a brief maintenance window, and an always-running five-second worker poll.

## Change Folder

- Planned location: promoted; private draft removed
- Active location: `docs/changes/2026-07-18-audit-hardening/`
- Closed location: `docs/changes/closed/2026-07-18-audit-hardening/`

## Impact

- Product: clearer private-AI processing expectations, more reliable opening recovery, better route/completion context for assistive-technology users, and private availability independent of the developer laptop.
- Code: backend generation evidence, worker policy, persistence seams, frontend routing/status behavior, idempotency fallback, CI generation checks, production health boundaries, image builds, and deployment commands.
- Infrastructure: one dedicated private LXC, a thin host ingress adapter, GHCR images, isolated Neon environments, and an explicit migration/recovery workflow.
- Tests: focused backend unit/functional/database coverage, frontend route/workbench tests, generated-contract cleanliness, container contract tests, deterministic E2E, hosted Neon smoke/recovery checks, private production smoke, and reverse traceability.
- Docs: three Epics, README operations/privacy/deployment guidance, a public provider-neutral runbook, private operator inventory kept outside the repository, relevant ADRs, and the active Change ledger.
- ADRs: update `docs/adrs/2026-07-17-provider-neutral-ai-boundary.md` and `docs/adrs/2026-07-12-postgresql-on-neon.md`; add `docs/adrs/2026-07-18-portable-container-deployment.md`.

## Release Communication Impact

- Required: yes.
- Record / section: the repository's next public release handoff or changelog mechanism, if established before closeout.
- Public summary: Adventure creation now explains AI processing, sensitive prompt/response evidence is not retained, transient opening work recovers more safely, route/completion accessibility is improved, and Lorecraft has a portable private-production deployment path.

## Open Questions

- None block planning. Provider mutations, production migration, host provisioning, image publication, and deployment remain explicit execution-time authorization gates even though the Change requires their verified completion.
