<!-- layer: records · status: record · verified: 2026-10-06 -->
# WordVale — Roadmap & Idea Bank

**Status: paused 2026-08-12, after Iteration 1 shipped.** The game is live, playable, and
open source. Nothing below is committed work — it's a structured bank of everything we
considered, so any of it can be picked up cold, months later, without re-deriving context.

> **If you are an AI agent picking this up:** read [`CLAUDE.md`](CLAUDE.md) →
> [`docs/workflow.md`](docs/workflow.md) → [`docs/workflow-state.md`](docs/workflow-state.md)
> first. This project runs a gated 6-stage cycle (Plan → Design → Tech Spec → Build → Test →
> Retro) with owner approval between stages. Do not start building from this document — items
> here are inputs to a Stage-1 plan, not a backlog to burn down. Each item states *why*, *where
> in the code*, and *what would make it done*, so it can be lifted straight into a plan.

---

## 1. Where things actually stand

**Shipped and live** ([wordvale-two.vercel.app](https://wordvale-two.vercel.app)):
generator engine · text input with failure handling · themed packs · review/regenerate ·
keyboard-and-selection play · save/resume library · celebration · synthesized audio ·
pixel design system.

**Planned for v1 but never built** — be honest about this when planning:

| Gap | Where it stands |
|---|---|
| **Image/OCR input** | Was Iteration 3. Tab exists in the Create screen, marked "soon". Nothing implemented. |
| **Voice input** | Was Iteration 4. Same — placeholder tab only. |
| **Coin economy** | Was Iteration 2. Coins are *awarded and persisted*, but there is nothing to spend them on. No letter reveals, no slot machine, no score carryover. |

So the app as it stands is Iteration 1 of a planned four. The economy and the extra input
methods are the largest unbuilt pieces, and the roadmap below folds the owner's newer ideas
into that reality.

---

## 2. Near-term: finish what the loop is missing

*These make the existing game feel complete rather than adding new surface area.*

### 2.1 Score & coin carryover (owner-requested)

Coins persist in `localStorage` today, but each puzzle is an island: no lifetime score, no
sense of accumulation, nothing to spend on.

- **Build:** a lifetime profile — total score, total coins, puzzles solved, current streak.
  Surface it on Home (a small "farm ledger" panel) and in the completion overlay
  ("+550 · lifetime 4,310").
- **Then give coins a purpose** — this is the piece that makes carryover *mean* something:
  - **Letter reveal**, cost escalating within a session (was the original Iteration-2 design:
    30 → 45 → 68 → …). Must never softlock: if a player has 0 coins they can still finish.
  - **Slot-machine bonus** on some completions — jackpot or small coin payout.
- **Where:** `src/state/economy.ts` (all constants already centralized here),
  `src/state/storage.ts` (add a `profile` record, bump `SCHEMA_VERSION` and write a migration),
  `src/ui/screens/Play.tsx` and `Home.tsx`.
- **Watch out:** the storage schema is versioned — adding a store requires a migration path for
  people who already have puzzles saved. Test upgrade-from-v1, not just fresh installs.
- **Done when:** coins earned in one puzzle are visibly spendable in the next; a 0-coin player
  can always complete a puzzle; the ledger survives a refresh.

### 2.2 Word-list cleaning for better puzzles (owner-requested)

Today a word list is normalized (case, accents, duplicates) and otherwise used as-is. Poor
lists therefore make poor grids — all-short words interlock badly, and a list of 3-letter
words produces a sparse, dull puzzle.

- **Ideas worth testing:**
  - **Quality feedback before generating:** "these words share few letters — expect a loose
    grid" with a suggestion to add a longer word.
  - **Smart subsetting:** when given 40 words, pick the ~15 that interlock best rather than
    refusing or truncating arbitrarily.
  - **Length balancing:** prefer a mix of lengths when subsetting; flag all-short lists.
  - **Stop-word / junk stripping** for pasted prose (the/and/of), so pasting a paragraph works.
  - **Paste-a-paragraph mode:** extract candidate words from free text automatically.
- **Where:** `src/engine/precheck.ts` (pure, well-tested — extend here, not in the UI),
  new metrics in `src/engine/metrics.ts`, surfaced by `src/ui/screens/Create.tsx`.
- **Watch out:** the engine is pure and deterministic by contract. Any selection logic must
  take the seeded RNG, not `Math.random`, or the test suite and "regenerate" both break.
- **Done when:** pasting a messy paragraph yields a good puzzle; property tests still pass;
  quality metrics measurably improve on a corpus of deliberately bad lists.

### 2.3 Remaining input methods (originally Iterations 3–4)

- **Image/OCR** via `tesseract.js`, entirely client-side. Route output through the *existing*
  Create review screen so a human always corrects it — that human step is the safety net for
  mediocre OCR. Needs a committed corpus of test images. ~10MB wasm: load it lazily so it
  never touches the main bundle.
- **Voice** via the Web Speech API. Feature-detect and hide the tab where unsupported (Firefox
  has no support); frame it as a bonus path, never the only way to do something.
- **Where:** `src/ui/screens/Create.tsx` — the tab strip was built to take four tabs, and the
  camera/mic placeholders are already in place.

---

## 3. Difficulty — making puzzles harder

Owner's observation: showing the full word bank makes puzzles too easy. **This is the single
most important gameplay question and remains undecided.** Candidate mechanics, cheapest first:

| Mechanic | Idea | Notes |
|---|---|---|
| **First-letter-only bank** | Show `H······` instead of `HARVEST` | Small change, big difficulty jump. Good first experiment. |
| **Hidden bank / hints-only** | Show only word lengths — classic hard kriss-kross | The purest version. May be too hard without a hint button. |
| **Progressive reveal** | Bank starts hidden; each solve reveals a few more words | Self-balancing; forgiving for beginners. |
| **Timed modes** | Countdown, or "beat your best" per puzzle | Cuts against the cozy tone — consider opt-in only. |
| **Limited placements** | Wrong placement costs coins or a life | Pairs naturally with the economy (§2.1). |
| **Difficulty tiers at generation** | Denser grids, more intersections, longer words | Engine-side; needs new scoring weights. |
| **Daily hard puzzle** | One bank-hidden puzzle a day, seeded by date | Pairs with streaks; the seeded engine makes this nearly free. |

**Design position to decide first:** is difficulty a *per-puzzle choice* (easy/normal/hard
picker at creation) or a *global progression* (it gets harder as you play)? Everything else
follows from that answer.

**The engine is already ready for all of this.** Placement data is deliberately separate from
presentation: the grid knows nothing about what the word bank displays. Hiding or masking the
bank is a UI change in `src/ui/screens/Play.tsx` plus a flag on the puzzle record — no engine
work at all.

---

## 4. The living world — deepening the Stardew feel

Owner's direction: the cozy game feel is right but too sparse. Ideas, in rough order of
impact-per-effort:

- **A plant grows where you solve.** When a word is completed, a sprout animates up beside it
  and — after a beat — fruits. This is the owner's favourite idea and the most on-theme:
  solving literally cultivates the field.
- **A villager walks by** when a word completes, crossing the empty margin of the grid.
  *Constraint the owner flagged:* only run it when there's genuinely enough empty space —
  compute a clear horizontal band from the grid bounds before triggering, and skip on small
  screens.
- **Seasonal skins** — palette and decoration shift with the real calendar (spring blossom,
  autumn wheat, winter frost). The design tokens are already centralized, so this is mostly a
  palette swap plus themed sprites.
- **Theme-matched scenery** — a Travel puzzle gets different flora than a Fantasy one.
- **Idle life** — birds landing, the mascot blinking or stretching, grass swaying.
- **Richer completion** — the field blooming all at once rather than confetti alone.
- **Sound to match** — a seasonal ambience variation, a growth chime distinct from the solve
  arpeggio.

**Production note from the owner:** asset generation and animation QA should be **delegated to
separate agents** — one to produce sprite sheets and animation specs, another to review them
against the design system for consistency, frame timing, and palette adherence. Worth setting
up as a repeatable pipeline before commissioning a large batch.

**Constraints that must hold** (see [`DESIGN.md`](DESIGN.md)):
- Everything is stepped animation (`steps()`), never smooth easing — smooth tweening on pixel
  art looks wrong and breaks the illusion.
- No pure black or white. Palette only.
- Currently there are **zero image files** — all art is inline pixel SVG in
  `src/ui/components/Sprites.tsx`, all audio is synthesized. Introducing real sprite sheets is
  a deliberate architectural change: it costs the "no assets" property (offline simplicity,
  tiny bundle) and should be a conscious decision, not a drift.
- Respect `prefers-reduced-motion` — animations already degrade to static states.

---

## 5. Longer-term: sharing, backend, platform

Owner's third bucket. Deliberately vaguer, and worth challenging before building.

- **Shareable puzzles — no backend needed.** A puzzle is fully described by its words and
  seed, so it can be encoded into a URL (`?p=<base64>`) and shared. **This is the highest-value
  item in this section and needs no server at all.** Someone opening the link regenerates the
  identical grid, because the engine is deterministic.
- **Share your result** — a spoiler-free image or emoji grid of your solve (the Wordle
  pattern), which is what actually drives word-game sharing.
- **A backend** would be needed only for: cross-device sync, accounts, leaderboards, a curated
  daily puzzle for everyone, or user-submitted packs. **Challenge this before starting** — the
  no-backend constraint is why this app is free to run, private by default, and works offline.
  Do not add a server for sharing alone; the URL approach covers it.
- **PWA install** — manifest plus service worker so it installs to a phone home screen and runs
  fully offline. Cheap, and fits the offline-first design.
- **Multiple grids per list** — "play these words again, different layout" is nearly free given
  seeding, and adds replay value with no new content.

---

## 6. Smaller polish items

Carried from [`docs/backlog.md`](docs/backlog.md) and review findings:

- **Clue layer** — optional user-written or dictionary clues on top of fill-in mode (the
  consciously deferred "real crossword" mode).
- **Accessibility pass** — currently at a deliberate minimum: focus rings, a lock icon so
  solved state isn't colour-only. Needs screen-reader grid semantics and a keyboard-only audit.
- **Undo** for a mis-placed word.
- **Puzzle rename** in the library.
- **Export/print** a puzzle as a PDF or image.
- **Non-Latin alphabets** — the engine assumes A–Z; supporting other scripts is a real project.
- **`docs/gates.md` design-approval bar** was written for previews; update it for a live app.

---

## 7. Open questions worth answering before the next build

1. **Difficulty: per-puzzle choice or global progression?** (§3) Everything else in difficulty
   depends on this.
2. **Does the economy stay cosmetic, or gate progress?** Letter reveals that cost coins change
   how the game is played; a purely decorative coin counter doesn't.
3. **Do real image assets enter the project?** (§4) It trades the zero-asset property for
   richer animation. Currently zero — deliberately.
4. **Is a backend ever justified?** (§5) Sharing doesn't need one. Sync and leaderboards do.
5. **Who is this for?** Learners drilling vocabulary and casual players want different things —
   the former wants their own word lists to work well, the latter wants themed packs and daily
   puzzles. The answer reorders this entire roadmap.

---

## 8. Notes for whoever picks this up

- **Run `bun run check` before anything.** If it's red, fix that first — it was green when the
  project was paused.
- **The engine and play machine are pure and tested.** `src/engine/` and
  `src/ui/playMachine.ts` have no DOM or React dependency and are covered by property tests.
  Keep them that way; it's what makes everything else safe to change.
- **The build log is the best onboarding doc.**
  [`docs/iterations/01-core-loop/04-build-log.md`](docs/iterations/01-core-loop/04-build-log.md)
  records every slice, every bug found in review, and what caused it.
- **Deploys are automatic** — pushing to `main` deploys to production. There is no staging
  environment, so a bad push is live in about a minute.
- **The owner's working style** is documented in [`docs/workflow.md`](docs/workflow.md): small
  vertical slices, each reviewed; plain-language summaries over jargon; scope locked at plan
  approval with new ideas parked rather than absorbed mid-build.
