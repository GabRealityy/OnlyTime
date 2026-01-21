import type { Settings } from './settings'
import { effectiveNetMonthlyIncome, hourlyRateCHF } from './settings'
import { daysInMonth, monthKeyFromDate, pad2 } from './date'
import { loadExpensesForMonth } from './expenses'
import { toHours } from './money'

export type TimeRange = '1M' | '3M' | '6M' | 'YTD' | '1Y' | '3Y' | '5Y'

export const timeRangeButtons: Array<{ id: TimeRange; label: string }> = [
  { id: '1M', label: '1M' },
  { id: '3M', label: '3M' },
  { id: '6M', label: '6M' },
  { id: 'YTD', label: 'YTD' },
  { id: '1Y', label: '1J' },
  { id: '3Y', label: '3J' },
  { id: '5Y', label: '5J' },
]

export type MonthlyData = {
  monthKey: string
  label: string
  earned: number
  spent: number
  earnedHours: number
  spentHours: number
  balance: number
  balanceHours: number
  expenseCount: number
  categorySpending: Map<string, number>
}

export type TotalStats = {
  earned: number
  spent: number
  expenseCount: number
  earnedHours: number
  spentHours: number
  balance: number
  balanceHours: number
}

export type TopCategory = {
  category: string
  amount: number
  hours: number
}

export function getMonthKeys(range: TimeRange, now: Date = new Date()): string[] {
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-12
  const keys: string[] = []

  switch (range) {
    case '1M':
      keys.push(`${currentYear}-${pad2(currentMonth)}`)
      break

    case '3M':
      for (let i = 0; i < 3; i++) {
        const d = new Date(currentYear, currentMonth - 1 - i, 1)
        keys.push(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}`)
      }
      keys.reverse()
      break

    case '6M':
      for (let i = 0; i < 6; i++) {
        const d = new Date(currentYear, currentMonth - 1 - i, 1)
        keys.push(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}`)
      }
      keys.reverse()
      break

    case 'YTD':
      for (let m = 1; m <= currentMonth; m++) {
        keys.push(`${currentYear}-${pad2(m)}`)
      }
      break

    case '1Y':
      for (let i = 0; i < 12; i++) {
        const d = new Date(currentYear, currentMonth - 1 - i, 1)
        keys.push(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}`)
      }
      keys.reverse()
      break

    case '3Y':
      for (let i = 0; i < 36; i++) {
        const d = new Date(currentYear, currentMonth - 1 - i, 1)
        keys.push(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}`)
      }
      keys.reverse()
      break

    case '5Y':
      for (let i = 0; i < 60; i++) {
        const d = new Date(currentYear, currentMonth - 1 - i, 1)
        keys.push(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}`)
      }
      keys.reverse()
      break
  }

  return keys
}

function dateFromMonthKey(monthKey: string): Date {
  const [year, month] = monthKey.split('-')
  return new Date(Number(year), Number(month) - 1, 1)
}

export function monthLabelFromMonthKey(monthKey: string): string {
  const d = dateFromMonthKey(monthKey)
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
}

export function buildMonthlyData(settings: Settings, range: TimeRange, now: Date = new Date()): MonthlyData[] {
  const hourly = hourlyRateCHF(settings)
  const monthlyIncome = effectiveNetMonthlyIncome(settings)
  const nowMonthKey = monthKeyFromDate(now)

  const monthKeys = getMonthKeys(range, now)

  return monthKeys.map((monthKey) => {
    const expenses = loadExpensesForMonth(monthKey)
    const spent = expenses.reduce((sum, e) => sum + (Number.isFinite(e.amountCHF) ? e.amountCHF : 0), 0)

    const monthDate = dateFromMonthKey(monthKey)
    const dim = daysInMonth(monthDate)
    const isCurrentMonth = monthKey === nowMonthKey
    const earned = isCurrentMonth ? (monthlyIncome > 0 && dim > 0 ? (monthlyIncome / dim) * now.getDate() : 0) : monthlyIncome

    const categorySpending = new Map<string, number>()
    for (const exp of expenses) {
      categorySpending.set(exp.category, (categorySpending.get(exp.category) || 0) + exp.amountCHF)
    }

    return {
      monthKey,
      label: monthLabelFromMonthKey(monthKey),
      earned,
      spent,
      earnedHours: toHours(earned, hourly),
      spentHours: toHours(spent, hourly),
      balance: earned - spent,
      balanceHours: toHours(earned - spent, hourly),
      expenseCount: expenses.length,
      categorySpending,
    }
  })
}

export function summarizeMonthlyData(monthlyData: MonthlyData[], hourly: number): TotalStats {
  const total = monthlyData.reduce(
    (acc, month) => ({
      earned: acc.earned + month.earned,
      spent: acc.spent + month.spent,
      expenseCount: acc.expenseCount + month.expenseCount,
    }),
    { earned: 0, spent: 0, expenseCount: 0 },
  )

  return {
    ...total,
    earnedHours: toHours(total.earned, hourly),
    spentHours: toHours(total.spent, hourly),
    balance: total.earned - total.spent,
    balanceHours: toHours(total.earned - total.spent, hourly),
  }
}

export function topCategoryFromMonthlyData(monthlyData: MonthlyData[], hourly: number): TopCategory {
  const categoryTotals = new Map<string, number>()

  for (const month of monthlyData) {
    for (const [cat, amount] of month.categorySpending) {
      categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + amount)
    }
  }

  let maxCat = ''
  let maxAmount = 0
  for (const [cat, amount] of categoryTotals) {
    if (amount > maxAmount) {
      maxAmount = amount
      maxCat = cat
    }
  }

  return { category: maxCat, amount: maxAmount, hours: toHours(maxAmount, hourly) }
}
