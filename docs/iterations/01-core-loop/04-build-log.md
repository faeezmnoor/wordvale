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
