import { useCallback, useMemo, useState } from 'react'
import type { Expense } from '../lib/expenseTypes'
import { useExpenseRepo } from '../contexts/RepoContext'

export function useExpenses(monthKey: string): {
  expenses: Expense[]
  mutate: () => void
} {
  const repo = useExpenseRepo()
  const [token, setToken] = useState(0)

  const expenses = useMemo(
    () => repo.listMonth(monthKey),
    // token is an explicit invalidation trigger, not referenced in factory
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [monthKey, token, repo],
  )

  const mutate = useCallback(() => setToken((t) => t + 1), [])

  return { expenses, mutate }
}
