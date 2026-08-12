# Owner feedback at Iteration-0 approval (2026-08-12)

Faeez approved Iteration 0 with four comments. Routing:

| # | Comment | Routed to |
|---|---|---|
| 1 | **Responsive sizing & space optimization** — app must adapt to screen size, use space fully, with proper balance of position/size/whitespace per design + game-UX best practices | **Iteration-1 Stage 2 requirement.** The design spec must define layouts at phone/tablet/desktop breakpoints; the preview's fixed left-biased grid inside an oversized panel is explicitly the anti-pattern to fix. Grid must center on its bounding box and scale to the viewport (integer tile scaling). |
| 2 | **Difficulty** — showing the full word bank may make puzzles too easy; brainstorm ways to raise difficulty (pinned for now) | **Backlog + Iteration-1 plan open question.** Brainstormed candidates recorded in [../..​/backlog.md](../../backlog.md); mechanics decided no earlier than Iteration-2 planning. Iteration-1 engine must not preclude them (e.g. keep letter data separate from display). |
| 3 | **Input ergonomics** — typing letters directly via keyboard, Tab to jump between word lines/slots, easy web-native entry | **Iteration-1 tech requirement (hard).** Play screen supports: click/tap a slot to focus, type letters directly, auto-advance along the word, Tab/Shift-Tab cycles words, arrow keys move within the grid, Backspace clears + retreats. Mobile: on-screen keyboard trigger. Full spec in Stage 3. |
| 4 | **Fun/design still too minimal** — right direction, but wants more game feel | **Iteration-1 Stage 2 bar raised.** Design spec must include: sprite imagery beyond the coin (scene framing, decorative flora per theme), a celebration moment (pixel confetti), sound hooks (even if muted by default), and idle micro-motion. "Chrome-only pixel styling" is not enough to pass the owner gate. |
