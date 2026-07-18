# ADR: Portable Container Deployment Boundary

- Status: Accepted
- Date: 2026-07-18
- Related change: `docs/changes/2026-07-18-audit-hardening/`
- Related Epics / Stories: `LC-001/S1`, `LC-001/S2`, `LC-001/S3`, and `LC-003/S1`

## Context

Lorecraft currently runs from a developer laptop, but the browser application, API, Adventure worker, PostgreSQL database, and model provider already have distinct runtime responsibilities. The first persistent deployment is private and single-hosted, while future deployment may move to AWS or another container platform. Host-specific networking and provisioning must not become application architecture.

## Decision

Package Lorecraft as standard OCI images with one frontend gateway image and one backend image run as separate API and worker services. The frontend gateway serves the built SPA and proxies same-origin `/api` traffic to the API. The API and worker receive configuration and secrets at runtime, store no authoritative application data on local container filesystems, and use standard PostgreSQL and OpenAI-compatible network contracts.

Use Docker Compose as the first single-host orchestration adapter. Terminate private HTTPS outside the application containers and publish only the frontend gateway to host loopback; keep API and worker traffic on the private container network. Build immutable commit-SHA images in CI, promote only reviewed `main` images to the production target, and keep deployment an explicit operator action. Platform-specific ingress, secret storage, and orchestration may later map the same images to AWS or another compatible platform.

## Options Considered

### Option 1: Portable OCI Images With A Thin Host Adapter

- Summary: Build reusable frontend and backend images; use Compose and private overlay ingress for the initial host.
- Pros: Reproducible builds, deterministic rollback, no source build on production, and a direct path to managed container platforms.
- Cons: Requires container build, registry, health-check, secret-injection, and deployment automation.

### Option 2: Native Node And Web Services On The Host

- Summary: Install Node.js and a web server directly and supervise the API and worker with systemd.
- Pros: Fewer container layers and straightforward host debugging.
- Cons: Makes the host mutable, weakens build reproducibility, and creates more host-specific migration work for a future cloud deployment.

### Option 3: Deploy Directly To A Public Cloud Platform

- Summary: Skip the private single-host deployment and provision a managed public platform now.
- Pros: Managed ingress, secrets, scaling, and monitoring are readily available.
- Cons: Adds public exposure, provider infrastructure, and recurring operational scope before the private application needs them.

## Consequences

- Positive: The initial private deployment and a future cloud deployment share the same application images and process boundaries.
- Positive: Browser session authentication keeps its required HTTPS and same-origin `/api` topology.
- Positive: API and worker can be deployed and supervised independently without splitting PostgreSQL authority.
- Negative: The first production handoff must establish an image registry, Compose configuration, health checks, and an explicit migration workflow.
- Negative: Single-host releases use a brief maintenance window; zero-downtime or horizontal deployment remains deferred.
- Follow-up: Introduce platform-managed secrets, ingress, and orchestration only when a selected cloud target requires them. Add shared quota enforcement before horizontally scaling the API.

## Validation

CI must build the production images from a clean checkout and identify them by commit SHA. Container tests must prove the frontend serves SPA routes and proxies `/api`, the API exposes liveness and database readiness checks, and the worker starts and shuts down cleanly. The production handoff must prove private HTTPS access, secure session cookies, account sign-in, starter-World access, Adventure generation through the separately running worker, no LAN/public application listener, deterministic image rollback, and a database recovery drill using an isolated restored target.

## Reconsider When

- A managed deployment platform imposes a materially different image, ingress, or process contract.
- Horizontal API or worker scaling becomes necessary.
- The single-host maintenance window becomes unacceptable.
- Application-owned durable files or another stateful service become part of Lorecraft.
