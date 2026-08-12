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
- **Debug harness:** a dev-only route rendering any (words, seed) → grid + metrics, for tuning;
  must regenerate in <10s round-trip so quality-tuning iterations stay cheap.
- **Tests:** property-based — for 500 random valid word lists: all placements legal, deterministic
  under fixed seed, no adjacency violations; **seed diversity: first 100 seeds of one list yield
  100 distinct grids** *(council)*; plus fixture tests for every failure class.
- **Stage-3 spec must define** *(council)*: the weighted scoring function (explicit weights, not
  lexicographic hand-waving) and the backtracking early-exit heuristic (attempts before partial).
- **Accept:** harness generates legal grids for all bundled packs; property suite green;
  **dev self-play: solve 5 generated grids end-to-end in the harness, each rated ≥3/5 for
  interest** *(council — tests the plan's own #1 risk; self-administered, not an owner gate)*.

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
- **Input model (hard requirements — NO drag-and-drop anywhere, owner directive 2026-08-12):**
  two selection-based paths, both required:
  1. *Select & type:* click/tap a slot cell to focus its word (highlight the run); type letters
     directly — auto-advance within the word; **Tab / Shift-Tab cycles words**; arrow keys move
     across the grid; Backspace clears and retreats; typing over a crossing updates both words;
     Enter checks the focused word.
  2. *Select & place:* tap a word in the bank → compatible slots highlight → tap a slot to place
     the whole word there (wrong slot = gentle shake, no penalty in v1).
  On touch, typing uses a **custom on-screen pixel keyboard** (owner-gate default Q3) — reliable
  on all browsers, on-theme, no iOS soft-keyboard fiddliness.
- **Solve model:** a word is solved when all its cells match; solved cells lock (meadow green,
  stepped pop). Wrong letters stay neutral in v1 (no red mark) — checking is explicit.
- **Responsive layout / space optimization (owner directive 2026-08-12, verified in the
  amended Iteration-0 preview):** grid renders its **bounding box** (never the raw generation
  grid), centered, tile size = largest integer in 24–72px that fits the container (ResizeObserver
  fit, as prototyped in `src/App.tsx` `FittedGrid`); the grid must visibly fill its panel —
  acceptance: grid occupies ≥70% of the puzzle panel's limiting dimension on desktop and mobile.
  ≥ 900px: grid + side panel; < 900px: grid on top, word bank as wrapping chips below; no
  horizontal page scroll at any width.
- **Fun bar (owner comment #4):** puzzle-complete celebration (pixel confetti + banner), tile-pop
  on every solve, idle sprite in the header, decorative flora corners on panels. Sound effects
  stubbed behind a mute-default toggle (assets land here only if slice time allows, else Iter 4).
- **Pre-authorized split clause** *(council)*: if this slice exceeds one working sitting, it
  splits mid-build into d1 (input logic) / d2 (responsive render) / d3 (effects) with no replan
  ceremony — each sub-slice gets its own `/review` + G-accept note.
- **Accept:** a full puzzle is playable start-to-finish with keyboard only, and separately with
  touch only; layout audited at **360px** / 768px / 1280px widths (small-phone check explicit).

### e. "Generate for me" — bundled themed packs
- ≥ 8 packs × ≥ 3 lists each (JSON in `src/data/`): Animals, Food & Cooking, Travel, Malaysia,
  Movies & TV, Science, Sports, Fantasy. Every list pre-verified generatable by a build-time test.
- Theme picker screen feeds the same pipeline as typed input.
- **Accept:** every bundled list generates successfully in CI (property test over packs).

### f. Persistence + home/library
- IndexedDB (schema v1, versioned): puzzles (words, seed, placements, fill state, status).
  localStorage: settings. **No wallet stub** *(council — economy is out of scope; dead code
  invites drift; Iteration 2 adds its own store under schema versioning)*.
- **The fill-state schema is written in the Stage-3 tech spec** (before slice d builds) and
  slice f implements against it — fixes the d-writes-what-f-defines inversion without
  reordering slices *(council)*.
- Home: library grid of saved puzzles (resume/replay/delete) or first-run CTA → create flow.
  Mid-puzzle refresh resumes exactly.
- **Accept:** create → play half → refresh → resume; delete works; first-run CTA state renders.

## Slice order & dependencies
a → b → c → d (d needs c's grid data) → e (needs b's pipeline) → f (needs d's fill state).
e can interleave after b if d drags.

## Out of scope (locked at owner approval)
Economy/coins beyond the visual stub (Iter 2), OCR (Iter 3), voice (Iter 4), difficulty
mechanics (backlog — engine merely stays neutral to them), dark mode, sharing, clue layers.

## Owner gate outcome (2026-08-12): **APPROVED** with two directives
1. **Space optimization is a hard requirement** — grids were rendering too small in their panel;
   fixed in the Iteration-0 preview (bounding-box render + fit-to-container tiles) and folded
   into slice-d acceptance (≥70% panel fill).
2. **No drag-and-drop.** Input is text entry and selection only (select word / select slot).
   Folded into slice-d input model.

The 5 gate questions were not individually answered; per Faeez's standing default-to-action
rule, these **defaults are adopted** (overridable any time before slice d builds — say the word):
- **Q1 grid model:** pure inference — empty slots, lengths + intersections + word bank guide you
  (classic kriss-kross). No pre-filled anchor; difficulty variants stay in backlog.
- **Q2 "core loop works" bar:** *satisfying to solve* — grids must pass dev self-play ≥3/5, not
  merely be legal; "come back tomorrow" retention is Iteration-2+ territory.
- **Q3 mobile input:** custom on-screen pixel keyboard (consistent with the no-drag,
  input-must-be-easy directive; avoids the iOS soft-keyboard trap).
- **Q4 wrong letters:** neutral until explicit Check (cozy, not punishing).
- **Q5 packs:** the 8 listed themes ship as-is.

Difficulty brainstorm stays parked in backlog.md (7 candidate mechanics); nothing here blocks them.

## Explicitly deferred (council-decided defaults)
- **Date→seed daily-puzzle contract:** deferred — the engine's pure `(words, seed) → grid`
  contract already makes a daily mode a one-line wrapper later.
- **Accessibility (color-blind palettes, screen reader on grid):** real debt, consciously
  carried; logged for Iteration-2 planning.
- **Per-word micro-celebrations & pack difficulty tags:** cheap wins noted for Stage-2 design
  to include if they fit the slice; not acceptance-gating.

## Risks
- **Grid quality is subjective** — mitigation: quality metrics + debug harness make tuning
  cheap; regenerate is one tap.
- **Keyboard focus model on mobile browsers is fiddly** (hidden-input soft-keyboard technique)
  — mitigation: word-bank chips remain a full alternate input path; QA on real iOS Safari.
- **Slice d is the biggest** — mitigation: keyboard model specced precisely in Stage 3 before
  build; chips path ships first within the slice.

## Council findings (2026-08-12, full `/council-review`: 5 advisors + 5 anonymous peer reviews + devil's advocate + chairman)

**Verdict: PASS — proceed to Stage 2 now. Six slices stay six. Zero new gates.** The devil's
advocate won the process argument (this owner's projects' observed failure mode is stalls behind
blocking gates, not rework from under-planning — Iteration 0 shipped in a day), so the advisors'
proposed restructuring (8–9 slices, pre-design decision queue, new human-play gate) was rejected
as delivered. Their substance survived as zero-momentum-cost amendments:

| Finding | Source | Resolution |
|---|---|---|
| Legal ≠ playable: property tests don't test the plan's own #1 risk (grid quality) | Contrarian + First Principles + 3 peer reviews | Slice-a acceptance: dev self-plays 5 grids ≥3/5; harness <10s round-trip |
| Seed diversity untested | Peer review | Property test: 100 seeds → 100 distinct grids |
| Scoring function unweighted; no early-exit heuristic | First Principles | Mandatory Stage-3 spec items |
| Slice d is 2–3 slices in disguise | Executor + Contrarian + First Principles | Pre-authorized mid-build split clause (d1/d2/d3), no replan ceremony |
| f defines the schema d writes (order inversion) | Executor | Schema written in Stage-3 spec before d builds; slice order unchanged |
| Grid-labeling model undefined — changes what design draws | Outsider (peer-voted strongest ambiguity) | Owner question #1 on this gate |
| "Core loop works" never defined by owner | Peer review | Owner question #2 |
| iOS hidden-input soft keyboard ~30–40% smooth base rate | Executor + First Principles | Owner question #3 (custom keyboard option); chips path remains fallback |
| Wallet stub = dead code inviting drift | Outsider | Dropped from slice f |
| Date→seed daily contract "lock now" | Expansionist | **Rejected** (chairman): pure-seed contract already makes it free later |
| Interaction semantics (crossing-cell focus, Check scope, conflicts, Tab rules, autocorrect, status enum, failure-loop mechanics) | Outsider + First Principles + Contrarian | Routed to Stage-3 tech spec (already scheduled; blocks nothing now) |
| Accessibility absent | Peer review | Deferred to Iteration-2 planning, logged as conscious debt |

**Gate-count audit (chairman check):** owner-blocking gates in this plan = exactly **1** (this
Stage-1 approval). ✓
