// Web-Audio-synthesized SFX — zero asset weight, tuned to the cozy register
// (design spec §Sound design). All calls no-op if audio is unavailable or muted.

import { getSettings } from '../state/settings'
import { audioCtx } from './context'

let active = 0
const MAX_CONCURRENT = 4
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
  const c = audioCtx()
  if (!c) return
  if (active >= MAX_CONCURRENT) stopOldest()

  const { type = 'triangle', dur = 0.12, vol = 0.5, delay = 0, slide = 0 } = opts
  const t0 = c.currentTime + delay
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (slide) osc.frequency.linearRampToValueAtTime(Math.max(40, freq + slide), t0 + dur)

  // brief attack then decay — ramping straight down from full volume clicks audibly
  const peak = Math.max(0.0001, vol * settings.sfxVol)
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)

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
  tone(PENTA[Math.min(PENTA.length - 1, Math.floor(progress * 5))], { dur: 0.16, vol: 0.7 })
}

/** word solved — 3-note ascending arpeggio */
export function arpeggio() {
  tone(PENTA[2], { dur: 0.18, vol: 0.75 })
  tone(PENTA[4], { dur: 0.18, vol: 0.75, delay: 0.1 })
  tone(PENTA[6], { dur: 0.3, vol: 0.8, delay: 0.2 })
}

/** wrong check — muted low thud */
export function thud() {
  tone(140, { type: 'sine', dur: 0.22, vol: 0.7, slide: -60 })
}

/** coin collected */
export function ding() {
  tone(1047, { type: 'sine', dur: 0.14, vol: 0.5 })
  tone(1319, { type: 'sine', dur: 0.2, vol: 0.45, delay: 0.07 })
}

/** puzzle complete — 5-note fanfare */
export function fanfare() {
  const notes = [PENTA[0], PENTA[2], PENTA[4], PENTA[5], PENTA[7]]
  notes.forEach((f, i) =>
    tone(f, { dur: i === notes.length - 1 ? 0.55 : 0.2, vol: 0.8, delay: i * 0.13 }),
  )
}

/** button press — woody click */
export function click() {
  tone(700, { type: 'square', dur: 0.07, vol: 0.35 })
}

/** on-screen keyboard key — quieter tick */
export function tick() {
  tone(620, { type: 'square', dur: 0.05, vol: 0.25 })
}

/** regenerate — quick descending shuffle */
export function whoosh() {
  tone(700, { type: 'triangle', dur: 0.28, vol: 0.45, slide: -400 })
}
