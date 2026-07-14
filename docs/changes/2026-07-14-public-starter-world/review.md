# Review: Public Starter World

## Verdict

changes-requested

## Gate Scorecard

| Gate                         | Result   | Notes                                                                                                        |
| ---------------------------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| Change artifacts             | findings | Safe ledger contradictions were reconciled; implementation findings remain below.                            |
| Change status                | pass     | Returned to `in_progress` for remediation.                                                                   |
| Epic truth                   | findings | LC-002 overstates inaccessible-World and exact-seed evidence.                                                |
| Requirements and Scenarios   | findings | S2/R1-S2 and S2/R1-S3 need stronger deterministic evidence.                                                  |
| Story reference traceability | pass     | LC-002/S1 and LC-002/S2 use unique Epic-scoped references with implementation maps.                          |
| Tests and verification       | findings | All current suites pass, but important authorization, integrity, and reconciliation cases are absent.        |
| Manual UI confirmation       | blocked  | `/worlds` and `/worlds/stormbound-chapel` remain `pending user`.                                             |
| Code review                  | findings | World/account cache lifecycle, detail recovery, and relational integrity require remediation.                |
| Visual / UX consistency      | findings | Detail failure copy promises retry without providing a retry control.                                        |
| Security review              | findings | Account-agnostic cached World data can survive account changes; inaccessible-private-World proof is missing. |
| Documentation                | pass     | README and supporting architecture guidance match the implemented slice.                                     |
| Release communication        | pass     | CHANGELOG contains only the user-facing catalog and detail behavior.                                         |
| Branch and merge readiness   | blocked  | Source is stacked on an unfinished Storybook Change. Merge preview itself is clean.                          |
| PRD alignment                | pass     | Read-only structured canon supports the creator-first World-bible direction.                                 |

## Findings

### BLOCKING

- [ ] `docs/changes/2026-07-14-storybook-ui-workbench/tasks.md:2` - The source includes `cd5604a`, but the stacked Storybook Change remains `in_progress` with review and manual acceptance pending. Integrating this branch would silently integrate both Changes. Recommendation: review and integrate Storybook first, or explicitly treat both Changes as one authorized integration unit.
- [ ] `docs/changes/2026-07-14-public-starter-world/tasks.md:50` - Manual confirmation of the populated catalog and structured detail remains pending. Recommendation: after remediation, confirm the listed desktop/mobile walkthrough or explicitly accept the gap.

### REQUIRED

- [ ] `apps/frontend/src/workspace/WorkspacePage.tsx:21` - World queries use account-agnostic cache keys, and sign-out clears only the session query. A private catalog or detail cached for one account can render briefly for the next account in the same browser while React Query refetches. Recommendation: scope World query keys to account identity and/or purge all account-owned World queries whenever the authenticated account changes; add an account-switch regression test for catalog and detail.
- [ ] `apps/frontend/src/worlds/tuyauWorldApi.ts:29` - Catalog and detail map `401` responses to generic network failures, leaving stale account state active instead of revalidating or ending the expired session. Recommendation: classify unauthorized responses, connect them to the shared session lifecycle, and test both routes after server-session expiry.
- [ ] `apps/backend/database/migrations/1784053200000_create_world_catalog_tables.ts:46` - Independent foreign keys allow a Character's `world_id` and `location_id` to point at different Worlds; the detail DTO then exposes the mismatched Location. Recommendation: add a database-level same-World constraint and a regression test that rejects cross-World assignment.
- [ ] `apps/backend/tests/functional/world_catalog.spec.ts:103` - LC-002/S2/R1-S2 claims unknown and inaccessible Worlds are indistinguishable, but the test exercises only an unknown slug. Recommendation: create another account's private World and assert the same minimized `404` response.
- [ ] `apps/backend/tests/functional/world_catalog.spec.ts:108` - LC-002/S2/R1-S3 claims an exact reconciled graph, but the test checks counts and two repaired fields without inserting stale rows or validating the complete configured graph. Recommendation: add stale Location/Character fixtures, assert their removal, and verify every seeded stable field or narrow the Scenario claim.
- [ ] `apps/frontend/src/worlds/WorldDetailPage.tsx:17` - The detail error state says “Try again” but offers no retry action. Recommendation: provide a `refetch` control with pending state and a recovery test.

### SUGGESTION

- None.

## Verification Evidence

| Command / Scenario                                                | Evidence Type                  | Requirement / Scenario                  | Result    | What It Proves                                                                   |
| ----------------------------------------------------------------- | ------------------------------ | --------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| Backend full suite against `lorecraft_test_codex`                 | focused automated tests        | LC-001 and LC-002 backend Scenarios     | 36 passed | Current persistence, auth, API, and seed assertions pass on isolated PostgreSQL. |
| `npm run test --workspace @lorecraft/frontend`                    | focused automated tests        | LC-001 and LC-002 frontend Scenarios    | 50 passed | Current route, state, and component behavior passes.                             |
| `npm run test:storybook`                                          | browser component tests        | Catalog/detail states and accessibility | 17 passed | Storybook interaction and accessibility checks pass.                             |
| `npm run lint`, `npm run typecheck`, `npm run build`              | broad supporting gates         | Full source                             | passed    | Static quality and production builds pass.                                       |
| `npm audit --omit=dev` and credential-pattern diff scan           | security checks                | Dependency and secret surface           | passed    | No reported production dependency vulnerability or credential-like diff value.   |
| `git merge-tree --write-tree develop change/public-starter-world` | integration check              | Branch mergeability                     | passed    | Git produced a clean merge tree.                                                 |
| Prior automated Chromium walkthrough at 1440x900 and 390x844      | deterministic browser evidence | LC-002/S1/R1-S1; LC-002/S2/R1-S1        | passed    | Seeded catalog/detail rendered without horizontal overflow.                      |

## Review Bundle

- Source branch/ref: `change/public-starter-world`
- Reviewed source commit: `cb4aa3eb082bf58bbab4154b5f1c0ba92f294546`
- Target branch/ref: `develop` at `2e75b375b50f36566af94acbf405ed3681929d60`
- Merge base: `2e75b375b50f36566af94acbf405ed3681929d60`
- Source-only commits: `cd5604a`, `cb4aa3e`
- Target-only commits: none
- Changed files: 59 across Storybook and Public Starter World Changes
- Diff stat: 6,088 insertions, 494 deletions
- Conflict check: clean tree `88a9cf56a2be0e6f7baa419fefdc8527c8ee47cc`
- Dirty state: source repository clean before review-artifact reconciliation; unrelated outer-vault changes preserved
- Branch policy: `change/` source correctly targets local `develop`; integration is blocked by its unfinished stacked dependency

## Discovery Wave

| Pass                               | Reviewer                                       | Result   | Notes                                                                                                      |
| ---------------------------------- | ---------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| Artifact truth                     | delegated fresh-context pass plus orchestrator | findings | Stacked Change, manual acceptance, evidence, and stale-ledger issues found.                                |
| Code diff                          | delegated fresh-context pass plus orchestrator | findings | Integrity, session lifecycle, cache isolation, and recovery findings validated.                            |
| Verification coverage              | orchestrator                                   | findings | Fresh suites pass; missing negative-path evidence remains.                                                 |
| Security                           | orchestrator                                   | findings | Backend auth is enforced and DTOs minimize identity, but client cache/session isolation needs remediation. |
| UI / visual identity               | orchestrator                                   | findings | Responsive evidence passes; detail retry affordance is incomplete.                                         |
| Docs / release communication / PRD | orchestrator                                   | pass     | Public docs and product direction agree with the slice.                                                    |
| Integration readiness              | delegated fresh-context pass plus orchestrator | blocked  | Merge tree clean; stacked unfinished Change and manual acceptance block closeout.                          |

## Consolidated Remediation

- Root causes addressed: stale LC-001 acceptance wording and contradictory selected-Change closeout wording.
- Safe-fix batch: artifact reconciliation only.
- Deferred or unsafe findings: relational constraint, account/session query lifecycle, authorization evidence, seed evidence, and detail recovery require `/sdd-apply`.
- Affected verification union: backend full suite, frontend full suite, Storybook, lint, typecheck, build, browser walkthrough, and repeated independent review.
- Regression-focused rereview: artifact references and source-repository dirty state rechecked after reconciliation.
- New regressions introduced by remediation: none.

## PR / Merge Readiness

- Source branch: `change/public-starter-world`
- Reviewed source commit: `cb4aa3eb082bf58bbab4154b5f1c0ba92f294546`
- Target branch: `develop`
- Conflict check: clean
- Commit state: implementation committed; safe review-artifact reconciliation included in a local review commit
- PR status: not requested
- Merge status: blocked

## Review Log

- 2026-07-14: Independent review completed; changes requested.
