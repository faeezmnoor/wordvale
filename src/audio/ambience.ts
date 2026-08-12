// Cozy ambience — soft breeze with occasional birds, synthesized (no asset download).
//
// This plays across the whole app, not just the home screen. It used to be home-only, which
// meant it was torn down by the very tap that started it (the only button on Home navigates
// away), so it was effectively never audible.

import { getSettings } from '../state/settings'
import { audioCtx, whenAudioReady } from './context'

interface Nodes {
  master: GainNode
  stop: () => void
}

let nodes: Nodes | null = null
let started = false

function build(c: AudioContext): Nodes {
  const master = c.createGain()
  master.gain.value = 0
  master.connect(c.destination)

  // breeze: low-passed noise, gently drifting so it doesn't sit still
  const noiseBuf = c.createBuffer(1, c.sampleRate * 3, c.sampleRate)
  const data = noiseBuf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.5
  const noise = c.createBufferSource()
  noise.buffer = noiseBuf
  noise.loop = true

  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 500

  const drift = c.createOscillator() // slow LFO on the filter = wind swelling and easing
  drift.frequency.value = 0.06
  const driftAmt = c.createGain()
  driftAmt.gain.value = 180
  drift.connect(driftAmt).connect(lp.frequency)
  drift.start()

  const breeze = c.createGain()
  breeze.gain.value = 0.9
  noise.connect(lp).connect(breeze).connect(master)
  noise.start()

  // birds: occasional two-note chirps
  const chirp = () => {
    if (c.state !== 'running' || !nodes) return
    const t = c.currentTime + Math.random() * 1.5
    const base = 1700 + Math.random() * 1100
    for (const [i, mult] of [1, 1.28].entries()) {
      const osc = c.createOscillator()
      const g = c.createGain()
      osc.type = 'sine'
      const at = t + i * 0.09
      osc.frequency.setValueAtTime(base * mult, at)
      osc.frequency.linearRampToValueAtTime(base * mult + 350, at + 0.05)
      g.gain.setValueAtTime(0.0001, at)
      g.gain.exponentialRampToValueAtTime(0.09, at + 0.012)
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.11)
      osc.connect(g).connect(master)
      osc.start(at)
      osc.stop(at + 0.13)
    }
  }
  const timer = setInterval(() => Math.random() < 0.55 && chirp(), 4200)

  return {
    master,
    stop: () => {
      clearInterval(timer)
      try {
        noise.stop()
        drift.stop()
      } catch {
        /* already stopped */
      }
      master.disconnect()
    },
  }
}

function applyVolume() {
  const c = audioCtx()
  if (!nodes || !c) return
  const s = getSettings()
  const target = s.sound && !document.hidden ? s.ambVol : 0
  nodes.master.gain.linearRampToValueAtTime(Math.max(0.0001, target), c.currentTime + 0.8)
}

/** Start the ambience bed. Safe to call repeatedly; waits for the first user gesture. */
export function startAmbience() {
  if (started) return
  started = true
  whenAudioReady(() => {
    const c = audioCtx()
    if (!c) return
    nodes = build(c)
    applyVolume()
  })
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', applyVolume)
  }
}

/** Re-read the sound setting (called by the mute toggle). */
export function refreshAmbienceVolume() {
  applyVolume()
}
