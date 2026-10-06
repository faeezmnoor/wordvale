# AGENTS.md — WordVale
<!-- standard: 1.1.1 · tier: minimal · ui: yes · db: no · verified: 2026-10-06 -->

## 1. What this is
- Browser-only crossword web app: paste a word list, generate a word-bank fill-in puzzle, review it, play it.
- Pixel-art, farm-sim styling; score, coins, letter-reveal and bonus mechanics are only partly built.
- No backend: puzzles and history in IndexedDB, settings and wallet in localStorage.
- Live and open source (MIT) at the URL README.md names. Paused since 2026-08-12 after Iteration 1.

## 2. Stack and commands
- Runtime and package manager: Bun, TypeScript ESM, React 19, Zustand, Vite.
- Install: `bun install` · Dev: `bun run dev` · Test: `bun run test` · Typecheck and lint: `bun run lint` (oxlint), `tsc -b` · Build: `bun run build`
- Full verification (the gate for "done"): `bun run check` (tsc -b, oxlint, bun test; exits 0 when all pass)
- Documentation lint: `bun .standard/standard-check.mjs .` (exits 0 when the repo conforms to the house standard)

## 3. Read first, in this order (nothing else unless a brief cites it)
1. STATE.md — what is live, next, blocked
2. docs/roadmap.md — direction and idea areas (Minimal tier has no docs/README.md)
3. The current slice's docs/slices/<id>/brief.md
4. DESIGN.md before any visual or UI decision

## 4. Boundaries
- Never: push to main directly · read .env* or other secrets · call paid services · force-push, reset --hard, rm -rf
- Deploys happen on their own when main changes; do not run a manual production deploy.
- Generated, do not edit by hand: dist/, bun.lock (only through `bun install`).
- Stay inside the task named in the brief. Report a needed scope change; do not make it.

## 5. Where facts live
- Current state and owner items: STATE.md · Direction: docs/roadmap.md
- Decisions: docs/decisions/ (001 DOM rendering) · Design: DESIGN.md · Deploy steps: docs/runbooks/deploy.md
- Records (not reading): docs/records/, docs/_archive/ (index at docs/_archive/index.md)

## 6. Working rules
- src/engine/ is the pure puzzle generator: no React, no DOM, no browser APIs, no Math.random (a seeded RNG is passed in).
- src/engine/ never imports from src/ui/ or src/state/.
- Storage and the economy live in src/state/; every game and economy constant stays in src/state/economy.ts.
- src/ui/ holds React screens and components and follows DESIGN.md: no pure #000 or #FFF, real pixel fonts, no deviation without owner approval.
- src/data/ holds the bundled word packs (JSON); tests/engine/ holds property-based and unit tests.
- The IndexedDB schema is versioned: adding a store means bumping SCHEMA_VERSION and writing a migration.
- Run `bun run check` before every commit.

## 7. How work is done here
- Tier: minimal. No docs/workflow.md; one agent works a brief to its gate ledger.
- Merge only through a pull request whose CI passed on that exact commit.
- Done means: `bun run check` and the documentation lint both exit 0 at the final commit, and STATE.md is updated.

## 8. Repo map
- src/ — engine/ (generator), state/ (storage, economy), ui/ (screens), data/ (word packs)
- tests/ — engine/ unit and property tests, e2e/ browser checks
- docs/ — decisions/, runbooks/, slices/, records/ (closed work), _archive/ (superseded)
- public/ — static assets (favicon, social preview image) · DESIGN.md — visual design system
- .standard/ — vendored documentation lint · .github/workflows/ci.yml — CI
