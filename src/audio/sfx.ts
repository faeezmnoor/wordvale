// Web-Audio-synthesized SFX — zero asset weight, tuned to the cozy register
// (design spec §Sound design). All calls no-op if audio is unavailable or muted.

import { getSettings } from '../state/settings'

let ctx: AudioContext | null = null
let active = 0
let gestureSeen = false
const MAX_CONCURRENT = 3

if (typeof window !== 'undefined') {
  const mark = () => {
    gestureSeen = true
    window.removeEventListener('pointerdown', mark)
    window.removeEventListener('keydown', mark)
  }
  window.addEventListener('pointerdown', mark)
  window.addEventListener('keydown', mark)
}

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined' || !gestureSeen) return null
  try {
    if (!ctx) ctx = new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

const voices: { stop: () => void }[] = []

function stopOldest() {
  const v = voices.shift()
  try {
    v?.stop()
  } catch {
    /* already ended */
  }
}

function tone(
  freq: number,
  opts: { type?: OscillatorType; dur?: number; vol?: number; delay?: number; slide?: number } = {},
) {
  const settings = getSettings()
  if (!settings.sound) return
  const c = ensureCtx()
  if (!c) return
  if (active >= MAX_CONCURRENT) stopOldest()
  const { type = 'triangle', dur = 0.12, vol = 0.5, delay = 0, slide = 0 } = opts
  const t0 = c.currentTime + delay
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (slide) osc.frequency.linearRampToValueAtTime(freq + slide, t0 + dur)
  gain.gain.setValueAtTime(vol * settings.sfxVol, t0)
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
  osc.connect(gain).connect(c.destination)
  active++
  const voice = { stop: () => osc.stop() }
  voices.push(voice)
  osc.onended = () => {
    active = Math.max(0, active - 1)
    const i = voices.indexOf(voice)
    if (i >= 0) voices.splice(i, 1)
  }
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

// pentatonic base (C4-ish) keeps everything harmonious
const PENTA = [262, 294, 330, 392, 440, 523, 587, 659]

/** letter placed — pitch rises with progress through the word (0..1) */
export function pluck(progress = 0) {
  tone(PENTA[Math.min(PENTA.length - 1, Math.floor(progress * 5))], { dur: 0.09, vol: 0.35 })
}

/** word solved — 3-note ascending arpeggio */
export function arpeggio() {
  tone(PENTA[2], { dur: 0.12, vol: 0.4 })
  tone(PENTA[4], { dur: 0.12, vol: 0.4, delay: 0.09 })
  tone(PENTA[6], { dur: 0.18, vol: 0.45, delay: 0.18 })
}

/** wrong check — muted low thud */
export function thud() {
  tone(110, { type: 'sine', dur: 0.16, vol: 0.4, slide: -30 })
}

/** coin collected */
export function ding() {
  tone(1047, { type: 'sine', dur: 0.1, vol: 0.3 })
  tone(1319, { type: 'sine', dur: 0.14, vol: 0.25, delay: 0.06 })
}

/** puzzle complete — 5-note fanfare */
export function fanfare() {
  const notes = [PENTA[0], PENTA[2], PENTA[4], PENTA[5], PENTA[7]]
  notes.forEach((f, i) => tone(f, { dur: i === notes.length - 1 ? 0.4 : 0.15, vol: 0.45, delay: i * 0.12 }))
}

/** button press — woody click */
export function click() {
  tone(880, { type: 'square', dur: 0.04, vol: 0.15 })
}

/** on-screen keyboard key — quieter tick */
export function tick() {
  tone(660, { type: 'square', dur: 0.03, vol: 0.08 })
}

/** regenerate — quick descending shuffle */
export function whoosh() {
  tone(600, { type: 'triangle', dur: 0.2, vol: 0.25, slide: -300 })
}
