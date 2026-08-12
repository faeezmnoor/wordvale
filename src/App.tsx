import { lazy, Suspense } from 'react'
import { useApp } from './state/store'
import Home from './ui/screens/Home'
import Create from './ui/screens/Create'
import Review from './ui/screens/Review'

// Dev-only: lazy so the harness (and its debug UI) stays out of the production bundle.
const DebugHarness = lazy(() => import('./ui/DebugHarness'))
const showHarness =
  import.meta.env.DEV &&
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('harness')

export default function App() {
  const screen = useApp((s) => s.screen)

  if (showHarness) {
    return (
      <Suspense fallback={null}>
        <DebugHarness />
      </Suspense>
    )
  }

  switch (screen) {
    case 'create':
      return <Create />
    case 'review':
      return <Review />
    case 'play':
      return <PlayStub />
    default:
      return <Home />
  }
}

// Replaced by the real play screen in slice d.
function PlayStub() {
  const go = useApp((s) => s.go)
  return (
    <div className="page">
      <section className="panel" style={{ padding: 24, textAlign: 'center' }}>
        <h2 style={{ marginBottom: 12 }}>Play screen arrives in the next slice</h2>
        <button className="btn" onClick={() => go('review')}>
          Back to review
        </button>
      </section>
    </div>
  )
}
