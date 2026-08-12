# Iteration 1 — Stage 3 Tech Spec

Implements [01-plan.md](01-plan.md) + [02-design.md](02-design.md). Slices build in order
a→f against this spec; deviations go in the build log with reasons.

## Module map

```
src/
  engine/          # PURE (no React/DOM/browser/Math.random). Types, generator, prechecks, metrics.
    types.ts       # Word, Placement, Grid, GenResult, GenFailure, QualityMetrics
    rng.ts         # mulberry32(seed) → () => number
    precheck.ts    # normalize + validate + connectivity graph
    generate.ts    # placement search (below)
    metrics.ts     # scoring + quality phrase mapping
  worker/
    gen.worker.ts  # wraps engine; postMessage protocol below
  state/
    store.ts       # zustand: screen, currentPuzzle, wallet(coins), settings
    db.ts          # IndexedDB (idb-keyval NOT used; small hand-rolled wrapper, versioned)
    settings.ts    # localStorage read/write (sound, volumes)
  audio/
    sfx.ts         # WebAudio-synthesized one-shots (pluck/arpeggio/thud/ding/fanfare/click/tick)
    ambience.ts    # bundled loop, gesture-gated start, visibility pause
  ui/
    App.tsx        # screen switch on store.screen — NO router lib (4 screens, persistence covers resume)
    screens/       # Home, Create, Review, Play
    components/    # Grid, Cell, WordChip, PixelKeyboard, Panel, Button, TopBar, Celebration, Sprites
  data/
    packs/*.json   # 8 themes × ≥3 lists; build-time generatability test
  assets/fonts/    # self-hosted woff2: PixelifySans, Silkscreen, DMSans (@font-face in index.css)
  assets/audio/    # ambience loop (CC0, ≤200KB)
```

Decisions (Executor's 5-minute items): **no router lib** (screen enum in store); **zustand**
for state (tiny, no boilerplate); fonts self-hosted from this iteration (offline app, kill the
CDN link); `bun run check` unchanged.

## Engine

### Types
```ts
type Dir = 'across' | 'down'
interface Placement { word: string; row: number; col: number; dir: Dir }
interface GenResult {
  status: 'complete' | 'partial' | 'failed'
  placements: Placement[]          // bounding-box-normalized (minRow=minCol=0)
  unplaced: string[]               // words that didn't fit (partial/failed)
  metrics: QualityMetrics          // placedRatio, xPerWord, density, balance, score
  seed: number
}
```

### Pre-checks (`precheck.ts`) — run before any search, synchronous
1. Normalize: trim, uppercase, NFD-strip diacritics, reject if any char outside A–Z after that
   (reason `charset`), reject length <2 (`tooShort`) or >15 (`tooLong`), dedupe (`duplicate`).
2. Count: 2–20 valid words else `tooFew`/`tooMany`.
3. Connectivity: build letter-share graph; words with zero shared letters vs all others →
   returned as `isolates` (UI offers drop/edit). Words in disconnected sub-groups: keep the
   largest connected component, report the rest as isolates.

### Placement search (`generate.ts`)
Best-of-N randomized greedy with bounded backtracking, all inside the worker's time budget:

```
generate(words, seed, budgetMs=2000):
  candidates = []
  for n in 0..N (N adaptive until budget spent, min 8):
    rng = mulberry32(seed + n)
    order = words sorted by (sharedLetterDegree desc, length desc), top-3 shuffled by rng
    grid = place order[0] horizontally at origin
    placedStack = [order[0]]
    for w in order[1..]:
      for attempt in 0..K (K=3):
        spots = all legal crossings of w with words in placedStack (legality below)
        if spots not empty:
          place w at argmax spotScore (tie-break by rng); placedStack.push(w); break
        if attempt < K and placedStack.length > 1:
          popped = placedStack.pop()          # most recent, never the first word
          deferred.push(popped)               # popped word re-queues at END of order
        else:
          unplaced.push(w); break             # exhausted: w unplaced, restore popped words
      # after each word: any deferred words re-enter the queue once (single re-queue max,
      # else infinite loops); still-unplaceable deferred words → unplaced
    candidates.push({placements, unplaced, metrics})
  best = argmax candidateScore
  status = unplaced empty ? complete : (any placed ? partial : failed)
```

**Legality:** crossing letters equal; no adjacent parallel contact (each neighbor cell of a
new letter must be empty, part of the same word, or the crossing word at the crossing cell);
result grid ≤21×21.

**spotScore (weighted, council-mandated explicit):**
`+3` per new crossing created · `+1.5` × compactness gain (1 − newArea/maxArea) ·
`+1` × balance (1 − |1 − aspectRatio|) · `−0.5` if placement extends the longer axis.

**candidateScore:** `placedRatio×100 + xPerWord×10 + density×5 + balance×2`.

**Quality phrase (Review screen):** xPerWord <1.2 `loose` · 1.2–1.6 `cosy` · >1.6 `nice & knotty`.
First hover/tap shows one-line legend ("knotty = lots of crossings").

**Determinism:** same (words, seed) → same output. Regenerate = seed+1. No `Date.now()`/
`Math.random()` anywhere in engine (lint-guarded by test asserting two runs identical).

### Worker protocol (`gen.worker.ts`)
`postMessage({words, seed})` → progress-free single reply `{result: GenResult}` within ~2.1s.
UI shows a stepped hourglass sprite + dimmed board while waiting (same treatment for Generate
and Regenerate); worker termination on unmount.

## Storage

**IndexedDB `wordvale` v1**, store `puzzles` (keyPath `id` = ulid-like `${ts36}${rand36}`
generated at save time):
```ts
interface PuzzleRecord {
  id: string
  title: string                    // theme name or first 2 words
  words: string[]                  // normalized
  seed: number
  placements: Placement[]          // frozen at Play-press
  fill: Record<string, string>    // "row,col" → typed letter (player state only)
  solvedWords: string[]
  status: 'in-progress' | 'solved'   // denormalized for library queries; ALWAYS recomputed on
                                     // write as (solvedWords.length === placements.length)
  coinsEarned: number
  createdAt: number; updatedAt: number   // Date.now() at UI layer, never in engine
}
```
Writes: debounced 500ms during play + on visibilitychange. Resume = load record, rebuild
board from placements+fill. First-run = `puzzles` count 0.

**localStorage `wordvale:settings`:** `{ sound: boolean, sfxVol: 0.6, ambVol: 0.3 }`.
Wallet coins v1: `wordvale:wallet` = number (Iteration 2 migrates into IndexedDB).

## Interaction state machine (council-mandated appendix)

Board modes: `idle` → (`wordFocus` | `bankSelect`).
- **Cell tap/click:** focus that cell's word → `wordFocus`. Cell on a crossing: first tap
  focuses ACROSS; tapping the same cell again toggles to DOWN — **toggle only exists when the
  cell belongs to words in both directions; otherwise repeat taps keep the single direction**.
  Focused cell = tapped cell.
- **Canonical fill model:** the grid's cell map (`fill: "row,col" → letter`) is the ONLY letter
  store; words derive their letters from it. A crossing cell is one cell — there is no
  two-store conflict by construction. Cells of solved words are **locked**: typing/bank-placing
  over a locked cell is a no-op (focus still advances past it).
- **Typing (physical or pixel keyboard) in `wordFocus`:** write letter into focused cell,
  advance to next empty unlocked cell in the word; at word end, stay (no auto-jump).
  Auto-check: when a word's cells are all filled, validate that word's letters against its own
  placement (crossing words' state is irrelevant); correct → solve (lock+pop+coins+SFX); wrong →
  silent (explicit Check reveals). Backspace: clear focused cell if filled, else retreat one
  cell within the word and clear; **at the word's first cell, Backspace stays put** (no
  cross-word retreat). Arrows: move focus to the nearest slot cell in that direction;
  **Tab/Shift-Tab: always next/prev unsolved word in placement order, wraps — Tab never toggles
  direction (same-cell tap is the only direction toggle)**; Enter or Check button: validate
  focused word → correct = solve, wrong = berry double-flash (letters kept). Esc/tap-outside:
  back to `idle`.
- **Bank word tap:** → `bankSelect`; all compatible slots pulse (compatible = same length AND
  every already-solved/locked crossing letter matches; typed-but-unsolved letters don't
  constrain). Tap compatible slot → fill whole word (auto-check applies), keep selection if
  other fits remain else `idle`. Tap incompatible slot → 2-frame shake, selection kept.
  Tap same bank word again → deselect. Solved words' chips disabled.
- **Mobile keyboard:** cell focus summons overlay (≤38% viewport); board scrolls focused word
  above it; dismiss = tap outside grid/keyboard, Esc key, or its dismiss key. Never docked.
- **Grid fit:** `tile = clamp(24, floor(min((W−gap·(cols−1))/cols, (H−gap·(rows−1))/rows)), 72)`,
  gap 3px, recomputed by ResizeObserver; panel fill target ≥70% verified in e2e at 360/768/1280.

## Audio (`src/audio/`)
- `sfx.ts`: one shared `AudioContext` (created lazily on first gesture). Each SFX = small
  oscillator/noise graph ≤400ms (fanfare ≤1.5s): pluck (triangle, pitch by word progress),
  arpeggio (3 notes, pentatonic), thud (filtered noise), ding (sine + harmonic), fanfare
  (5-note), click (short square), tick (quieter click). Concurrency cap 3 (drop oldest).
- `ambience.ts`: `<audio loop>` element, bundled CC0 file, play() on first gesture if enabled,
  pause on `document.hidden`. Volumes from settings; TopBar toggle writes settings + applies live.
- Failure-safe: all audio calls no-op if context unavailable; never throws into UI.

## Per-slice test plan

| Slice | Tests |
|---|---|
| a | Property: 500 random valid lists → legal (crossings match, no adjacency, connected), deterministic, bounding-box normalized; 100 seeds → 100 distinct grids; fixtures per failure class (isolates, tooFew, charset…); **one forced-backtracking fixture** (8–10 words where a word only places after removals — verified placement expected); metrics monotonicity sanity. Dev self-play gate: 5 grids ≥3/5 on the rubric: 3 = solvable unaided in <5 min with ≥1.2 crossings/word and no dangling one-crossing chains ≥3 words; 4 = also visually balanced; 5 = "want another". |
| b | Unit: precheck reasons; component: chips render per reason; e2e fixtures (canonical list): `["cat","dog"]` tooFew-adjacent OK · `["xyz","qqq","www"]` disconnected → isolates · 11-word list w/ 2 isolates → partial "drop 2" · 21 words → tooMany · `["café","kuih lapis"]` → charset · `["a"]` → tooShort · 20×15-letter pathological list → timeout-partial. |
| c | e2e: regenerate <2s produces different layout (seed+1), edit round-trips. |
| d | Unit: state machine reducer (focus/type/backspace/tab/crossing/conflict paths); e2e keyboard-only solve + touch-only solve; 360/768/1280 layout audit incl. ≥70% fill assertion; SFX calls mocked-asserted. |
| e | Build-time test: every pack list generates `complete` under seed 1..3. |
| f | e2e: save/refresh/resume exact; delete; first-run; ambience gesture-gate (mocked context). |

**Definition of done per slice:** `bun run check` green (typecheck+lint+unit) · new e2e specs
green · `/review` pass · `/qa-only` smoke pass · build-log entry · G-accept note posted.

## Council findings (2026-08-12, quick council: 3 advisors; DA skipped — recorded deviation)

**PASS with amendments, all applied above:** backtracking rewritten as explicit stack/deferred
pseudocode + forced-backtracking test fixture (Contrarian); canonical single-store fill model,
locked-cell no-op, and bank-place overwrite rule (Executor's "crossing-cell fill model" —
also settles the status-enum recomputation); direction-toggle only where both words exist,
Tab never toggles direction, Backspace stays at word start, auto-check validates a word only
against itself, regenerate shows the same hourglass treatment (Outsider); dev self-play rubric
and slice-b fixture list made concrete (Executor).

**Deviation note:** the devil's-advocate step was skipped for this gate — the advisor consensus
was a list of concrete textual defects with no decision tension to attack; fixes cost minutes
and zero momentum. If a future quick council produces a genuine judgment call, the DA runs.
