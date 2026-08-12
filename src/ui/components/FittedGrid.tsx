import { useEffect, useRef, useState, type ReactNode } from 'react'

const MIN_TILE = 24
const MAX_TILE = 72
const GAP = 3

export interface CellView {
  content?: ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}

/**
 * Fit-to-container pixel grid (owner space directive): measures its parent and picks the
 * largest whole-pixel tile 24–72px that fits, centered. Rendering of each slot cell is
 * delegated so Review (slots only) and Play (focus/solved states) share one grid.
 */
export function FittedGrid({
  rows,
  cols,
  slots,
  cell,
}: {
  rows: number
  cols: number
  slots: Set<string>
  cell: (key: string, tile: number) => CellView
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [tile, setTile] = useState(40)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const fit = () => {
      const fitW = Math.floor((el.clientWidth - GAP * (cols - 1)) / cols)
      const fitH = Math.floor((el.clientHeight - GAP * (rows - 1)) / rows)
      setTile(Math.max(MIN_TILE, Math.min(MAX_TILE, fitW, fitH)))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [rows, cols])

  return (
    <div
      ref={wrapRef}
      style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${tile}px)`,
          gridTemplateRows: `repeat(${rows}, ${tile}px)`,
          gap: GAP,
        }}
      >
        {Array.from({ length: rows * cols }, (_, i) => {
          const key = `${Math.floor(i / cols)},${i % cols}`
          if (!slots.has(key)) return <div key={key} />
          const view = cell(key, tile)
          return (
            <div
              key={key}
              className={view.className}
              onClick={view.onClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-grid)',
                fontSize: Math.round(tile * 0.5),
                background: 'var(--parchment-hi)',
                border: '3px solid var(--wood-dark)',
                cursor: view.onClick ? 'pointer' : undefined,
                ...view.style,
              }}
            >
              {view.content}
            </div>
          )
        })}
      </div>
    </div>
  )
}
