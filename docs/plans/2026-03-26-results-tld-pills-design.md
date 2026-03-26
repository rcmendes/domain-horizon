# Design: Results view — base-name rows with TLD pills

**Date:** 2026-03-26
**Status:** Approved

## Problem

The current generator results view renders each domain variant as a full-width card inside a tree structure. On wide screens the domain name (left) and status badge (right) are too far apart, making them hard to track visually. The tree lines add indentation and visual noise without meaningful benefit, especially when groups have only one variant.

## Solution

Replace the tree layout with a flat list of **base-name rows**. Each row shows the base name as a fixed-width left label and all TLD variants as compact inline pills on the same line.

```
voltstream    [.com  TAKEN]  [.io  FREE]  [.co  CHECKING…]
aquacharge    [.com  TAKEN]
silentsail    [.com  FREE]   [.net FREE]
```

## Layout

- Vertical stack of rows (`.domain-rows` list, `.domain-row` items)
- Each row: fixed-width label column (~160px, monospace, semibold) + wrapping pill zone
- No tree lines, no indentation, no full-width stretching

## Pills

Each pill represents one `base.tld` combo and is the selectable/interactive element (no separate checkbox).

| State | Visual |
|---|---|
| Default (unverified) | Ghost pill — subtle border, neutral bg |
| Selected | Primary-color border + faint primary tint bg |
| Checking | Ghost + CSS pulse animation |
| Available | Green border + faint green bg + `✓ Free` label |
| Taken | Muted red border + faint tint + `Taken` label |
| Selected + Available | Strong green bg |

Click = toggle selection.

## Component changes

| Before | After |
|---|---|
| `DomainGroup` | `DomainRow` — one `<li>` with label + pill list |
| `DomainLeaf` | `TldPill` — `<button>` with status styling |
| `.tree-container` / `.tree-branches` / `.tree-branch` / `.tree-line` / `.tree-leaves` / `.tree-leaf-card` / `.tree-group*` | Removed |
| `--tree-bg` / `--tree-border` CSS vars | Kept (reused as pill surface tokens) |

New CSS classes: `.domain-rows`, `.domain-row`, `.domain-row-label`, `.tld-pill`, `.tld-pill--selected`, `.tld-pill--available`, `.tld-pill--taken`, `.tld-pill--checking`.

## "Your latest run" header

Demoted to a small muted label above the row list (plain text, not a styled node), since the tree metaphor is gone.
