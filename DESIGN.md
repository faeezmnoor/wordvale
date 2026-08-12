# Design System — WordVale

## Product Context
- **What this is:** Browser-only crossword generator + player. Word list in → word-bank fill-in puzzle out → play.
- **Who it's for:** Casual players and self-learners turning any word list (study vocab, themes, names) into a game.
- **Space/industry:** Casual word games (Wordscapes, NYT Games) × cozy sims (Stardew Valley).
- **Project type:** Web app (game).

## Memorable Thing
> "My word list became a tiny cozy place — a game, not a utility."

Every decision below serves this: the moment the grid appears it should feel like opening a
pocket game, not using a generator tool.

## Aesthetic Direction
- **Direction:** Cozy Pixel (Organic/Natural × Retro-pixel). Warm parchment surfaces framed in
  wood panels, sprite icons, chunky pixel borders. Stardew-adjacent, not Stardew-cloned.
- **Decoration level:** Expressive for game chrome (panels, coins, celebrations), intentional for
  text-heavy moments (input, settings) so usability never fights charm.
- **Mood:** Warm, generous, a little nostalgic. The app smiles at you; it never feels like admin.

## Typography
- **Display/Hero:** **Pixelify Sans** (OFL, Google Fonts) — rounded, friendly pixel display face;
  reads "cozy game" instantly without arcade harshness (deliberately NOT Press Start 2P).
- **Grid letters & numerals:** **Silkscreen** (OFL, Google Fonts) — purpose-built for legibility at
  tiny pixel sizes; uppercase-only in cells; also used for score/coin counters (tabular feel).
- **Body/UI:** **DM Sans** — warm humanist sans for instructions, buttons, longer text. Pixel fonts
  fatigue at paragraph length; DM Sans keeps reading effortless while staying friendly.
- **Loading:** Google Fonts `<link>` for Iteration 0 preview; **self-host woff2 in `src/assets/fonts/`
  from Iteration 1** (offline app — no runtime CDN dependency).
- **Scale (rem):** hero 2.5 / h1 2 / h2 1.5 / body 1 (16px) / small 0.875 / grid-cell: 55–60% of cell height.

## Color
- **Approach:** Balanced, warm-earth. No pure `#000` or `#FFF` anywhere.

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#3B2A1E` | Primary text (deep warm brown) |
| `--ink-soft` | `#6B5744` | Secondary text |
| `--parchment` | `#F1E3C3` | App background |
| `--parchment-hi` | `#FAF1DC` | Cards, grid cells (empty) |
| `--wood` | `#8A5A38` | Panel frames, header |
| `--wood-dark` | `#5B3A24` | Borders, panel edges |
| `--meadow` | `#5FA344` | Primary action, solved words |
| `--meadow-dark` | `#3F7A2E` | Action borders/pressed |
| `--sky` | `#5A9BD8` | Info, selection highlight |
| `--gold` | `#E8B33C` | Coins, score, celebration |
| `--berry` | `#C24B3F` | Errors, destructive |
| `--sky-tint` | `#DCEBF7` | Focused-word cell fill |
| `--meadow-hi` | `#7DBB5E` | Grass highlight |
| `--gold-dark` | `#C9922A` | Coin shading, solved-chip text |
| `--berry-dark` | `#8F3428` | Error borders/pressed |

- **Semantic:** success `--meadow`, info `--sky`, warning `--gold`, error `--berry`.
- **Dark mode ("night on the farm"):** deferred to backlog — v1 ships the single warm-light look.
  When it comes: indigo-brown night sky (`#241E2B`/`#2A2233`) with lamp-lit warm surfaces, not gray.

## Spacing & Tiles
- **Base unit:** 4px. Scale: 4 / 8 / 12 / 16 / 24 / 32 / 48.
- **Tile size:** grid cells fit their container at any whole-pixel size 24–72px (letters are font
  glyphs, not sprite art — free scaling is safe). **Integer scaling (×1/×2/×3) applies to sprite
  art only** (icons, mascot, decorations, authored on 8/16px grids); `image-rendering: pixelated`
  on all pixel art. *(Amended 2026-08-12 by design-review — previous "32px only" rule conflicted
  with the fit-to-container space directive.)*
- **Silkscreen floor:** never below 12px (0.75rem) — the face goes mushy under its pixel grid.
- **Density:** comfortable; the grid is the hero, chrome stays out of its way.

## Layout
- **Approach:** grid-disciplined app inside playful chrome. Content max-width 960px, centered.
- **Panels:** wooden frame pattern — `--parchment-hi` surface, 3px `--wood-dark` border,
  hard offset shadow (`4px 4px 0`), square corners with a 2px corner notch. **No soft
  border-radius, no blur shadows** — depth comes from hard pixel offsets.
- **Buttons:** chunky 3px-border blocks; press = translate down 2px + shadow shrink (no opacity fades).

## Motion
- **Approach:** intentional, and **stepped**: pixel art snaps between frames. All keyframe
  animations use `steps(n)` easing — smooth tweens on pixel art read as slop.
- **Signature moments:** tile-fill pop (scale 1 → 1.12 → 1 in 3 steps, ~180ms), word-solve ripple
  along the word's tiles (40ms stagger), coin fly-to-wallet arc (steps(8), ~400ms), puzzle-complete
  confetti of 8×8 pixel squares.
- **Duration:** micro 100ms / short 180ms / medium 300ms / long 500ms. Respect `prefers-reduced-motion`.

## Safe choices vs deliberate risks
- **Safe:** humanist body font for all reading text; conventional app navigation (home/library/create);
  high-contrast ink-on-parchment in grid cells.
- **Risk 1 — full pixel chrome:** panels/buttons/shadows are pixel-styled everywhere, not just accents.
  Gain: unmistakable identity. Cost: every new component needs the pattern applied (no default shadcn look).
- **Risk 2 — steps() motion:** stepped easing across the app is rare on the web. Gain: authentic
  game feel. Cost: needs discipline; a single smooth-tween component breaks the illusion.
- **Risk 3 — dual-font pairing:** pixel display + humanist body. Gain: charm AND readability.
  Cost: the boundary must be policed (pixel fonts never used for paragraphs).

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-08-12 | Initial system via /design-consultation (autonomous; owner gate pending) | Recommended choices made solo per launch brief; Faeez judges the in-stack preview at the Iteration-0 owner gate |
| 2026-08-12 | Pixelify Sans over Press Start 2P | Rounded warmth fits cozy-sim mood; PS2P reads harsh arcade and is illegible small |
| 2026-08-12 | Dark mode deferred to backlog | v1 scope discipline; single warm look ships polished |
| 2026-08-12 | Pixelify Sans allowed on buttons/tabs for labels ≤3 words; DM Sans for all sentence-length UI text | Design-review found the drift, judged it right for game feel — recorded instead of silent |
| 2026-08-12 | Derived tokens promoted (`--sky-tint`, `--meadow-hi`, `--gold-dark`, `--berry-dark`); tile-size rule scoped to sprite art; Silkscreen 12px floor | Stage-2 design-review findings #7/#8/#12/#14 |
