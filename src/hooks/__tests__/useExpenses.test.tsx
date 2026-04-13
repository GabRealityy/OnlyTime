import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useExpenses } from '../useExpenses'
import { RepoProvider } from '../../contexts/RepoContext'
import { createInMemoryRepo } from '../../test/renderWithRepo'
import type { Expense } from '../../lib/expenseTypes'

const MONTH = '2026-04'

function makeExpense(input: Partial<Expense> & { date: string; amountCHF: number }): Expense {
  return {
    id: input.id ?? `seed-${input.date}-${input.amountCHF}`,
    title: input.title ?? 'Test',
    category: input.category ?? 'Essen',
    createdAt: input.createdAt ?? 1,
    ...input,
  }
}

function wrapperFor(repo: ReturnType<typeof createInMemoryRepo>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <RepoProvider repo={repo}>{children}</RepoProvider>
  }
}

describe('useExpenses', () => {
  it('loads expenses for the given monthKey from the injected repo', () => {
    const repo = createInMemoryRepo([makeExpense({ date: '2026-04-10', amountCHF: 12.5, title: 'Kaffee' })])
    const { result } = renderHook(() => useExpenses(MONTH), { wrapper: wrapperFor(repo) })

    expect(result.current.expenses).toHaveLength(1)
    expect(result.current.expenses[0]).toMatchObject({ title: 'Kaffee', amountCHF: 12.5 })
  })

  it('mutate() triggers a reload after repo mutations', () => {
    const repo = createInMemoryRepo()
    const { result } = renderHook(() => useExpenses(MONTH), { wrapper: wrapperFor(repo) })
    expect(result.current.expenses).toHaveLength(0)

    repo.add(MONTH, { date: '2026-04-11', amountCHF: 5, title: 'Tram', category: 'Mobilität' })
    // Without mutate(), the memo keeps the stale snapshot.
    expect(result.current.expenses).toHaveLength(0)

    act(() => result.current.mutate())

    expect(result.current.expenses).toHaveLength(1)
    expect(result.current.expenses[0].title).toBe('Tram')
  })

  it('re-reads when monthKey changes', () => {
    const repo = createInMemoryRepo([
      makeExpense({ date: '2026-03-15', amountCHF: 1, title: 'March' }),
      makeExpense({ date: '2026-04-15', amountCHF: 2, title: 'April' }),
    ])

    const { result, rerender } = renderHook(
      ({ key }: { key: string }) => useExpenses(key),
      { wrapper: wrapperFor(repo), initialProps: { key: '2026-03' } },
    )

    expect(result.current.expenses[0].title).toBe('March')
    rerender({ key: '2026-04' })
    expect(result.current.expenses[0].title).toBe('April')
  })
})
