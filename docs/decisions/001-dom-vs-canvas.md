# ADR 001 — Grid & sprite rendering: DOM, behind a `<Grid>` boundary

**Status:** accepted (2026-08-12) · **Timebox honored:** one-day spike, per council demotion
(this was deliberately NOT a gating investigation — see Iteration-0 council findings #1).

## Decision

Render the puzzle grid, tiles, and sprites with **DOM/CSS** (`image-rendering: pixelated`,
CSS grid, `steps()` keyframe animations), not `<canvas>`. All grid rendering stays behind a
single `<Grid>` component boundary so the choice is reversible in days, not weeks. Design
tokens live in CSS custom properties and are renderer-agnostic.

## Spike evidence (in-stack preview, 2026-08-12)

- 15×15 CSS-grid of 32px tiles + word bank + header rendered and interactive in the real
  Vite+React app (`src/App.tsx`).
- Stepped tile-pop (`steps(3)`), coin-bump (`steps(4)`) animations ran at **~120fps** in headless
  Chromium (`browse perf` + rAF sampling: fps~122); zero console errors.
- Pixel fonts (Pixelify Sans, Silkscreen) and SVG pixel-art sprite (coin) rendered crisp at DPR 1;
  native-DPR check on Faeez's device happens at the owner gate (docs/gates.md).
- Text-in-cells, focus/hover, accessibility, and hit-testing come free with DOM — all would be
  hand-rolled on canvas.

## Why not canvas

A ≤625-cell grid is trivially within DOM capability. Canvas's one real advantage here —
per-frame integer-snap control for pixel art under *animated* transforms at fractional DPR —
doesn't outweigh losing free text layout, accessibility, and React reconciliation for a grid of
interactive cells.

## Reversal triggers (revisit canvas if any fires)

1. Iteration-2 juice effects (coin arcs, confetti, slot machine) drop below **~55fps** on the
   reference device (Faeez's daily phone/laptop).
2. Visible shimmer/resampling on animated pixel art at fractional DPR that CSS
   (`image-rendering`, integer-snapped transforms) cannot eliminate.
3. Any future free-form particle/parallax feature where DOM node count per frame exceeds ~500.

If triggered: swap the internals of `<Grid>` (and only `<Grid>`) to a canvas renderer; design
tokens and all surrounding UI are unaffected.
