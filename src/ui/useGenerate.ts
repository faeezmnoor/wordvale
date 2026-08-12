import { useCallback, useEffect, useRef, useState } from 'react'
import type { GenResult } from '../engine'

/** Wraps the generation worker: request(words, seed) → pending → result. */
export function useGenerate(onResult: (result: GenResult) => void) {
  const workerRef = useRef<Worker | null>(null)
  const [pending, setPending] = useState(false)
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult

  useEffect(() => {
    const worker = new Worker(new URL('../worker/gen.worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = (e: MessageEvent<{ result: GenResult }>) => {
      setPending(false)
      onResultRef.current(e.data.result)
    }
    workerRef.current = worker
    return () => worker.terminate()
  }, [])

  const request = useCallback((words: string[], seed: number) => {
    setPending(true)
    workerRef.current?.postMessage({ words, seed })
  }, [])

  return { request, pending }
}
