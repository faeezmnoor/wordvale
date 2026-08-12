import { describe, expect, test } from 'bun:test'
import { compatibleSlots, initPlay, playReducer, type PlayState } from '../../src/ui/playMachine'
import type { Placement } from '../../src/engine'

// Fixed tiny board:  CAT across at (0,0); ARC down crossing at A (0,1)
//   C A T
//   . R .
//   . C .
const P: Placement[] = [
  { word: 'CAT', row: 0, col: 0, dir: 'across' },
  { word: 'ARC', row: 0, col: 1, dir: 'down' },
]

function run(s: PlayState, ...actions: Parameters<typeof playReducer>[1][]): PlayState {
  return actions.reduce((st, a) => playReducer(st, a), s)
}

describe('playMachine', () => {
  test('tap focuses across first; same-cell tap toggles direction only at crossings', () => {
    let s = run(initPlay(P), { type: 'tapCell', key: '0,1' })
    expect(s.placements[s.focusWord!].word).toBe('CAT') // across preferred
    s = run(s, { type: 'tapCell', key: '0,1' })
    expect(s.placements[s.focusWord!].word).toBe('ARC') // toggle at crossing
    // non-crossing cell: repeat taps keep the single direction
    s = run(s, { type: 'tapCell', key: '0,0' }, { type: 'tapCell', key: '0,0' })
    expect(s.placements[s.focusWord!].word).toBe('CAT')
  })

  test('typing writes, advances, auto-solves; crossing letter feeds both words', () => {
    let s = run(
      initPlay(P),
      { type: 'tapCell', key: '0,0' },
      { type: 'typeLetter', letter: 'c' },
      { type: 'typeLetter', letter: 'a' },
      { type: 'typeLetter', letter: 't' },
    )
    expect(s.solved).toContain('CAT')
    expect(s.events.some((e) => e.type === 'solve')).toBe(true)
    // A at 0,1 is locked now (CAT solved); ARC already has its A
    s = run(s, { type: 'ack' }, { type: 'tapCell', key: '1,1' }, { type: 'typeLetter', letter: 'r' }, { type: 'typeLetter', letter: 'c' })
    expect(s.solved).toContain('ARC')
    expect(s.events.some((e) => e.type === 'complete')).toBe(true)
  })

  test('wrong letters stay neutral; explicit check flags them; letters kept', () => {
    let s = run(
      initPlay(P),
      { type: 'tapCell', key: '0,0' },
      { type: 'typeLetter', letter: 'x' },
      { type: 'typeLetter', letter: 'y' },
      { type: 'typeLetter', letter: 'z' },
    )
    expect(s.solved).toEqual([])
    expect(s.events).toEqual([]) // silent on wrong autocheck
    s = run(s, { type: 'check' })
    expect(s.events.some((e) => e.type === 'wrongCheck')).toBe(true)
    expect(s.fill['0,0']).toBe('X') // letters kept for editing
  })

  test('typing over a locked cell is a no-op but advances focus', () => {
    let s = run(
      initPlay(P),
      { type: 'tapCell', key: '0,0' },
      { type: 'typeLetter', letter: 'c' },
      { type: 'typeLetter', letter: 'a' },
      { type: 'typeLetter', letter: 't' },
      { type: 'ack' },
    )
    // focus ARC via tab; its first empty cell is 1,1 (0,1 locked+filled)
    s = run(s, { type: 'tab' })
    expect(s.focusCell).toBe('1,1')
    const before = s.fill['0,1']
    s = run(s, { type: 'tapCell', key: '0,1' }, { type: 'tapCell', key: '0,1' }, { type: 'typeLetter', letter: 'z' })
    expect(s.fill['0,1']).toBe(before) // locked: unchanged
  })

  test('backspace clears, retreats within word, stays at first cell', () => {
    let s = run(
      initPlay(P),
      { type: 'tapCell', key: '0,0' },
      { type: 'typeLetter', letter: 'c' },
      { type: 'typeLetter', letter: 'x' },
    )
    expect(s.focusCell).toBe('0,2')
    s = run(s, { type: 'backspace' }) // 0,2 empty → retreat to 0,1 and clear X
    expect(s.focusCell).toBe('0,1')
    expect(s.fill['0,1']).toBeUndefined()
    s = run(s, { type: 'backspace' }) // retreat to 0,0 clearing C
    s = run(s, { type: 'backspace' }) // 0,0 now empty, first cell → stay
    expect(s.focusCell).toBe('0,0')
  })

  test('tab cycles unsolved words in placement order and wraps; shift-tab reverses', () => {
    let s = run(initPlay(P), { type: 'tab' })
    expect(s.placements[s.focusWord!].word).toBe('CAT')
    s = run(s, { type: 'tab' })
    expect(s.placements[s.focusWord!].word).toBe('ARC')
    s = run(s, { type: 'tab' }) // wraps
    expect(s.placements[s.focusWord!].word).toBe('CAT')
    s = run(s, { type: 'tab', back: true })
    expect(s.placements[s.focusWord!].word).toBe('ARC')
  })

  test('bank select: compatible slots by length + locked letters; place overwrites typed', () => {
    let s = run(initPlay(P), { type: 'tapCell', key: '0,0' }, { type: 'typeLetter', letter: 'z' })
    s = run(s, { type: 'tapBank', word: 'CAT' })
    expect(s.mode).toBe('bankSelect')
    // both slots are 3 letters with no locked cells yet → both are candidate spots
    // (that's the puzzle: the player figures out WHICH slot; typed letters don't constrain)
    expect(compatibleSlots(s)).toEqual([0, 1])
  })

  test('bank place on incompatible slot shakes and keeps selection', () => {
    // solve CAT first so its cells lock, then ARC slot demands A at 0,1
    let s = run(
      initPlay(P),
      { type: 'tapCell', key: '0,0' },
      { type: 'typeLetter', letter: 'c' },
      { type: 'typeLetter', letter: 'a' },
      { type: 'typeLetter', letter: 't' },
      { type: 'ack' },
      { type: 'tapBank', word: 'ARC' },
    )
    expect(compatibleSlots(s)).toEqual([1])
    s = run(s, { type: 'tapCell', key: '1,1' }) // tap ARC slot → place
    expect(s.solved).toContain('ARC')
  })

  test('second tap on bank word deselects', () => {
    let s = run(initPlay(P), { type: 'tapBank', word: 'CAT' }, { type: 'tapBank', word: 'CAT' })
    expect(s.mode).toBe('idle')
    expect(s.bankWord).toBeNull()
  })

  test('resume: init with fill + solved restores exactly', () => {
    const s = initPlay(P, { '0,0': 'C', '0,1': 'A', '0,2': 'T' }, ['CAT'])
    expect(s.solved).toEqual(['CAT'])
    expect(s.fill['0,1']).toBe('A')
  })
})
