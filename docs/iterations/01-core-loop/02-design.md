# Iteration 1 — Stage 2 Design Spec

Applies [DESIGN.md](../../../DESIGN.md) to the core-loop screens. Mockups in
[mockups/](mockups/) are the rendered evidence; this doc is the contract.
Owner directives honored throughout: **space optimization** (grids fill their panel),
**no drag-and-drop** (selection + typing only), **raise the fun bar** (sprites, celebration,
micro-motion — not chrome-only).

## Screen map & navigation

```
Home ──"New puzzle"──▶ Create ──generate──▶ Review ──Play──▶ Play ──complete──▶ Celebration → Home
 ▲  └─resume/replay──────────────────────────────────────────▶ Play             │
 └───────────────────────────────────────────────────────────────────────────────┘
```

Top bar on every screen: WordVale wordmark (Pixelify) left; coin counter (Silkscreen + coin
sprite) right; back arrow (pixel chevron) on non-Home screens.

## 1. Home
- **First-run:** hero panel with a little pixel scene (rolling meadow strip, sun, sprout
  mascot), display-font greeting "Turn any words into a cozy crossword", one primary CTA
  **"Create your first crossword"**. No empty library shown — the CTA panel IS the screen.
- **With puzzles:** "New puzzle" primary button + library grid of puzzle cards (2–4 columns by
  width). Card = mini grid thumbnail (auto-drawn from placements), title (first words/theme),
  status chip (`In progress` sky / `Solved ★` gold), word count, relative date. Card menu:
  Resume/Replay, Delete (confirm dialog).
- **Space rule:** library fills the content column; cards stretch to equal heights.

## 2. Create
- Two input tabs in v1 (segmented pixel control): **My words** (pencil sprite) | **Surprise me**
  (gift sprite). OCR (camera sprite) and voice (mic sprite) tabs appear in Iterations 3/4 —
  the control is built to take 4. **All icons are hand-built 8×8 pixel SVG sprites — emoji are
  banned everywhere in product UI** (design-review blocker #1).
- **My words:** big parchment textarea (one word per line or commas); live word chips render
  under it as you type — valid = meadow outline, problem = berry outline with reason on the
  chip ("too short", "duplicate", "A–Z only"). Counter `words: 7 / 20`. Primary button
  **Generate** (disabled with reason until ≥2 valid words).
- **Surprise me:** theme cards (8) with pixel icon, name, and size tag (`6–8 words` etc.);
  tapping one → Generate immediately.
- **Failure states** (same screen, result panel slides in — stepped):
  - *Partial:* "We fit 9 of 11 — drop these 2 and play?" with the 2 words as berry chips +
    buttons **Drop & play** / **Edit words** / **Try again** (new seed).
  - *Disconnected:* "These words don't share letters with the rest:" + chips + same buttons.
  - *Total failure/timeout:* friendly sprout-with-sweat sprite + "These words really don't want
    to hold hands. Add a few longer words and retry."

## 3. Review
- Grid preview rendered exactly as Play (bounding box, fitted tiles, empty slots) so there is
  no visual jump into the game; word bank listed beside it.
- Meta line: `8 words · 9×8 grid · nice & knotty` (quality phrase from engine metrics:
  loose / cosy / knotty by intersections-per-word).
- Buttons: **Play** (primary, meadow), **Regenerate** (secondary wood — reshuffles layout,
  new seed, grid animates re-place in steps), **Edit words** (ghost).

## 4. Play
- **Layout ≥900px:** grid panel (flex-1) + right sidebar (word bank, progress, Check button).
  **<900px:** top bar → grid (fills width) → word-bank chips (wrap); the on-screen keyboard
  appears as a summoned overlay per below, never in the base layout.
- **Grid:** bounding-box render, fitted integer tiles 24–72px (≥70% of panel's limiting
  dimension). Focused word's run = sky-tinted cells with 3px sky border; focused cell = gold
  border + blinking underscore caret (steps(2), 1s). Solved words lock meadow with stepped pop
  cascade (40ms stagger per tile).
- **Input (NO drag):** select & type (physical keyboard or on-screen pixel keyboard) and
  select & place (tap bank word → compatible slots pulse sky → tap slot; wrong slot = 2-frame
  shake). Bank words show as struck-through parchment chips once placed.
- **On-screen keyboard (touch):** 3 rows QWERTY, Silkscreen caps, parchment keys with wood
  borders, backspace and Check keys; height ≤38% of viewport. **Summoned on cell focus as a
  bottom overlay; dismissed by tapping outside the grid/keyboard or a dismiss key** — never
  permanently docked, so grid + chips keep the space when browsing (council: the docked model
  couldn't coexist with ≥70% grid fill on small phones). While the keyboard is up, the focused
  word is auto-scrolled into the visible region above it.
- **Check:** validates focused word (or all filled words via long-press/menu): correct →
  lock + pop + coins fly (steps(8) arc) to the counter; wrong → cells flash berry twice
  (steps), letters stay for editing.
- **Progress:** sidebar/bank header shows `5/8 words` with a growing sprout sprite
  (4 growth frames: seed → sprout → bud → bloom, advancing by quarter of progress).
- **Celebration (complete):** dim parchment overlay, banner panel "Puzzle complete! ★",
  8×8 pixel confetti in palette colors (steps(6), ~1.2s), score + coins tally counting up
  (Silkscreen), buttons **Home** / **Play again** (same words, new layout).
- **Reduced motion:** all celebrations become static banners; pops become instant fills.

## Fun elements checklist (owner comment #4)
**Visible in mockups (static + live CSS motion):** sprout mascot (home hero + progress stages +
failure sweat) · sun + meadow scene on home · flora corner sprigs · caret blink, falling
confetti, coin idle-bounce, button hover-press — all steps() easing, live in the HTML mockups ·
quality phrases ("nice & knotty") · pixel sprite icon set (pencil/gift/camera/mic + 8 themes +
star/lock/chevron/sun).
**Build-only (choreography needs the real app):** tile-pop solve cascade (40ms/tile stagger,
total capped at 400ms) · coin flight to wallet · idle mascot blink every ~6s · full sound
design per the section below.

## Sound design (owner directive at Stage-2 approval, 2026-08-12)

**Palette:** warm, soft, organic-chiptune — plucks, marimba-like tones, gentle nature ambience.
Stardew's register: cozy and quiet, never arcade-loud. Nothing longer than ~1.5s except loops.

| Moment | Sound | Notes |
|---|---|---|
| Letter typed / placed | soft wood-block pluck | pitch rises subtly with word progress |
| Word solved | 3-note ascending arpeggio | + tile-pop cascade sync |
| Wrong check | muted low thud | gentle, not punishing (matches berry flash) |
| Coin collected | bright short ding | one per coin burst, max 3 stacked |
| Puzzle complete | 5-note fanfare + coin jingle | syncs with confetti |
| Button press / tab switch | woody click | every interactive element |
| On-screen keyboard key | tiny tick | quieter than grid pluck |
| Regenerate | shuffle whoosh | with the grid re-place animation |
| Home ambience | birds + soft breeze loop | very low volume, loops seamlessly |

**Architecture & rules (spec detail in Stage 3):**
- SFX are **synthesized at runtime via Web Audio** (tiny sfx module, zero asset weight, easy to
  tune); the home ambience loop is one small bundled CC0 audio file.
- Browsers block audio before the first user gesture — ambience starts on first interaction,
  never on load. No autoplay violations.
- **Default ON** (SFX ~60%, ambience ~30%) — sound is part of the experience per the owner;
  top-bar toggle on every screen, state persisted in localStorage settings.
- Max 3 simultaneous SFX; all one-shots ≤400ms except fanfares; ambience pauses when the tab
  is hidden (Page Visibility API).
- Slice placement: play/interaction SFX land in slice d; ambience + home sounds in slice f.
  Theme-specific music beds stay in the backlog.

## Component inventory (new in this iteration)
Segmented tab control · word chip (valid/problem/placed variants) · textarea panel ·
theme card · puzzle library card + status chip · quality meta line · on-screen pixel keyboard ·
overlay + banner (celebration/confirm) · progress sprout · toast (berry/meadow).

## Accessibility floor (v1, consciously minimal)
Focus states on all interactive elements (gold 3px outline), color-blind-safe redundancy
(solved = filled AND locked icon in corner of first tile of a solved word), textarea and
buttons are native elements. Full a11y pass deferred to Iteration 2 (recorded debt).

## Stage-3 handoff requirements (from council)
The tech spec MUST include a **component dimension & state-machine appendix**: exact sizes for
tiles/chips/keys/sprites, the select-&-place flowchart (compatibility = length + fixed crossing
letters; multi-fit words highlight all fits; incompatible slot tap = 2-frame shake, selection
kept; second tap on bank word deselects), Tab semantics (cycles words in placement order, wraps,
Shift-Tab reverses, mid-word Tab keeps typed letters), the grid fit equation
(`tile = clamp(24, floor(min((W−gaps)/cols, (H−gaps)/rows)), 72)`), animation timings resolved
(per-tile stagger 40ms, word cascade capped 400ms), textarea max-height with inner scroll, and
the first-run flag (empty puzzles store in IndexedDB = first run).

## AI gate record (2026-08-12)
- **/design-review (fresh-eyes agent on rendered mockups): PASS-WITH-FIXES** — 2 blockers
  (emoji→sprites; grid fill below the spec's own ≥70%) + 17 findings. All blockers/majors fixed
  same-day (sprite set built, 64px fitted tiles, hero scene anchored w/ sun, lock icon on solved
  words, integer sprite sizes, Silkscreen 12px floor, tokens promoted, corner notches, auto-fit
  library, disabled-tab colors). Font-role drift (Pixelify on buttons) recorded as a decision in
  DESIGN.md instead of silently kept.
- **/council-review --quick on this spec: PASS with amendments** — Contrarian caught the mobile
  constraint contradiction (docked keyboard + ≥70% grid + chips can't coexist at 375px) →
  keyboard is summoned-on-focus overlay; Executor demanded the Stage-3 appendix (above);
  Outsider caught undefined quality-phrase semantics (players see a one-line legend on first
  hover/tap: "knotty = lots of crossings") and select-&-place ambiguity (resolved in appendix
  requirements). **Devil's advocate materially changed the artifact:** mockups claimed a
  motion-based fun bar while containing zero animation — live steps() motion (caret blink,
  confetti fall, coin idle, hover press) added to the mockups themselves, and this doc's
  "every item visible" claim corrected.
- **Deviation note:** gates.md prescribes a full council for Stage-2 docs; a quick council ran
  here (spec inherits an already-fully-councilled plan; Stage-1 chairman's momentum ruling).
  Proposed contract amendment at the owner gate: full council for Stage-1 plans, quick for
  Stage-2/3 docs.
