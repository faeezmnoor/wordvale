# Iteration 1 — Stage 6 Retro (closes the cycle)

**Shipped 2026-08-12.** Goal was: a stranger can paste a word list or pick a theme and be
playing a good crossword two clicks later, with keyboard-first play and graceful failure.
**That goal was met**, and the result is live at <https://wordvale-two.vercel.app> and open
source at <https://github.com/faeezmnoor/wordvale>.

## Plan vs actual

| Planned | Actual |
|---|---|
| 6 slices (a–f) | 6 slices, all delivered, no scope added mid-build |
| Generator engine, pure + seeded | Delivered; 500-case property suite; ~1ms/puzzle |
| Text input + failure UX | Delivered; every failure class has a designed screen |
| Review / regenerate | Delivered |
| Play screen, keyboard-first, responsive | Delivered; two input paths (type, or select-and-place) |
| 8 themed packs | Delivered, all build-time verified generatable |
| IndexedDB persistence + library | Delivered |
| *Not planned:* deploy, open-source, CI | Added at owner request after ship |

Scope held. The one thing that grew was **post-ship polish** — three rounds of owner feedback
after the build was "done" (space optimization, thumbnail overflow, audio).

## What worked

- **Building the pure engine first, behind a debug harness.** The riskiest code got the most
  test coverage and never needed rework once the UI landed. The same applies to
  `playMachine.ts` — extracting play logic as a pure reducer meant the fiddly interaction
  rules were testable without a browser.
- **Determinism as a design constraint.** Seeding everything made "regenerate" free, made
  tests reproducible, and will make puzzle-sharing-by-URL nearly free later.
- **The council review earned its cost at Stage 1.** It demoted a decision we were treating as
  architectural (DOM vs canvas), and forced the design system to be judged on a real in-stack
  preview rather than mockups — which is exactly the failure that sank a previous project's v0.
- **Failure states designed up front**, not bolted on. Enumerating them in the plan meant none
  were discovered late.

## What didn't

- **The design bar needed three rounds of owner feedback after "done".** Space optimization,
  the overflowing library thumbnail, and inaudible audio all reached the owner rather than
  being caught internally. The QA pass verified *correctness* thoroughly but under-weighted
  *perception* — "does this look and feel right at real sizes, on real hardware".
- **The audio bug is the sharpest lesson.** Ambience was scoped to the home screen, but the
  only interaction on that screen navigates away — so it was destroyed by the very gesture
  that started it. It was never audible to anyone, and no test caught it because every test
  asserted the code ran, not that sound was produced. *Verify the observable outcome, not the
  code path.* The fix was verified by reading actual gain values from a live AudioContext.
- **Thumbnail overflow** came from fixed pixel maths with a floor value that silently broke at
  larger grids. Replaced with an SVG viewBox that cannot overflow by construction. Prefer
  designs that make a class of bug impossible over tuning constants.
- **QA ran at a single desktop viewport** for much of the pass. The mobile-specific issues
  surfaced only when the owner opened it on a phone.

## Carried forward

- **Perception QA is now explicit:** check real screen sizes, real devices, and — for anything
  audio or animated — verify the *effect*, not just that the handler fired.
- The unbuilt v1 scope (OCR, voice, coin economy) is recorded honestly at the top of
  [`ROADMAP.md`](../../../ROADMAP.md) rather than quietly dropped.
- Difficulty remains the biggest open gameplay question, deliberately unresolved and parked
  with seven candidate mechanics.

## Numbers

27 tests · 500-case property suite · ~1ms per generated puzzle · zero image or audio assets ·
zero console errors in production · CI green · 8 themed packs · deploys in ~6s.
