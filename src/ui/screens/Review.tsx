import { useEffect, useMemo, useRef, useState } from 'react'
import { boundsOf, cellsOf, qualityPhrase } from '../../engine'
import { useApp } from '../../state/store'
import { useGenerate } from '../useGenerate'
import { FittedGrid } from '../components/FittedGrid'
import { TopBar } from '../components/TopBar'
import { HourglassSprite, PlaySprite, RefreshSprite } from '../components/Sprites'

export default function Review() {
  const { draft, setDraft, go, setCreateText } = useApp()
  const [legend, setLegend] = useState(false)
  const [keptBetter, setKeptBetter] = useState(false)
  // regen seed advances on EVERY attempt, even when we keep the old layout —
  // otherwise a rejected result makes the button deterministically dead.
  const regenSeed = useRef<number | null>(null)

  const { request, pending } = useGenerate((result) => {
    if (!draft) return
    if (result.placements.length >= draft.result.placements.length) {
      setKeptBetter(false)
      setDraft({ ...draft, result })
    } else {
      setKeptBetter(true)
    }
  })

  const regenerate = () => {
    if (!draft) return
    const base = regenSeed.current ?? draft.result.seed
    const next = base + 1
    regenSeed.current = next
    setKeptBetter(false)
    request(draft.words, next)
  }

  useEffect(() => {
    if (!draft) go('home')
  }, [draft, go])

  const slots = useMemo(() => {
    const s = new Set<string>()
    if (draft) for (const p of draft.result.placements) for (const c of cellsOf(p)) s.add(`${c.r},${c.c}`)
    return s
  }, [draft])

  if (!draft) return null

  const bounds = boundsOf(draft.result.placements)
  const phrase = qualityPhrase(draft.result.metrics)

  return (
    <div className="page">
      <TopBar title="Ready to play?" back />
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'stretch' }}>
        <section
          className="panel"
          style={{ padding: 16, flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 420 }}
        >
          <div style={{ flex: 1, opacity: pending ? 0.4 : 1 }}>
            <FittedGrid rows={bounds.rows} cols={bounds.cols} slots={slots} cell={() => ({})} />
          </div>
          {pending && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
              <span className="hourglass">
                <HourglassSprite size={20} />
              </span>
              <span style={{ color: 'var(--ink-soft)', fontSize: '.9rem' }}>reshuffling…</span>
            </div>
          )}
          <div
            style={{ fontFamily: 'var(--font-grid)', fontSize: '.8rem', color: 'var(--ink-soft)', textAlign: 'center', cursor: 'help' }}
            onClick={() => setLegend((l) => !l)}
            title="knotty = lots of crossings"
          >
            {draft.result.placements.length} WORDS · {bounds.cols}×{bounds.rows} GRID · {phrase.toUpperCase()}
            {legend && <div style={{ marginTop: 4, textTransform: 'none' }}>knotty = lots of crossings · cosy = snug fit · loose = roomy</div>}
            {keptBetter && !pending && (
              <div style={{ marginTop: 6, color: 'var(--gold-dark)', textTransform: 'none' }}>
                kept the better layout — try again for a different one
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn" style={{ fontSize: '1.2rem', padding: '10px 26px' }} onClick={() => go('play')}>
              <PlaySprite /> Play
            </button>
            <button className="btn secondary" disabled={pending} onClick={regenerate}>
              <RefreshSprite /> Regenerate
            </button>
            <button
              className="btn ghost"
              onClick={() => {
                setCreateText(draft.words.join('\n').toLowerCase())
                go('create')
              }}
            >
              Edit words
            </button>
          </div>
        </section>
        <aside className="panel" style={{ padding: 16, flex: '0 1 260px', minWidth: 220 }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 8 }}>Word bank</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {draft.result.placements.map((p) => (
              <span key={p.word} className="chip">
                {p.word}
              </span>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
