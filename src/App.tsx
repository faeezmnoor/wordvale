import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Iteration-0 design preview + ADR-001 spike substrate (docs/gates.md → exemptions).
// Hardcoded legal kriss-kross layout — the real generator lands in Iteration 1.
// Throwaway-allowed: no engine imports, no persistence.

type Dir = 'across' | 'down'
interface Placement {
  word: string
  row: number
  col: number
  dir: Dir
}

const PLACEMENTS: Placement[] = [
  { word: 'HARVEST', row: 7, col: 3, dir: 'across' },
  { word: 'APPLE', row: 7, col: 4, dir: 'down' },
  { word: 'VINE', row: 7, col: 6, dir: 'down' },
  { word: 'SEED', row: 7, col: 8, dir: 'down' },
  { word: 'FIR', row: 5, col: 5, dir: 'down' },
  { word: 'OAT', row: 5, col: 9, dir: 'down' },
  { word: 'ELDER', row: 10, col: 6, dir: 'across' },
]

const COINS_PER_WORD = 5
const MIN_TILE = 24
const MAX_TILE = 72

function cellsOf(p: Placement): { r: number; c: number; letter: string }[] {
  return p.word.split('').map((letter, i) => ({
    r: p.dir === 'down' ? p.row + i : p.row,
    c: p.dir === 'across' ? p.col + i : p.col,
    letter,
  }))
}

// Bounding box of all placements — the grid renders ONLY this, so the puzzle
// fills its panel instead of floating inside a fixed 15x15 (owner feedback 2026-08-12).
function boundsOf(placements: Placement[]) {
  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity
  for (const p of placements)
    for (const { r, c } of cellsOf(p)) {
      minR = Math.min(minR, r); maxR = Math.max(maxR, r)
      minC = Math.min(minC, c); maxC = Math.max(maxC, c)
    }
  return { minR, minC, rows: maxR - minR + 1, cols: maxC - minC + 1 }
}

export default function App() {
  const [placed, setPlaced] = useState<Set<string>>(new Set())
  const [coins, setCoins] = useState(0)
  const [coinBump, setCoinBump] = useState(0)

  const bounds = useMemo(() => boundsOf(PLACEMENTS), [])

  const slotLetters = useMemo(() => {
    const m = new Map<string, string>()
    for (const p of PLACEMENTS)
      for (const cell of cellsOf(p)) m.set(`${cell.r - bounds.minR},${cell.c - bounds.minC}`, cell.letter)
    return m
  }, [bounds])

  const filled = useMemo(() => {
    const m = new Map<string, string>()
    for (const p of PLACEMENTS) {
      if (!placed.has(p.word)) continue
      for (const cell of cellsOf(p)) m.set(`${cell.r - bounds.minR},${cell.c - bounds.minC}`, cell.letter)
    }
    return m
  }, [placed, bounds])

  const placeWord = useCallback((word: string) => {
    setPlaced((prev) => {
      if (prev.has(word)) return prev
      const next = new Set(prev)
      next.add(word)
      return next
    })
    setCoins((c) => c + COINS_PER_WORD)
    setCoinBump((n) => n + 1)
  }, [])

  const allDone = placed.size === PLACEMENTS.length

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 16, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        className="panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'var(--wood)',
          color: 'var(--parchment-hi)',
          marginBottom: 16,
        }}
      >
        <h1 style={{ fontSize: '1.8rem' }}>WordVale</h1>
        <div
          key={coinBump}
          className={coinBump > 0 ? 'coin-bump' : undefined}
          style={{
            fontFamily: 'var(--font-grid)',
            fontSize: '1.1rem',
            color: 'var(--gold)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <CoinSprite /> {coins}
        </div>
      </header>

      <main style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'stretch', flex: 1 }}>
        <section
          className="panel"
          style={{ padding: 16, flex: '1 1 480px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 420 }}
        >
          <FittedGrid rows={bounds.rows} cols={bounds.cols} slotLetters={slotLetters} filled={filled} />
        </section>

        <aside className="panel" style={{ padding: 16, flex: '0 1 300px', minWidth: 250 }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: 4 }}>Word bank</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.875rem', marginTop: 0 }}>
            Tap a word to place it. (Preview: real play is select &amp; type, Iteration 1.)
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PLACEMENTS.map((p) => (
              <button
                key={p.word}
                className="btn"
                onClick={() => placeWord(p.word)}
                disabled={placed.has(p.word)}
                style={
                  placed.has(p.word)
                    ? { background: 'var(--parchment)', color: 'var(--ink-soft)', borderColor: 'var(--wood-dark)', cursor: 'default' }
                    : undefined
                }
              >
                {placed.has(p.word) ? `✓ ${p.word}` : p.word}
              </button>
            ))}
          </div>
          {allDone && (
            <p
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--meadow-dark)',
                fontSize: '1.2rem',
                marginBottom: 0,
              }}
            >
              ★ Puzzle complete!{' '}
              <span style={{ fontFamily: 'var(--font-grid)', fontSize: '1rem' }}>
                +{PLACEMENTS.length * COINS_PER_WORD}
              </span>{' '}
              coins
            </p>
          )}
        </aside>
      </main>

      <footer style={{ color: 'var(--ink-soft)', fontSize: '0.875rem', marginTop: 16 }}>
        Iteration-0 design preview — fonts: Pixelify Sans / Silkscreen / DM Sans · palette per DESIGN.md
      </footer>
    </div>
  )
}

// Measures its container and picks the largest integer tile size that fits both
// dimensions (clamped MIN_TILE..MAX_TILE) — the space-optimization contract from
// the Iteration-1 plan, demonstrated here.
function FittedGrid({
  rows,
  cols,
  slotLetters,
  filled,
}: {
  rows: number
  cols: number
  slotLetters: Map<string, string>
  filled: Map<string, string>
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [tile, setTile] = useState(40)
  const gap = 3

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const fit = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      const fitW = Math.floor((w - gap * (cols - 1)) / cols)
      const fitH = Math.floor((h - gap * (rows - 1)) / rows)
      setTile(Math.max(MIN_TILE, Math.min(MAX_TILE, fitW, fitH)))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [rows, cols])

  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${tile}px)`,
          gridTemplateRows: `repeat(${rows}, ${tile}px)`,
          gap,
        }}
      >
        {Array.from({ length: rows * cols }, (_, i) => {
          const r = Math.floor(i / cols)
          const c = i % cols
          const key = `${r},${c}`
          const isSlot = slotLetters.has(key)
          const letter = filled.get(key)
          if (!isSlot) return <div key={key} />
          return (
            <div
              key={key}
              style={{
                background: letter ? 'var(--meadow)' : 'var(--parchment-hi)',
                border: `3px solid ${letter ? 'var(--meadow-dark)' : 'var(--wood-dark)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-grid)',
                fontSize: Math.round(tile * 0.5),
                color: 'var(--parchment-hi)',
              }}
            >
              {letter && <span className="cell-letter-enter">{letter}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 16px pixel-art coin scaled ×1 via crisp SVG rects — stands in for real sprites (Iteration 1+).
function CoinSprite() {
  return (
    <svg width="16" height="16" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }} aria-hidden>
      <rect x="2" y="0" width="4" height="1" fill="#e8b33c" />
      <rect x="1" y="1" width="6" height="1" fill="#e8b33c" />
      <rect x="0" y="2" width="8" height="4" fill="#e8b33c" />
      <rect x="1" y="6" width="6" height="1" fill="#c9922a" />
      <rect x="2" y="7" width="4" height="1" fill="#c9922a" />
      <rect x="2" y="2" width="1" height="3" fill="#faf1dc" />
      <rect x="5" y="3" width="1" height="2" fill="#c9922a" />
    </svg>
  )
}
