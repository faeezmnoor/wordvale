import { useEffect, useState } from 'react'
import { useApp } from '../../state/store'
import { deletePuzzle, listPuzzles, type PuzzleRecord } from '../../state/db'
import { boundsOf, cellsOf } from '../../engine'
import { TopBar } from '../components/TopBar'
import { SproutSprite } from '../components/Sprites'
import * as sfx from '../../audio/sfx'

export default function Home() {
  const { go, setDraft } = useApp()
  const [puzzles, setPuzzles] = useState<PuzzleRecord[] | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    void listPuzzles()
      .then(setPuzzles)
      .catch(() => setPuzzles([])) // storage-less browser still gets the first-run hero
  }, [])

  const resume = (p: PuzzleRecord) => {
    sfx.click()
    const replaying = p.status === 'solved'
    setDraft({
      words: p.words,
      title: p.title,
      // replay is a NEW record: keeping the id would wipe the solved one and re-mint coins
      id: replaying ? undefined : p.id,
      fill: replaying ? {} : p.fill,
      solvedWords: replaying ? [] : p.solvedWords,
      result: {
        status: 'complete',
        placements: p.placements,
        unplaced: [],
        seed: p.seed,
        metrics: { placedRatio: 1, xPerWord: 0, density: 0, balance: 0, score: 0, placed: p.placements.length, crossings: 0 },
      },
    })
    go('play')
  }

  const remove = async (id: string) => {
    await deletePuzzle(id)
    setPuzzles(await listPuzzles())
    setConfirmDelete(null)
  }

  const empty = puzzles !== null && puzzles.length === 0

  return (
    <div className="page">
      <TopBar />

      {puzzles === null && <section className="panel" style={{ padding: 20, color: 'var(--ink-soft)' }}>Opening the valley…</section>}

      {empty && (
        <section className="panel hero">
          <span className="sun" aria-hidden>
            <svg width="40" height="40" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
              <rect x="2" y="2" width="4" height="4" fill="#e8b33c" />
              <rect x="3" y="0" width="2" height="1" fill="#e8b33c" />
              <rect x="3" y="7" width="2" height="1" fill="#e8b33c" />
              <rect x="0" y="3" width="1" height="2" fill="#e8b33c" />
              <rect x="7" y="3" width="1" height="2" fill="#e8b33c" />
            </svg>
          </span>
          <span className="sprout">
          <SproutSprite size={112} />
        </span>
          <h2>Turn any words into a cozy crossword</h2>
          <p>Paste a list or pick a theme — WordVale weaves them into a puzzle you can play anywhere.</p>
          <button
            className="btn"
            style={{ fontSize: '1.25rem', padding: '12px 28px' }}
            onClick={() => {
              sfx.click()
              go('create')
            }}
          >
            Create your first crossword
          </button>
          <div className="meadow" aria-hidden>
            <MeadowStrip />
          </div>
        </section>
      )}

      {puzzles !== null && puzzles.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0 12px' }}>
            <h2 style={{ fontSize: '1.3rem' }}>Your crosswords</h2>
            <button
              className="btn"
              onClick={() => {
                sfx.click()
                go('create')
              }}
            >
              + New puzzle
            </button>
          </div>
          <div className="cards">
            {puzzles.map((p) => (
              <div key={p.id} className="panel card">
                <button className="thumbbtn" onClick={() => resume(p)} aria-label={`Open ${p.title}`}>
                  <Thumb record={p} />
                </button>
                <h3>{p.title}</h3>
                <div className="cardmeta">
                  <span>
                    {p.placements.length} words · {relativeDay(p.updatedAt)}
                  </span>
                  <span className={`statuschip ${p.status === 'solved' ? 'solved' : 'progress'}`}>
                    {p.status === 'solved' ? 'SOLVED' : `${p.solvedWords.length}/${p.placements.length}`}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn" style={{ fontSize: '.9rem', padding: '4px 12px' }} onClick={() => resume(p)}>
                    {p.status === 'solved' ? 'Play again' : 'Resume'}
                  </button>
                  {confirmDelete === p.id ? (
                    <>
                      <button className="btn danger" style={{ fontSize: '.9rem', padding: '4px 12px' }} onClick={() => void remove(p.id)}>
                        Delete
                      </button>
                      <button className="btn ghost" style={{ fontSize: '.9rem', padding: '4px 12px' }} onClick={() => setConfirmDelete(null)}>
                        Keep
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn ghost"
                      style={{ fontSize: '.9rem', padding: '4px 12px' }}
                      onClick={() => setConfirmDelete(p.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="meadow-foot" aria-hidden>
            <MeadowStrip />
          </div>
        </>
      )}
    </div>
  )
}

function Thumb({ record }: { record: PuzzleRecord }) {
  const bounds = boundsOf(record.placements)
  if (bounds.rows === 0 || bounds.cols === 0) return null

  const solvedCells = new Set<string>()
  for (const p of record.placements)
    if (record.solvedWords.includes(p.word)) for (const c of cellsOf(p)) solvedCells.add(`${c.r},${c.c}`)

  const cells: { r: number; c: number; solved: boolean }[] = []
  const seen = new Set<string>()
  for (const p of record.placements)
    for (const c of cellsOf(p)) {
      const key = `${c.r},${c.c}`
      if (seen.has(key)) continue
      seen.add(key)
      cells.push({ r: c.r, c: c.c, solved: solvedCells.has(key) })
    }

  // An SVG viewBox scales to whatever box it's given, so a 25-column puzzle and a 5-column
  // one both fit the card exactly — no per-grid pixel maths, no overflow.
  return (
    <svg
      viewBox={`0 0 ${bounds.cols} ${bounds.rows}`}
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      style={{ display: 'block', imageRendering: 'pixelated' }}
      aria-hidden
    >
      {cells.map(({ r, c, solved }) => (
        <rect
          key={`${r},${c}`}
          x={c + 0.06}
          y={r + 0.06}
          width={0.88}
          height={0.88}
          fill={solved ? 'var(--meadow)' : 'var(--parchment-hi)'}
          stroke={solved ? 'var(--meadow-dark)' : 'var(--wood-dark)'}
          strokeWidth={0.12}
        />
      ))}
    </svg>
  )
}

function MeadowStrip() {
  return (
    <svg width="100%" height="34" viewBox="0 0 260 10" preserveAspectRatio="none" style={{ display: 'block', imageRendering: 'pixelated' }}>
      <rect x="0" y="4" width="260" height="6" fill="#5fa344" />
      <rect x="0" y="4" width="260" height="1" fill="#7dbb5e" />
      <rect x="14" y="1" width="3" height="3" fill="#3f7a2e" />
      <rect x="48" y="2" width="2" height="2" fill="#e8b33c" />
      <rect x="86" y="1" width="2" height="3" fill="#c24b3f" />
      <rect x="120" y="2" width="3" height="2" fill="#3f7a2e" />
      <rect x="160" y="1" width="2" height="3" fill="#e8b33c" />
      <rect x="200" y="2" width="2" height="2" fill="#c24b3f" />
      <rect x="236" y="0" width="3" height="4" fill="#3f7a2e" />
    </svg>
  )
}

function relativeDay(ts: number): string {
  const days = Math.floor((Date.now() - ts) / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
