<!-- layer: records · status: archived · verified: 2026-10-06 -->
# Gate definitions (one page, operational)

> Answers, for every gate: what runs, what "pass" means, and what happens on failure.
> Companion to [workflow.md](workflow.md). If a gate's bar isn't written here, it isn't a gate yet.

## AI gates (blocking — work pauses until resolved)

| Gate | When | Pass bar | On failure |
|---|---|---|---|
| `/council-review` (full) | Stage-1 plans of full-cycle iterations | Every advisor objection either fixed in the doc or recorded under "accepted risks" with a reason | Amend doc, re-check the specific objection (no full re-run needed for wording fixes) |
| `/council-review --quick` | Stage-2/3 docs and light-cycle mini-specs *(contract amended 2026-08-12, owner default-approved: these docs inherit a fully-councilled plan)* | Same | Same |
| `/review` | End of every dev slice | No correctness findings open; simplification findings fixed or consciously declined in the build log | Fix before the next slice starts |
| `bun run check` | Before every commit | tsc + oxlint + tests all green | No commit until green |
| `/qa-only` smoke | End of every dev slice | Core flow of the slice works in a real browser | Fix before commit |
| `/qa` (full) + `/design-review` | Stage 5 | Every acceptance criterion in the tech spec verified, incl. failure paths; no visual-consistency findings open | Fix and re-run; Stage 5 doesn't exit red |

## Owner gates (Faeez decides; blocking vs async as marked)

| Gate | Blocking? | What Faeez is shown | "Approve" means |
|---|---|---|---|
| Stage-1 plan | **Blocking** | ≤1-page summary: goal, problem solved, slices, out-of-scope, open questions | Scope locked; new ideas → backlog.md |
| Stage-2 design | **Blocking** | Rendered screenshots of all key states incl. failure/empty; for Iteration 0: the in-stack play-screen preview on his own device at native DPR | Aesthetic + layouts locked |
| Stage-3 tech spec | **Blocking** | Plain-language build summary: what gets built slice-by-slice, key decisions, risks | Build authorized; slices then run back-to-back autonomously |
| Per-slice G-accept | **Async** | Short note: goal, problem solved, how to try it locally | Slice accepted. Open G-accepts gate SHIP, never dev momentum |
| Stage-5 ship | **Blocking** | QA report + the playable app; all G-accepts must be closed | `/ship` runs |

## Design-approval bar (Iteration 0, per council)

The design system passes when **one play-screen preview built in the actual Vite+React app** —
real pixel font, real palette, hardcoded 15×15 grid, one tile-fill animation — meets all of:

1. Viewed on Faeez's actual device at native DPR: tile borders and font strokes crisp, no sub-pixel blur.
2. Letters legible at the 15×15 grid's cell size.
3. The animation runs smoothly (no shimmer/resample artifacts on pixel art).
4. Palette contains no pure `#000`/`#FFF`; fonts are real licensed pixel fonts, not system fonts.

## Explicit exemptions

- The Iteration-0 **spike/preview UI is exempt** from the "no real UI in Iteration 0" rule — it
  *is* the design-approval artifact and the ADR-001 substrate. It is throwaway-allowed code and
  carries no G-accept.
- **Dev-only tools** (`?harness` debug harness and future debug routes, dev-gated and excluded
  from production bundles) are exempt from the design system — they are instruments, not product
  UI. *(Added at slice-a review, 2026-08-12.)*

## Timeboxes

- Iteration-0 close-out: **5 working days** from 2026-08-12. Overrun → cut scope, don't extend.
