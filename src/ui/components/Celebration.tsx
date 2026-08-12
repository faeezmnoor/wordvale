import { CoinSprite } from './Sprites'

const CONFETTI = ['#e8b33c', '#5fa344', '#c24b3f', '#5a9bd8', '#e8b33c', '#5fa344', '#c24b3f', '#5a9bd8']

export function Celebration({
  score,
  coins,
  onHome,
  onAgain,
}: {
  score: number
  coins: number
  onHome: () => void
  onAgain: () => void
}) {
  return (
    <div className="overlay">
      {CONFETTI.map((color, i) => (
        <span
          key={i}
          className="confetti"
          style={{
            left: `${8 + i * 11}%`,
            animationDelay: `${(i % 5) * 0.28}s`,
            background: color,
          }}
        />
      ))}
      <section className="panel" style={{ maxWidth: 420, margin: '0 auto', textAlign: 'center', padding: 24 }}>
        <h2 style={{ fontSize: '1.8rem' }}>Puzzle complete!</h2>
        <svg width="72" height="72" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', margin: '10px 0' }} aria-hidden>
          <rect x="6" y="10" width="4" height="4" fill="#8a5a38" />
          <rect x="5" y="13" width="6" height="2" fill="#5b3a24" />
          <rect x="7" y="6" width="2" height="4" fill="#3f7a2e" />
          <rect x="4" y="4" width="3" height="3" fill="#5fa344" />
          <rect x="9" y="4" width="3" height="3" fill="#5fa344" />
          <rect x="5" y="1" width="6" height="4" fill="#e8b33c" />
          <rect x="7" y="2" width="2" height="2" fill="#c24b3f" />
          <rect x="7" y="11" width="1" height="1" fill="#3b2a1e" />
          <rect x="9" y="11" width="1" height="1" fill="#3b2a1e" />
        </svg>
        <div style={{ fontFamily: 'var(--font-grid)', fontSize: '1rem', marginBottom: 4 }}>
          SCORE <span style={{ color: 'var(--meadow-dark)' }}>{score}</span>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-grid)',
            fontSize: '1rem',
            color: 'var(--gold-dark)',
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <CoinSprite /> +{coins}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn" onClick={onHome}>
            Home
          </button>
          <button className="btn secondary" onClick={onAgain}>
            ⟳ Play again
          </button>
        </div>
      </section>
    </div>
  )
}
