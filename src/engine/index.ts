// WordVale puzzle engine — PURE module.
// Hard rules: no React/DOM/browser APIs, no Math.random/Date.now — seeded RNG only.

export const ENGINE_VERSION = '1.0.0'

export * from './types'
export { mulberry32 } from './rng'
export { precheck, normalizeWord, MIN_WORDS, MAX_WORDS, MIN_LEN, MAX_LEN } from './precheck'
export { generate, type GenerateOptions } from './generate'
export { cellsOf, boundsOf, extendBounds, computeMetrics, qualityPhrase, type QualityPhrase } from './metrics'
export * from './config'
