import { LOOSE_BALANCE, LOOSE_DENSITY } from './config'
import type { Placement, QualityMetrics } from './types'

export function cellsOf(p: Placement): { r: number; c: number; letter: string }[] {
  const dr = p.dir === 'down' ? 1 : 0
  const dc = p.dir === 'across' ? 1 : 0
  return p.word.split('').map((letter, i) => ({ r: p.row + i * dr, c: p.col + i * dc, letter }))
}

export function boundsOf(placements: Placement[]) {
  if (placements.length === 0) return { minR: 0, minC: 0, rows: 0, cols: 0 }
  // O(1) per placement: only the two endpoints matter (review: efficiency #3)
  let minR = Infinity
  let maxR = -Infinity
  let minC = Infinity
  let maxC = -Infinity
  for (const p of placements) {
    const endR = p.dir === 'down' ? p.row + p.word.length - 1 : p.row
    const endC = p.dir === 'across' ? p.col + p.word.length - 1 : p.col
    if (p.row < minR) minR = p.row
    if (endR > maxR) maxR = endR
    if (p.col < minC) minC = p.col
    if (endC > maxC) maxC = endC
  }
  return { minR, minC, rows: maxR - minR + 1, cols: maxC - minC + 1 }
}

/** Merge one placement into existing bounds without re-scanning — O(1). */
export function extendBounds(
  b: { minR: number; minC: number; rows: number; cols: number },
  p: Placement,
) {
  const endR = p.dir === 'down' ? p.row + p.word.length - 1 : p.row
  const endC = p.dir === 'across' ? p.col + p.word.length - 1 : p.col
  const minR = Math.min(b.minR, p.row)
  const minC = Math.min(b.minC, p.col)
  const maxR = Math.max(b.minR + b.rows - 1, endR)
  const maxC = Math.max(b.minC + b.cols - 1, endC)
  return { minR, minC, rows: maxR - minR + 1, cols: maxC - minC + 1 }
}

export function computeMetrics(placements: Placement[], totalWords: number): QualityMetrics {
  if (placements.length === 0)
    return { placedRatio: 0, xPerWord: 0, density: 0, balance: 0, score: 0, placed: 0, crossings: 0 }

  const filled = new Map<string, number>()
  for (const p of placements)
    for (const { r, c } of cellsOf(p)) {
      const key = `${r},${c}`
      filled.set(key, (filled.get(key) ?? 0) + 1)
    }
  let crossings = 0
  for (const count of filled.values()) if (count > 1) crossings += count - 1

  const { rows, cols } = boundsOf(placements)
  const placedRatio = placements.length / totalWords
  const xPerWord = crossings / placements.length
  const density = filled.size / (rows * cols)
  const aspect = rows > cols ? cols / rows : rows / cols // 0..1, 1 = square
  const balance = aspect

  const score = placedRatio * 100 + xPerWord * 10 + density * 5 + balance * 2
  return { placedRatio, xPerWord, density, balance, score, placed: placements.length, crossings }
}

export type QualityPhrase = 'loose' | 'cosy' | 'nice & knotty'

// Recalibrated against measured generator output (build log, slice a): strict kriss-kross
// adjacency makes crossings-beyond-spanning-tree rare, so the tree itself is the "cosy"
// baseline; sprawl reads as loose; any extra crossing reads as knotty.
export function qualityPhrase(m: QualityMetrics): QualityPhrase {
  if (m.placed <= 1) return 'loose' // empty/degenerate grids never flatter (review: cross-file #1)
  const extraCrossings = m.crossings - (m.placed - 1)
  if (extraCrossings >= 1) return 'nice & knotty'
  if (m.density < LOOSE_DENSITY || m.balance < LOOSE_BALANCE) return 'loose'
  return 'cosy'
}
