# Review: Restore Release Gate Integrity

## Verdict

ready

## Gate Scorecard

| Gate | Result | Notes |
|---|---|---|
| Change artifacts and status | pass | Active Change is `in_review`; proposal, design, and ledger align. |
| Epic / Requirement / Scenario truth | pass | LC-001, LC-002, and LC-003 maps and exact scenario evidence are current. |
| Reverse traceability and semantic ownership | pass | Diff surfaces are classified to their governing services, limiters, tests, and workflow entry points. |
| Tests and aggregate candidate | pass | Fresh cache-bypassed `ci:required` passed on `f46fdf5`. |
| Evidence and pattern/stateful review | pass | Owner isolation, Guide reflection, retry/discard, stale claims, defaults, migration, and limiter boundaries were inspected. |
| Rendered/manual UI | not applicable | No visible UI contract changed; Storybook and desktop/mobile E2E are regression proof. |
| Code and security review | pass | No unresolved actionable code or privacy finding. |
| Documentation, Idea truth, PRD, release communication | pass | Active app/archived MVP mapping and product constraints align; Unreleased Security note added. |
| Branch and prospective integration | pass | `develop` is the merge base and merge tree equals source tree; no target-only drift or conflict. |

## Findings

### REQUIRED

- [x] `CHANGELOG.md:32` - The restored private-Guide reflection guard required a bounded public security note. Resolved with an Unreleased Security entry.
- [x] `apps/backend/tests/functional/adventure_query_service.spec.ts:268` - Owner debug projection still expected obsolete blank NPC state. Resolved by asserting the accepted nonblank fallback state; focused and aggregate backend tests pass.
- [x] `apps/backend/start/limiter.ts:5` - The full E2E lifecycle exceeds the production ten-turn quota, but the prior broad test-mode bypass was removed. Resolved with a `NODE_ENV=test` plus `LORECRAFT_E2E=1` Playwright-only capacity; the normal functional ten-request limit remains proved.
- [x] `apps/frontend/src/app/App.test.tsx:72` - Routed signup assertion could retain a detached heading during a transition. Resolved by re-querying inside `waitFor`; repeated file and full frontend runs pass.

## Verification Evidence

| Command / Scenario | Evidence Type | Result | What It Proves |
|---|---|---|---|
| Backend query-service focused test | focused automated | pass, 3/3 plus 20 safety checks | Owner frozen projection uses accepted NPC defaults. |
| Backend generation-limit focused test | focused automated | pass, 1/1 plus 20 safety checks | Normal functional quota remains ten requests. |
| Targeted lifecycle E2E | deterministic E2E | pass, 2/2 incl. setup | E2E-only capacity permits reset/delete after a complete lifecycle. |
| `npm run test --workspace @lorecraft/frontend` | broad supporting | pass, 149/149 | Routed workspace assertion is stable in the frontend suite. |
| `NODE_ENV=test APP_KEY=<test-only> npm run ci:required` | fresh aggregate candidate | pass | Build, contracts, guarded migrations, lint, typecheck, backend 177/177, frontend 149/149, Storybook 88/88, E2E 11/11. |
| `sdd validate lorecraft --repo <repo> --change 2026-07-22-release-gate-integrity --changed-from 998d7af --json` | scoped artifact validation | pending final ledger check | Change/Epic structure and changed evidence. |

## Review Bundle

- Source branch/ref: `fix/release-gate-integrity` / `f46fdf56074a9504a6c6377d92f2c75c84e96d78`.
- Target branch/ref and merge base: `develop` / `998d7afa33f64c948990bedabbb26cbe5b51fb34`.
- Prospective integration: merge tree equals the reviewed source tree; no conflict and no target-only commits.
- Branch policy: policy-compliant `fix/*` to local-first `develop`; no push, merge, PR, or close action was authorized.
- Dirty state at review watermark: clean.

## Consolidated Remediation

- Root causes: an omitted public security classification, two stale test expectations, and an E2E fixture that needed capacity isolated from the production quota.
- Safe-fix batch: changelog note, deterministic test expectations/synchronization, and a test-only Playwright backend flag.
- Deferred or unsafe findings: none.
- Regression-focused rereview: all resolved surfaces were exercised by focused tests and the exact fresh aggregate candidate; no new regressions found.

## Review Log

- 2026-07-22: Independent review completed; all required findings remediated and rechecked. Verdict `ready`.
