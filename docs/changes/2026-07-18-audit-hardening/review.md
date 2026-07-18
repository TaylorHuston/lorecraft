# Review: Audit Hardening

## Verdict

ready

The consolidated implementation findings, release-gate heading defect, and six production-PR review findings are remediated. Independent code/security, artifact/traceability, and verification/UI regression passes are clean, and commit `11509c267b77d027a9c907b6ac7a90e2b50b0ec1` is the refreshed immutable semantic review watermark. Local UI acceptance is `user confirmed`; private-production acceptance remains `pending user`, so deployment and closeout are not yet acceptance-ready.

## Gate Scorecard

| Gate                                  | Result                                        | Notes                                                                                                                                                 |
| ------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Change artifacts                      | pass                                          | Proposal, design, task ledger, and deployment expansion agree after remediation.                                                                      |
| Change status                         | pass                                          | Active folder is `in_review`.                                                                                                                         |
| Epic truth                            | pass                                          | LC-001/002/003 retain honest live-production gaps; LC-003 disposable-Neon evidence and deployment support maps are current.                           |
| Requirements and Scenarios            | pass                                          | No duplicate or missing Story/Requirement/Scenario references.                                                                                        |
| Story reference traceability          | pass                                          | All referenced implementation and verification files exist.                                                                                           |
| Reverse traceability                  | pass                                          | 65 changed-surface candidates classified; remaining CI/generated/database-guard candidates are supporting infrastructure.                             |
| Tests and verification                | pass with external gaps                       | PR-focused tests, all 120 frontend tests, build, lint, typecheck, contracts, and scoped validation pass; prior disposable-Neon/E2E evidence remains current; real Docker/host/restore proof remains pending. |
| Manual UI confirmation                | local user confirmed; production pending user | Taylor approved the provider-backed pending-to-ready Adventure UI and generated opening; private HTTPS/session/host/recovery checks await deployment. |
| Code review                           | pass after remediation                        | Release env parsing, retry bounds, evidence byte counting, trusted HTTPS forwarding, and delayed-route focus preservation are corrected and independently rereviewed. |
| Visual / UX consistency               | pass                                          | Pending/failure headings now follow the Story `h1`; focused and Storybook accessibility tests pass, with no visual redesign.                           |
| Security review                       | pass                                          | Metadata-only evidence, trusted private-HTTPS forwarding, secret isolation, loopback publishing, non-root images, and fail-closed DB guards are preserved. |
| Documentation                         | pass                                          | README, ADRs, Epics, and Change ledger describe current local versus live-production truth.                                                           |
| Idea repository / current-state truth | pass                                          | Official repository remains active, MVP archived, and no hosted deployment is claimed.                                                                |
| Release communication                 | pass                                          | Public-safe `[Unreleased]` notes are committed in `CHANGELOG.md`.                                                                                      |
| Branch and merge readiness            | technically ready, remote gate pending        | `develop` merges cleanly to `main`; PR #2 checks/review must refresh on the reconciled head, and private-production acceptance remains pending.        |
| PRD alignment                         | pass                                          | Private-by-default, creator authority, non-canonical Adventures, and replaceable AI boundary are preserved.                                           |

## Findings

### BLOCKING

- [x] Source working tree - Commit the implementation and rerun stale-contract, conflict, and review-watermark checks. Resolved by `bb59d36dfc6e92ad13dd649c9c36d993a57da369`; `.neon` remains excluded private-local state.

### REQUIRED

- [x] `deploy/release-command.mjs` - Require a fresh recovery reference for every migration-bearing deploy and restore the recorded current application SHA when new-stack health fails.
- [x] `.github/workflows/images.yml` - Publish images only from `refs/heads/main`, including manual dispatches.
- [x] `deploy/compose.yaml` and `apps/backend/scripts/run-production-migrations.mjs` - Use the production build's actual `ace.js` command entrypoint.
- [x] `deploy/release-command.mjs` - Preserve support for a keyless private OpenAI-compatible provider.
- [x] `docs/changes/2026-07-18-audit-hardening/tasks.md` and `docs/epics/lc-003-adventure-play/epic.md` - Reconcile completed Neon evidence, current status, closeout truth, and reverse traceability.
- [x] `docs/adrs/2026-07-17-provider-neutral-ai-boundary.md` - Add active Change provenance.

### SUGGESTION

- [x] `docs/adrs/2026-07-12-postgresql-on-neon.md` - Expand related Epic routing to the World and Adventure production/restore paths.

## Verification Evidence

| Command / Scenario                                          | Evidence Type                  | Requirement / Scenario                     | Result                    | What It Proves                                                                                                    |
| ----------------------------------------------------------- | ------------------------------ | ------------------------------------------ | ------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `npm run test:deployment`                                   | focused automated test         | LC-003/S1 R3-S9..R3-S10 support            | 6 passed                  | Tolerant production env parsing, immutable image derivation, release order, explicit recovery, and failed-health restoration. |
| `npm run test:containers`                                   | focused automated test         | LC-001 production support; LC-003/S1 R3-S9 | 6 passed                  | Loopback gateway, same-origin proxy, health boundaries, production commands, migration isolation, and log bounds. |
| `npm run test:images`                                       | focused automated test         | production image provenance                | 1 passed                  | PR builds and immutable publication are restricted to `main`.                                                     |
| `node --test apps/backend/scripts/database-safety.test.mjs` | focused automated test         | database safety boundary                   | 20 passed                 | Disposable and production URL identity, pooled/direct, acknowledgement, and environment guards.                   |
| `npm run lint`, `npm run typecheck`, `npm run build`        | broad supporting gate          | changed application surfaces               | passed                    | Both workspaces compile, lint, and produce production builds; `build/ace.js` exists.                              |
| Full backend against disposable Neon                        | production-path automated test | LC-001/002/003 database behavior           | 112 passed                | Migration, auth, catalog, Adventure, retry, cancellation, and persistence behavior.                               |
| Desktop/mobile Playwright against disposable Neon           | deterministic E2E              | LC-001/002/003 journeys                    | 7 passed                  | Signup/workspace, starter World, and full Adventure lifecycle.                                                    |
| Focused frontend review rerun                               | focused automated test         | route/disclosure/completion behavior       | 16 passed                 | Route titles/focus, notice, UUID fallback, and non-stealing announcement.                                         |
| `RoutePresentation.test.tsx` after PR feedback              | focused automated test         | LC-001/S3 R3-S1..R3-S2                     | 4 passed                  | Navigation still focuses headings while user-selected focus survives delayed route data.                         |
| Full frontend Vitest after PR feedback                      | broad supporting gate          | frontend regression surface                | 120 passed                | The focus correction does not regress account, World, or Adventure client behavior.                              |
| `npm run verify:contracts` after PR feedback                | generated-contract gate        | API consumer boundary                      | passed                    | PR remediation leaves the tracked generated client clean.                                                        |
| `sdd validate ... --json`                                   | structural gate                | active Change and affected Epics           | passed, 0 errors; 3 legacy-schema warnings | Artifact structure and declared references remain valid; LC-001/002/003 retain their accepted legacy shape.                           |
| Focused `AdventureWorkbench.test.tsx`                       | focused automated test         | LC-003/S1 R5 pending/failure headings      | 5 passed                  | State titles are level-two headings beneath the Story heading.                                                     |
| `npm run test:storybook`                                    | browser accessibility          | LC-003/S1 R5 desktop/mobile states         | 78 passed                 | Pending and failure stories have no automated accessibility violations.                                           |

## Review Bundle

- Source branch/ref: `develop`
- Reviewed source commit: `11509c267b77d027a9c907b6ac7a90e2b50b0ec1`
- Target branch/ref: `origin/main` at `1dd901c3a5fe0df0f898acda39ba18fcb065e11c`
- Merge base: `cfe17b8f65892ff75a3497487bfbae06e3ebce6d`
- Source-only commits: 16, ending with `11509c2 Address release PR feedback`
- Target-only commits: none
- Changed files in PR-remediation regression scope: 12
- Diff stat in PR-remediation regression scope: 104 insertions, 15 deletions
- Conflict check: `git merge-tree --write-tree origin/main develop` passed and produced tree `d269128e00971e599b283b288c251b472928eee2`
- Dirty state: only private-local `.neon` remains untracked
- Branch policy: production release PR `develop` to `main` is correct; merge remains unauthorized
- Reverse-traceability command/result: packaged orphan audits with `--changed-from df92d33` for LC-001 and LC-003; the combined changed source/tests are owned. The stripped-leading-dot `.github/workflows/images.yml` report remains a classified parser false positive.

## Reverse Traceability

- Candidate scope: 13 changed/local candidates across the semantic PR-remediation commit plus excluded `.neon` state.
- Epic ownership reconciled: focus behavior/test map to LC-001/S3 R3; provider/retry/deployment behavior and tests map to LC-003/S1 R3.
- Support/generated/framework classifications: CI/image workflows, Tuyau output, database guards, root scripts, Compose contracts, and package/config files are supporting infrastructure.
- Stranded refactor surfaces checked: worker entrypoint, generated contracts, routes, migration, provider evidence fields, old raw evidence names, and unused Neon driver dependency.
- Explicit gaps or tracked cleanup: `.neon` is excluded private-local state; live Docker/GHCR/LXC/Tailscale/restore evidence remains tracked in Tasks 13-15.

## Discovery Wave

| Pass                                            | Reviewer                                | Result                    | Notes                                                                                                   |
| ----------------------------------------------- | --------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------- |
| Artifact truth                                  | delegated fresh-context review          | pass after reconciliation | Stale PR head, next action, commit reference, and review watermark corrected.                           |
| Reverse traceability                            | delegated review plus packaged audit    | pass after remediation    | Deployment/support paths classified and mapped.                                                         |
| Code diff                                       | delegated code/security review plus orchestrator | pass             | Six automated-review fixes are narrow and correct.                                                       |
| Verification coverage                           | delegated verification/UI review        | pass with external gaps   | Focused and broad regressions pass; static deployment proof is not presented as live deployment proof.   |
| Security                                        | delegated security review               | pass after remediation    | Main provenance and recovery boundaries corrected.                                                      |
| UI / visual identity                            | delegated UI review                     | pass, pending manual      | Focused UI tests passed.                                                                                |
| Docs / Idea truth / release communication / PRD | delegated artifact and docs reviews     | pass with release pending | Idea lifecycle and PRD align.                                                                           |
| Integration readiness                           | orchestrator                            | technically ready         | Immutable commit and clean conflict check recorded; manual acceptance and authorization remain pending. |

## Consolidated Remediation

- Root causes addressed: permissive env parsing, unbounded unexpected retry input, unnecessary byte-count allocation, untrusted proxy scheme propagation, delayed focus theft, and stale review state.
- Safe-fix batch: release parser/tests, provider/retry implementation/tests, gateway contract, route presentation/test, LC-001/LC-003 evidence, tasks ledger, and review record.
- Deferred or unsafe findings: none from code review; external production execution remains an explicit workflow gate.
- Affected verification union: deployment/container/image/database-safety tests, lint, typecheck, build, reverse traceability, and scoped validation.
- Regression-focused rereview: passed for the remediated code/artifact surfaces and committed review watermark.
- New regressions introduced by remediation: none.

## PR / Merge Readiness

- Source branch: `develop`
- Reviewed source commit: `11509c267b77d027a9c907b6ac7a90e2b50b0ec1`
- Target branch: `main`
- Conflict check: passed
- Commit state: reviewed semantic source committed at `11509c2`; this review/task reconciliation is documentation-only
- PR status: #2 open; reconciled head not yet pushed
- Merge status: not authorized; remote checks/review and required acceptance policy remain gates

## Review Log

- 2026-07-18: Deep review discovery completed, consolidated safe remediation applied, and regression verification passed; commit/manual/external gates remain.
- 2026-07-18: Implementation committed at `bb59d36dfc6e92ad13dd649c9c36d993a57da369`; generated contracts and merge-tree conflict check passed; verdict advanced to `ready` with manual acceptance pending.
- 2026-07-18: User authorized close and merge; local integration into `develop` completed at `92895f7`. Closeout remains pending the accepted private deployment, restore drill, and production acceptance scope.
- 2026-07-18: Release gate exposed skipped heading levels in Adventure pending/failure states. Fix commit `47dbaea` and handoff commit `0c026d6` passed focused semantic assertions, all Storybook accessibility tests, conflict checking, traceability, artifact, security, docs, Idea, PRD, and branch-readiness review. Verdict remains `ready`; deployment acceptance and closeout remain pending.
- 2026-07-18: User authorized local integration of the reviewed heading fix; merged `fix/adventure-heading-order` into `develop` at `76239fade23bdb171895406080dafb478fb6cc79`. No push, branch deletion, deployment, or closeout occurred.
- 2026-07-18: `/sdd-release` passed the full local gate, committed public release communication, pushed `develop`, and opened production release PR #2 to `main`. Hosted CI, PR image builds, remote review, merge authorization, deployment, restore, and production acceptance remain pending.
- 2026-07-18: PR #2 automated review produced six accepted findings. Semantic remediation commit `11509c2` passed focused deployment/container/backend/frontend checks, all 120 frontend tests, lint, typecheck, build, generated-contract cleanliness, conflict checking, scoped validation, reverse traceability, and three independent regression passes. Verdict remains `ready`; the remote gate and private-production acceptance remain pending.
