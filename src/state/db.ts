// Versioned IndexedDB wrapper (tech spec §Storage). Small and hand-rolled: one store,
// no dependency. All calls resolve safely if IndexedDB is unavailable (private mode).

import type { Placement } from '../engine'

export interface PuzzleRecord {
  id: string
  title: string
  words: string[]
  seed: number
  placements: Placement[]
  fill: Record<string, string>
  solvedWords: string[]
  status: 'in-progress' | 'solved'
  coinsEarned: number
  createdAt: number
  updatedAt: number
}

const DB_NAME = 'wordvale'
const DB_VERSION = 1
const STORE = 'puzzles'

let dbPromise: Promise<IDBDatabase | null> | null = null

function open(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') return resolve(null)
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' })
        store.createIndex('updatedAt', 'updatedAt')
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => resolve(null)
  })
  return dbPromise
}

async function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | null> {
  const db = await open()
  if (!db) return null
  return new Promise((resolve) => {
    const transaction = db.transaction(STORE, mode)
    const req = run(transaction.objectStore(STORE))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => resolve(null)
  })
}

export function newPuzzleId(now: number, rand: number): string {
  return `${now.toString(36)}${Math.floor(rand * 1e6).toString(36)}`
}

export async function savePuzzle(record: PuzzleRecord): Promise<void> {
  // status is always derived, never trusted from the caller
  const status: PuzzleRecord['status'] =
    record.solvedWords.length === record.placements.length ? 'solved' : 'in-progress'
  await tx('readwrite', (s) => s.put({ ...record, status }))
}

export async function listPuzzles(): Promise<PuzzleRecord[]> {
  const all = await tx<PuzzleRecord[]>('readonly', (s) => s.getAll())
  return (all ?? []).sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function getPuzzle(id: string): Promise<PuzzleRecord | null> {
  return (await tx<PuzzleRecord>('readonly', (s) => s.get(id))) ?? null
}

export async function deletePuzzle(id: string): Promise<void> {
  await tx('readwrite', (s) => s.delete(id))
}
