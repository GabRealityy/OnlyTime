/*
  Minimal localStorage-backed state hook.
  - Loads once on mount
  - Persists on set
  - Keeps a single source of truth per tab
*/

import { useCallback, useEffect, useState } from 'react'

export function useLocalStorageState<T>(
  key: string,
  load: () => T,
  save: (value: T) => void,
): [T, (next: T) => void] {
  const [value, setValue] = useState<T>(() => load())

  useEffect(() => {
    // Best-effort cross-tab sync.
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return
      setValue(load())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key, load])

  const setAndPersist = useCallback(
    (next: T) => {
      setValue(next)
      save(next)
    },
    [save],
  )

  return [value, setAndPersist]
}
