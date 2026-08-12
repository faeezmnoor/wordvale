import { describe, expect, test } from 'bun:test'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { generate, precheck } from '../../src/engine'

// Build-time guarantee: every bundled list must produce a full puzzle. A pack that can't
// generate would hand the player a failure screen from a button labelled "Surprise me".
const DIR = join(import.meta.dir, '../../src/data/packs')

describe('themed packs', () => {
  const files = readdirSync(DIR).filter((f) => f.endsWith('.json'))

  test('8 packs, each with >= 3 lists', () => {
    expect(files.length).toBe(8)
    for (const f of files) {
      const pack = JSON.parse(readFileSync(join(DIR, f), 'utf8'))
      expect(pack.lists.length).toBeGreaterThanOrEqual(3)
      expect(pack.name).toBeTruthy()
      expect(pack.sprite).toBeTruthy()
    }
  })

  test('every list is clean and fully generatable within 3 seeds', () => {
    for (const f of files) {
      const pack = JSON.parse(readFileSync(join(DIR, f), 'utf8'))
      pack.lists.forEach((list: string[], i: number) => {
        const pre = precheck(list)
        if (pre.countError || pre.isolates.length || pre.rejected.length) {
          throw new Error(`${pack.slug}[${i}]: ${pre.countError ?? ''} isolates=${pre.isolates} rejected=${pre.rejected.map((r) => r.normalized)}`)
        }
        const ok = [1, 2, 3].some((seed) => generate(pre.valid, seed).status === 'complete')
        if (!ok) {
          const r = generate(pre.valid, 1)
          throw new Error(`${pack.slug}[${i}] not generatable: ${r.status}, unplaced ${r.unplaced}`)
        }
      })
    }
  })
})
