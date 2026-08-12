import { describe, expect, test } from 'bun:test'
import { ENGINE_VERSION } from '../../src/engine'

describe('engine harness', () => {
  test('engine module loads without browser APIs', () => {
    expect(ENGINE_VERSION).toBe('0.0.0')
    expect(typeof document).toBe('undefined')
  })
})
