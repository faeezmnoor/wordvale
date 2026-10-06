# 🌾 WordVale

**Turn any list of words into a cozy pixel-art crossword — then play it.**

### ▶ [Play it now](https://wordvale-two.vercel.app) · no signup, works on your phone

Paste your vocabulary list, your grocery list, or the names of everyone at the
party. WordVale weaves the words into an interlocking puzzle and hands it back to
you to solve. Everything runs in your browser: no accounts, no server, no data
leaving your device.

![WordVale home screen](docs/screenshots/01-home.png)

---

## How it works

### 1. Give it some words

Type or paste them — one per line or comma-separated. Words are checked as you
type, so anything too short, duplicated, or full of spaces is flagged before you
press Generate. Accents are handled (`café` becomes `CAFE`).

![Entering words, with live validation](docs/screenshots/02-create.png)

**Or don't.** Pick one of eight built-in themes and get a puzzle instantly.

![The eight themed packs](docs/screenshots/03-themes.png)

### 2. Check the shape before you commit

You see the puzzle before you play it. Don't like the layout? Regenerate for a
different one. Want to change your words? Go back and edit — your list is still
there.

![Reviewing a generated puzzle](docs/screenshots/04-review.png)

### 3. Play it

Two ways to fill the grid, whichever suits you:

- **Type it.** Click a slot and start typing. Letters advance on their own, `Tab`
  hops to the next word, arrow keys move around, `Backspace` walks back.
- **Place it.** Tap a word from the bank and the slots it can legally fit light up.
  Tap one.

Solve a word and it locks in green, coins fly to your pocket, and the sprout beside
your progress grows. There's no drag-and-drop anywhere — it never feels good on the
web.

![Playing a puzzle, five of eight words solved](docs/screenshots/05-play.png)

Puzzles save automatically. Close the tab mid-word and pick up where you left off.

![The completion celebration](docs/screenshots/06-complete.png)

---

## What makes it interesting

**Some word lists simply cannot become a crossword.** `CAT, DOG, RABBIT, HORSE,
SHEEP, GOAT` shares too few letters to interlock, and the generator can prove it
rather than spin. So it says *"we fit 5 of 6 — drop CAT and play?"* and lets you
decide. Every way this can fail has a designed, plain-English screen.

**There are no asset files.** Every sound is synthesized at runtime with the Web
Audio API — the wood-block plucks as you type, the arpeggio when a word solves, the
birds and breeze on the home screen. Every icon is a hand-built pixel SVG. Not a
single image or audio file ships in the bundle, which is most of why it loads
instantly and works offline.

**Puzzles are reproducible.** The generator is fully deterministic: the same words
and the same seed always produce the same grid. That is what makes "regenerate"
just `seed + 1`, and what makes the whole thing testable without a browser.

---

## How it's built

React + TypeScript on Vite, no backend. Two pieces do the real work, and both are
pure, dependency-free and unit-tested:

**[`src/engine/`](src/engine/) — the puzzle generator.** Given words and a seed it
returns an interlocking grid or an honest explanation. It sorts words by how
connectable they are, places each at its best-scoring crossing, backtracks when it
paints itself into a corner, and builds 32 candidate layouts before picking a
winner. A property test throws 500 random word lists at it and checks every grid is
legal, connected and correctly normalized.

**[`src/ui/playMachine.ts`](src/ui/playMachine.ts) — the play logic.** Every
interaction is a pure reducer over one immutable state object. The grid is the
single source of truth for letters, so a crossing square can never disagree with
itself. All the fiddly rules live here: typing over a solved letter, `Backspace` at
the start of a word, which direction a shared square belongs to on a second tap.

The rest is React screens (`src/ui/`), local storage (`src/state/`) and runtime
audio (`src/audio/`).

### The design system

The whole look is defined in **[DESIGN.md](DESIGN.md)** — an earthy palette with no
pure black or white, real pixel typefaces, hard offset shadows instead of blurs,
and stepped `steps()` animation, because smooth tweening on pixel art looks wrong.
Read it first if you're contributing UI.

### The process, in the repo

Unusually, how this got built is committed alongside the code in
**[`docs/`](docs/)**: the [workflow contract](docs/_archive/2026-10/workflow.md) and, for each
iteration, the [plan](docs/records/slices/01-core-loop/01-plan.md),
[design spec](docs/records/slices/01-core-loop/02-design.md) and
[technical spec](docs/records/slices/01-core-loop/03-tech-spec.md). Each stage has to
clear a review gate before the next one starts.

---

## Run it yourself

You'll need [Bun](https://bun.sh).

```bash
git clone https://github.com/faeezmnoor/wordvale.git
cd wordvale
bun install
bun run dev          # → http://localhost:5173
```

| Command | What it does |
|---|---|
| `bun run dev` | Dev server with hot reload |
| `bun run check` | Typecheck + lint + tests |
| `bun run test` | The test suite on its own |
| `bun run build` | Production build into `dist/` |

There's a **generator playground** at `/?harness` in dev mode: type any word list,
step through seeds, and watch grids appear with their quality metrics. It's the
fastest way to get a feel for the algorithm.

## Contributing

Issues and pull requests are welcome. A few invariants worth knowing:

- `bun run check` must be green.
- `src/engine/` stays pure — no React, no DOM, no `Math.random()`, no `Date.now()`.
  Randomness comes from a seeded generator that's passed in. This is what keeps
  puzzles reproducible.
- Icons are hand-built pixel SVGs in
  [`Sprites.tsx`](src/ui/components/Sprites.tsx) — no emoji in the interface.
- Gameplay constants belong in [`economy.ts`](src/state/economy.ts) or
  [`config.ts`](src/engine/config.ts), not scattered inline.

**[ROADMAP.md](docs/records/roadmap-2026-08.md)** groups every idea considered — harder puzzle modes, a
coin economy, growing plants where you solve, shareable puzzle links — with notes
on where each would live in the code.

## License

[MIT](LICENSE)
