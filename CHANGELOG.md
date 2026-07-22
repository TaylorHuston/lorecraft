# Changelog

All notable user-facing changes to Lorecraft will be documented in this file.

The format is based on Keep a Changelog 1.1.0.

## [Unreleased]

### Added

- World authors can create, edit, and delete complete Character Cards, including their initial Adventure mood, status, and memory.
- Adventure Scene panels now let owners inspect a complete development/debug card for each NPC currently present.
- Account creation, sign-in, persistent browser sessions, sign-out, and a protected Lorecraft workspace.
- An authenticated World catalog with a shared read-only `Stormbound Chapel` starter World.
- Structured World detail for canonical Locations and complete development/debug Character Cards, including private Character knowledge for authorized development readers; player-safe disclosure remains deferred.
- Private Adventures created from a frozen World version, with player identity and visible starting Scene context.
- Durable Game Master openings that survive reloads and can be resumed, retried after failure, reset, or deleted without changing the source World.
- Act, Pass, and private Guide turns that resolve asynchronously into new Adventure narration and visible current scene state.
- Portable private-hosting support with immutable application images, health checks, coordinated migrations, and application rollback safeguards.

### Changed

- Account access and World-browsing screens now share a consistent, responsive creator-focused interface.
- Password visibility, World recovery actions, Adventure forms, and destructive confirmations now use consistent accessible controls with clear pending and error feedback.
- Adventure creation now explains that player details and frozen World context are processed by the configured AI provider.
- Adventure openings now recover more safely from transient provider failures and interrupted workers.
- Route titles, destination focus, asynchronous opening announcements, and pending/failure heading structure now provide clearer assistive-technology context.

### Security

- Adventure model-call records now retain bounded operational metadata instead of assembled prompts or raw provider responses.
- Private Guide turn input is no longer reflected in generated Adventure narration.
