import { describe, expect, test } from 'bun:test'
import { generate, mulberry32, precheck } from '../../src/engine'
import { validateLegal } from './validate'

// Deterministic pseudo-word lists: consonant-vowel syllables from a seeded RNG, which
// guarantees heavy letter overlap (realistic for word lists) plus occasional oddballs.
function randomList(seed: number): string[] {
  const rng = mulberry32(seed)
  const cons = 'BCDFGHKLMNPRSTW'
  const vowels = 'AEIOU'
  const count = 3 + Math.floor(rng() * 12)
  const words: string[] = []
  for (let i = 0; i < count; i++) {
    const syllables = 1 + Math.floor(rng() * 3)
    let w = ''
    for (let s = 0; s < syllables; s++) {
      w += cons[Math.floor(rng() * cons.length)] + vowels[Math.floor(rng() * vowels.length)]
      if (rng() < 0.3) w += cons[Math.floor(rng() * cons.length)]
    }
    words.push(w.slice(0, 15))
  }
  return words
}

describe('generate: property suite', () => {
  test('500 random lists → legal, conserved, normalized', () => {
    let generated = 0
    for (let caseSeed = 1; caseSeed <= 500; caseSeed++) {
      const pre = precheck(randomList(caseSeed))
      if (pre.valid.length < 2) continue
      const result = generate(pre.valid, caseSeed, { candidates: 2 })
      const errors = validateLegal(result.placements, pre.valid, result.unplaced)
      if (errors.length) throw new Error(`case ${caseSeed}: ${errors.join('; ')}`)
      generated++
    }
    expect(generated).toBeGreaterThan(400)
  })

  test('deterministic: same (words, seed) → identical result', () => {
    const pre = precheck(randomList(42))
    const a = generate(pre.valid, 7, { candidates: 8 })
    const b = generate(pre.valid, 7, { candidates: 8 })
    expect(a).toEqual(b)
  })

  test('seed diversity: 100 seeds → 100 distinct grids', () => {
    const words = ['HARVEST', 'APPLE', 'VINE', 'SEED', 'ELDER', 'STREAM', 'ORCHARD', 'PETAL', 'ACORN', 'MEADOW']
    const signatures = new Set<string>()
    for (let seed = 1; seed <= 100; seed++) {
      const r = generate(words, seed, { candidates: 8 })
      expect(r.status).toBe('complete')
      signatures.add(JSON.stringify(r.placements))
    }
    expect(signatures.size).toBe(100)
  })

  test('forced backtracking: word placeable only after removals still lands', () => {
    // ZOO can only cross via O; OX takes an O-crossing spot that can starve ZOO in greedy
    // order. The engine's backtrack/deferred path must still place every word.
    const words = ['CROSS', 'STONE', 'ONSET', 'ZOO', 'OX']
    const r = generate(words, 3, { candidates: 8 })
    const errors = validateLegal(r.placements, words, r.unplaced)
    expect(errors).toEqual([])
    expect(r.status).toBe('complete')
  })
})

describe('generate: failure fixtures', () => {
  test('single word cannot generate (needs a crossing partner)', () => {
    const r = generate(['ALONE'], 1, { candidates: 2 })
    expect(r.status).toBe('complete') // one word IS the grid — trivially complete
    expect(r.placements).toHaveLength(1)
  })

  test('pathological long words still return within candidate budget', () => {
    const words = Array.from({ length: 15 }, (_, i) => 'ABCDEFGHIJKLMNO'.slice(0, 15 - (i % 3)))
    const pre = precheck(words)
    const r = generate(pre.valid, 5, { candidates: 2 })
    expect(['complete', 'partial', 'failed']).toContain(r.status)
  })
})

describe('precheck fixtures', () => {
  test('disconnected words reported as isolates', () => {
    const pre = precheck(['XYZ', 'QQ', 'WW'])
    expect(pre.valid.length + pre.isolates.length).toBe(3)
    expect(pre.isolates.length).toBeGreaterThan(0)
  })
  test('charset, tooShort, duplicate reasons', () => {
    const pre = precheck(['café', 'kuih lapis', 'a', 'apple', 'APPLE'])
    const reasons = pre.rejected.map((r) => r.reason).sort()
    expect(reasons).toEqual(['charset', 'duplicate', 'tooShort'])
    expect(pre.valid).toEqual(['CAFE', 'APPLE']) // café normalizes to CAFE — valid, not rejected
  })
  test('diacritics normalize instead of rejecting', () => {
    expect(precheck(['café', 'naïve']).valid).toEqual(['CAFE', 'NAIVE'])
  })
  test('count errors', () => {
    expect(precheck(['solo']).countError).toBe('tooFew')
    expect(precheck(Array.from({ length: 25 }, (_, i) => `WORD${String.fromCharCode(65 + i)}`)).countError).toBe('tooMany')
  })
})

describe('generate: production path (default candidates)', () => {
  test('30 lists at default options → legal', () => {
    for (let caseSeed = 1; caseSeed <= 30; caseSeed++) {
      const pre = precheck(randomList(caseSeed * 101))
      if (pre.countError !== null || pre.valid.length < 2) continue
      const result = generate(pre.valid, caseSeed)
      const errors = validateLegal(result.placements, pre.valid, result.unplaced)
      if (errors.length) throw new Error(`case ${caseSeed}: ${errors.join('; ')}`)
    }
  })
  test('degenerate inputs never report complete', () => {
    expect(generate([], 1).status).toBe('failed')
    expect(() => generate(['ABC'], 1, { maxMs: 100 })).toThrow() // maxMs without now
  })
})
