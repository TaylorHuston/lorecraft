# Review: Interactive Adventure Turns

## Verdict

ready

This review preserves the pre-close assessment of the committed turn implementation and UI/remediation work. The refreshed review remediated the missing turn-submission provider disclosure, incomplete composer tab semantics, and one stale Ember secondary control. The owner accepted the remaining live-provider/manual walkthrough risk before the later authorized local merge and folder closeout; it is not a claim that the walkthrough occurred.

## Gate Scorecard

| Gate | Result | Notes |
|---|---|---|
| Change artifacts and status | pass | At review time the Change was `in_review` and the reviewed UI/remediation batch was committed as `0ed8f90`; it later moved to closed history. |
| Requirements and scenarios | pass | Automated evidence covers reset, recovery, concurrency, disclosure, and current composer semantics. |
| Story and reverse traceability | pass | Orphan audit reports zero missing implementation or verification references; generated Tuyau registry output is the only expected ownership exclusion. |
| Code and security | pass | Narrator context excludes private Character knowledge and mutable state. A direct reflection of private Guide text is rejected before extraction, metadata recording, or publication. |
| Database and API verification | pass | Guarded disposable-Neon suite covers reset of all Adventure-owned state, non-publication on reflected Guide text, and owner retry/discard. |
| Browser verification | pass | Deterministic Playwright covers turn lifecycle behavior; direct current Storybook desktop/mobile inspection covers Ember controls, provider notice, composer semantics, and no-overflow/error-overlay checks. |
| Supporting gates | pass | Lint, typecheck, build, generated-contract check, frontend suite, Storybook, and container/image/deployment contracts pass. |
| Documentation and private Idea truth | pass | Change design and private visual identity now agree with Ember and the approved removal of Guide-specific help. |
| Manual and live-provider acceptance | pass with accepted risk | The owner explicitly authorized local integration and Change closeout on 2026-07-19 before the live-provider/manual walkthrough. No provider payload, raw Guide, or prompt is retained. |
| Branch and merge readiness | pass | The source merged locally into `develop` as `78033ab`; the managed closeout moved this Change to closed history. No push, PR, deployment, or production action was performed. |

## Findings

### Resolved

- [x] Private Character knowledge and mutable NPC state no longer enter the narrator prompt. The publication boundary rejects a direct reflection of the private Guide before it can reach extraction, `model_calls`, Story, or revisions.
- [x] Reset after a completed turn now proves player state, every Adventure-owned NPC state, and completed-turn lineage are rebuilt from the frozen source.
- [x] Owner retry/discard is covered through the HTTP contract. Browser coverage proves failure recovery, pending reload, and same-owner concurrent-tab behavior while preserving Player/Scene state on desktop and mobile.
- [x] LC-003 evidence and the private Lorecraft Idea documents no longer describe interactive turns as deferred.
- [x] Turn submission now discloses that the turn and relevant Adventure/World context are processed by Lorecraft's configured AI provider, as required by the provider-boundary ADR.
- [x] The Act/Guide controls retain their approved tab appearance but now use native keyboard-operable semantic toggle buttons rather than incomplete ARIA tabs.
- [x] Return to World uses the borderless raised-secondary Ember treatment on desktop and mobile.

### Accepted Closeout Risk

- [x] The owner accepted the missing live-provider Act/Guide and desktop/mobile walkthrough evidence for this local integration on 2026-07-19. This does not claim that walkthrough was performed.

## Verification Evidence

| Command / Scenario | Result | What It Proves |
|---|---|---|
| Guarded disposable-Neon backend suite | pass | Reflected short Guide text does not publish narration or leave extractor/model-call evidence; reset rebuilds player/NPC state and removes completed lineage; retry/discard authorization works. |
| `npm run test --workspace @lorecraft/frontend` | pass; 129 tests | Client lifecycle, accessibility, typed API, and workbench coverage. |
| Deterministic Playwright Adventure journey | pass; 3 projects | Act, Guide, Pass, reload, concurrent tabs, retry/discard, reset, owner isolation, and desktop/mobile context. |
| `npm run lint`, `npm run typecheck`, `npm run build` | pass | Repository static correctness and production bundles. |
| `npm run verify:contracts` | pass | Generated client contract stays synchronized. |
| `npm run test:storybook` | pass; 81 tests | Documented component and responsive states. |
| `npm run test:containers`, `npm run test:images`, `npm run test:deployment` | pass; 6, 1, and 10 tests | Current deployment, container, and image-release contracts. |
| `sdd validate ... --json` | pass; 0 errors, 2 scope warnings | Change/Epic structure is valid; warnings record the intentional single primary user path. |
| `sdd_orphan_audit.py ... --changed-from develop --epic lc-003-adventure-play` | pass | No missing owned implementation or verification references. |

## Review Bundle

- Source branch/ref: `change/interactive-adventure-turns`
- Committed implementation watermark: `0ed8f90a829a2764085804b3f46e2a98eb823256`
- Target branch/ref: `develop`
- Merge base: `d389ccd6d7b93e4fa6b11fb82cd9eec1efbd0e79`
- Source-only commits reviewed: `a6a911f`, `33870e4`, `ff1d2ec`, `4290467`, `623ec42`, `0ed8f90`
- Conflict check: clean for committed source (`git merge-tree --write-tree develop HEAD` -> `3e1993a9eca90e9e4c86e64765fca6923c327c68`)
- Dirty state: clean.
- Private supporting documentation: the Lorecraft visual-identity note is reconciled in vault backup commit `569ec71aa`; unrelated vault state remains untouched.
- Branch policy: correct `change/*` source targeting non-production `develop`; local merge and closeout were completed with owner authorization. No push, PR, deployment, or production action was performed.

## Manual UI Confirmation

- Status: accepted by owner for local integration on 2026-07-19
- Route: development `/adventures/<owned-ready-adventure-id>`
- Setup: signed-in owner, seeded Stormbound Chapel, ready Adventure, and a live provider.
- Steps: submit an Act and a private Guide; observe pending/completion; reload while resolving; exercise a failed turn's retry/discard state; confirm Player/Scene updates and responsive layout on desktop and mobile.
- Expected result: successful turns append one chronological narration and accepted bounded state only; failures leave prior Story and context intact; private Guide text is never shown verbatim; controls remain clear and usable.

## Review Log

- 2026-07-19: Initial independent review returned `changes-requested` for private-context publication, reset, recovery/concurrency, and documentation gaps.
- 2026-07-19: A current full independent review remediated the provider disclosure, composer semantics, Ember Return control, and visual-documentation drift. Focused/frontend/broad checks and direct desktop/mobile rendering pass. `0ed8f90` commits the reviewed application batch. The owner explicitly accepted the remaining live-provider/manual walkthrough gap for local integration and Change closeout; the gap remains recorded as an accepted risk rather than completed evidence.
- 2026-07-19: Local integration merged as `78033ab`; `sdd change close` moved the Change to closed history. No push, deployment, or production promotion was performed.
