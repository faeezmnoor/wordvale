import { useDeferredValue, useMemo, useState } from 'react'
import { boundsOf, cellsOf, generate, MIN_WORDS, precheck, qualityPhrase } from '../engine'

// Dev-only engine harness (slice a): ?harness — type words, step seeds, see grid + metrics.
// Dev-tool exemption from the design system is recorded in docs/gates.md → Explicit exemptions.

export default function DebugHarness() {
  const [text, setText] = useState('harvest\napple\nvine\nseed\nelder\nstream\norchard\npetal')
  const [seed, setSeed] = useState(1)
  const [showLetters, setShowLetters] = useState(true)

  const deferredText = useDeferredValue(text) // full generate per keystroke would jank typing
  const pre = useMemo(() => precheck(deferredText.split(/[\n,]+/)), [deferredText])
  const result = useMemo(
    () => (pre.countError === null && pre.valid.length >= MIN_WORDS ? generate(pre.valid, seed) : null),
    [pre, seed],
  )
  const bounds = result ? boundsOf(result.placements) : null

  const cellMap = useMemo(() => {
    const m = new Map<string, string>()
    if (result) for (const p of result.placements) for (const c of cellsOf(p)) m.set(`${c.r},${c.c}`, c.letter)
    return m
  }, [result])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 16, fontFamily: 'monospace' }}>
      <h1 style={{ fontSize: 18 }}>engine harness · v1</h1>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            cols={24}
            style={{ fontFamily: 'monospace' }}
          />
          <div>
            seed{' '}
            <input
              type="number"
              value={seed}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (Number.isFinite(v)) setSeed(v)
              }}
              style={{ width: 80 }}
            />
            <button onClick={() => setSeed((s) => s + 1)}>next seed</button>
            <label>
              <input type="checkbox" checked={showLetters} onChange={(e) => setShowLetters(e.target.checked)} /> letters
            </label>
          </div>
          {pre.rejected.length > 0 && (
            <p style={{ color: '#c00' }}>rejected: {pre.rejected.map((r) => `${r.input}(${r.reason})`).join(' ')}</p>
          )}
          {pre.isolates.length > 0 && <p style={{ color: '#c60' }}>isolates: {pre.isolates.join(' ')}</p>}
          {pre.countError && <p style={{ color: '#c00' }}>count error: {pre.countError} (valid: {pre.valid.length})</p>}
          {result && (
            <pre style={{ fontSize: 12 }}>
              {`status:    ${result.status}
unplaced:  ${result.unplaced.join(',') || '—'}
grid:      ${bounds!.cols}×${bounds!.rows}
crossings: ${result.metrics.crossings} (${result.metrics.xPerWord.toFixed(2)}/word)
density:   ${result.metrics.density.toFixed(2)}
balance:   ${result.metrics.balance.toFixed(2)}
score:     ${result.metrics.score.toFixed(1)}
phrase:    ${qualityPhrase(result.metrics)}`}
            </pre>
          )}
        </div>
        {result && bounds && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${bounds.cols}, 26px)`,
              gridTemplateRows: `repeat(${bounds.rows}, 26px)`,
              gap: 2,
              alignSelf: 'flex-start',
            }}
          >
            {Array.from({ length: bounds.rows * bounds.cols }, (_, i) => {
              const r = Math.floor(i / bounds.cols)
              const c = i % bounds.cols
              const letter = cellMap.get(`${r},${c}`)
              return (
                <div
                  key={i}
                  style={{
                    border: letter ? '2px solid #5b3a24' : undefined,
                    background: letter ? '#faf1dc' : undefined,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    color: '#3b2a1e',
                  }}
                >
                  {letter && showLetters ? letter : ''}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
