// Generation runs off the main thread with a wall-clock budget (tech spec §Worker protocol).
import { generate } from '../engine'

export interface GenRequest {
  words: string[]
  seed: number
}

self.onmessage = (e: MessageEvent<GenRequest>) => {
  const { words, seed } = e.data
  const result = generate(words, seed, { maxMs: 2000, now: () => performance.now() })
  self.postMessage({ result })
}
