# Review: Interactive Adventure Turns

## Verdict

changes-requested

The committed turn implementation is sound and the current UI/remediation work passes its focused checks, but this review cannot mark the source ready for integration while 27 related application files remain uncommitted. The refreshed review also found and remediated the missing turn-submission provider disclosure, incomplete composer tab semantics, and one stale Ember secondary control. A live-provider and owner manual walkthrough remains required before merge or Change closeout; that is acceptance evidence, not an unresolved code-review finding.

## Gate Scorecard

| Gate | Result | Notes |
|---|---|---|
| Change artifacts and status | findings | The Change remains `in_review`, but its prior review watermark predates `623ec42` and the related uncommitted UI work. This record and the ledger now state the required commit/watermark step. |
| Requirements and scenarios | pass | Automated evidence covers reset, recovery, concurrency, disclosure, and current composer semantics. |
| Story and reverse traceability | pass | Orphan audit reports zero missing implementation or verification references; generated Tuyau registry output is the only expected ownership exclusion. |
| Code and security | pass | Narrator context excludes private Character knowledge and mutable state. A direct reflection of private Guide text is rejected before extraction, metadata recording, or publication. |
| Database and API verification | pass | Guarded disposable-Neon suite covers reset of all Adventure-owned state, non-publication on reflected Guide text, and owner retry/discard. |
| Browser verification | pass | Deterministic Playwright covers turn lifecycle behavior; direct current Storybook desktop/mobile inspection covers Ember controls, provider notice, composer semantics, and no-overflow/error-overlay checks. |
| Supporting gates | pass | Lint, typecheck, build, generated-contract check, frontend suite, Storybook, and container/image/deployment contracts pass. |
| Documentation and private Idea truth | pass | Change design and private visual identity now agree with Ember and the approved removal of Guide-specific help. |
| Manual and live-provider acceptance | pending user | Required before merge/closeout. No provider payload, raw Guide, or prompt is to be retained. |
| Branch and merge readiness | findings | The committed source merges cleanly into `develop`, but 27 related uncommitted files block an integration-ready watermark. No merge, push, or PR action is authorized. |

## Findings

### Resolved

- [x] Private Character knowledge and mutable NPC state no longer enter the narrator prompt. The publication boundary rejects a direct reflection of the private Guide before it can reach extraction, `model_calls`, Story, or revisions.
- [x] Reset after a completed turn now proves player state, every Adventure-owned NPC state, and completed-turn lineage are rebuilt from the frozen source.
- [x] Owner retry/discard is covered through the HTTP contract. Browser coverage proves failure recovery, pending reload, and same-owner concurrent-tab behavior while preserving Player/Scene state on desktop and mobile.
- [x] LC-003 evidence and the private Lorecraft Idea documents no longer describe interactive turns as deferred.
- [x] Turn submission now discloses that the turn and relevant Adventure/World context are processed by Lorecraft's configured AI provider, as required by the provider-boundary ADR.
- [x] The Act/Guide controls retain their approved tab appearance but now use native keyboard-operable semantic toggle buttons rather than incomplete ARIA tabs.
- [x] Return to World uses the borderless raised-secondary Ember treatment on desktop and mobile.

### Required Before Integration

- [ ] Commit the reviewed current worktree, then refresh the review watermark and rerun the staleness/conflict check. The current worktree has 27 related uncommitted application, documentation, tooling, and test files.

### Acceptance Evidence Pending

- [ ] Run one live-provider Act and private Guide walkthrough, recording only visible behavior and bounded metadata.
- [ ] Obtain owner confirmation of ready, pending, completed, and failed recovery states on desktop and mobile.

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
- Committed implementation watermark: `623ec422742957f94ffb3a60ea415ad4cd1b8b97`
- Target branch/ref: `develop`
- Merge base: `d389ccd6d7b93e4fa6b11fb82cd9eec1efbd0e79`
- Source-only commits reviewed: `a6a911f`, `33870e4`, `ff1d2ec`, `4290467`, `623ec42`
- Conflict check: clean for committed source (`git merge-tree --write-tree develop HEAD` -> `26110a7c16d07af42d1d02c775623d54fde5c0e5`)
- Dirty state: 27 related uncommitted source-repository files, including the current Ember/workbench UI, documentation, tests, review artifacts, and local browser-check tooling. This blocks an integration-ready review watermark. `.neon` remains unrelated and untouched.
- Private supporting documentation: the Lorecraft visual-identity note is reconciled in the vault working tree; unrelated vault state remains untouched.
- Branch policy: correct `change/*` source targeting non-production `develop`; no PR, merge, push, deployment, or closeout was authorized.

## Manual UI Confirmation

- Status: pending user
- Route: development `/adventures/<owned-ready-adventure-id>`
- Setup: signed-in owner, seeded Stormbound Chapel, ready Adventure, and a live provider.
- Steps: submit an Act and a private Guide; observe pending/completion; reload while resolving; exercise a failed turn's retry/discard state; confirm Player/Scene updates and responsive layout on desktop and mobile.
- Expected result: successful turns append one chronological narration and accepted bounded state only; failures leave prior Story and context intact; private Guide text is never shown verbatim; controls remain clear and usable.

## Review Log

- 2026-07-19: Initial independent review returned `changes-requested` for private-context publication, reset, recovery/concurrency, and documentation gaps.
- 2026-07-19: A current full independent review remediated the provider disclosure, composer semantics, Ember Return control, and visual-documentation drift. Focused/frontend/broad checks and direct desktop/mobile rendering pass. Verdict is `changes-requested` solely until the 27 related uncommitted source files are committed and the review watermark is refreshed; live-provider and owner manual acceptance remain pending after that technical gate.
