// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useExpenses } from '../useExpenses'
import { addExpense } from '../../lib/expenses'

const MONTH = '2026-04'

describe('useExpenses', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('loads expenses for the given monthKey', () => {
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

    // Without mutate(), the memo keeps the stale empty snapshot.
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
})
