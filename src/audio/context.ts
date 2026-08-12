// One shared AudioContext for the whole app. Browsers cap how many a page may create, and
// two modules each making their own was both wasteful and hard to reason about.
//
// Nothing here touches audio before the first real user gesture — that's a hard browser rule
// (autoplay policy), and violating it logs a warning and silently produces no sound.

let ctx: AudioContext | null = null
let gestureSeen = false
const waiting: (() => void)[] = []

if (typeof window !== 'undefined') {
  const onGesture = () => {
    gestureSeen = true
    // resume immediately: contexts created before a gesture start suspended
    ctx?.resume().catch(() => {})
    const queued = waiting.splice(0)
    for (const fn of queued) fn()
    window.removeEventListener('pointerdown', onGesture)
    window.removeEventListener('keydown', onGesture)
    window.removeEventListener('touchstart', onGesture)
  }
  window.addEventListener('pointerdown', onGesture)
  window.addEventListener('keydown', onGesture)
  window.addEventListener('touchstart', onGesture)
}

/** The shared context, or null if audio isn't usable yet (no gesture) or at all. */
export function audioCtx(): AudioContext | null {
  if (typeof window === 'undefined' || !gestureSeen) return null
  try {
    if (!ctx) ctx = new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** Run `fn` once audio is allowed — immediately if a gesture already happened. */
export function whenAudioReady(fn: () => void) {
  if (gestureSeen) fn()
  else waiting.push(fn)
}

export function hasGesture(): boolean {
  return gestureSeen
}
