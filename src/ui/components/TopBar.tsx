import { useApp } from '../../state/store'
import { ChevronSprite, CoinSprite, SoundSprite } from './Sprites'
import { refreshAmbienceVolume } from '../../audio/ambience'

export function TopBar({ title, back }: { title?: string; back?: boolean }) {
  const coins = useApp((s) => s.coins)
  const go = useApp((s) => s.go)
  const sound = useApp((s) => s.sound)
  const toggleSound = useApp((s) => s.toggleSound)
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <button
          onClick={() => {
            toggleSound()
            refreshAmbienceVolume()
          }}
          aria-label={sound ? 'Mute sound' : 'Unmute sound'}
          title={sound ? 'Mute sound' : 'Unmute sound'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
        >
          <SoundSprite on={sound} />
        </button>
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
      </div>
    </header>
  )
}
