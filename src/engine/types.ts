export type Dir = 'across' | 'down'

export interface Placement {
  word: string
  row: number
  col: number
  dir: Dir
}

export type GenStatus = 'complete' | 'partial' | 'failed'

export interface QualityMetrics {
  placedRatio: number
  xPerWord: number
  density: number
  balance: number
  score: number
  placed: number
  crossings: number
}

export interface GenResult {
  status: GenStatus
  placements: Placement[]
  unplaced: string[]
  metrics: QualityMetrics
  seed: number
}

export type RejectReason = 'tooShort' | 'tooLong' | 'charset' | 'duplicate'

export interface RejectedWord {
  input: string
  normalized: string
  reason: RejectReason
}

export interface PrecheckResult {
  valid: string[]        // normalized, deduped, connected component
  isolates: string[]     // valid words that share no letters with the main component
  rejected: RejectedWord[]
  countError: 'tooFew' | 'tooMany' | null
}
