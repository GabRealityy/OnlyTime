import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { StatusScreen } from '../StatusScreen'
import { defaultSettings, type Settings } from '../../lib/settings'
import type { Expense } from '../../lib/expenseTypes'
import { renderWithRepo } from '../../test/renderWithRepo'

function makeSettings(overrides: Partial<Settings> = {}): Settings {
  return {
    ...defaultSettings,
    netMonthlyIncomeCHF: 5000,
    weeklyWorkingHours: 40,
    weeksPerMonth: 4,
    ...overrides,
  }
}

function makeExpense(partial: Partial<Expense> & { date: string; amountCHF: number }): Expense {
  return {
    id: partial.id ?? `seed-${partial.date}-${partial.amountCHF}`,
    title: partial.title ?? 'Test',
    category: partial.category ?? 'Essen',
    createdAt: partial.createdAt ?? 1,
    ...partial,
  }
}

describe('StatusScreen', () => {
  it('renders seeded expenses from the repo with injected now', () => {
    const now = new Date('2026-04-15T12:00:00')
    const seed: Expense[] = [
      makeExpense({ date: '2026-04-01', amountCHF: 40, title: 'Brunch' }),
      makeExpense({ date: '2026-04-10', amountCHF: 60, title: 'Tanken' }),
    ]

    renderWithRepo(
      <StatusScreen settings={makeSettings()} onChange={() => {}} now={now} />,
      { seed },
    )

    // Both expenses visible
    expect(screen.getByText('Brunch')).toBeInTheDocument()
    expect(screen.getByText('Tanken')).toBeInTheDocument()

    // Day indicator for injected now (2026-04-15, April has 30 days)
    expect(screen.getByText('15/30')).toBeInTheDocument()

    // Expense list count hint
    expect(screen.getByText('2 item(s)')).toBeInTheDocument()
  })

  it('renders status frame without crashing when repo is empty', () => {
    const now = new Date('2026-04-15T12:00:00')
    renderWithRepo(
      <StatusScreen
        settings={makeSettings({ netMonthlyIncomeCHF: 3200 })}
        onChange={() => {}}
        now={now}
      />,
      { seed: [] },
    )

    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('0 item(s)')).toBeInTheDocument()
  })
})
