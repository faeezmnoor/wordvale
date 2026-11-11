# STATE — WordVale
<!-- layer: state · status: living · budget: 80 lines -->
verified: 2026-11-11 at 98f8ed9 by bun run check exit 0, the CI run list and PR list read (PRs #1, #2 merged, none open); documentation lint 12 FAIL, all in records

## Now
- Adopted the house standard at Minimal tier (PR #1, merged 2026-10-06): AGENTS.md, STATE.md, roadmap, records and archive, CI with the lint required on main.
- Live: the app at the URL README.md names; Iteration 1 (core loop) shipped 2026-08-12.
- Paused since 2026-08-12; nothing half-finished, nothing merged but undeployed.
- Pushes to main deploy automatically (verified 2026-08-12); the deploy steps are in docs/runbooks/deploy.md.
- `bun run check` exits 0 as of 2026-11-11.
- 2026-11-11: re-applied standard 1.6.0 (lint bundle, declared version, harness-audit line in the AGENTS.md header); local audit in docs/records/audit-2026-11.md. Pending the pull request; 12 lint rows remain, all inside records (see Blocked).
- Not built from the original v1 plan: coin economy, image/OCR input, voice input (docs/roadmap.md).

## Next
1. Nothing planned. To resume: run `bun install && bun run check` (must be green), read docs/roadmap.md, pick a goal with the owner, then open a slice under docs/slices/.

## Blocked
- reported: a code comment in src/ui/DebugHarness.tsx cites docs/gates.md, now archived; code is out of scope for this migration.
- lint under 1.6.0: 11 dead links (H2) in closed records under docs/records/ and docs/_archive/ (paths moved by the 2026-10 adoption) and K1 (docs/decisions/001-dom-vs-canvas.md has no YAML frontmatter). Clearing them means editing records, which a re-apply does not do; the owner rules (Owner items).
- An untracked supabase/ folder exists locally; the owner decides whether it belongs in the repo.

## Direction in force
- Paused side project; resume only on an owner-chosen goal (docs/roadmap.md).

## Owner items
1. Rule how to clear the 12 lint rows in Blocked: re-point or backtick the dead links in the records and add MADR frontmatter to decision 001 (edits to records), or accept them as known.
2. Upload `public/og-image.png` as the repository's social preview image (repository Settings, General, Social preview). Browser only; everything else is done.
3. Decide what to do with the untracked supabase/ folder (see Blocked).
4. Archived gate logs and records that pre-date the standard contain the owner's first name; decide whether to scrub them (public repository).

## Measurements
| Slice | Builder tokens | Reviewer tokens | Fix rounds |
| --- | --- | --- | --- |
| 002-adopt-standard | ~90k | ~74k | 0 (path fixes only) |
Owner minutes this week: 0. Last cold-start test: 2026-10-06, pass (independent reviewer).
