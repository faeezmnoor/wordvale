import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { boundsOf, cellsOf } from '../../engine'
import { useApp } from '../../state/store'
import { COINS_PER_WORD, SCORE_COMPLETE_BONUS, SCORE_PER_LETTER } from '../../state/economy'
import { compatibleSlots, initPlay, playReducer } from '../playMachine'
import { newPuzzleId, savePuzzle } from '../../state/db'
import { FittedGrid } from '../components/FittedGrid'
import { TopBar } from '../components/TopBar'
import { PixelKeyboard } from '../components/PixelKeyboard'
import { CheckSprite, LockSprite, SelectedDot } from '../components/Sprites'
import { Celebration } from '../components/Celebration'
import * as sfx from '../../audio/sfx'

const isCoarse = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

export default function Play() {
  const { draft, go, addCoins } = useApp()

  const [state, dispatch] = useReducer(
    playReducer,
    draft,
    (d) => initPlay(d?.result.placements ?? [], d?.fill ?? {}, d?.solvedWords ?? []),
  )
  // stable id for this play session — resumed puzzles keep theirs, new ones get one now
  const puzzleId = useRef<string | null>(null)
  if (puzzleId.current === null) puzzleId.current = draft?.id ?? newPuzzleId(Date.now(), Math.random())
  const createdAt = useRef(Date.now())
  // A brand-new puzzle is saved as soon as it's opened, so it lands in the library even if
  // the player just looks at it. A RESUMED record is only rewritten once something changes,
  // so opening it can never wipe saved progress.
  const dirty = useRef(!draft?.id)
  const [flash, setFlash] = useState<{ kind: string; cells: string[]; id: number } | null>(null)
  const flashId = useRef(0)
  const sessionCoins = useRef(0)
  const [celebrating, setCelebrating] = useState(false)

  // event → SFX/animation pump
  useEffect(() => {
    if (!state.events.length) return
    for (const ev of state.events) {
      if (ev.type === 'solve') {
        sfx.arpeggio()
        sfx.ding()
        addCoins(COINS_PER_WORD)
        sessionCoins.current += COINS_PER_WORD
        setFlash({ kind: 'solve', cells: ev.cascade, id: ++flashId.current })
      } else if (ev.type === 'wrongCheck') {
        sfx.thud()
        const p = state.placements.find((pl) => pl.word === ev.word)
        if (p) setFlash({ kind: 'wrong', cells: cellsOf(p).map((c) => `${c.r},${c.c}`), id: ++flashId.current })
      } else if (ev.type === 'bankPlaced') {
        sfx.pluck(0.5)
        setFlash({ kind: 'placed', cells: ev.changed, id: ++flashId.current })
      } else if (ev.type === 'shake') {
        sfx.thud()
      } else if (ev.type === 'incompleteCheck') {
        sfx.tick()
      } else if (ev.type === 'complete') {
        sfx.fanfare()
        setCelebrating(true)
      }
    }
    dispatch({ type: 'ack' })
  }, [state.events, state.placements, addCoins])

  // flash clears on its own timer (keyed on the flash itself, so it can't be cancelled
  // by the events effect re-running)
  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(null), 600)
    return () => clearTimeout(t)
  }, [flash])

  useEffect(() => {
    if (!draft) go('home')
  }, [draft, go])

  // debounced autosave; also flushed on unmount and page hide so the winning move is never lost
  const latest = useRef({ fill: state.fill, solved: state.solved })
  latest.current = { fill: state.fill, solved: state.solved }

  useEffect(() => {
    if (!draft) return
    const write = () => {
      if (!dirty.current) return
      void savePuzzle({
        id: puzzleId.current!,
        title: draft.title,
        words: draft.words,
        seed: draft.result.seed,
        placements: draft.result.placements,
        fill: latest.current.fill,
        solvedWords: latest.current.solved,
        status: 'in-progress', // recomputed inside savePuzzle
        coinsEarned: latest.current.solved.length * COINS_PER_WORD,
        createdAt: createdAt.current,
        updatedAt: Date.now(),
      })
    }
    const t = setTimeout(write, 500)
    const onHide = () => write()
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', onHide)
    return () => {
      clearTimeout(t)
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', onHide)
      write() // flush on navigation away
    }
  }, [draft, state.fill, state.solved])

  // any real change marks the record dirty (a bare open must not overwrite a saved puzzle)
  useEffect(() => {
    if (Object.keys(state.fill).length > 0 || state.solved.length > 0) dirty.current = true
  }, [state.fill, state.solved])

  // physical keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (celebrating) return
      if (e.key === 'Tab') {
        e.preventDefault()
        dispatch({ type: 'tab', back: e.shiftKey })
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        dispatch({ type: 'backspace' })
      } else if (e.key === 'Enter') {
        dispatch({ type: 'check' })
      } else if (e.key === 'Escape') {
        dispatch({ type: 'dismiss' })
      } else if (e.key.startsWith('Arrow')) {
        e.preventDefault()
        const d = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key]!
        dispatch({ type: 'arrow', dr: d[0], dc: d[1] })
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        sfx.pluck(0.3)
        dispatch({ type: 'typeLetter', letter: e.key })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [celebrating])

  const bounds = useMemo(
    () => boundsOf(draft?.result.placements ?? []),
    [draft],
  )
  const slots = useMemo(() => {
    const s = new Set<string>()
    for (const p of draft?.result.placements ?? []) for (const c of cellsOf(p)) s.add(`${c.r},${c.c}`)
    return s
  }, [draft])

  const focusCells = useMemo(() => {
    if (state.focusWord === null) return new Set<string>()
    return new Set(cellsOf(state.placements[state.focusWord]).map((c) => `${c.r},${c.c}`))
  }, [state.focusWord, state.placements])

  const solvedCells = useMemo(() => {
    const s = new Set<string>()
    for (const p of state.placements)
      if (state.solved.includes(p.word)) for (const c of cellsOf(p)) s.add(`${c.r},${c.c}`)
    return s
  }, [state.solved, state.placements])

  // first tile of each solved word carries a lock — solved state is not colour-only
  const lockCells = useMemo(() => {
    const s = new Set<string>()
    for (const p of state.placements)
      if (state.solved.includes(p.word)) s.add(`${p.row},${p.col}`)
    return s
  }, [state.solved, state.placements])

  const compatCells = useMemo(() => {
    const s = new Set<string>()
    for (const i of compatibleSlots(state)) for (const c of cellsOf(state.placements[i])) s.add(`${c.r},${c.c}`)
    return s
  }, [state])

  const cell = useCallback(
    (key: string) => {
      const letter = state.fill[key]
      const solved = solvedCells.has(key)
      const focused = state.focusCell === key
      const inFocusWord = focusCells.has(key)
      const compat = state.mode === 'bankSelect' && compatCells.has(key)
      const flashing = flash?.cells.includes(key) ? flash.kind : null
      return {
        content: letter ? (
          <span
            key={flash?.id ?? 0}
            className={flashing === 'solve' || flashing === 'placed' ? 'cell-letter-enter' : undefined}
          >
            {lockCells.has(key) && <LockSprite />}
            {letter}
          </span>
        ) : focused ? (
          <span className="caret" />
        ) : undefined,
        onClick: () => {
          sfx.click()
          dispatch({ type: 'tapCell', key })
        },
        className: flashing === 'wrong' ? 'cell-wrong' : undefined,
        flashKey: flashing === 'wrong' ? flash?.id : undefined,
        style: {
          background: solved ? 'var(--meadow)' : compat ? 'var(--sky-tint)' : inFocusWord ? 'var(--sky-tint)' : 'var(--parchment-hi)',
          borderColor: solved ? 'var(--meadow-dark)' : focused ? 'var(--gold)' : compat || inFocusWord ? 'var(--sky)' : 'var(--wood-dark)',
          color: solved ? 'var(--parchment-hi)' : 'var(--ink)',
        },
      }
    },
    [state, solvedCells, lockCells, focusCells, compatCells, flash],
  )

  if (!draft) return null

  const total = draft.result.placements.length
  const solvedCount = state.solved.length
  const showKeyboard = isCoarse() && state.mode === 'wordFocus' && !celebrating
  const score = state.solved.join('').length * SCORE_PER_LETTER + (celebrating ? SCORE_COMPLETE_BONUS : 0)
  // show what this session actually paid — resuming a half-done puzzle must not claim the lot
  const earnedCoins = sessionCoins.current

  return (
    <div className="page">
      <TopBar title={draft.title} back />
      <div className={`playwrap${showKeyboard ? ' kb-open' : ''}`}>
        <section className="panel gridpanel" onClick={(e) => e.target === e.currentTarget && dispatch({ type: 'dismiss' })}>
          <FittedGrid rows={bounds.rows} cols={bounds.cols} slots={slots} cell={cell} />
        </section>

        <aside className="panel sidepanel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.1rem' }}>
              Words{' '}
              <span style={{ fontFamily: 'var(--font-grid)', fontSize: '.8rem', color: 'var(--ink-soft)' }}>
                {solvedCount}/{total}
              </span>
            </h2>
            <ProgressSprout stage={Math.min(3, Math.floor((solvedCount / Math.max(1, total)) * 4))} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {draft.result.placements.map((p) => {
              const solved = state.solved.includes(p.word)
              const selected = state.bankWord === p.word
              return (
                <button
                  key={p.word}
                  className={`chip chipbtn ${solved ? 'placed' : ''}`}
                  style={selected ? { borderColor: 'var(--sky)', color: 'var(--sky)' } : undefined}
                  disabled={solved}
                  onClick={() => {
                    sfx.click()
                    dispatch({ type: 'tapBank', word: p.word })
                  }}
                >
                  {p.word}
                  {selected && <SelectedDot />}
                </button>
              )
            })}
          </div>
          <p style={{ color: 'var(--ink-soft)', fontSize: '.82rem', margin: 0 }}>
            Type into the grid, or tap a word then tap its slot. <b>Tab</b> hops to the next word.
          </p>
          <button className="btn" style={{ marginTop: 'auto' }} onClick={() => dispatch({ type: 'check' })}>
            <CheckSprite /> Check word
          </button>
        </aside>
      </div>

      {showKeyboard && (
        <PixelKeyboard
          onKey={(k) => {
            sfx.tick()
            if (k === 'BACK') dispatch({ type: 'backspace' })
            else if (k === 'CHECK') dispatch({ type: 'check' })
            else dispatch({ type: 'typeLetter', letter: k })
          }}
          onDismiss={() => dispatch({ type: 'dismiss' })}
        />
      )}

      {celebrating && (
        <Celebration
          score={score}
          coins={earnedCoins}
          onHome={() => go('home')}
          onAgain={() => go('review')}
        />
      )}
    </div>
  )
}

function ProgressSprout({ stage }: { stage: number }) {
  const stages: [number, number, number, number, string][][] = [
    [[7, 8, 2, 2, '#5fa344']],
    [[7, 6, 2, 4, '#3f7a2e'], [5, 5, 2, 2, '#5fa344'], [9, 5, 2, 2, '#5fa344']],
    [[7, 5, 2, 5, '#3f7a2e'], [4, 4, 3, 3, '#5fa344'], [9, 4, 3, 3, '#5fa344']],
    [[7, 6, 2, 4, '#3f7a2e'], [4, 4, 3, 3, '#5fa344'], [9, 4, 3, 3, '#5fa344'], [5, 1, 6, 4, '#e8b33c'], [7, 2, 2, 2, '#c24b3f']],
  ]
  const base: [number, number, number, number, string][] = [
    [6, 10, 4, 4, '#8a5a38'],
    [5, 13, 6, 2, '#5b3a24'],
  ]
  return (
    <svg width="40" height="40" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }} aria-hidden>
      {[...base, ...stages[stage]].map(([x, y, w, h, f], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={f} />
      ))}
    </svg>
  )
}
