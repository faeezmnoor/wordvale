// Home ambience — soft birds + breeze, synthesized (no asset download) and gesture-gated.
// Browsers block audio before the first user gesture; we start only after one.

import { getSettings } from '../state/settings'

let ctx: AudioContext | null = null
let nodes: { gain: GainNode; stop: () => void } | null = null
let gestureHooked = false
let gestureSeen = false
let wanted = false

function build(c: AudioContext) {
  const master = c.createGain()
  master.gain.value = 0
  master.connect(c.destination)

  // breeze: filtered noise
  const noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate)
  const data = noiseBuf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.35
  const noise = c.createBufferSource()
  noise.buffer = noiseBuf
  noise.loop = true
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 420
  const breezeGain = c.createGain()
  breezeGain.gain.value = 0.5
  noise.connect(lp).connect(breezeGain).connect(master)
  noise.start()

  // birds: occasional short chirps, scheduled ahead in a loop
  let timer: ReturnType<typeof setInterval> | null = null
  const chirp = () => {
    if (c.state !== 'running' || !wanted) return
    const t = c.currentTime + Math.random() * 2
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'sine'
    const base = 1800 + Math.random() * 900
    osc.frequency.setValueAtTime(base, t)
    osc.frequency.linearRampToValueAtTime(base + 400, t + 0.06)
    g.gain.setValueAtTime(0.06, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
    osc.connect(g).connect(master)
    osc.start(t)
    osc.stop(t + 0.14)
  }
  timer = setInterval(() => Math.random() < 0.6 && chirp(), 3500)

  return {
    gain: master,
    stop: () => {
      if (timer) clearInterval(timer)
      try {
        noise.stop()
      } catch {
        /* already stopped */
      }
      master.disconnect()
    },
  }
}

function applyVolume() {
  if (!nodes || !ctx) return
  const s = getSettings()
  const target = s.sound && wanted && !document.hidden ? s.ambVol * 0.5 : 0
  nodes.gain.gain.linearRampToValueAtTime(target, ctx.currentTime + 0.6)
}

function start() {
  if (typeof window === 'undefined') return
  // hard rule: never touch AudioContext before a real user gesture (browser autoplay policy)
  if (!gestureSeen) return
  try {
    if (!ctx) ctx = new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    if (!nodes) nodes = build(ctx)
    applyVolume()
  } catch {
    /* no audio available — silent is fine */
  }
}

/** Call on mount of the home screen. Actual playback waits for the first user gesture. */
export function enableAmbience() {
  wanted = true
  if (!gestureHooked) {
    gestureHooked = true
    const onGesture = () => {
      gestureSeen = true
      start()
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
    }
    window.addEventListener('pointerdown', onGesture, { once: false })
    window.addEventListener('keydown', onGesture, { once: false })
    document.addEventListener('visibilitychange', applyVolume)
  } else {
    start()
  }
}

/** Call when leaving home (ambience is a home-screen mood, not a game-wide bed). */
export function disableAmbience() {
  wanted = false
  applyVolume()
  // fully tear down after the fade so nothing keeps scheduling in the background
  const dying = nodes
  nodes = null
  setTimeout(() => dying?.stop(), 700)
}

export function refreshAmbienceVolume() {
  applyVolume()
}
