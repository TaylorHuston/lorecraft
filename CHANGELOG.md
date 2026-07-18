# Changelog

All notable user-facing changes to Lorecraft will be documented in this file.

The format is based on Keep a Changelog 1.1.0.

## [Unreleased]

### Added

- Account creation, sign-in, persistent browser sessions, sign-out, and a protected Lorecraft workspace.
- An authenticated World catalog with a shared read-only `Stormbound Chapel` starter World.
- Structured World detail for canonical Locations and Characters, including character descriptions, backgrounds, personalities, voices, and locations while withholding private Character knowledge from shared reader/player views.
- Private Adventures created from a frozen World version, with player identity and visible starting Scene context.
- Durable Game Master openings that survive reloads and can be resumed, retried after failure, reset, or deleted without changing the source World.

### Changed

- Account access and World-browsing screens now share a consistent, responsive creator-focused interface.
- Password visibility, World recovery actions, Adventure forms, and destructive confirmations now use consistent accessible controls with clear pending and error feedback.
