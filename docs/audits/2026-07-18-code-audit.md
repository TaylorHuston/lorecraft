# SDD Code Audit: Lorecraft

Status: audit complete

## Snapshot

- Audit date: 2026-07-18
- Repository: Lorecraft Git root
- Scope: Entire application repository, including backend, frontend, CI, public documentation, accepted ADRs, Epics, and closed Changes
- Exclusions: Dependencies, generated server output, build and distribution output, caches, coverage, vendor code, production systems, live providers, and the archived prototype repository
- Branch: `develop`
- HEAD: `91ea546a7b4133fba2b847ea764c4300fcf0d8a3`
- Working tree: Clean at audit start; local `develop` was one commit ahead of `origin/develop`. This report is the only intended audit write.
- Audit depth: default; reviewer effort selection was not available in this runtime
- SDD-managed: yes

## Context

- Architecture and package boundaries: TypeScript monorepo with an AdonisJS/PostgreSQL authoritative backend in `apps/backend`, a Vite/React/TanStack Query client in `apps/frontend`, a separately runnable Adventure-opening worker, and Tuyau-generated client contracts tracked under `apps/backend/.adonisjs/client`.
- Primary entry points: `apps/backend/start/routes.ts`, `apps/backend/bin/server.ts`, `apps/backend/commands/work_adventure_openings.ts`, `apps/frontend/src/main.tsx`, and `apps/frontend/src/app/AppRoutes.tsx`.
- Test and verification surfaces: Japa unit/functional/database suites, Vitest frontend tests, Storybook browser tests, Playwright desktop/mobile journeys, guarded PostgreSQL migration and test scripts, lint, typecheck, builds, CI, SDD validation, and reverse-traceability inventory.
- Relevant project guidance: `AGENTS.md`, `README.md`, application READMEs, accepted ADRs, the resolved SDD workflow, the private product brief, and Epics LC-001 through LC-003.

## Review Coverage

| Charter | Reviewer / method | Effort | Coverage and limitations |
|---|---|---|---|
| Code quality and architecture | Independent architecture/reliability specialist plus orchestrator sampling | Runtime default | Backend services, worker, provider adapter, migrations, frontend Adventure flow, CI, and package boundaries. No live provider, load test, or production deployment was available. |
| Testing and behavioral correctness | Independent test/SDD specialist plus current local gates | Runtime default | Test topology, CI ordering, generated contracts, all Epics and closed Changes, SDD validation, and reverse traceability. Database-backed Japa and Playwright suites were not rerun. |
| Security and data safety | Independent security/data specialist plus orchestrator evidence checks | Runtime default | Auth, session, CSRF, CORS, throttling, authorization, destructive operations, provider data, persistence, logs, and dependency audit. No production HTTPS, backup/access-control, or hosted-provider inspection was available. |
| Performance and reliability | Combined with architecture specialist | Runtime default | Queue claims, leases, retry/failure behavior, shutdown, query shapes, rate limiting, deployment expectations, and observability. No production manifest, traffic profile, or failure-injection environment was available. |
| UI/UX and accessibility | Combined with security specialist plus orchestrator source/test sampling | Runtime default | Routed production UI, responsive composition, dialogs, keyboard behavior, live regions, route transitions, and component-preview evidence. No manual screen-reader session was run. |
| SDD traceability | Combined with test specialist plus packaged reverse-inventory script | Runtime default | Three Epics, seven closed Changes, structural validation, current evidence paths, and unowned-test candidates. The script is conservative and does not establish deletion safety. |

## Validated Findings

| Severity | Confidence | Finding | Evidence | Impact | Remediation direction |
|---|---|---|---|---|---|
| medium | high | Sensitive AI prompts and raw responses have no retention or debug-access lifecycle | `opening_prompt.ts:16-56` includes World guidance, player backstory, and Character private knowledge; `openai_compatible_story_generator.ts:143-158` retains the full request body; `adventure_opening_worker.ts:108-117,570-590,665-684` persists prompt-bearing requests and raw responses; `1784236800000_create_adventure_aggregate.ts:134-178` has no expiry boundary; the provider-neutral ADR at lines 20 and 48 explicitly leaves retention/privacy undecided. | Every opening duplicates private canon and player material into operational evidence retained for the Adventure lifetime and potentially into backups. Current player APIs do not expose it, but operational access and future debug surfaces remain undefined. | Default to metadata-only evidence or define explicit capture, access, encryption, expiry, purge, and backup behavior before production use with sensitive Worlds. |
| medium | high | Hosted model transmission is not disclosed at Adventure creation | `work_adventure_openings.ts:52-85` accepts any configured OpenAI-compatible endpoint; `openai_compatible_story_generator.ts:127-180` sends assembled private context; `NewAdventurePage.tsx:149-220` collects profile/backstory without describing external processing. | When `LLM_BASE_URL` is hosted, creators may submit unpublished canon and player material without knowing it leaves Lorecraft's infrastructure. A local-only deployment does not trigger this risk. | Decide the supported provider/privacy model and present an appropriate processing notice before submission, distinguishing local and hosted processing where applicable. |
| medium | high | Worker recovery turns transient provider failure or deployment interruption into terminal failure too readily | `adventure_opening_worker.ts:246-256,686-705` defaults retry delay to zero and retries every normalized failure once; `work_adventure_openings.ts:73-105` does not override the delay and immediately loops after non-idle results. Its SIGTERM handler at lines 94-110 stops polling but does not cancel in-flight generation, while the provider timeout can run 120 seconds (`openai_compatible_story_generator.ts:162-195`). | Rate limits and outages consume both attempts back-to-back. A worker terminated under a shorter deployment grace period can leave an expiring lease; two interrupted attempts make the Adventure terminally fail and delay recovery. | Classify retryable failures, honor `Retry-After`, add configurable exponential backoff with jitter, propagate shutdown cancellation, and safely reschedule rather than charging an operational shutdown as a provider attempt. |
| medium | high | CI can silently repair stale tracked Tuyau client artifacts | `.gitignore:7-11` intentionally tracks `apps/backend/.adonisjs/client/**`; CI builds/generates before typecheck and tests at `.github/workflows/ci.yml:60-85` but never checks the generated diff. The unresolved suggestion is also recorded in `docs/changes/closed/2026-07-12-account-workspace-entry/review.md:41-44`. | A route or controller contract can change without its generated client being committed, yet CI can regenerate the checkout and pass. The merged repository then contains stale typed contracts until another build occurs. | Generate deterministically and fail CI on `git diff --exit-code -- apps/backend/.adonisjs/client`, or stop tracking the output and guarantee generation before every consumer. |
| medium | high | The durable Adventure quota is broader than the process-local implementation | `config/limiter.ts:1-8` uses memory storage; `start/limiter.ts:15-18` keys the generation budget by account; LC-003 `R3-S5` and its evidence at `epic.md:149-153,253` describe an account-wide limit, while the functional test proves one process. LC-001 already records a shared ingress/distributed limiter as a pre-horizontal-scale requirement. | Multiple API instances and process restarts multiply or reset the stated quota, increasing provider cost and queue load beyond the durable Epic guarantee. Current single-instance operation is not bypassed. | Use a shared atomic limiter or ingress control before horizontal/provider-paid deployment; meanwhile scope LC-003 wording and gaps to the actual single-process guarantee. |
| medium | high | SPA navigation and asynchronous opening completion lack a consistent announcement/focus boundary | `index.html:8` has one static title; `AppRoutes.tsx:212-249` has no route-aware title or navigation focus handling; programmatic redirects unmount their initiating controls. `AdventurePage.tsx:40-45` polls until ready, but only the pending state is live at `AdventureWorkbench.tsx:95-103`; completed narration is inserted outside a live region at lines 123-129. | Keyboard and screen-reader users can lose context after route transitions, while a pending opening can silently become ready without announcing or directing users to the primary Story content. | Add a route-level title/focus policy and a polite, persistent status for active-to-ready transitions, with deliberate non-disruptive focus behavior. |
| medium | high | Core Adventure application policy is coupled directly to Lucid/PostgreSQL details | `AGENTS.md` requires domain/application behavior to remain persistence-independent, but `adventure_creation_service.ts`, `adventure_lifecycle_service.ts`, and the 712-line `adventure_opening_worker.ts` combine validation, lifecycle/retry policy, SQL table names, locking, evidence storage, and transaction orchestration. | Durable policy changes require database-backed tests and coordinated persistence edits; retry/publication rules are harder to reason about independently and the worker concentrates several responsibilities. | Extract pure lifecycle/retry/publication policy and purpose-specific repository/transaction ports incrementally, keeping atomic SQL implementations in adapters. |
| medium | high | Canonical Epic gaps contradict completed UI acceptance | LC-002 `epic.md:160-162,256-258` and LC-003 `epic.md:265-268` still say user confirmation remains closeout work. The closed UI-foundations Change records `user confirmed` in `tasks.md:175-177,194-209` and `review.md:11-20`. LC-003's frontmatter still says `last_verified: 2026-07-17` although July 18 evidence appears later in the file. | Re-entry from canonical Epic truth incorrectly treats completed acceptance as outstanding and understates the latest verification date. | Remove resolved confirmation gaps, update the verification date, and leave only real current gaps. |
| low | high | The browser UUID fallback cannot pass backend validation | `NewAdventurePage.tsx:19-22` falls back to a timestamp/random string, while `validators/adventure.ts:3-5` requires a UUID. | A browser/context without `crypto.randomUUID` can render the form but every Adventure creation submission fails validation. | Generate a valid UUID fallback with available secure random bytes, or make the API requirement explicit and fail clearly before submission. |
| low | high | Three behavior tests are absent from canonical reverse traceability | The repository inventory and direct search found no Epic/Change reference to `adventure_aggregate_migration.spec.ts`, `tuyauAdventureApi.test.ts`, or `vite.config.test.ts`, although they prove LC-003 database constraints and API mapping and the LC-001 same-origin proxy boundary. | Future work cannot discover this evidence from Epic maps, and weakening or deleting it would not make canonical truth visibly stale. | Add scenario-mapped `Verified By` entries to LC-001 and LC-003. Treat other inventory candidates as support/generated files unless inspection proves otherwise. |

## Cross-Cutting Themes

- Privacy is the clearest pre-production decision gap: Lorecraft deliberately handles private canon but currently retains and may transmit more AI payload data than its product UI explains.
- The Adventure worker has strong transactional stale-worker protection, but operational recovery policy is less mature than its database correctness.
- CI and SDD both have strong structural gates; the remaining weaknesses are truth-integrity checks that allow generated or accepted state to drift without failing.
- The routed UI has good component-level keyboard and dialog coverage, but application-level navigation and asynchronous transition announcements need one shared policy.

## Candidate Changes

| Priority | Desired outcome | Findings grouped | Likely scope | Dependencies | Verification direction |
|---|---|---|---|---|---|
| 1 | Define a privacy-safe AI evidence and provider-transparency contract | AI retention; hosted transmission disclosure | Provider ADR, model-call schema/worker, purge/access policy, Adventure creation disclosure, Epic evidence | Product decision on local versus hosted providers, retention duration, support/debug access, and backup treatment | Migration/data-retention tests, provider request assertions, UI accessibility tests, deletion/purge proof, privacy copy walkthrough |
| 2 | Make Adventure opening recovery resilient to outages and deploys | Immediate retry; shutdown cancellation | Worker policy, command signal flow, provider adapter abort contract, configuration, logs/metrics, LC-003 | Deployment termination grace and selected provider retry semantics | Fake-clock retry/backoff tests, `Retry-After` cases, shutdown failure injection, lease/requeue integration tests |
| 3 | Make repository contracts reproducible from a clean checkout | Generated Tuyau drift | Backend generation command and CI | Decision to track or regenerate client output | Deliberately stale generated artifact must fail the clean-checkout CI gate |
| 4 | Align quota guarantees with deployment topology | Process-local limiter and Epic overstatement | Limiter store/ingress, deployment docs, LC-001 and LC-003 | Replica topology and provider cost model | Multi-process/shared-counter test or explicit single-instance deployment assertion; scoped SDD validation |
| 5 | Establish application-level route and async accessibility behavior | Route focus/title; ready announcement | App routing boundary, page headings/main landmarks, Adventure transition status, tests | Confirm desired focus behavior so background completion is not disruptive | Routed keyboard tests, document-title assertions, live-region transition test, manual screen-reader walkthrough |
| 6 | Reduce persistence coupling around Adventure policy | Service/worker architecture | Pure policies, repository ports, Lucid adapters, focused tests | Preserve current transactional guarantees and avoid speculative universal abstractions | Fast policy unit tests plus unchanged PostgreSQL concurrency and API suites |
| 7 | Reconcile small correctness and evidence drift | Epic closeout truth; UUID fallback; missing test ownership | LC-002/LC-003 evidence, frontend ID generation, Verified By maps | None beyond choosing the UUID compatibility boundary | Focused fallback test, SDD validation, reverse traceability rerun |

## SDD Traceability

- Result: gaps found
- Epic and evidence observations: Structural validation passes for all three Epics and seven closed Changes with zero warnings/errors. Canonical UI confirmation gaps are stale, LC-003's verification date lags current evidence, and the process-local generation budget is described too broadly.
- Orphan-audit evidence used: The packaged current-working-tree inventory found 264 tracked candidates, 92 implemented references, 40 verified references, no missing referenced files, 28 source candidates without `Implemented By`, and 8 test candidates without `Verified By`. Manual classification rejected framework, generated, preview, helper, and support files; three executable behavior tests remain useful traceability gaps.

## Challenged Or Unresolved Claims

- Rejected: model-call evidence is exposed to players. Current owner APIs intentionally omit raw snapshots, prompts, private Character knowledge, and raw provider responses; the validated concern is retention and operational access, not current API disclosure.
- Narrowed: the memory limiter is not a current single-process bypass. It is a deployment-scaling risk and an Epic wording mismatch already anticipated by LC-001.
- Deferred from finding status: no checked-in production deployment manifest means replica count, reverse proxy, termination grace, process supervision, health checks, database pool sizing, backups, and monitoring could not be verified. This limits operational confidence but does not prove those controls are absent from the eventual host.
- Unresolved product decision: whether hosted-provider disclosure belongs directly in this first private Adventure UI depends on the supported deployment model; the repository currently permits hosted endpoints, so the risk remains until that model is explicit.

## Commands And Tools

| Command or tool | Result | Limitation |
|---|---|---|
| Git branch/HEAD/status/worktree/submodule inventory | `develop` at `91ea546`; clean; one commit ahead; one worktree; no submodule output | Snapshot only; remote state was not refreshed. |
| `sdd context . --json`; `sdd status lorecraft --all --json` | Official active repository resolved; no active Change; three active-repository Epics | Archived prototype appeared only as related history and was excluded. |
| `sdd validate lorecraft --repo lorecraft --json` | Valid: 7 Changes, 3 Epics, 0 errors, 0 warnings | Structural validation does not prove semantic truth or test strength. |
| Packaged `sdd_orphan_audit.py ... --format json` | No missing references; candidate counts summarized above | Conservative ownership inventory; no deletion conclusions. |
| Backend and frontend lint | Passed | Static analysis only. |
| Backend and frontend `tsc --noEmit` | Passed | Type safety only; no build/code-generation cleanliness assertion. |
| Frontend Vitest suite | 13 files, 115 tests passed | jsdom/component behavior; no routed real-browser or backend integration. |
| Backend database-safety suite | 16 tests passed | Proves target guards, not application/database behavior. |
| Delegated dependency audit | `npm audit --omit=dev --audit-level=high`: 0 reported vulnerabilities | Registry/tool snapshot only; not a source review or future guarantee. |
| Delegated Storybook browser suite | 78 tests passed | Component-preview/browser evidence; not production routing. |
| Source inspection and three independent specialist reviews | No critical/high findings; validated findings consolidated above | Reviewers combined compatible charters because three delegation slots were available. |

Database-backed Japa suites, migrations, Playwright E2E, a production build, a generated-client cleanliness check, live-provider calls, hosted Neon smoke testing, load testing, and production/manual screen-reader verification were not run by the orchestrator. Existing historical evidence was inspected but is not represented as a current rerun.

## Recommended First Action

- Recommendation: Capture and plan the AI evidence-retention and hosted-provider transparency outcome before production use with private World content.
- Why first: It governs intentional duplication and external transmission of the product's most sensitive data, and the accepted provider ADR already marks retention/privacy as unresolved.
- Suggested next workflow: `/sdd-change --brief`

## Guardrail

This is a point-in-time advisory report for the snapshot above. Accepted behavior and implementation truth belong in the relevant Epics and Changes. No application code was modified by this audit.
