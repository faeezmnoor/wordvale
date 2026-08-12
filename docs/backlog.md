# Backlog — scope parking lot

Ideas land here the moment they appear; nothing enters a running iteration after its Stage-1 scope lock.
Each entry: one line, plain language, why it might matter.

## Difficulty (owner-pinned 2026-08-12 — brainstorm, decide no earlier than Iteration-2 plan)

Faeez: full word bank on the side may make puzzles too easy. Candidate mechanics:

- **Hidden word bank / hints-only** — show only word lengths (classic kriss-kross hard mode).
- **Timed modes** — countdown or "beat your best" per puzzle.
- **Limited placements** — wrong placement costs a life/coins, so you must reason before trying.
- **Progressive reveal** — word bank starts hidden; each solved word reveals the next few.
- **First-letter-only bank** — bank shows `H······` style masks instead of full words.
- **Difficulty tiers at generation** — denser grids, more intersections, longer words = harder.
- **Daily hard puzzle** — one bank-hidden puzzle per day for streak players.

Engine constraint for Iteration 1: keep placement data separate from presentation so any of
these can bolt on without engine changes.

## Gamification (gate at Iteration-2 plan)

- Daily puzzle with streak counter — habitual return loop (Wordle-style).
- Collectible pixel critters/sprites earned by milestones — Stardew-style collection joy.
- Seasonal themes (spring/summer/fall/winter palettes) rotating with real calendar.
- Combo multiplier for solving words back-to-back without hints.
- "Perfect solve" badge (no reveals used) with bonus coins.

## Features (post-v1 candidates)

- Clue layer (user-typed or dictionary definitions) on top of fill-in mode — was consciously deferred.
- Share/export a puzzle as a link or image.
- Multiple grids per word list ("play it again, different layout") — cheap because generator is seeded.
- PWA install + full offline mode.

## Tech

- Property-based fuzzing corpus for the generator beyond Iteration-1 tests.
