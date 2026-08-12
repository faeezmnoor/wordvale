import type { PrecheckResult, RejectedWord } from './types'

export const MIN_WORDS = 2
export const MAX_WORDS = 20
export const MIN_LEN = 2
export const MAX_LEN = 15

export function normalizeWord(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function precheck(inputs: string[]): PrecheckResult {
  const rejected: RejectedWord[] = []
  const valid: string[] = []
  const seen = new Set<string>()

  for (const input of inputs) {
    const normalized = normalizeWord(input)
    if (normalized.length === 0) continue
    if (normalized.length < MIN_LEN) {
      rejected.push({ input, normalized, reason: 'tooShort' })
    } else if (normalized.length > MAX_LEN) {
      rejected.push({ input, normalized, reason: 'tooLong' })
    } else if (!/^[A-Z]+$/.test(normalized)) {
      rejected.push({ input, normalized, reason: 'charset' })
    } else if (seen.has(normalized)) {
      rejected.push({ input, normalized, reason: 'duplicate' })
    } else {
      seen.add(normalized)
      valid.push(normalized)
    }
  }

  // Connectivity: keep the largest letter-sharing component; the rest are isolates.
  const { component, isolates } = largestComponent(valid)

  // countError describes the RETURNED valid list (review: cross-file #2) — so
  // countError === null really does mean "generatable count".
  const countError =
    component.length < MIN_WORDS ? 'tooFew' : component.length > MAX_WORDS ? 'tooMany' : null
  return { valid: component, isolates, rejected, countError }
}

function shareLetter(a: string, b: string): boolean {
  for (const ch of a) if (b.includes(ch)) return true
  return false
}

function largestComponent(words: string[]): { component: string[]; isolates: string[] } {
  if (words.length <= 1) return { component: words, isolates: [] }
  const n = words.length
  const visited = new Array<boolean>(n).fill(false)
  const components: number[][] = []
  for (let i = 0; i < n; i++) {
    if (visited[i]) continue
    const comp: number[] = []
    const queue = [i]
    visited[i] = true
    while (queue.length) {
      const cur = queue.pop()!
      comp.push(cur)
      for (let j = 0; j < n; j++) {
        if (!visited[j] && shareLetter(words[cur], words[j])) {
          visited[j] = true
          queue.push(j)
        }
      }
    }
    components.push(comp)
  }
  components.sort((a, b) => b.length - a.length)
  const main = new Set(components[0])
  return {
    component: words.filter((_, i) => main.has(i)),
    isolates: words.filter((_, i) => !main.has(i)),
  }
}
