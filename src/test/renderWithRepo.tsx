import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'
import { RepoProvider } from '../contexts/RepoContext'
import type { ExpenseRepo } from '../lib/expenseRepo'
import type { Expense } from '../lib/expenseTypes'

export function createInMemoryRepo(seed: Expense[] = []): ExpenseRepo & {
  dump: () => Expense[]
} {
  const byMonth = new Map<string, Expense[]>()
  for (const exp of seed) {
    const key = exp.date.slice(0, 7)
    const list = byMonth.get(key) ?? []
    byMonth.set(key, [exp, ...list])
  }

  let idCounter = seed.length

  return {
    listMonth: (monthKey) =>
      [...(byMonth.get(monthKey) ?? [])].sort(
        (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt,
      ),
    listRange: (start, end) => {
      const all: Expense[] = []
      for (const [key, list] of byMonth.entries()) {
        if (key >= start && key <= end) all.push(...list)
      }
      return all.sort(
        (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt,
      )
    },
    add: (monthKey, input) => {
      idCounter++
      const next: Expense = {
        ...input,
        id: `mem-${idCounter}`,
        createdAt: Date.now(),
      }
      const list = byMonth.get(monthKey) ?? []
      const updated = [next, ...list]
      byMonth.set(monthKey, updated)
      return updated
    },
    delete: (monthKey, id) => {
      const list = (byMonth.get(monthKey) ?? []).filter((e) => e.id !== id)
      byMonth.set(monthKey, list)
      return list
    },
    dump: () => {
      const all: Expense[] = []
      for (const list of byMonth.values()) all.push(...list)
      return all
    },
  }
}

export function renderWithRepo(
  ui: ReactElement,
  options: { seed?: Expense[]; repo?: ExpenseRepo } & Omit<RenderOptions, 'wrapper'> = {},
) {
  const { seed, repo: externalRepo, ...renderOptions } = options
  const repo = externalRepo ?? createInMemoryRepo(seed)
  const result = render(
    <RepoProvider repo={repo}>{ui}</RepoProvider>,
    renderOptions,
  )
  return { repo, ...result }
}
