<!-- layer: records · status: living (while open) · verified: 2026-10-06 -->
# 002 · adopt-standard — notes

## Builder decisions
| # | Decision | Basis |
| --- | --- | --- |
| 1 | AGENTS.md §3 lists docs/roadmap.md and DESIGN.md in the read-first chain, since Minimal has no docs/README.md. | inferred: template item 2 is Standard-and-up; the lint passes with it |
| 2 | AGENTS.md §6 rules carry no lesson links; Minimal has no docs/lessons.md. | verified: lint accepts it; STANDARD §6 lets Minimal leave §6 empty |
| 3 | The "(decision 001)" citation was dropped from engine-purity rules: decision 001 is about DOM rendering, not engine purity. AGENTS.md §5 cites 001 for rendering only. | verified: read the decision |
| 4 | docs/runbooks/deploy.md rewritten into the six runbook sections, all facts kept; the per-user dashboard link and the personal-handle SSO alias URL were generalised in wording. | inferred: public-repo name hygiene (lint H-rule family); nothing else lost |
| 5 | Moved records and archived files each received a one-line header (status record or archived) so the S3 header rule passes; no other content change. | verified: lint S3 failed without it |
| 6 | STATE.md Measurements: tokens and owner minutes written as "not recorded"; fix rounds 0. | inferred: not measurable from inside the slice |
| 7 | The pointer file docs/design/design-system.md was deleted with git rm; the empty folder disappeared with it. | verified: brief |

## Not checked
- Dead links inside moved files (they still point at old paths such as docs/workflow.md); the lint does not flag them.
- README.md still links to ROADMAP.md, docs/workflow.md and docs/iterations/...; README is out of scope, so these links are now dead. Owner or a README slice must fix them.
- src/ui/DebugHarness.tsx line 5 comment cites docs/gates.md (now archived); src/ is out of scope.
- CI job `standard-check` has not run on GitHub; only the local lint was run.
- Independent fresh-agent cold-start test (the answer below is the builder's own).

## Cold-start answer (from AGENTS.md and STATE.md only)
- What is live: the browser-only crossword app at the URL README.md names, Iteration 1 shipped 2026-08-12; pushes to main auto-deploy; `bun run check` green.
- What is next: nothing planned; project paused since 2026-08-12; to resume, run the check, read docs/roadmap.md, pick a goal with the owner, open a slice.
- What waits on the owner: uploading public/og-image.png as the repository social preview image; deciding about the untracked supabase/ folder; picking a goal if the project is to resume.
