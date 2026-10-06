<!-- layer: records · status: archived · verified: 2026-10-06 -->
# WordVale Development Workflow (canonical)

Every iteration of WordVale runs a 6-stage cycle. AI works autonomously within a stage;
**AI gates** (blocking) run before Faeez ever sees anything; **owner gates** decide stage
transitions. Owner communication is always plain language: state the goal and the problem solved.

Current position is tracked in [workflow-state.md](workflow-state.md). Iteration artifacts
live in `docs/iterations/NN-<name>/01-plan.md … 06-retro.md`.

## The six stages

| Stage | AI does autonomously | AI gate (blocking) | Owner gate — approve means… |
|---|---|---|---|
| 1. Plan | Research + write iteration plan: goal, slices with acceptance criteria, out-of-scope list, open questions | `/council-review` on the plan doc | ≤1-page summary → **scope locked**; new ideas go to [backlog.md](backlog.md) |
| 2. Design | Design spec + clickable HTML mockups in the real design system (never gray boxes); `/design-shotgun` when directions compete | `/council-review` on spec + `/design-review` on rendered mockups | Rendered screenshots incl. failure/empty states → **aesthetic + layouts locked** |
| 3. Tech Spec | `/spec`: modules, storage schema, algorithm pseudocode, failure handling, per-slice test plan | `/council-review` on the spec | Plain-language build summary → **build authorized**; slices then run back-to-back with no blocking owner input |
| 4. Develop | Per slice: implement → `bun run check` → `/qa-only` smoke → commit → append to build log | `/review` per slice, must pass before the next slice starts | **Async G-accept note per slice** (gates SHIP, not progress) |
| 5. Test | Full `/qa` against every acceptance criterion incl. failure paths; `/design-review` on the live app | `/qa` green + `/design-review` green | Faeez plays it; all G-accepts closed → **`/ship`** |
| 6. Iterate | Retro (plan vs actual), update backlog + workflow-state, propose next iteration goals | — | Faeez picks the next iteration goal (defined *with* him) or declares v1 done |

## Full vs light cycle

- **Full cycle** (all 6 stages): any iteration with new algorithmic risk or a new visual surface.
- **Light cycle**: extending established patterns. Stages 1+3 merge into one mini-spec with a single
  `/council-review --quick` pass; Stage 2 is skipped unless there is genuinely new UI; Stages 4–6 run in full.

## Review tooling

- **Doc gates:** `/council-review` (ngmeyer DMAD council — 5 advisors, peer review, devil's advocate, chairman).
  Full mode for full-cycle Stage 1–3 docs; `--quick` for light-cycle mini-specs.
- **Artifact stress tests:** `/adversarial-review` for a finished doc/spec when a single sharp critic fits better.
- **Design:** gstack `/design-consultation` (system, once), `/design-shotgun` (variants), `/design-review` (visual QA).
- **Build & test:** gstack `/review` (per slice), `/qa-only` (smoke), `/qa` (full browser QA + fix), `/ship` (release).

## Rules

1. **Scope locks at Stage-1 approval.** Anything discovered later goes to `backlog.md`, not the current iteration.
2. **Nothing unstyled reaches an owner gate.** Design system first; `/design-review` runs before every owner viewing.
3. **`src/engine/` stays pure.** No React, no DOM, no browser APIs, seeded RNG only — this keeps the riskiest code unit-testable.
4. **Every council objection is resolved or recorded** as an accepted risk in the doc it reviewed.
5. **G-accept is async.** Owner review never blocks slice-to-slice momentum — only SHIP.
6. **All economy/game constants live in one tunable config** (`src/state/economy.ts`).

## v1 iteration map

| # | Iteration | Contents | Cycle |
|---|---|---|---|
| 0 | Foundations | Scaffold, `bun run check`, workflow docs, vision, design system (`/design-consultation`), DOM-vs-canvas ADR | Light |
| 1 | Core loop | Pure seeded generator + debug harness; text input → generate + failure UX; review/confirm/regenerate; play screen; themed packs; IndexedDB save/resume | **Full** |
| 2 | Economy | Score, coins on words, escalating letter reveals, slot-machine bonus, wallet | **Full** |
| 3 | OCR input | tesseract.js upload/camera → confidence handling → existing review/edit screen | Light |
| 4 | Voice + polish | Web Speech with feature-detect fallback; animation/sound juice; stats | Light |
