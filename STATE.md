# STATE — WordVale
<!-- layer: state · status: living · budget: 80 lines -->
verified: 2026-10-06 at cb05950 by CI on PR #1 (Typecheck/lint/tests, Documentation standard, Vercel preview all green) and the reviewer cold-start test (pass)

## Now
- Adopted the house standard at Minimal tier (PR #1, merged 2026-10-06): AGENTS.md, STATE.md, roadmap, records and archive, CI with the lint required on main.
- Live: the app at the URL README.md names; Iteration 1 (core loop) shipped 2026-08-12.
- Paused since 2026-08-12; nothing half-finished, nothing merged but undeployed.
- Pushes to main deploy automatically (verified 2026-08-12); the deploy steps are in docs/runbooks/deploy.md.
- `bun run check` is green as of 2026-10-06.
- Slice 002-adopt-standard (house documentation standard, Minimal tier) built on its branch, not yet merged.
- Not built from the original v1 plan: coin economy, image/OCR input, voice input (docs/roadmap.md).

## Next
1. Nothing planned. To resume: run `bun install && bun run check` (must be green), read docs/roadmap.md, pick a goal with the owner, then open a slice under docs/slices/.

## Blocked
- reported: a code comment in src/ui/DebugHarness.tsx cites docs/gates.md, now archived; code is out of scope for this migration.
- Nothing.
- An untracked supabase/ folder exists locally; the owner decides whether it belongs in the repo.

## Direction in force
- Paused side project; resume only on an owner-chosen goal (docs/roadmap.md).

## Owner items
- The owner\'s first name appears in archived gate logs and records that pre-date the standard; decide whether to scrub them (public repository).
1. Upload `public/og-image.png` as the repository's social preview image (repository Settings, General, Social preview). Browser only; everything else is done.
2. Decide what to do with the untracked supabase/ folder (see Blocked).

## Measurements
| Slice | Builder tokens | Reviewer tokens | Fix rounds |
| --- | --- | --- | --- |
| 002-adopt-standard | ~90k | ~74k | 0 (path fixes only) |
Owner minutes this week: 0. Last cold-start test: 2026-10-06, pass (independent reviewer).
