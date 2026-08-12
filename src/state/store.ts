import { create } from 'zustand'
import type { GenResult, PrecheckResult } from '../engine'

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
  /** last precheck for the create screen (isolates surfaced in failure UX) */
  lastPre: PrecheckResult | null

  go: (screen: Screen) => void
  setCreateText: (text: string) => void
  setDraft: (draft: DraftPuzzle | null, pre?: PrecheckResult | null) => void
  addCoins: (n: number) => void
}

export const useApp = create<AppState>()((set) => ({
  screen: 'home',
  coins: 0,
  draft: null,
  createText: '',
  lastPre: null,

  go: (screen) => set({ screen }),
  setCreateText: (createText) => set({ createText }),
  setDraft: (draft, pre) => set({ draft, lastPre: pre ?? null }),
  addCoins: (n) => set((s) => ({ coins: s.coins + n })),
}))
