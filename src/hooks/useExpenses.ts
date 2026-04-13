import { useCallback, useMemo, useState } from 'react'
import { loadExpensesForMonth, type Expense } from '../lib/expenses'

export function useExpenses(monthKey: string): {
  expenses: Expense[]
  mutate: () => void
} {
  const [token, setToken] = useState(0)

  const expenses = useMemo(
    () => loadExpensesForMonth(monthKey),
    // token is an explicit invalidation trigger, not referenced in factory
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [monthKey, token],
  )

  const mutate = useCallback(() => setToken((t) => t + 1), [])

  return { expenses, mutate }
}
