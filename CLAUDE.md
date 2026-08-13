# WordVale

Browser-only crossword web app: paste/speak/screenshot a word list → generate a word-bank
fill-in (kriss-kross) puzzle → review/confirm/regenerate → play. No backend; all data in
IndexedDB (puzzles/history) + localStorage (settings/wallet). Pixel-art, Stardew-Valley-inspired,
gamified (score, coins, letter reveals, slot-machine bonus).

> **Project status: paused (2026-08-12) after Iteration 1 shipped.** It is live and open
> source. Future ideas are grouped and ready to plan in [ROADMAP.md](ROADMAP.md); the closing
> retro is in [docs/iterations/01-core-loop/06-retro.md](docs/iterations/01-core-loop/06-retro.md).

## Workflow — read first

This project runs a strict 6-stage gated cycle. **Before doing anything, read
[docs/workflow.md](docs/workflow.md) (the contract) and [docs/workflow-state.md](docs/workflow-state.md)
(where we are).** Do not skip gates; do not add scope mid-iteration (park it in docs/backlog.md).

## Commands

```bash
bun install
bun run dev      # vite dev server
bun run check    # tsc -b + oxlint + bun test  — must be green before every commit
bun run test     # engine + unit tests only
bun run build    # production build
```

## Architecture rules

- `src/engine/` — PURE puzzle generator. No React, no DOM, no browser APIs, no `Math.random()`
  (seeded RNG passed in). Fully unit-testable headless. **Never** import from `ui/` or `state/`.
- `src/state/` — storage (IndexedDB/localStorage) and the economy. All game/economy constants in
  one tunable `economy.ts`.
- `src/ui/` — React screens/components. Pixel design system per `docs/design/design-system.md`.
- `src/data/` — bundled themed word packs (JSON).
- `tests/engine/` — property-based + unit tests, run on every slice. `tests/e2e/` — Playwright/gstack `/qa`.

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

## Owner communication

Plain language, always: state the goal and the problem solved. G-accept reviews are async and
gate SHIP, never development momentum. Design taste bar: no pure #000/#FFF, real (pixel) fonts,
imagery + icons, elegant — nothing unstyled at an owner gate.
