/*
  localStorage helpers (safe JSON parsing, versioned keys).
  No backend, no database.
*/

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue }

const PREFIX = 'onlytime:v1'

export const storageKeys = {
  settings: `${PREFIX}:settings`,
  expensesByMonth: (monthKey: string) => `${PREFIX}:expenses:${monthKey}`,
}

export function safeJsonParse<T>(raw: string | null): T | undefined {
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as T
  } catch {
    return undefined
  }
}

export function loadFromStorage<T>(key: string): T | undefined {
  return safeJsonParse<T>(localStorage.getItem(key))
}

export function saveToStorage<T extends JsonValue>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function removeFromStorage(key: string): void {
  localStorage.removeItem(key)
}

export function clearAllData(): void {
  const keys = Object.keys(localStorage)
  const prefix = 'onlytime:'
  for (const key of keys) {
    if (key.startsWith(prefix)) {
      localStorage.removeItem(key)
    }
  }
}
