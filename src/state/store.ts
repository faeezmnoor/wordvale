import { create } from 'zustand'
import type { GenResult } from '../engine'

export type Screen = 'home' | 'create' | 'review' | 'play'

export interface DraftPuzzle {
  words: string[] // normalized valid words the result was generated from
  result: GenResult
  title: string
}

interface AppState {
  screen: Screen
  coins: number
  draft: DraftPuzzle | null
  /** create-screen text survives navigation (edit-words round trip) */
  createText: string

  go: (screen: Screen) => void
  setCreateText: (text: string) => void
  setDraft: (draft: DraftPuzzle | null) => void
  addCoins: (n: number) => void
}

export const useApp = create<AppState>()((set) => ({
  screen: 'home',
  coins: 0,
  draft: null,
  createText: '',

  go: (screen) => set({ screen }),
  setCreateText: (createText) => set({ createText }),
  setDraft: (draft) => set({ draft }),
  addCoins: (n) => set((s) => ({ coins: s.coins + n })),
}))
