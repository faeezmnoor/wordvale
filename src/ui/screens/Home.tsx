import { useApp } from '../../state/store'
import { TopBar } from '../components/TopBar'
import { SproutSprite } from '../components/Sprites'

// Slice-b placeholder: the real home (library grid, resume/replay) lands in slice f.
export default function Home() {
  const go = useApp((s) => s.go)
  return (
    <div className="page">
      <TopBar />
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
        <SproutSprite size={96} />
        <h2>Turn any words into a cozy crossword</h2>
        <p>Paste a list or type a few words — WordVale weaves them into a puzzle you can play anywhere.</p>
        <button className="btn" style={{ fontSize: '1.25rem', padding: '12px 28px' }} onClick={() => go('create')}>
          Create your first crossword
        </button>
        <div className="meadow" aria-hidden>
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
        </div>
      </section>
    </div>
  )
}
