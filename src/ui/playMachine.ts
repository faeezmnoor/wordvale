// Pure play-screen state machine (tech spec §Interaction state machine).
// No React, no DOM — unit-tested directly. The grid's fill map is the ONLY letter store.

import { cellsOf, type Placement } from '../engine'

export type PlayEvent =
  | { type: 'solve'; word: string; cascade: string[] }
  | { type: 'wrongCheck'; word: string }
  | { type: 'incompleteCheck' }
  | { type: 'shake' }
  | { type: 'bankPlaced'; word: string; changed: string[] }
  | { type: 'complete' }

export interface PlayState {
  placements: Placement[]
  fill: Record<string, string>
  solved: string[]
  mode: 'idle' | 'wordFocus' | 'bankSelect'
  focusWord: number | null // index into placements
  focusCell: string | null // "r,c"
  bankWord: string | null
  /** consumed by the UI for SFX/animation; cleared via 'ack' */
  events: PlayEvent[]
}

export type PlayAction =
  | { type: 'tapCell'; key: string }
  | { type: 'typeLetter'; letter: string }
  | { type: 'backspace' }
  | { type: 'arrow'; dr: number; dc: number }
  | { type: 'tab'; back?: boolean }
  | { type: 'check' }
  | { type: 'tapBank'; word: string }
  | { type: 'dismiss' }
  | { type: 'ack' }

export function initPlay(placements: Placement[], fill: Record<string, string> = {}, solved: string[] = []): PlayState {
  return { placements, fill, solved, mode: 'idle', focusWord: null, focusCell: null, bankWord: null, events: [] }
}

const keyOf = (r: number, c: number) => `${r},${c}`

function wordCells(p: Placement): string[] {
  return cellsOf(p).map((c) => keyOf(c.r, c.c))
}

function wordsAt(s: PlayState, key: string): number[] {
  return s.placements.reduce<number[]>((acc, p, i) => {
    if (wordCells(p).includes(key)) acc.push(i)
    return acc
  }, [])
}

function isLocked(s: PlayState, key: string): boolean {
  return wordsAt(s, key).some((i) => s.solved.includes(s.placements[i].word))
}

function letterAt(p: Placement, key: string): string {
  const cells = cellsOf(p)
  const idx = cells.findIndex((c) => keyOf(c.r, c.c) === key)
  return cells[idx]?.letter ?? ''
}

function wordFilled(s: PlayState, i: number): boolean {
  return wordCells(s.placements[i]).every((k) => s.fill[k])
}

function wordCorrect(s: PlayState, i: number): boolean {
  const p = s.placements[i]
  return wordCells(p).every((k) => s.fill[k] === letterAt(p, k))
}

/** solve any filled+correct unsolved words touching the given cells; returns events */
function autoCheck(s: PlayState, touchedCells: string[]): PlayState {
  let next = s
  const toCheck = new Set<number>()
  for (const k of touchedCells) for (const i of wordsAt(s, k)) toCheck.add(i)
  const newlySolved: string[] = []
  for (const i of toCheck) {
    const w = next.placements[i].word
    if (next.solved.includes(w)) continue
    if (wordFilled(next, i) && wordCorrect(next, i)) {
      newlySolved.push(w)
      next = { ...next, solved: [...next.solved, w] }
    }
  }
  if (newlySolved.length) {
    const events: PlayEvent[] = newlySolved.map((word) => ({
      type: 'solve' as const,
      word,
      cascade: wordCells(next.placements.find((p) => p.word === word)!),
    }))
    next = { ...next, events: [...next.events, ...events] }
    if (next.solved.length === next.placements.length) {
      next = { ...next, events: [...next.events, { type: 'complete' }], mode: 'idle', focusWord: null, focusCell: null }
    }
  }
  return next
}

/** the next cell along the word (not the next EMPTY one) — typing walks every cell so a
 *  player can type a whole word straight through even where crossings are already filled */
function nextCell(s: PlayState, wordIdx: number, fromKey: string): string | null {
  const cells = wordCells(s.placements[wordIdx])
  const i = cells.indexOf(fromKey)
  return i >= 0 && i + 1 < cells.length ? cells[i + 1] : null
}

function firstCell(s: PlayState, wordIdx: number): string {
  return wordCells(s.placements[wordIdx])[0]
}

export function playReducer(s: PlayState, a: PlayAction): PlayState {
  switch (a.type) {
    case 'ack':
      return s.events.length ? { ...s, events: [] } : s

    case 'tapCell': {
      const words = wordsAt(s, a.key)
      if (words.length === 0) return s

      // bank-select mode: tapping a slot attempts placement of the selected bank word
      if (s.mode === 'bankSelect' && s.bankWord) {
        return placeBankWord(s, a.key)
      }

      let focusWord = words[0]
      // same-cell repeat tap toggles direction ONLY when the cell has both directions
      if (s.focusCell === a.key && s.focusWord !== null && words.length > 1) {
        const cur = words.indexOf(s.focusWord)
        focusWord = words[(cur + 1) % words.length]
      } else {
        // prefer across on first tap
        const across = words.find((i) => s.placements[i].dir === 'across')
        focusWord = across ?? words[0]
        if (s.focusWord !== null && words.includes(s.focusWord) && s.focusCell !== a.key) {
          focusWord = s.focusWord // moving within the focused word keeps it
        }
      }
      return { ...s, mode: 'wordFocus', focusWord, focusCell: a.key, bankWord: null }
    }

    case 'typeLetter': {
      if (s.mode !== 'wordFocus' || s.focusWord === null || !s.focusCell) return s
      const letter = a.letter.toUpperCase()
      if (!/^[A-Z]$/.test(letter)) return s
      // Locked cells are position-agnostic: typing the whole word walks over them, and
      // typing only the MISSING letters also works — a letter that doesn't match the locked
      // cell isn't consumed there, it skips ahead to the next writable cell.
      let target: string | null = s.focusCell
      while (target && isLocked(s, target)) {
        const lockedLetter = s.fill[target]
        if (lockedLetter === letter) {
          // the player typed the letter that's already there: consume it, move on
          const after = nextCell(s, s.focusWord, target)
          return { ...s, focusCell: after ?? target }
        }
        target = nextCell(s, s.focusWord, target)
      }
      if (!target) return s
      let next: PlayState = { ...s, fill: { ...s.fill, [target]: letter } }
      next = autoCheck(next, [target])
      if (next.mode === 'wordFocus' && next.focusWord !== null) {
        const adv = nextCell(next, next.focusWord, target)
        next = { ...next, focusCell: adv ?? target }
      }
      return next
    }

    case 'backspace': {
      if (s.mode !== 'wordFocus' || s.focusWord === null || !s.focusCell) return s
      const cells = wordCells(s.placements[s.focusWord])
      const idx = cells.indexOf(s.focusCell)
      if (s.fill[s.focusCell] && !isLocked(s, s.focusCell)) {
        const fill = { ...s.fill }
        delete fill[s.focusCell]
        return { ...s, fill }
      }
      // retreat within the word; at the first cell, stay put (spec)
      if (idx > 0) {
        const prev = cells[idx - 1]
        const fill = { ...s.fill }
        if (fill[prev] && !isLocked(s, prev)) delete fill[prev]
        return { ...s, fill, focusCell: prev }
      }
      return s
    }

    case 'arrow': {
      if (!s.focusCell) return s
      const [r, c] = s.focusCell.split(',').map(Number)
      // scan up to 21 cells in the direction for the next slot cell
      for (let step = 1; step <= 21; step++) {
        const k = keyOf(r + a.dr * step, c + a.dc * step)
        const words = wordsAt(s, k)
        if (words.length) {
          const wantDir = a.dr !== 0 ? 'down' : 'across'
          const byDir = words.find((i) => s.placements[i].dir === wantDir)
          const keepCurrent = words.find((i) => i === s.focusWord)
          const focusWord = byDir ?? keepCurrent ?? words[0]
          return { ...s, mode: 'wordFocus', focusWord, focusCell: k, bankWord: null }
        }
      }
      return s
    }

    case 'tab': {
      const unsolved = s.placements
        .map((p, i) => ({ p, i }))
        .filter(({ p }) => !s.solved.includes(p.word))
      if (unsolved.length === 0) return s
      const cur = unsolved.findIndex(({ i }) => i === s.focusWord)
      const nextIdx = a.back
        ? (cur - 1 + unsolved.length) % unsolved.length
        : (cur + 1) % unsolved.length
      const target = unsolved[cur === -1 ? 0 : nextIdx]
      return {
        ...s,
        mode: 'wordFocus',
        focusWord: target.i,
        focusCell: firstCell(s, target.i), // start of the word: type it straight through
        bankWord: null,
      }
    }

    case 'check': {
      if (s.mode !== 'wordFocus' || s.focusWord === null) {
        return { ...s, events: [...s.events, { type: 'incompleteCheck' }] }
      }
      const w = s.placements[s.focusWord].word
      if (s.solved.includes(w)) return s
      if (!wordFilled(s, s.focusWord)) return { ...s, events: [...s.events, { type: 'incompleteCheck' }] }
      if (wordCorrect(s, s.focusWord)) return autoCheck(s, wordCells(s.placements[s.focusWord]))
      return { ...s, events: [...s.events, { type: 'wrongCheck', word: w }] }
    }

    case 'tapBank': {
      if (s.solved.includes(a.word)) return s
      if (s.bankWord === a.word) return { ...s, mode: s.focusWord !== null ? 'wordFocus' : 'idle', bankWord: null }
      return { ...s, mode: 'bankSelect', bankWord: a.word }
    }

    case 'dismiss':
      return { ...s, mode: 'idle', focusWord: null, focusCell: null, bankWord: null }

    default:
      return s
  }
}

/** compatible = same length AND every locked cell letter matches (typed letters don't constrain) */
export function compatibleSlots(s: PlayState): number[] {
  if (!s.bankWord) return []
  return s.placements.reduce<number[]>((acc, p, i) => {
    if (s.solved.includes(p.word)) return acc
    if (p.word.length !== s.bankWord!.length) return acc
    const cells = wordCells(p)
    const ok = cells.every((k, idx) => !isLocked(s, k) || s.fill[k] === s.bankWord![idx])
    if (ok) acc.push(i)
    return acc
  }, [])
}

function placeBankWord(s: PlayState, tappedKey: string): PlayState {
  const word = s.bankWord!
  const slotIdx = wordsAt(s, tappedKey).find((i) => compatibleSlots(s).includes(i))
  if (slotIdx === undefined) {
    return { ...s, events: [...s.events, { type: 'shake' }] }
  }
  const p = s.placements[slotIdx]
  const cells = wordCells(p)
  const fill = { ...s.fill }
  const changed: string[] = []
  cells.forEach((k, idx) => {
    if (!isLocked(s, k) && fill[k] !== word[idx]) {
      fill[k] = word[idx]
      changed.push(k)
    }
  })
  let next: PlayState = {
    ...s,
    fill,
    events: [...s.events, { type: 'bankPlaced', word, changed }],
  }
  next = autoCheck(next, cells)
  const stillFits = compatibleSlots(next).length > 0 && !next.solved.includes(word)
  if (stillFits) return { ...next, mode: 'bankSelect', bankWord: word }
  // no stale highlight left behind when the selection ends
  return { ...next, mode: 'idle', bankWord: null, focusWord: null, focusCell: null }
}
