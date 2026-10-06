<!-- layer: records · status: record · verified: 2026-10-06 -->
# Review — slice 002-adopt-standard

Reviewer lanes: correctness, public hygiene, cold start. Range: main...HEAD at 5b6d576. Nothing was modified except this file.

## Cold-start test (run first, from AGENTS.md and STATE.md only)
- Live: the app at the URL the README names; Iteration 1 shipped 2026-08-12; the project is paused.
- Next: nothing planned; to resume, run install and the full check, read the roadmap, pick a goal with the owner.
- Waits on the owner: upload the social preview image; decide about the untracked supabase/ folder.
- The two files sufficed.

## Gates (run as written)
- G1 lint: exit 0, 0 FAIL, 0 WARN. G2 `bun run check`: exit 0 (27 tests pass). G3, G4, G5: exit 0.

## Checks
1. Public hygiene: no person's name, home path, or internal queue or decision link in the added lines (the only hits are the lint's own pattern text and the generic design reminder). src/, tests/, README.md, LICENSE, DESIGN.md, vercel.json and index.html are untouched.
2. Nothing lost: all 6 root and docs moves plus the 13 iteration files differ from their sources by exactly one added header line (mockups are byte-identical). The archive index has 5 rows for 5 archived files. The only deletions are the 4-line pointer and the old deploy.md, whose content was rewritten into docs/runbooks/deploy.md (see finding 3).
3. AGENTS.md: header and eight sections present; header fields correct; commands and the five architecture rules match the main-branch CLAUDE.md; no tool-specific terms. STATE.md is 31 lines; its live-URL, paused and owner items are true and generic.
4. ci.yml: existing job kept unchanged; standard-check job added with checkout and Bun setup; no continue-on-error.

## Findings
1. Dead links (path-only fix, not a block; README is out of this slice's scope):
   - README.md line 109: docs/workflow.md has no live destination; the archived copy is docs/_archive/2026-10/workflow.md (or drop the link).
   - README.md lines 110-112: docs/iterations/01-core-loop/{01-plan,02-design,03-tech-spec}.md become docs/records/slices/01-core-loop/{01-plan,02-design,03-tech-spec}.md.
   - README.md line 152: ROADMAP.md becomes docs/records/roadmap-2026-08.md (or docs/roadmap.md for the summary).
   - src/ui/DebugHarness.tsx line 5 (comment): docs/gates.md becomes docs/_archive/2026-10/gates.md. src/ is out of scope; report only.
   - AGENTS.md, STATE.md, docs/roadmap.md and docs/runbooks/deploy.md: no dead links (the AGENTS.md mentions of docs/README.md and docs/workflow.md state that they do not exist at this tier).
2. STATE.md verified line names bd6f5ad, which is on the branch but is three commits behind the head (5b6d576). The final commit message says it names the final head. Harmless, but the line is not the head.
3. The deploy runbook was rewritten, not moved. The repository, dashboard and account-scoped alias details and the working-directory steps were dropped (reasonably, they carried a name and a home path). All operational steps and notes survive.
4. Pre-existing person's-name mentions remain in moved records, the archive and docs/decisions/001-dom-vs-canvas.md (they were public before the slice and content was preserved). G3 and G4 do not scope records or archive, so the lint and gates would not flag new ones there. Owner to decide whether to scrub.
5. The old CLAUDE.md "Owner communication" paragraph was removed; the content survives only in git history and nothing in the standard asks for it.

## Planted defects (restored from saved copies; tree clean)
- A name added to docs/roadmap.md: lint passed (it does not check names); gate G4 caught it.
- An absolute path added to STATE.md: lint rule H1 caught it and G3 caught it.
- Header removed from a records file: lint passed (records and archive are exempt from header checks); no gate caught it. Survived.

## Not checked
- CI on the exact head (not run here); rendering of the README; links inside moved records and archive files (they point at old paths by design).

VERDICT: APPROVE
