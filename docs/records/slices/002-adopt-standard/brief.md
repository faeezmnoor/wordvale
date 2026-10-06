<!-- layer: knowledge · status: living (while open) · verified: 2026-10-06 · budget: 200 lines -->
# 002 · adopt-standard — brief (context pack)
Source: the house standard ($STANDARD_DIR/STANDARD.md) §3 file map, §4 Minimal tier, §6 AGENTS.md, §7 STATE.md, §12 lint and archive policy, §13 runbook (Minimal steps 2, 3, 4, 9, 10, 12, 13). Lessons L-04 to L-10 from migration 1 apply. Templates: $STANDARD_DIR/templates/.

Goal: conform this paused, live, public repository to the house standard at Minimal tier (UI: yes, DB: no) so that `bun .standard/standard-check.mjs .` exits 0, a fresh agent resumes it cold from AGENTS.md and STATE.md, and nothing a future session needs is lost.
In scope:
- AGENTS.md from the template (eight numbered sections plus the header; header `standard: 1.1.1 · tier: minimal · ui: yes · db: no · verified: <date>`), built from the current CLAUDE.md, package.json and the repo tree. Section 2 verification command: `bun run check`. Section 6 carries the architecture rules from CLAUDE.md as one-liners (engine is pure, no React/DOM/Math.random; state in src/state; design per DESIGN.md).
- CLAUDE.md reduced to `@AGENTS.md` plus at most 20 lines (the DESIGN.md reminder may stay as one line).
- STATE.md (≤ 80 lines) written from the live facts: paused since 2026-08-12 after Iteration 1; live at the URL README names; pushes to main auto-deploy; `bun run check` green today; Next: nothing planned, "to resume" steps; Blocked: nothing; Owner items: the one browser task from workflow-state.md (upload the social preview image) in generic wording; Direction: paused side project; Measurements: this slice.
- docs/roadmap.md (≤ 30 lines, STATE layer header): Now (paused), Next (none), Later (the grouped idea areas from ROADMAP.md as one line each, pointing to the archived full document).
- Moves, never deletes: ROADMAP.md → docs/records/roadmap-2026-08.md (full idea bank, header `layer: records · status: record`); docs/workflow-state.md, docs/workflow.md, docs/gates.md, docs/backlog.md, docs/00-vision.md → docs/_archive/2026-10/ with docs/_archive/index.md rows (reason: superseded by the standard; Minimal tier runs the generic contract); docs/iterations/ → docs/records/slices/ (closed work; keep folder names); docs/deploy.md → docs/runbooks/deploy.md with the runbook header; docs/decisions/001-dom-vs-canvas.md: add the one-line header after any frontmatter and a `status:` if missing; docs/design/design-system.md (a 4-line pointer) → delete the pointer only (it is a pointer, not content) and remove the empty folder; DESIGN.md stays as it is (Minimal does not require Google's format); docs/screenshots stays (README uses them).
- CI: keep the existing .github/workflows/ci.yml job(s); add a `standard-check` job (setup Bun, `bun .standard/standard-check.mjs .`). No continue-on-error anywhere (L-07).
- docs/slices/002-adopt-standard/notes.md with Builder decisions (verified/inferred) and the cold-start test record.
Out of scope: src/, tests/, index.html, configs other than ci.yml, README.md, LICENSE, DESIGN.md content, vercel.json; the untracked `supabase/` folder (leave it untracked; mention it in STATE.md Blocked as "an untracked supabase/ folder exists locally; the owner decides whether it belongs in the repo").
Stop if: the lint demands a file this brief forbids; `bun run check` fails for reasons unrelated to your changes; anything would put a person's name or an absolute home path into a committed file.

## Rules that apply (copied in, with source)
- Public repository: no person's name, no absolute home path, no internal queue or decision-page link in any committed file (§1 constraints; lint H1; L-05, L-09).
- Nothing is deleted except the 4-line pointer file; moves go to docs/records/ or docs/_archive/2026-10/ with an index row (§12 archive policy; Goal 6).
- Every docs/ file carries the one-line header; records use `layer: records · status: record` (§12).
- The STATE.md verified line is written last, naming the head commit (L-10).
- AGENTS.md §2's verification command is itself a gate (L-08): run `bun run check`.
- Merge only through a pull request with CI green on the exact head; work on branch slice/002-adopt-standard (already created).

## Files to read (only these)
- $STANDARD_DIR/STANDARD.md (§3, §4, §6, §7, §12, §13 by heading) and $STANDARD_DIR/templates/{AGENTS.md,CLAUDE.md,STATE.md,docs/roadmap.md,docs/_archive/index.md,docs/runbooks/_template.md}
- CLAUDE.md, ROADMAP.md, docs/workflow-state.md, docs/backlog.md (headings and first lines), docs/deploy.md, docs/decisions/001-dom-vs-canvas.md, .github/workflows/ci.yml, package.json, README.md lines 1–10

## Carry-overs from migration 1
- L-07 report-only CI jobs use a ::warning, not continue-on-error (not needed here: check passes).
- L-08 the verification command is a gate. L-09 review and notes files are name-free. L-10 verified line last.

## Decisions already made (do not reopen)
- Tier Minimal, UI yes, DB no (0001). HANDOVER-style files are retired (0003). ROADMAP ≤ 30 lines (0003). Archive policy (0008). Sequential migration with LEARN (0009).

## Report
Fixed format, under 300 words: Verdict · Commits · Gates met/total · Findings (for LEARN) · Decisions I made (verified/inferred) · Needs the owner.
