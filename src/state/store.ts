import { create } from 'zustand'
import type { GenResult, Placement } from '../engine'
import { getSettings, updateSettings } from './settings'

export type Screen = 'home' | 'create' | 'review' | 'play'

export interface DraftPuzzle {
  words: string[] // normalized valid words the result was generated from
  result: GenResult
  title: string
  /** set when resuming a saved puzzle */
  id?: string
  fill?: Record<string, string>
  solvedWords?: string[]
}

const WALLET_KEY = 'wordvale:wallet'

function loadWallet(): number {
  try {
    return Number(localStorage.getItem(WALLET_KEY)) || 0
  } catch {
    return 0
  }
}

interface AppState {
  screen: Screen
  coins: number
  draft: DraftPuzzle | null
  /** create-screen text survives navigation (edit-words round trip) */
  createText: string

  sound: boolean
  go: (screen: Screen) => void
  setCreateText: (text: string) => void
  setDraft: (draft: DraftPuzzle | null) => void
  addCoins: (n: number) => void
  toggleSound: () => void
}

export const useApp = create<AppState>()((set) => ({
  screen: 'home',
  coins: loadWallet(),
  sound: getSettings().sound,
  draft: null,
  createText: '',

  go: (screen) => set({ screen }),
  setCreateText: (createText) => set({ createText }),
  setDraft: (draft) => set({ draft }),
  addCoins: (n) =>
    set((s) => {
      const coins = s.coins + n
      try {
        localStorage.setItem(WALLET_KEY, String(coins))
      } catch {
        /* wallet just won't persist */
      }
      return { coins }
    }),
  toggleSound: () =>
    set((s) => {
      const sound = !s.sound
      updateSettings({ sound })
      return { sound }
    }),
}))

export type { Placement }
