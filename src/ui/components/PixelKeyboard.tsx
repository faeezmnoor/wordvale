// Custom on-screen pixel keyboard — summoned on cell focus, never docked (design spec §4).

import { CheckSprite } from './Sprites'

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']

export function PixelKeyboard({
  onKey,
  onDismiss,
}: {
  onKey: (k: string) => void
  onDismiss: () => void
}) {
  return (
    <div className="kb-overlay" onClick={(e) => e.target === e.currentTarget && onDismiss()}>
      <div className="kb">
        {ROWS.map((row, i) => (
          <div key={row} className="kbrow">
            {i === 2 && (
              <button className="key action" onClick={() => onKey('CHECK')} aria-label="Check word">
                <CheckSprite size={14} />
              </button>
            )}
            {row.split('').map((k) => (
              <button key={k} className="key" onClick={() => onKey(k)}>
                {k}
              </button>
            ))}
            {i === 2 && (
              <button className="key" onClick={() => onKey('BACK')} aria-label="Backspace">
                <svg width="16" height="16" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }} aria-hidden>
                  <rect x="0" y="3" width="3" height="2" fill="#3b2a1e" />
                  <rect x="1" y="2" width="2" height="1" fill="#3b2a1e" />
                  <rect x="1" y="5" width="2" height="1" fill="#3b2a1e" />
                  <rect x="3" y="1" width="5" height="6" fill="#3b2a1e" />
                  <rect x="4" y="3" width="3" height="1" fill="#faf1dc" />
                  <rect x="4" y="4" width="3" height="1" fill="#faf1dc" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
