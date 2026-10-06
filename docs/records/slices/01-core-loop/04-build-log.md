<!-- layer: records · status: record · verified: 2026-10-06 -->
# Iteration 1 — Build log

## Slice a — generator engine (2026-08-12)

**Goal:** pure seeded kriss-kross generator + debug harness. **Problem solved:** the product's
riskiest code is now its most tested — legal, deterministic, fast, tunable.

**Shipped:** `src/engine/` (types, mulberry32 rng, precheck w/ connectivity graph, placement
search, metrics + quality phrases), `src/ui/DebugHarness.tsx` (`?harness`), property suite
(`tests/engine/`) incl. independent legality validator.

**Measured:** 100/100 seeds complete on a 10-word list, 100/100 distinct layouts, ~4ms/gen at
default 32 candidates (2s worker budget is enormous headroom); 500-list property suite green.

**Deviations from spec (with reasons):**
1. **Default candidates 8 → 32** — 8 was under-searching (partials on plausible lists); at
   ~1.2ms/build, 32 costs nothing.
2. **Restart heuristic added** (spec had "restart with a new seed ordering"; concretized as:
   words unplaced in earlier builds get an order bump in alternating later builds).
3. **Quality-phrase thresholds recalibrated with data:** spec's `xPerWord ≥1.3` target is
   geometrically unreachable under strict adjacency (a legal grid is near-tree; measured
   0.88–1.0). New mapping: knotty = any crossing beyond the spanning tree; loose = sprawl
   (density <0.28 or balance <0.5); cosy = the rest. candidateScore unchanged.
4. **Diversity mechanism** — spec's "top-3 shuffle" was insufficient (51/100 distinct);
   replaced with rng-perturbed order + weighted top-3 spot pick + seed-driven near-best
   selection → 100/100 distinct.

**Self-play gate (rubric ≥3/5 on 5 grids):** food 4/5, cities 4/5, science 4/5 (knotty!),
fantasy 4/5 · animals list = **provably unsolvable complete** (exhaustive DFS confirms; engine
correctly returns 5-of-6 partial → the designed "drop CAT?" flow). **PASS.**

**Notable finding for the docs:** simple short-word lists can be legitimately ungeneratable —
the partial-failure UX (slice b) is a core path, not an edge case. Pack curation (slice e) must
run the build-time generatability test early.

**Slice-a `/review` gate (8-angle agent review): PASS after fixes.** Confirmed and fixed:
empty-grid "knotty" flattery bug; `countError` computed pre-isolate-filter (contract now: it
describes the returned list); `maxMs` silently no-op without `now` (now throws); `generate([])`
reported complete (now failed); oversize words guard (public API may skip precheck); harness
reachable in prod bundle via substring match (now `import.meta.env.DEV` + `URLSearchParams` +
lazy import); harness ignored countError / coerced NaN seeds / regenerated per keystroke (fixed:
display + `Number.isFinite` + `useDeferredValue`); App.tsx duplicated engine geometry (now
imports engine); all tuning constants gathered into `src/engine/config.ts`; `boundsOf` O(1)
endpoints + hoisted loop-invariant bounds (the generator's inner-loop hot path); structural
purity-guard test (bans Math.random/Date.now/DOM/ui-imports in engine source); production-path
legality tests at default options. Deferred, recorded: worker-budget nondeterminism (2s budget
>> ~4ms real gen; saved puzzles freeze placements, not seeds), letter-mask degree optimization,
validate.ts internal dedup (test-only). Dev-tool design-system exemption added to gates.md.

**G-accept (async):** try `bun run dev` → `http://localhost:5173/?harness` — type any word
list, step seeds, watch grids. 14 tests green.

## Slices b + c — create + review screens (2026-08-12)

**Goal:** paste words → live validation → generate (worker, 2s budget) → review/confirm.
**Shipped:** zustand store (`state/store.ts`), gen worker + `useGenerate` hook, `TopBar`/
`Sprites` (pixel SVG set: coin, chevron, pencil, gift, camera, mic, sprouts, hourglass),
Create screen (chips per precheck reason incl. isolates-warn, partial-failure "drop & play",
total-failure sprite state, tooFew/tooMany messaging), Review screen (shared `FittedGrid`
fit-to-panel renderer, quality-phrase meta with tap legend, regenerate seed+1 keeping ≥
placement count, edit-words round trip preserving text), Home first-run hero (sun + meadow +
mascot). Smoke-tested in browser: full flow, regenerate, edit round-trip — no console errors.
**Deviation:** slice-b/c AI review runs as one focused pass (files land together; per-slice
full 8-angle review reserved for slice d/f per momentum ruling).
**G-accept:** `bun run dev` → Create your first crossword → paste any list (try including
"kuih lapis" and a lone "xyz" to see the chips) → Generate → Review → Regenerate.

## Slice d — play screen (2026-08-12)

**Goal:** the game itself — keyboard-first play, no drag, responsive, celebration + sound.
**Shipped:** pure `playMachine.ts` reducer (canonical single fill store; select-&-type with
auto-advance and silent auto-solve; select-&-place with compatibility by length + locked letters
and overwrite-with-flash; Tab/Shift-Tab word cycling; arrows; Backspace clear→retreat→stay;
explicit Check with berry flash; locked-cell no-ops; direction toggle only at real crossings),
10 unit tests covering every one of those paths · `PixelKeyboard` (summoned on focus, coarse
pointers only) · `Celebration` (stepped confetti, score/coins, sprout bloom) · `audio/sfx.ts`
(Web-Audio pluck/arpeggio/thud/ding/fanfare/click/tick, 3-voice cap, defaults ON per owner) ·
`state/settings.ts` (localStorage) · `state/economy.ts` (all game constants) · progress sprout
with 4 growth stages.

**Fixes from the slice-b/c review (blocker + 4 majors):** "Try again" was deterministic
(fixed seed → identical failure forever) — now an attempt counter; Regenerate wedged after a
rejected result — seed now advances every attempt with a "kept the better layout" note; editing
during a pending worker desynced draft words — request snapshot + `acceptPartial` derives kept
words from `result.placements`; isolate words were silently dropped — now a confirmation panel;
`▶ ⟳ ➜ ✔ ⌫` glyphs replaced with pixel sprites (emoji/dingbat ban); worker error handler so
"Weaving…" can't hang; dead `lastPre` store field removed; render-phase navigation → effects.

**Measured:** `MAX_TILE` raised 72 → 128 so small grids still fill the panel (owner space
directive); browser smoke: bank-select highlights only truly compatible slots (7-letter word →
1 slot), place → lock + coins + strike-through, full solve → celebration, zero console errors.

**G-accept:** `bun run dev` → make a puzzle → Play. Try both paths: click a cell and type, or
tap a bank word then a highlighted slot. Tab cycles words. Sound is on.

## Slices e + f — themed packs, persistence, library, ambience (2026-08-12)

**Shipped:** 8 packs × 3 curated lists (`src/data/packs/`, all build-time verified generatable),
theme picker with hand-built pixel sprites · versioned IndexedDB store with debounced autosave,
resume, delete-with-confirm, library cards with auto-drawn grid thumbnails and progress chips ·
persisted wallet + sound settings · synthesized home ambience (birds + breeze), gesture-gated.

**Deviations recorded:** ambience is synthesized rather than a bundled CC0 file (zero asset
weight, same effect — `src/assets/audio/` is unused); the sidebar Check button is enabled in
idle mode and emits the incomplete-check tick rather than being disabled.

## Final /review gate (slices d–f): 3 blockers + 5 majors found, all fixed

1. **Replaying a solved puzzle destroyed its record and re-minted coins** (blocker) — replay
   reused the record id, and autosave overwrote it on mount with an empty board; re-solving
   paid the coins again, so one puzzle could be farmed indefinitely. Fixed: replay mints a new
   record, autosave is gated behind a dirty flag, celebration reports session-earned coins.
   *Verified in browser: solved card stayed SOLVED, wallet unchanged after a replay-open.*
2. **The on-screen keyboard overlay swallowed every tap** (blocker) — a full-viewport
   `position: fixed` layer meant each grid/chip tap only dismissed the keyboard, doubling every
   interaction on touch. Fixed with `pointer-events: none` on the overlay + bottom padding so
   the focused word isn't hidden.
3. **A synchronous IndexedDB failure hung Home forever** (blocker) — Firefox private mode throws
   from `indexedDB.open`, rejecting the cached promise; the user sat on "Opening the valley…"
   with no CTA. Fixed with try/catch → resolve(null), `onblocked`, and a `.catch` on load.
4. **Autosave never flushed on unmount** (major) — the winning move could be lost while its
   coins were already banked. Now flushed on cleanup + `pagehide`.
5. **Replaying a fresh puzzle spawned duplicate library cards** (major) — id is now minted once
   per session (lazy ref) and replay is an explicit new record.
6. **Wrong-check flash could never re-trigger** (major) — the clear timer was cancelled by the
   events effect; flashes now carry an id used as a React key.
7. **Typing only the missing letters misplaced them** (major) — a letter that doesn't match a
   locked cell now skips ahead instead of being swallowed, so both typing styles work.
8. **Pack failures showed "we fit N of 0 words"** (major) — the failure panel and Try-again now
   use the requested word list, not the textarea.

Also fixed: transaction commit-on-complete for writes, ambience teardown (was scheduling
oscillators forever), SFX drops oldest voice, colour-blind lock icons on solved words, remaining
glyphs → sprites, keyboard keys fit at 360px, reduced-motion keeps a static wrong-answer signal,
arrow keys prefer the matching direction, stale focus highlight cleared, equal-height cards.
