# Lorecraft Style Guide

Lorecraft extends the shared Taylor UI foundation with a creator-first world-bible identity. This document owns public, application-specific color roles; component details remain in the frontend token and CSS Module files.

## Color Roles

- Ember uses neutral charcoal surfaces with a restrained copper identity.
- Filled creator actions use Ember copper `#9F5A29`; their text and icons are white.
- Readable copper text uses `#E19666`. It owns links, selection labels, the wordmark, canon-oriented eyebrows, and deliberate creator-owned emphasis.
- Ember's dark copper `#2F241E` remains available as an identity surface, not as text.
- Informational indicators use readable Ember copper rather than a separate filled-control color.
- Moss or storm green may represent persistent World truth only when that domain role is introduced explicitly. It is not a generic action or success color.
- Success, warning, and danger retain their conventional semantic colors and must not be replaced with identity or action colors.

## Token Mapping

| Role | Token | Value |
|---|---|---|
| Filled action | `--action` | `#9F5A29` |
| Action foreground | `--action-foreground` | `#FFFFFF` |
| Action hover and active | `--action-hover`, `--action-active` | `#8C4C22`, `#78411E` |
| Readable identity text | `--action-text`, `--identity` | `#E19666` |
| Identity surface | `--identity-surface` | `#2F241E` |
| Information | `--info` | `var(--action-text)` |
| Keyboard focus | `--focus-ring` | `#D1885C` |

Components consume semantic tokens rather than raw palette values. The `--primary` alias remains mapped to filled action; `--accent` remains mapped to visible identity text.

## Application

- Authentication and creator actions use filled Ember copper, while navigation, links, focus, and creator-owned labels use the readable copper role.
- Informational messages and indicators use readable Ember copper where color provides useful semantic distinction.
- Lorecraft branding, World-canon section eyebrows, and identity markers use readable copper.
- Danger, success, and warning treatments remain unchanged.

Shared controls follow the Ember component grammar: filled and destructive buttons are borderless semantic fills; secondary actions use raised surfaces; ghost actions remain transparent; and pointer-coarse devices promote controls to the 44px touch target. Existing layout, typography, and responsive behavior otherwise remain authoritative.
