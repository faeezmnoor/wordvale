// Independent legality checker for tests — deliberately NOT reusing engine internals.
import type { Placement } from '../../src/engine'

export function validateLegal(placements: Placement[], inputWords: string[], unplaced: string[]) {
  const errors: string[] = []
  const cells = new Map<string, { letter: string; dirs: string[] }>()

  for (const p of placements) {
    const dr = p.dir === 'down' ? 1 : 0
    const dc = p.dir === 'across' ? 1 : 0
    for (let i = 0; i < p.word.length; i++) {
      const k = `${p.row + i * dr},${p.col + i * dc}`
      const existing = cells.get(k)
      if (existing) {
        if (existing.letter !== p.word[i]) errors.push(`letter conflict at ${k}`)
        if (existing.dirs.includes(p.dir)) errors.push(`same-direction overlap at ${k}`)
        existing.dirs.push(p.dir)
      } else {
        cells.set(k, { letter: p.word[i], dirs: [p.dir] })
      }
    }
  }

  // adjacency: two neighboring filled cells must share a word (i.e. be consecutive cells of
  // some placement) — otherwise it's illegal parallel contact.
  const consecutive = new Set<string>()
  for (const p of placements) {
    const dr = p.dir === 'down' ? 1 : 0
    const dc = p.dir === 'across' ? 1 : 0
    for (let i = 0; i < p.word.length - 1; i++) {
      const a = `${p.row + i * dr},${p.col + i * dc}`
      const b = `${p.row + (i + 1) * dr},${p.col + (i + 1) * dc}`
      consecutive.add(`${a}|${b}`)
      consecutive.add(`${b}|${a}`)
    }
  }
  for (const k of cells.keys()) {
    const [r, c] = k.split(',').map(Number)
    for (const [nr, nc] of [
      [r + 1, c],
      [r, c + 1],
    ]) {
      const nk = `${nr},${nc}`
      if (cells.has(nk) && !consecutive.has(`${k}|${nk}`)) errors.push(`illegal contact ${k}~${nk}`)
    }
  }

  // connectivity of placed words via shared cells
  if (placements.length > 1) {
    const adj = new Map<number, Set<number>>()
    placements.forEach((_, i) => adj.set(i, new Set()))
    const cellOwners = new Map<string, number[]>()
    placements.forEach((p, i) => {
      const dr = p.dir === 'down' ? 1 : 0
      const dc = p.dir === 'across' ? 1 : 0
      for (let j = 0; j < p.word.length; j++) {
        const k = `${p.row + j * dr},${p.col + j * dc}`
        const owners = cellOwners.get(k) ?? []
        owners.push(i)
        cellOwners.set(k, owners)
      }
    })
    for (const owners of cellOwners.values())
      for (const a of owners) for (const b of owners) if (a !== b) adj.get(a)!.add(b)
    const seen = new Set<number>([0])
    const queue = [0]
    while (queue.length) for (const nb of adj.get(queue.pop()!)!) if (!seen.has(nb)) { seen.add(nb); queue.push(nb) }
    if (seen.size !== placements.length) errors.push('disconnected placements')
  }

  // bounding box normalized + within limits
  let minR = Infinity, minC = Infinity, maxR = -Infinity, maxC = -Infinity
  for (const k of cells.keys()) {
    const [r, c] = k.split(',').map(Number)
    minR = Math.min(minR, r); maxR = Math.max(maxR, r)
    minC = Math.min(minC, c); maxC = Math.max(maxC, c)
  }
  if (placements.length > 0) {
    if (minR !== 0 || minC !== 0) errors.push('not bounding-box normalized')
    if (maxR - minR + 1 > 21 || maxC - minC + 1 > 21) errors.push('grid exceeds 21x21')
  }

  // conservation: placed + unplaced == input set
  const out = [...placements.map((p) => p.word), ...unplaced].sort()
  const inp = [...inputWords].sort()
  if (JSON.stringify(out) !== JSON.stringify(inp)) errors.push('placed+unplaced != input')

  return errors
}
