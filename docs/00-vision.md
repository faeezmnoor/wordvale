# WordVale — v1 Vision

## Goal

Turn any word list into a playable, delightful crossword in under a minute. The problem solved:
making a crossword by hand is tedious, and existing generators feel like utilities, not games.
WordVale makes the *making* instant and the *playing* feel like a cozy pixel game.

## Product shape

- **Puzzle type:** word-bank fill-in (kriss-kross). Player gets a grid of empty slots plus the word
  bank, and places words by length and letter intersections. No clues required, so it works with
  ANY word list — study vocab, baby names, groceries, in any language with Latin letters (v1).
- **Inputs (v1):** typed/pasted text · "generate for me" themed packs (bundled, offline) ·
  screenshot OCR (tesseract.js, client-side) · voice (Web Speech API, where supported).
- **Flow:** Home (puzzle library, or first-run CTA) → input → generate → **review & confirm**
  (see the grid, regenerate for a new layout, edit words) → play → score/coins → library.
- **No backend.** Puzzles, history, wallet, settings all persist in the browser
  (IndexedDB + localStorage). Nothing leaves the device.

## Experience pillars

1. **Cozy pixel warmth** — Stardew-Valley-inspired: earthy palette (never pure #000/#FFF), real
   pixel fonts, sprites and icons, gentle motion. Themes may re-skin accents while the system stays consistent.
2. **Generosity over friction** — failures are helpful ("we could fit 9 of 11 words — drop these 2?"),
   never dead ends. A player at 0 coins can always finish a puzzle.
3. **Juice on every win** — placing a word pops, coins fly to the wallet, finishing a puzzle
   celebrates, some solves open a slot-machine bonus.

## Gamified economy (Iteration 2, constants in one config)

- **Score** per solved puzzle, scaled by word count/length.
- **Coins** scattered on word tiles, collected as words are solved.
- **Letter reveal** costs coins, price escalating within a puzzle session.
- **Slot machine bonus** unlocked by some completions — jackpot or coin bonus.
- Backlog (gated at Iteration-2 plan): streaks, daily puzzle, collectibles, perfect-solve badges.

## Engineering pillars

- `src/engine/` is a pure, seeded, headless generator — the product's riskiest code is its most tested.
- Generation runs in a Web Worker with a time budget; "regenerate" is just a new seed.
- A word list is pre-checked for connectivity (shared letters) so failure is fast and explainable.

## What v1 is NOT

No clue-based crosswords, no accounts/sync/multiplayer, no non-Latin scripts, no monetization,
no server. These are consciously out, not forgotten (see backlog.md).

## Definition of v1 done

All 4 input methods live; generate→review→play loop solid with graceful failure UX; economy fun
and softlock-free; pixel design system applied everywhere; `bun run check` + `/qa` green; Faeez
has played it and shipped each iteration through the gates in [workflow.md](workflow.md).
