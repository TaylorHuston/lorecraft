# Lorecraft Style Guide

Lorecraft extends the shared Taylor UI foundation with a creator-first world-bible identity. This document owns public, application-specific color roles; component details remain in the frontend token and CSS Module files.

## Color Roles

- Zinc surfaces and text remain the dominant application foundation.
- Burnished Orange `#E58A3A` is Lorecraft's identity and interaction color. It owns primary actions, links, selection, keyboard focus, the wordmark, canon-oriented eyebrows, and deliberate creator-owned emphasis.
- Deep Steel Blue `#3F6F99` is reserved for semantic information that must remain distinct from Lorecraft interaction and identity.
- Lorecraft does not currently use Deep Steel Blue as a filled-control background. Any future filled blue informational control must use `#FFFFFF` text and icons.
- Moss or storm green may represent persistent World truth only when that domain role is introduced explicitly. It is not a generic action or success color.
- Success, warning, and danger retain their conventional semantic colors and must not be replaced with identity or action colors.

## Token Mapping

| Role | Token | Value |
|---|---|---|
| Action and identity | `--action`, `--identity` | `#E58A3A` |
| Action foreground | `--action-foreground` | `#18130A` |
| Action hover | `--action-hover` | `#F2A15A` |
| Information | `--info` | `#3F6F99` |
| Keyboard focus | `--focus-ring` | `var(--action)` |

Components consume semantic tokens rather than raw palette values. The `--primary` and `--accent` aliases remain mapped to Lorecraft's orange identity.

## Application

- Authentication, navigation, links, focus, and creator actions remain Burnished Orange.
- Informational messages and indicators use Deep Steel Blue where color provides useful semantic distinction.
- Lorecraft branding, World-canon section eyebrows, and identity markers remain Burnished Orange.
- Danger, success, and warning treatments remain unchanged.

This is a token reconciliation, not a broader restyle. Existing layout, density, typography, surfaces, component shapes, and responsive behavior remain authoritative.
