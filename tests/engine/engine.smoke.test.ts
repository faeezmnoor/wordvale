import { describe, expect, test } from 'bun:test'
import { ENGINE_VERSION } from '../../src/engine'

describe('engine harness', () => {
  test('engine module loads without browser APIs', () => {
    expect(ENGINE_VERSION).toBe('1.0.0')
    expect(typeof document).toBe('undefined')
  })
})

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

describe('engine purity (structural guard)', () => {
  test('no browser APIs, Math.random, Date.now, or ui/state imports in src/engine', () => {
    const dir = join(import.meta.dir, '../../src/engine')
    const banned = [/Math\.random/, /Date\.now/, /\bdocument\./, /\bwindow\./, /localStorage/, /from '\.\.\/(ui|state)/]
    for (const file of readdirSync(dir)) {
      const src = readFileSync(join(dir, file), 'utf8')
        .split('\n')
        .filter((l) => !l.trim().startsWith('//') && !l.trim().startsWith('*'))
        .join('\n')
      for (const re of banned) {
        if (re.test(src)) throw new Error(`${file} violates engine purity: ${re}`)
      }
    }
  })
})
