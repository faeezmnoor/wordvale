# STATE — WordVale
<!-- layer: state · status: living · budget: 80 lines -->
verified: 2026-11-20 at 8de5973 by bun run check exit 0 and the 1.7.0 lint at 0 FAIL, 11 WARN (dead links inside records and archive); CI checks on pull request 4 read (all pass); PR list read (none open)

## Now
- Adopted the house standard at Minimal tier (PR #1, merged 2026-10-06): AGENTS.md, STATE.md, roadmap, records and archive, CI with the lint required on main.
- Live: the app at the URL README.md names; Iteration 1 (core loop) shipped 2026-08-12.
- Paused since 2026-08-12; nothing half-finished, nothing merged but undeployed.
- Pushes to main deploy automatically (verified 2026-08-12); the deploy steps are in docs/runbooks/deploy.md.
- `bun run check` exits 0 as of 2026-11-20.
- Standard 1.7.0 re-applied 2026-11-20 (pull request 4, 8de5973): lint bundle and declared version; no line-length or chain-length rows, so nothing changes on 2026-12-14. The 1.6.x re-apply and its local audit (docs/records/audit-2026-11.md) merged 2026-11-11; the 11 remaining lint rows are warnings on dead links inside records and archive.
- Not built from the original v1 plan: coin economy, image/OCR input, voice input (docs/roadmap.md).

## Next
1. Nothing planned. To resume: run `bun install && bun run check` (must be green), read docs/roadmap.md, pick a goal with the owner, then open a slice under docs/slices/.

## Blocked
- reported: a code comment in src/ui/DebugHarness.tsx cites docs/gates.md, now archived; code is out of scope for this migration.
- An untracked supabase/ folder exists locally; the owner decides whether it belongs in the repo.

## Direction in force
- Paused side project; resume only on an owner-chosen goal (docs/roadmap.md).

## Owner items
1. Upload `public/og-image.png` as the repository's social preview image (repository Settings, General, Social preview). Browser only; everything else is done.
2. Decide what to do with the untracked supabase/ folder (see Blocked).
4. Archived gate logs and records that pre-date the standard contain the owner's first name; decide whether to scrub them (public repository).

## Measurements
| Slice | Builder tokens | Reviewer tokens | Fix rounds |
| --- | --- | --- | --- |
| 002-adopt-standard | ~90k | ~74k | 0 (path fixes only) |
Owner minutes this week: 0. Last cold-start test: 2026-10-06, pass (independent reviewer).
