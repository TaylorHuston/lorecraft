# ADR: Provider-Neutral AI Boundary

- Status: Accepted
- Date: 2026-07-17
- Related change: `docs/changes/closed/2026-07-16-private-adventure-foundation/`
- Related Epics / Stories: `LC-003/S1`, especially `R3`

## Context

Lorecraft will use language models for Adventure narration and, later, creator-facing analysis and assistance. Development and playtesting must work with local models, while production may use hosted providers or gateways. Provider protocols, credentials, response shapes, and generation controls must not become domain contracts or leak into browser and future mobile clients.

The first implemented operation uses a backend `StoryGenerator` interface and an OpenAI-compatible HTTP adapter.

## Decision

Define each AI capability through a backend-owned operation interface with structured Lorecraft inputs, normalized outputs, and application-level failures. Domain and application services depend on those interfaces rather than provider SDKs or wire formats.

Provider adapters own authentication, protocol translation, provider-specific settings, response bounds, response parsing, and failure normalization. The initial adapter uses the OpenAI-compatible `/chat/completions` protocol and server-side environment configuration, but that protocol is an adapter choice rather than Lorecraft's permanent AI contract.

Browser, mobile, and other clients SHALL call Lorecraft application APIs and SHALL NOT call model providers directly. Persisted model-call evidence remains backend-owned and credential-redacted as required by the durable asynchronous work ADR; retention and debug-access policy require a separate decision.

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
- Positive: Prompt assembly, response validation, failure handling, and credential redaction remain centralized and testable.
- Negative: Provider-specific features require explicit adapter capabilities rather than leaking through an untyped options object.
- Negative: Streaming, multimodal input, tool use, or multi-model workflows may require operation-specific interface evolution.
- Follow-up: Add new AI operations as narrow interfaces; do not turn `StoryGenerator` into a universal provider abstraction. Decide model-call retention and privacy before production use with sensitive World content.

## Validation

Unit tests prove deterministic prompt assembly, bounded response handling, normalized timeout/provider/malformed/empty failures, truncation rejection, settings capture, and credential redaction. The supervised Playwright journey exercises the production worker through a fake OpenAI-compatible endpoint, and a live `gemma4:31b` playtest proves that the same adapter works with a local provider without changing the application contract.

## Reconsider When

- A required model capability cannot be represented cleanly through operation-specific interfaces.
- A managed gateway provides materially better routing, policy, observability, and portability without becoming the domain contract.
- OpenAI-compatible behavior diverges too much across selected providers to remain a useful first adapter.
- A future client has a justified direct on-device inference mode with an equivalent privacy and persistence boundary.
