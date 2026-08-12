# WordVale

Turn any word list into a cozy pixel-art crossword you can play in the browser.

Paste words, pick a theme, or bring your own list — WordVale weaves them into a
word-bank fill-in (kriss-kross) puzzle, then you solve it by typing or by tapping
words into their slots. Everything runs client-side: no backend, no accounts, and
your puzzles are saved in your own browser.

## Play locally

```bash
bun install
bun run dev          # http://localhost:5173
bun run dev --host   # also serve on your local network (for phones)
```

## Commands

```bash
bun run check   # typecheck + lint + tests — must be green before every commit
bun run test    # engine + play-machine tests
bun run build   # production build to dist/
```

## What's inside

- **`src/engine/`** — the puzzle generator: pure, seeded, no DOM. Given words and a seed it
  produces a legal interlocking grid, or explains precisely why it can't.
- **`src/ui/playMachine.ts`** — the play-screen state machine (typing, Tab cycling, word
  placement, solving), also pure and unit-tested.
- **`src/ui/`** — React screens in a hand-built pixel design system (see [DESIGN.md](DESIGN.md)).
- **`src/audio/`** — all sound effects and ambience synthesized at runtime; no audio assets.
- **`docs/`** — how this project is built: the [workflow contract](docs/workflow.md), the
  [iteration plans](docs/iterations/), and the design system.

## Deploying

See [docs/deploy.md](docs/deploy.md).
