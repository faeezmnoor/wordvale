<!-- layer: records · status: record · verified: 2026-10-06 -->
# Iteration 1 — Stage 5 QA report (2026-08-12)

Browser QA run against the built app (headless Chromium + manual measurement), plus the
automated suite. **Result: all acceptance criteria met; no console errors on any path.**

## Acceptance criteria matrix

| Slice | Criterion (from 01-plan.md) | Result |
|---|---|---|
| a | property suite green (500 lists legal/deterministic/normalized) | ✅ 27 tests, 175 assertions |
| a | 100 seeds → 100 distinct grids | ✅ verified in-suite |
| a | forced-backtracking fixture places | ✅ |
| a | dev self-play ≥3/5 on 5 grids | ✅ 4/5 avg (build log slice a) |
| b | every failure class renders its designed state | ✅ partial, disconnected/isolates, tooFew, tooMany, charset, tooShort, duplicate — all verified in browser |
| b | live validation chips per reason | ✅ CAFE/APPLE valid · XYZZY "no shared letters" · KUIH LAPIS "A–Z only" · A "too short" · APPLE "duplicate" |
| c | regenerate <2s, different legal layout | ✅ (~4ms gen; seed advances every attempt) |
| c | edit-words round-trips the list | ✅ |
| d | keyboard-only solve | ✅ Tab focus + type + auto-solve verified; whole-word typing across locked crossings fixed and unit-tested |
| d | touch-only solve | ✅ select-&-place path verified (bank word → compatible slots pulse → tap places) |
| d | layouts at 360 / 768 / 1280 | ✅ no horizontal page scroll at any width |
| d | grid fills ≥70% of panel limiting dimension | ✅ **92% / 93% / 93%** |
| e | every bundled list generates in CI | ✅ 8 packs × 3 lists, all `complete` within 3 seeds (build-time test) |
| f | create → play half → refresh → resume exact | ✅ 6 typed letters restored after reload |
| f | delete works; first-run CTA renders | ✅ (delete has a Keep/Delete confirm step) |
| f | ambience gesture-gated | ✅ zero autoplay warnings; audio context only after first gesture |

## Bugs found and fixed during QA

1. **Whole-word typing broke across locked crossings** (major, UX): typing a word whose crossing
   letter was already solved landed the remaining letters offset, so a correct word read as
   wrong. Fixed: focus starts at the word's first cell and typing walks *every* cell, writing
   only where unlocked (standard crossword behaviour). New unit test covers it.
2. **Horizontal page scroll at 360px** (major): the grid's minimum tile forced the panel wider
   than the viewport. Fixed: the grid scrolls inside its own panel; page never scrolls sideways.
3. **Grid only filled 63% of the panel on tablet** (major, owner directive): fixed by giving the
   stacked grid panel 55vh; now 92–93% at every breakpoint.
4. **Secondary/ghost button styles missing** (major, visual): every button rendered as primary
   green, destroying hierarchy on the failure panel. Added `.btn.secondary` / `.btn.ghost` /
   `:disabled`.
5. **AudioContext created before a user gesture** (minor): browser autoplay warning on load.
   Fixed with a hard gesture gate in both `sfx.ts` and `ambience.ts`.
6. **Library cards had unequal heights** (minor, spec): fixed with stretch + fixed thumb box.

## Post-QA review round (final `/review` on slices d–f)

A final review pass found **3 blockers + 5 majors** after the QA above; all are fixed and
re-verified (details in [04-build-log.md](04-build-log.md)). The two that mattered most:
replaying a solved puzzle used to destroy its record and re-mint coins (an unlimited coin farm
for Iteration 2's economy), and the on-screen keyboard overlay swallowed every tap on touch
devices, which would have made the mobile experience feel broken. Browser-verified after fixing:
solved card stays SOLVED after a replay-open, wallet unchanged, no duplicate cards.

## Deferred (recorded, not blocking)

- Worker time-budget determinism: `maxMs` makes candidate count clock-dependent. Not user-visible
  (2s budget vs ~4ms real generation) and saved puzzles store placements, not seeds.
- Accessibility pass (screen-reader grid semantics, colour-blind audit beyond the solved-lock
  redundancy) — carried to Iteration 2 as agreed at Stage 1.
- OCR + voice input tabs are visible but disabled ("soon") — Iterations 3 and 4.
- Per-tile 40ms solve-cascade stagger and the coin-flight-to-wallet arc are specified but not
  implemented (solves pop as one; coins increment directly) — small polish, carried forward.
- `tests/e2e/` is still empty: end-to-end coverage was performed by driven-browser QA rather
  than committed Playwright specs. Worth adding before Iteration 2 builds on this loop.

## Evidence

Screens verified: Home (first-run + library), Create (both tabs, all failure panels), Review
(preview, regenerate, edit), Play (desktop, mobile, bank-select, solve, celebration).
`bun run check` green (typecheck + lint + 27 tests). `bun run build` produces a 235 KB JS bundle
(74 KB gzipped) with fonts self-hosted — the app runs fully offline.
