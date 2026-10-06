<!-- layer: records · status: living (while open) · verified: 2026-10-06 -->
# 002 · adopt-standard — gate ledger
| Gate | CHECK | EXPECT | EVIDENCE |
| --- | --- | --- | --- |
| G1 | `bun .standard/standard-check.mjs .` | exit 0 | |
| G2 | `bun run check` | exit 0 | |
| G3 | `sh -c "! grep -rIl -e /Us[e]rs/ -e /ho[m]e/ AGENTS.md CLAUDE.md STATE.md docs .github"` | exit 0 | |
| G4 | `sh -c "! grep -rIl -i fa[e]ez AGENTS.md CLAUDE.md STATE.md docs/slices docs/roadmap.md docs/_archive/index.md .github"` | exit 0 | |
| G5 | `sh -c "test ! -e ROADMAP.md && test ! -e docs/workflow-state.md && test -e docs/records/roadmap-2026-08.md && test -e docs/_archive/index.md"` | exit 0 | |
