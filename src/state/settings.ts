// localStorage-backed settings (tech spec §Storage). Sound defaults ON per owner directive.

export interface Settings {
  sound: boolean
  sfxVol: number
  ambVol: number
}

const KEY = 'wordvale:settings'
const DEFAULTS: Settings = { sound: true, sfxVol: 0.6, ambVol: 0.3 }

let cache: Settings | null = null

export function getSettings(): Settings {
  if (cache) return cache
  let loaded: Settings
  try {
    const raw = localStorage.getItem(KEY)
    loaded = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
  } catch {
    loaded = { ...DEFAULTS }
  }
  cache = loaded
  return loaded
}

export function updateSettings(patch: Partial<Settings>): Settings {
  const next = { ...getSettings(), ...patch }
  cache = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* private mode etc. — settings just don't persist */
  }
  return next
}
