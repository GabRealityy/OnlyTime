// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useExpenses } from '../useExpenses'
import { addExpense } from '../../lib/expenses'
import { RepoProvider } from '../../contexts/RepoContext'
import type { ExpenseRepo } from '../../lib/expenseRepo'
import type { Expense } from '../../lib/expenseTypes'

const MONTH = '2026-04'

describe('useExpenses', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('loads expenses for the given monthKey (default localStorage repo)', () => {
    addExpense(MONTH, {
      date: '2026-04-10',
      amountCHF: 12.5,
      title: 'Kaffee',
      category: 'Essen',
    })

    const { result } = renderHook(() => useExpenses(MONTH))

    expect(result.current.expenses).toHaveLength(1)
    expect(result.current.expenses[0]).toMatchObject({
      title: 'Kaffee',
      amountCHF: 12.5,
    })
  })

  it('mutate() triggers a reload from storage', () => {
    const { result } = renderHook(() => useExpenses(MONTH))
    expect(result.current.expenses).toHaveLength(0)

    addExpense(MONTH, {
      date: '2026-04-11',
      amountCHF: 5,
      title: 'Tram',
      category: 'Transport',
    })

    expect(result.current.expenses).toHaveLength(0)

    act(() => {
      result.current.mutate()
    })

    expect(result.current.expenses).toHaveLength(1)
    expect(result.current.expenses[0].title).toBe('Tram')
  })

  it('re-reads when monthKey changes', () => {
    addExpense('2026-03', {
      date: '2026-03-15',
      amountCHF: 1,
      title: 'March',
      category: 'Essen',
    })
    addExpense('2026-04', {
      date: '2026-04-15',
      amountCHF: 2,
      title: 'April',
      category: 'Essen',
    })

    const { result, rerender } = renderHook(
      ({ key }: { key: string }) => useExpenses(key),
      { initialProps: { key: '2026-03' } },
    )

    expect(result.current.expenses[0].title).toBe('March')

    rerender({ key: '2026-04' })

    expect(result.current.expenses[0].title).toBe('April')
  })

  it('uses an injected in-memory repo via RepoProvider', () => {
    const store = new Map<string, Expense[]>()
    const memoryRepo: ExpenseRepo = {
      listMonth: (key) => store.get(key) ?? [],
      listRange: () => [],
      add: (key, exp) => {
        const list = store.get(key) ?? []
        const next: Expense = { ...exp, id: `mem-${list.length}`, createdAt: Date.now() }
        store.set(key, [next, ...list])
        return store.get(key)!
      },
      delete: (key, id) => {
        const list = (store.get(key) ?? []).filter((e) => e.id !== id)
        store.set(key, list)
        return list
      },
    }

    memoryRepo.add(MONTH, {
      date: '2026-04-20',
      amountCHF: 99,
      title: 'Memory',
      category: 'Essen',
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RepoProvider repo={memoryRepo}>{children}</RepoProvider>
    )

    const { result } = renderHook(() => useExpenses(MONTH), { wrapper })

    expect(result.current.expenses).toHaveLength(1)
    expect(result.current.expenses[0].title).toBe('Memory')
    expect(localStorage.length).toBe(0)
  })
})
