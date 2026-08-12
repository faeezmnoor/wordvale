# Iteration 0 — Foundations (light cycle: merged plan + spec)

**Goal:** a repo where every later iteration can move fast safely — gates wired, harness green,
design system approved *before any product UI exists*.
**Problem solved:** the two historic failure modes of this working style are (a) unstyled v0s
getting rejected and (b) process drifting mid-build. Iteration 0 buys insurance against both.

## Scope (locked at owner approval)

1. **Scaffold** — Vite + React + TS (ESM), bun; `bun run check` = `tsc -b` + oxlint + `bun test`. ✅ done, green.
2. **Workflow contract** — `docs/workflow.md`, `workflow-state.md`, `backlog.md`, `CLAUDE.md`. ✅ done.
3. **Review tooling** — ngmeyer `council-review` + `adversarial-review` installed and invocable. ✅ done.
4. **Design system + in-stack preview** *(amended by council)* — design consultation produces
   `docs/design/design-system.md` (real pixel fonts, earthy Stardew-adjacent palette — no pure
   #000/#FFF, spacing/tile grid, motion rules) **plus one play-screen preview rendered in the
   actual Vite+React app**: real font, real palette, hardcoded 15×15 grid, one tile-fill
   animation. This single artifact is both the design-approval evidence and the rendering-spike
   substrate. Approval bar: viewed on Faeez's actual device at native DPR, font legible, borders
   crisp (no sub-pixel blur), animation smooth.
5. **Sprite-rendering ADR** *(demoted by council)* — one-day timeboxed spike using the preview
   above. Default answer: DOM (`image-rendering: pixelated`) behind a `<Grid>` component boundary
   with renderer-agnostic design tokens. Record explicit reversal triggers in
   `docs/decisions/001-dom-vs-canvas.md` (e.g. juice effects below 55fps on reference device →
   revisit canvas). Not on the critical path; nothing sequences behind it.
6. **One-page gate definition** *(added by council)* — `docs/gates.md`: what blocks when a gate
   fails, the exact design-approval bar (item 4), and an explicit exemption of the spike/preview
   from the "no real UI" rule.
7. **CI-lite** — a pre-commit expectation (not enforced tooling yet): no commit with red `bun run check`.

**Timebox (council):** everything remaining in Iteration 0 closes within **5 working days**; if
exceeded, cut scope rather than extend.

## Out of scope

Any product feature, any generator code beyond the pure-module stub, any real UI beyond the
design-system preview page. Themed word-pack content design belongs to Iteration 1.

## Technical decisions

- **Storage split:** IndexedDB for puzzles/history (structured, growing), localStorage for
  settings/wallet (tiny, synchronous reads at boot). Schema versioning from day one.
- **Engine purity rule** (hard): `src/engine/` has no React/DOM/browser imports and takes a seeded
  RNG as input. Enforced by the smoke test asserting `document` is undefined under `bun test`,
  and by review gates.
- **Tests:** `bun test` for engine/unit (fast, every slice); Playwright + gstack `/qa` for e2e
  from Iteration 1 on.
- **Worker boundary:** generation will run in a Web Worker (Iteration 1); Iteration 0 only ensures
  the engine module is worker-compatible (pure, no DOM).

## Acceptance criteria

- [ ] `bun run check` green (tsc + lint + tests). *(already true)*
- [ ] `bun run dev` serves the app shell.
- [ ] `/council-review --quick` run on this doc; objections resolved or recorded below.
- [ ] Design system doc + rendered preview exist and pass `/design-review`.
- [ ] ADR 001 recorded with the spike's evidence.
- [ ] Owner gate: Faeez approves the Iteration-0 summary + design previews.

## Risks accepted this iteration

- Design system approved on preview pages may still need touch-ups when applied to real screens
  (Iteration 1 Stage 2 exists for exactly that).
- oxlint (not eslint) is a lighter linter; acceptable for a solo game project, revisit if rules feel thin.

## Council findings (2026-08-12, `/council-review --quick`: 3 advisors + devil's advocate + chairman)

**Verdict: execute Iteration 0, amended lightly.** Amendments applied to the scope above:

1. **[Error catch — Executor, refuted by Devil's Advocate, resolved by chairman]** The Executor
   argued the DOM-vs-canvas ADR must run *before* the design system since rendering tech
   constrains design tokens. The Devil's Advocate refuted this: design tokens (palette, fonts,
   spacing, sprites) are renderer-agnostic, and a ≤625-cell grid is trivially within DOM
   capability. **Resolution:** ADR demoted off the critical path to a one-day spike with a
   default answer (DOM behind `<Grid>`) and recorded reversal triggers. → scope item 5.
2. **[Error catch — Contrarian]** "Design system approved on preview pages" repeats the exact
   preview≠production failure that got a previous v0 rejected (DPR blur, animation shimmer).
   **Resolution:** the approval artifact is now one play-screen preview *in the actual stack*,
   viewed on Faeez's real device at native DPR with an animation running. → scope item 4.
3. **[Error catch — Outsider]** Gate enforcement was aspirational: "pass /design-review"
   undefined, blocking-vs-async unclear, spike conflicted with the no-UI rule. **Resolution:**
   one-page `docs/gates.md`. → scope item 6.
4. **[Value tension — rigor vs momentum, chairman]** For a solo project the binding constraint is
   motivation; a rejected design gate *is* the demotivation trigger, so de-risking the design gate
   is momentum protection. **Resolution:** 5-working-day timebox on Iteration-0 close-out; overrun
   means cut scope, not extend.
5. **[Devil's Advocate point conceded in part]** The one real DOM/canvas difference for this app:
   pixel-art scaling under *animated* transforms at fractional DPR (DOM can shimmer/resample;
   canvas gives integer-snap control). Worth the one-day spike; not worth a gating investigation.

**Accepted risks recorded:** gates may still soften by Iteration 3 (Executor's 70% base rate) —
accepted deliberately, heavier process has a worse failure mode here. If Iteration-2 juice
effects drop below ~55fps on the reference device, the DOM choice gets revisited (ADR trigger).
