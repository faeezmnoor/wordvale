import { mulberry32, type Rng } from './rng'
import { boundsOf, cellsOf, computeMetrics, extendBounds } from './metrics'
import type { Dir, GenResult, Placement } from './types'
import {
  BACKTRACK_K,
  DEFAULT_CANDIDATES,
  EARLY_EXIT_XPERWORD,
  MAX_GRID,
  NEAR_BEST_BAND,
  ORDER_NOISE,
  PRIORITY_BUMP,
  P_LONG_AXIS,
  SPOT_PICK_P1,
  SPOT_PICK_P2,
  W_BALANCE,
  W_COMPACTNESS,
  W_CROSSING,
} from './config'

export interface GenerateOptions {
  /** candidate builds to attempt (each independently seeded). Default 32 (~1.2ms each). */
  candidates?: number
  /** wall-clock budget; omit for unlimited (deterministic). */
  maxMs?: number
  /** clock for the budget — injected so the engine stays pure/testable. */
  now?: () => number
}

interface Board {
  cells: Map<string, string> // "r,c" -> letter
  dirs: Map<string, Dir[]> // directions of words covering each cell
  placements: Placement[]
}

function key(r: number, c: number): string {
  return `${r},${c}`
}

function emptyBoard(): Board {
  return { cells: new Map(), dirs: new Map(), placements: [] }
}

function place(b: Board, p: Placement): void {
  for (const { r, c, letter } of cellsOf(p)) {
    b.cells.set(key(r, c), letter)
    const d = b.dirs.get(key(r, c)) ?? []
    d.push(p.dir)
    b.dirs.set(key(r, c), d)
  }
  b.placements.push(p)
}

function unplaceLast(b: Board): Placement | undefined {
  const p = b.placements.pop()
  if (!p) return undefined
  for (const { r, c } of cellsOf(p)) {
    const k = key(r, c)
    const d = b.dirs.get(k) ?? []
    d.splice(d.indexOf(p.dir), 1)
    if (d.length === 0) {
      b.dirs.delete(k)
      b.cells.delete(k)
    } else {
      b.dirs.set(k, d)
    }
  }
  return p
}

/** Legality per tech spec: crossings match; no adjacent parallel contact; grid ≤ 21×21. */
function isLegal(b: Board, p: Placement): boolean {
  const dr = p.dir === 'down' ? 1 : 0
  const dc = p.dir === 'across' ? 1 : 0
  let hasCrossing = b.placements.length === 0 // first word needs none

  // cell before start / after end must be empty
  if (b.cells.has(key(p.row - dr, p.col - dc))) return false
  if (b.cells.has(key(p.row + dr * p.word.length, p.col + dc * p.word.length))) return false

  const cells = cellsOf(p)
  for (const { r, c, letter } of cells) {
    const existing = b.cells.get(key(r, c))
    if (existing !== undefined) {
      // crossing: letters must match, and the cell must not already carry our direction
      if (existing !== letter) return false
      const dirs = b.dirs.get(key(r, c)) ?? []
      if (dirs.includes(p.dir)) return false
      hasCrossing = true
    } else {
      // empty cell: its perpendicular neighbors must be empty (no parallel contact)
      const n1 = p.dir === 'across' ? key(r - 1, c) : key(r, c - 1)
      const n2 = p.dir === 'across' ? key(r + 1, c) : key(r, c + 1)
      if (b.cells.has(n1) || b.cells.has(n2)) return false
    }
  }
  if (!hasCrossing) return false

  // bounds check with the new word included — O(1) via extendBounds (review: efficiency #1)
  const bounds = extendBounds(boardBounds(b), p)
  return bounds.rows <= MAX_GRID && bounds.cols <= MAX_GRID
}

// cached per board mutation count would be nicer; bounds is O(placements) which is small
function boardBounds(b: Board) {
  return boundsOf(b.placements)
}

interface Spot {
  placement: Placement
  score: number
  crossings: number
}

/** spotScore per tech spec: crossings, compactness gain, balance, long-axis penalty. */
function spotScore(
  b: Board,
  p: Placement,
  before: ReturnType<typeof boundsOf>,
): { score: number; crossings: number } {
  let crossings = 0
  for (const { r, c } of cellsOf(p)) if (b.cells.has(key(r, c))) crossings++

  const after = extendBounds(before, p)
  const beforeArea = Math.max(1, before.rows * before.cols)
  const afterArea = after.rows * after.cols
  const maxArea = MAX_GRID * MAX_GRID
  const compactness = 1 - afterArea / maxArea
  const aspect = after.rows > after.cols ? after.cols / after.rows : after.rows / after.cols
  const extendsLongAxis =
    (before.rows >= before.cols && after.rows > before.rows) ||
    (before.cols > before.rows && after.cols > before.cols)

  let s = W_CROSSING * crossings + W_COMPACTNESS * compactness + W_BALANCE * aspect
  if (extendsLongAxis && afterArea > beforeArea) s -= P_LONG_AXIS
  return { score: s, crossings }
}

function findSpots(b: Board, word: string): Spot[] {
  const spots: Spot[] = []
  const tried = new Set<string>()
  const before = boundsOf(b.placements) // hoisted: loop-invariant (review: efficiency #2)
  for (const placed of b.placements) {
    const targetDir: Dir = placed.dir === 'across' ? 'down' : 'across'
    for (const cell of cellsOf(placed)) {
      for (let i = 0; i < word.length; i++) {
        if (word[i] !== cell.letter) continue
        const row = targetDir === 'down' ? cell.r - i : cell.r
        const col = targetDir === 'across' ? cell.c - i : cell.c
        const sig = `${row},${col},${targetDir}`
        if (tried.has(sig)) continue
        tried.add(sig)
        const p: Placement = { word, row, col, dir: targetDir }
        if (isLegal(b, p)) {
          const { score, crossings } = spotScore(b, p, before)
          spots.push({ placement: p, score, crossings })
        }
      }
    }
  }
  return spots
}

function sharedLetterDegree(word: string, all: string[]): number {
  let degree = 0
  for (const other of all) {
    if (other === word) continue
    for (const ch of new Set(word)) {
      if (other.includes(ch)) {
        degree++
        break
      }
    }
  }
  return degree
}

function buildCandidate(
  words: string[],
  rng: Rng,
  priority?: Set<string>,
): Board & { unplaced: string[] } {
  // connectability-guided order with rng perturbation — the diversity lever that makes
  // distinct seeds produce visibly distinct layouts (greedy argmax alone converges).
  // Words in `priority` (unplaced in an earlier pass) jump the queue: scarce-crossing words
  // must claim their spots before flexible words consume them.
  const noisyKey = new Map(
    words.map((w) => [
      w,
      sharedLetterDegree(w, words) * 10 +
        w.length +
        rng() * ORDER_NOISE +
        (priority?.has(w) ? PRIORITY_BUMP : 0),
    ]),
  )
  const order = [...words].sort((a, b) => noisyKey.get(b)! - noisyKey.get(a)!)

  const board = emptyBoard()
  const unplaced: string[] = []
  const first = order.shift()
  if (!first) return Object.assign(board, { unplaced })
  place(board, { word: first, row: 0, col: 0, dir: 'across' })

  const requeued = new Set<string>()
  const queue = [...order]

  while (queue.length) {
    const w = queue.shift()!
    let placed = false
    const popped: Placement[] = []

    for (let attempt = 0; attempt <= BACKTRACK_K; attempt++) {
      const spots = findSpots(board, w)
      if (spots.length > 0) {
        // multi-crossing spots always win (knotty grids); randomness only picks WHERE
        spots.sort((a, b) => b.crossings - a.crossings || b.score - a.score)
        const maxX = spots[0].crossings
        const pool = spots.filter((s) => s.crossings === maxX)
        const r = rng()
        const idx = Math.min(pool.length - 1, r < SPOT_PICK_P1 ? 0 : r < SPOT_PICK_P2 ? 1 : 2)
        place(board, pool[idx].placement)
        placed = true
        break
      }
      if (attempt < BACKTRACK_K && board.placements.length > 1) {
        const removed = unplaceLast(board)
        if (removed) popped.push(removed)
      } else {
        break
      }
    }

    if (placed) {
      // popped words re-queue at the END, once each; a second failure = unplaced
      for (const pw of popped) {
        if (requeued.has(pw.word)) unplaced.push(pw.word)
        else {
          requeued.add(pw.word)
          queue.push(pw.word)
        }
      }
    } else {
      // restore everything we popped (their positions were legal) and give up on w
      for (const pw of popped.reverse()) place(board, pw)
      unplaced.push(w)
    }
  }

  return Object.assign(board, { unplaced })
}

/** Normalize placements so the bounding box starts at (0,0). */
function normalizePlacements(placements: Placement[]): Placement[] {
  const { minR, minC } = boundsOf(placements)
  return placements.map((p) => ({ ...p, row: p.row - minR, col: p.col - minC }))
}

/** Mix (seed, n) into a well-separated uint32 so sequential seeds share no candidate RNGs. */
function mix(seed: number, n: number): number {
  let h = (seed ^ 0x9e3779b9) >>> 0
  h = Math.imul(h ^ (h >>> 16), 2246822507)
  h = Math.imul(h ^ (h >>> 13), 3266489909) ^ n
  h = Math.imul(h ^ (h >>> 16), 2246822507)
  return h >>> 0
}

export function generate(words: string[], seed: number, opts: GenerateOptions = {}): GenResult {
  if (opts.maxMs !== undefined && !opts.now) {
    throw new Error('generate: maxMs requires a now() clock (engine stays pure)')
  }
  const candidateCount = opts.candidates ?? DEFAULT_CANDIDATES
  const start = opts.now?.() ?? 0

  // words the grid can never hold go straight to unplaced (public API may skip precheck)
  const oversize = words.filter((w) => w.length > MAX_GRID)
  const usable = oversize.length ? words.filter((w) => w.length <= MAX_GRID) : words

  const scored: { candidate: Board & { unplaced: string[] }; score: number }[] = []
  let priority: Set<string> | undefined
  for (let n = 0; n < candidateCount; n++) {
    if (opts.now && opts.maxMs !== undefined && n > 0 && opts.now() - start > opts.maxMs) break
    // restart heuristic: alternate plain builds with builds that bump previously-unplaced
    // words toward the front — scarce-crossing words claim spots before flexible words
    // consume them, while plain builds preserve layout diversity.
    const usePriority = priority && n % 2 === 1
    const candidate = buildCandidate(usable, mulberry32(mix(seed, n)), usePriority ? priority : undefined)
    const metrics = computeMetrics(candidate.placements, words.length)
    scored.push({ candidate, score: metrics.score })
    if (candidate.unplaced.length === 0 && metrics.xPerWord > EARLY_EXIT_XPERWORD) break // early exit: excellent
    if (candidate.unplaced.length > 0) {
      priority = new Set([...(priority ?? []), ...candidate.unplaced])
    }
  }

  // Seed-driven pick among near-best candidates (fewest unplaced words first, then within 5%
  // of the best score): keeps quality high while making distinct seeds produce visibly
  // distinct layouts ("regenerate" contract).
  const minUnplaced = Math.min(...scored.map((s) => s.candidate.unplaced.length), Infinity)
  const fullest = scored.filter((s) => s.candidate.unplaced.length === minUnplaced)
  const topScore = Math.max(...fullest.map((s) => s.score), 0)
  const eligible = fullest.filter((s) => s.score >= topScore * NEAR_BEST_BAND)
  const pick = eligible[Math.floor(mulberry32(mix(seed, 0xffff))() * eligible.length)]
  const best = pick?.candidate ?? null

  const placements = normalizePlacements(best?.placements ?? [])
  const unplaced = [...(best?.unplaced ?? [...usable]), ...oversize]
  const metrics = computeMetrics(placements, words.length)
  // an empty grid is never 'complete' (review: removed-behavior #4)
  const status =
    placements.length === 0 ? 'failed' : unplaced.length === 0 ? 'complete' : 'partial'
  return { status, placements, unplaced, metrics, seed }
}
