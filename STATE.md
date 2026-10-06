# STATE — WordVale
<!-- layer: state · status: living · budget: 80 lines -->
verified: 2026-10-06 at bd6f5ad by `bun run check` exit 0, `bun .standard/standard-check.mjs .` exit 0, live URL README.md names (HTTP 200)

## Now
- Live: the app at the URL README.md names; Iteration 1 (core loop) shipped 2026-08-12.
- Paused since 2026-08-12; nothing half-finished, nothing merged but undeployed.
- Pushes to main deploy automatically (verified 2026-08-12); the deploy steps are in docs/runbooks/deploy.md.
- `bun run check` is green as of 2026-10-06.
- Slice 002-adopt-standard (house documentation standard, Minimal tier) built on its branch, not yet merged.
- Not built from the original v1 plan: coin economy, image/OCR input, voice input (docs/roadmap.md).

## Next
1. Nothing planned. To resume: run `bun install && bun run check` (must be green), read docs/roadmap.md, pick a goal with the owner, then open a slice under docs/slices/.

## Blocked
- Nothing.
- An untracked supabase/ folder exists locally; the owner decides whether it belongs in the repo.

## Direction in force
- Paused side project; resume only on an owner-chosen goal (docs/roadmap.md).

## Owner items
1. Upload `public/og-image.png` as the repository's social preview image (repository Settings, General, Social preview). Browser only; everything else is done.
2. Decide what to do with the untracked supabase/ folder (see Blocked).

## Measurements
| Slice | Builder tokens | Reviewer tokens | Fix rounds |
| --- | --- | --- | --- |
| 002-adopt-standard | not recorded | not recorded | 0 |
Owner minutes this week: not recorded. Last cold-start test: builder self-check 2026-10-06 (answers in docs/slices/002-adopt-standard/notes.md); independent fresh-agent test pending.
