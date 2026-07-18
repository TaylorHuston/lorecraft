# Review: Audit Hardening

## Verdict

ready

The consolidated implementation findings are remediated, regression checks pass, and commit `bb59d36dfc6e92ad13dd649c9c36d993a57da369` is the immutable review watermark. Local UI acceptance is `user confirmed`; private-production acceptance remains `pending user`, so deployment and closeout are not yet acceptance-ready.

## Gate Scorecard

| Gate                                  | Result                                        | Notes                                                                                                                                                 |
| ------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Change artifacts                      | pass                                          | Proposal, design, task ledger, and deployment expansion agree after remediation.                                                                      |
| Change status                         | pass                                          | Active folder is `in_review`.                                                                                                                         |
| Epic truth                            | pass                                          | LC-001/002/003 retain honest live-production gaps; LC-003 disposable-Neon evidence and deployment support maps are current.                           |
| Requirements and Scenarios            | pass                                          | No duplicate or missing Story/Requirement/Scenario references.                                                                                        |
| Story reference traceability          | pass                                          | All referenced implementation and verification files exist.                                                                                           |
| Reverse traceability                  | pass                                          | 65 changed-surface candidates classified; remaining CI/generated/database-guard candidates are supporting infrastructure.                             |
| Tests and verification                | pass with external gaps                       | Local, disposable-Neon, and deterministic E2E evidence passes; real Docker/GHCR/host/restore proof remains pending.                                   |
| Manual UI confirmation                | local user confirmed; production pending user | Taylor approved the provider-backed pending-to-ready Adventure UI and generated opening; private HTTPS/session/host/recovery checks await deployment. |
| Code review                           | pass after remediation                        | Release recovery, production entrypoints, keyless provider configuration, and main-only publication corrected.                                        |
| Visual / UX consistency               | pass                                          | Focused UI tests pass; no visual redesign was introduced.                                                                                             |
| Security review                       | pass                                          | Metadata-only evidence, secret isolation, loopback publishing, non-root images, and fail-closed DB guards are preserved.                              |
| Documentation                         | pass                                          | README, ADRs, Epics, and Change ledger describe current local versus live-production truth.                                                           |
| Idea repository / current-state truth | pass                                          | Official repository remains active, MVP archived, and no hosted deployment is claimed.                                                                |
| Release communication                 | pending                                       | Required at release handoff; no project changelog is established.                                                                                     |
| Branch and merge readiness            | technically ready                             | Committed source merges cleanly to `develop`; manual acceptance and explicit integration authorization remain pending.                                |
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
| `npm run test:deployment`                                   | focused automated test         | LC-003/S1 R3-S9..R3-S10 support            | 5 passed                  | Immutable image derivation, release order, explicit recovery, and failed-health restoration.                      |
| `npm run test:containers`                                   | focused automated test         | LC-001 production support; LC-003/S1 R3-S9 | 6 passed                  | Loopback gateway, same-origin proxy, health boundaries, production commands, migration isolation, and log bounds. |
| `npm run test:images`                                       | focused automated test         | production image provenance                | 1 passed                  | PR builds and immutable publication are restricted to `main`.                                                     |
| `node --test apps/backend/scripts/database-safety.test.mjs` | focused automated test         | database safety boundary                   | 20 passed                 | Disposable and production URL identity, pooled/direct, acknowledgement, and environment guards.                   |
| `npm run lint`, `npm run typecheck`, `npm run build`        | broad supporting gate          | changed application surfaces               | passed                    | Both workspaces compile, lint, and produce production builds; `build/ace.js` exists.                              |
| Full backend against disposable Neon                        | production-path automated test | LC-001/002/003 database behavior           | 112 passed                | Migration, auth, catalog, Adventure, retry, cancellation, and persistence behavior.                               |
| Desktop/mobile Playwright against disposable Neon           | deterministic E2E              | LC-001/002/003 journeys                    | 7 passed                  | Signup/workspace, starter World, and full Adventure lifecycle.                                                    |
| Focused frontend review rerun                               | focused automated test         | route/disclosure/completion behavior       | 16 passed                 | Route titles/focus, notice, UUID fallback, and non-stealing announcement.                                         |
| `sdd validate ... --json`                                   | structural gate                | active Change and affected Epics           | passed, 0 errors/warnings | Artifact structure and declared references remain valid.                                                          |

## Review Bundle

- Source branch/ref: `change/audit-hardening`
- Reviewed source commit: `bb59d36dfc6e92ad13dd649c9c36d993a57da369`
- Target branch/ref: `develop` at `91ea546a7b4133fba2b847ea764c4300fcf0d8a3`
- Merge base: `91ea546a7b4133fba2b847ea764c4300fcf0d8a3`
- Source-only commits: `bb59d36 Harden Lorecraft and add private deployment`
- Target-only commits: none
- Changed files: 65
- Diff stat: 3,074 insertions, 311 deletions
- Conflict check: `git merge-tree --write-tree develop HEAD` passed and produced tree `a9521396d0bbddcb39618db0e912962d2c0ba647`
- Dirty state: only private-local `.neon` remains untracked
- Branch policy: `change/*` to non-production `develop` is correct; no PR/merge authorized
- Reverse-traceability command/result: packaged orphan audit with `--changed-from develop`, plus LC-001/002/003 passes; no missing references

## Reverse Traceability

- Candidate scope: 65 source, test, support, generated, config, doc, and local-state candidates.
- Epic ownership reconciled: product behavior maps to LC-001/002/003; deployment behavior maps to LC-001/LC-003.
- Support/generated/framework classifications: CI/image workflows, Tuyau output, database guards, root scripts, Compose contracts, and package/config files are supporting infrastructure.
- Stranded refactor surfaces checked: worker entrypoint, generated contracts, routes, migration, provider evidence fields, old raw evidence names, and unused Neon driver dependency.
- Explicit gaps or tracked cleanup: `.neon` is excluded private-local state; live Docker/GHCR/LXC/Tailscale/restore evidence remains tracked in Tasks 13-15.

## Discovery Wave

| Pass                                            | Reviewer                                | Result                    | Notes                                                                                                   |
| ----------------------------------------------- | --------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------- |
| Artifact truth                                  | delegated fresh-context review          | findings remediated       | Stale task closeout and LC-003 DB gaps corrected.                                                       |
| Reverse traceability                            | delegated review plus packaged audit    | pass after remediation    | Deployment/support paths classified and mapped.                                                         |
| Code diff                                       | delegated code review plus orchestrator | findings remediated       | Production entrypoint issue was additionally found from build output.                                   |
| Verification coverage                           | delegated verification review           | pass with external gaps   | Static deployment proof is not presented as live deployment proof.                                      |
| Security                                        | delegated security review               | pass after remediation    | Main provenance and recovery boundaries corrected.                                                      |
| UI / visual identity                            | delegated UI review                     | pass, pending manual      | Focused UI tests passed.                                                                                |
| Docs / Idea truth / release communication / PRD | delegated artifact and docs reviews     | pass with release pending | Idea lifecycle and PRD align.                                                                           |
| Integration readiness                           | orchestrator                            | technically ready         | Immutable commit and clean conflict check recorded; manual acceptance and authorization remain pending. |

## Consolidated Remediation

- Root causes addressed: release provenance/recovery assumptions, source-vs-build command mismatch, and stale evidence/closeout truth.
- Safe-fix batch: release command/tests, Compose/production migration entrypoints, image workflow/test, README, ADRs, LC-003, and tasks ledger.
- Deferred or unsafe findings: none from code review; external production execution remains an explicit workflow gate.
- Affected verification union: deployment/container/image/database-safety tests, lint, typecheck, build, reverse traceability, and scoped validation.
- Regression-focused rereview: passed for the remediated code/artifact surfaces and committed review watermark.
- New regressions introduced by remediation: none.

## PR / Merge Readiness

- Source branch: `change/audit-hardening`
- Reviewed source commit: `bb59d36dfc6e92ad13dd649c9c36d993a57da369`
- Target branch: `develop`
- Conflict check: passed
- Commit state: committed; review-record follow-up commit pending
- PR status: none; not authorized
- Merge status: locally merged to `develop` at `92895f7`; no push performed

## Review Log

- 2026-07-18: Deep review discovery completed, consolidated safe remediation applied, and regression verification passed; commit/manual/external gates remain.
- 2026-07-18: Implementation committed at `bb59d36dfc6e92ad13dd649c9c36d993a57da369`; generated contracts and merge-tree conflict check passed; verdict advanced to `ready` with manual acceptance pending.
- 2026-07-18: User authorized close and merge; local integration into `develop` completed at `92895f7`. Closeout remains pending the accepted private deployment, restore drill, and production acceptance scope.
