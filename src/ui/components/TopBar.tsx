import { useApp } from '../../state/store'
import { ChevronSprite, CoinSprite } from './Sprites'

export function TopBar({ title, back }: { title?: string; back?: boolean }) {
  const coins = useApp((s) => s.coins)
  const go = useApp((s) => s.go)
  return (
    <header
      className="panel"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        background: 'var(--wood)',
        color: 'var(--parchment-hi)',
        marginBottom: 16,
      }}
    >
      <h1 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: 12 }}>
        {back && (
          <button
            onClick={() => go('home')}
            aria-label="Back to home"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
          >
            <ChevronSprite />
          </button>
        )}
        {title ?? 'WordVale'}
      </h1>
      <div
        style={{
          fontFamily: 'var(--font-grid)',
          fontSize: '1.05rem',
          color: 'var(--gold)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <CoinSprite /> {coins}
      </div>
    </header>
  )
}
