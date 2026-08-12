# Iteration 1 — Core Loop (full cycle) · Stage 1 Plan

**Goal:** a stranger can paste a word list (or pick a theme) and be playing a good crossword
two clicks later — with keyboard-first play and graceful failure when a list can't interlock.
**Problem solved:** this iteration IS the product; everything after it is seasoning.

## Slices (each ends with `bun run check` green, `/review` pass, async G-accept note)

### a. Generator engine (pure, seeded) + debug harness
The riskiest code, built first, headless.
- **Algorithm:** best-of-N randomized greedy placement with backtracking. Sort words by
  connectability (shared-letter degree, then length desc). Place first word centered; each next
  word tries every legal intersection with placed words, scored by intersections created, grid
  compactness, and balance (aspect ratio near 1). Dead-end → backtrack up to K steps; restart
  with a new seed ordering if exhausted. Run N candidate builds (time-budgeted), keep the
  best-scoring grid.
- **Legality rules:** crossing letters must match; no non-crossing adjacency (a placed word may
  not touch a parallel neighbor cell unless it's a legal crossing); every word connected to the
  main component; grid ≤ 21×21 before compaction.
- **Quality metrics** (used to rank candidates and to decide "good enough"): % words placed,
  intersections per word (target ≥ 1.3), grid density, bounding-box balance.
- **Determinism:** seeded PRNG (mulberry32) injected; same (words, seed) → same grid, tested.
  "Regenerate" = same words, next seed.
- **Web Worker:** generation runs off-main-thread with a 2s budget; returns best result so far
  plus a `complete | partial | failed` status.
- **Pre-checks (fail fast, before any search):** normalization (uppercase, strip diacritics to
  Latin, reject non-A–Z after normalization, dedupe, trim); word count 2–20; length 2–15;
  connectivity graph — any word sharing zero letters with all others is reported unplaceable
  immediately.
- **Difficulty-proofing (owner comment #2):** engine output is pure placement data
  (word, row, col, dir) — no assumptions that the word bank is visible. Presentation decides
  what the player sees.
- **Debug harness:** a dev-only route rendering any (words, seed) → grid + metrics, for tuning.
- **Tests:** property-based — for 500 random valid word lists: all placements legal, deterministic
  under fixed seed, no adjacency violations; plus fixture tests for every failure class.
- **Accept:** harness generates legal grids for all bundled packs; 500-case property suite green.

### b. Text input → generate, with failure UX
- Paste/type words (one per line or comma-separated); live validation chips (too short, non-Latin,
  duplicate) as you type — problems visible before Generate is pressed.
- **Failure states, each with plain-language message + suggested action:**
  1. *Total failure / disconnected words* → "These words don't share enough letters to link up"
     + list the isolates + offer to drop them or edit.
  2. *Partial placement* → "We fit 9 of 11 — drop these 2 and play?" (one-tap accept).
  3. *Timeout with partial* → same as partial, framed as "best layout we found".
  4. *Too few/many words, bad characters* → inline validation before generation.
- **Accept:** every failure class reachable in QA via a documented fixture list and renders its
  designed state (no dead ends, no raw errors).

### c. Review → confirm → regenerate screen
- Shows the generated grid (letters hidden, slots visible), word count, size, quality note.
- Actions: **Play**, **Regenerate** (new seed, instant re-render), **Edit words** (back to input,
  list preserved). Regenerate history is session-local (no storage until Play).
- **Accept:** regenerate produces a visibly different legal layout ≤ 2s; edit round-trips the list.

### d. Play screen — keyboard-first (owner comment #3), responsive (owner comment #1)
- **Input model (hard requirements):** click/tap a slot cell to focus its word (highlight the
  run); type letters directly — auto-advance within the word; **Tab / Shift-Tab cycles words**;
  arrow keys move across the grid; Backspace clears and retreats; typing over a crossing updates
  both words; Enter checks the focused word. On touch: tapping a cell raises the soft keyboard
  (hidden input technique); word bank chips remain tappable as the coarse-pointer path.
- **Solve model:** a word is solved when all its cells match; solved cells lock (meadow green,
  stepped pop). Wrong letters stay neutral in v1 (no red mark) — checking is explicit.
- **Responsive layout:** grid renders its **bounding box** (not the raw 15×15), centered, tile
  size = clamp(24px, fit-to-viewport, 48px) at integer pixel sizes; ≥ 900px: grid + side panel;
  < 900px: grid on top, word bank as wrapping chips below; no horizontal page scroll at any width.
- **Fun bar (owner comment #4):** puzzle-complete celebration (pixel confetti + banner), tile-pop
  on every solve, idle sprite in the header, decorative flora corners on panels. Sound effects
  stubbed behind a mute-default toggle (assets land here only if slice time allows, else Iter 4).
- **Accept:** a full puzzle is playable start-to-finish with keyboard only, and separately with
  touch only; layout audited at 360px / 768px / 1280px widths.

### e. "Generate for me" — bundled themed packs
- ≥ 8 packs × ≥ 3 lists each (JSON in `src/data/`): Animals, Food & Cooking, Travel, Malaysia,
  Movies & TV, Science, Sports, Fantasy. Every list pre-verified generatable by a build-time test.
- Theme picker screen feeds the same pipeline as typed input.
- **Accept:** every bundled list generates successfully in CI (property test over packs).

### f. Persistence + home/library
- IndexedDB (schema v1, versioned): puzzles (words, seed, placements, fill state, status),
  wallet stub. localStorage: settings.
- Home: library grid of saved puzzles (resume/replay/delete) or first-run CTA → create flow.
  Mid-puzzle refresh resumes exactly.
- **Accept:** create → play half → refresh → resume; delete works; first-run CTA state renders.

## Slice order & dependencies
a → b → c → d (d needs c's grid data) → e (needs b's pipeline) → f (needs d's fill state).
e can interleave after b if d drags.

## Out of scope (locked at owner approval)
Economy/coins beyond the visual stub (Iter 2), OCR (Iter 3), voice (Iter 4), difficulty
mechanics (backlog — engine merely stays neutral to them), dark mode, sharing, clue layers.

## Open questions for Faeez (at this gate)
1. **Wrong-letter feedback:** v1 keeps checking explicit (Enter/`Check` button) rather than
   auto-marking errors red — matches "cozy, not punishing". OK, or prefer instant feedback?
2. **Packs list:** happy with the 8 themes above? Anything you want added/removed (e.g. Kids,
   Islamic terms, Bahasa Melayu pack)?
3. Difficulty brainstorm is parked in backlog.md with 7 candidate mechanics — skim when
   convenient; nothing in this iteration blocks any of them.

## Risks
- **Grid quality is subjective** — mitigation: quality metrics + debug harness make tuning
  cheap; regenerate is one tap.
- **Keyboard focus model on mobile browsers is fiddly** (hidden-input soft-keyboard technique)
  — mitigation: word-bank chips remain a full alternate input path; QA on real iOS Safari.
- **Slice d is the biggest** — mitigation: keyboard model specced precisely in Stage 3 before
  build; chips path ships first within the slice.

## Council findings

*(appended after the full `/council-review` gate)*
