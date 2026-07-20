# ADR: Provider-Neutral AI Boundary

- Status: Accepted
- Date: 2026-07-17
- Related changes: `docs/changes/closed/2026-07-16-private-adventure-foundation/`, `docs/changes/2026-07-18-audit-hardening/`, and `docs/changes/2026-07-18-interactive-adventure-turns/`
- Related Epics / Stories: `LC-003/S1/R3` and `LC-003/S2/R3`

## Context

Lorecraft will use language models for Adventure narration and, later, creator-facing analysis and assistance. Development and playtesting must work with local models, while production may use hosted providers or gateways. Provider protocols, credentials, response shapes, and generation controls must not become domain contracts or leak into browser and future mobile clients.

The implemented operations use narrow backend opening/turn narration and state-extraction interfaces with OpenAI-compatible HTTP adapters.

## Decision

Define each AI capability through a backend-owned operation interface with structured Lorecraft inputs, normalized outputs, and application-level failures. Domain and application services depend on those interfaces rather than provider SDKs or wire formats.

Provider adapters own authentication, protocol translation, provider-specific settings, response bounds, response parsing, and failure normalization. The initial adapter uses the OpenAI-compatible `/chat/completions` protocol and server-side environment configuration, but that protocol is an adapter choice rather than Lorecraft's permanent AI contract.

Browser, mobile, and other clients SHALL call Lorecraft application APIs and SHALL NOT call model providers directly. Before a user submits private World or player context for model processing, the client SHALL explain that Lorecraft sends that context to the configured AI provider.

Normal operation SHALL persist metadata-only model-call evidence. Provider/model identity, bounded settings, timing, status, retry relationships, usage, size/hash data, and normalized failures may be retained; assembled prompts, provider request messages, raw provider responses, credentials, and authorization material SHALL NOT be persisted or logged. Accepted narration remains Adventure-owned product content rather than operational evidence. Any future raw-content capture requires a separate decision covering necessity, consent/disclosure, privileged access, encryption, expiry, purge, and backup behavior.

## Options Considered

### Option 1: Backend Operation Interfaces With Provider Adapters

- Summary: Keep Lorecraft-specific AI contracts stable while adapters translate to local providers, hosted providers, or gateways.
- Pros: Provider portability, deterministic fakes, centralized validation and security, and reuse across clients and workers.
- Cons: Requires adapter maintenance and may expose only a deliberate subset of provider-specific capabilities.

### Option 2: Provider SDK Types In Application Services

- Summary: Let use cases depend directly on one provider or gateway SDK.
- Pros: Fast access to provider features and less initial translation code.
- Cons: Couples product behavior, errors, and tests to one vendor and makes local-model substitution harder.

### Option 3: Clients Call Providers Directly

- Summary: Send prompts from the web or mobile client to the selected model endpoint.
- Pros: Removes one backend hop and can simplify prototypes.
- Cons: Exposes credentials and private context, duplicates orchestration across clients, and bypasses authoritative persistence, validation, and evidence controls.

## Consequences

- Positive: Lorecraft can test with local OpenAI-compatible models and adopt hosted providers without changing Adventure domain services or client contracts.
- Positive: Prompt assembly, response validation, failure handling, evidence minimization, and credential redaction remain centralized and testable.
- Negative: Provider-specific features require explicit adapter capabilities rather than leaking through an untyped options object.
- Negative: Streaming, multimodal input, tool use, or multi-model workflows may require operation-specific interface evolution.
- Follow-up: Add new AI operations as narrow interfaces; do not turn `StoryGenerator` into a universal provider abstraction. Revisit raw-content capture only when a concrete debugging or regulated-audit need justifies the complete privacy lifecycle.

## Validation

Unit and production-path tests prove deterministic prompt assembly, bounded response handling, normalized failures, abort handling, metadata-only persistence/logging, and credential redaction. The supervised Playwright journey exercises the production worker through a fake OpenAI-compatible endpoint; live-provider playtests may prove portability but must not depend on retaining raw provider bodies.

## Reconsider When

- A required model capability cannot be represented cleanly through operation-specific interfaces.
- A managed gateway provides materially better routing, policy, observability, and portability without becoming the domain contract.
- OpenAI-compatible behavior diverges too much across selected providers to remain a useful first adapter.
- A future client has a justified direct on-device inference mode with an equivalent privacy and persistence boundary.
