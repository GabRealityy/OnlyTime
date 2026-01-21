/*
  Status screen (default).

  Core question:
  "Am I ahead or behind the money I have earned so far this month?"

  Earned so far (linear accrual across days):
    earned = (monthlyIncome / daysInMonth) * today
*/

import { useEffect, useMemo, useState } from 'react'
import type { Settings } from '../lib/settings'
import { hourlyRateCHF } from '../lib/settings'
import { dayOfMonth, daysInMonth, isoDateLocal, monthKeyFromDate, monthLabel } from '../lib/date'
import { formatCHF, formatHoursMinutes } from '../lib/money'
import { addExpense, deleteExpense, expenseCategories, loadExpensesForMonth, type Expense, type ExpenseCategory } from '../lib/expenses'
import { LineChart, type DailyPoint } from '../components/LineChart'

function sumSpent(expenses: Expense[]): number {
  return expenses.reduce((acc, e) => acc + (Number.isFinite(e.amountCHF) ? e.amountCHF : 0), 0)
}

function toDay(isoDate: string): number {
  // isoDate expected: YYYY-MM-DD
  const d = Number(isoDate.slice(8, 10))
  return Number.isFinite(d) ? d : 1
}

export function StatusScreen(props: { settings: Settings }) {
  const now = new Date()
  const monthKey = monthKeyFromDate(now)
  const today = dayOfMonth(now)
  const dim = daysInMonth(now)
  const label = monthLabel(now)

  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpensesForMonth(monthKey))

  useEffect(() => {
    setExpenses(loadExpensesForMonth(monthKey))
  }, [monthKey])

  // Expense form state
  const [date, setDate] = useState<string>(isoDateLocal(now))
  const [amount, setAmount] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [category, setCategory] = useState<ExpenseCategory>('Food')

  const hourly = hourlyRateCHF(props.settings)

  const earned = useMemo(() => {
    const monthly = props.settings.netMonthlyIncomeCHF
    if (monthly <= 0) return 0
    return (monthly / dim) * today
  }, [props.settings.netMonthlyIncomeCHF, dim, today])

  const spent = useMemo(() => sumSpent(expenses), [expenses])

  const balanceCHF = earned - spent
  const balanceHours = hourly > 0 ? balanceCHF / hourly : 0

  const isAhead = balanceCHF >= 0

  const dailyPoints: DailyPoint[] = useMemo(() => {
    const monthly = props.settings.netMonthlyIncomeCHF
    const earnedPerDay = dim > 0 ? monthly / dim : 0

    // Pre-sum expenses by day.
    const spentByDay = new Map<number, number>()
    for (const e of expenses) {
      const d = toDay(e.date)
      spentByDay.set(d, (spentByDay.get(d) ?? 0) + e.amountCHF)
    }

    let spentCum = 0
    const pts: DailyPoint[] = []
    for (let d = 1; d <= dim; d++) {
      spentCum += spentByDay.get(d) ?? 0
      pts.push({
        day: d,
        earned: earnedPerDay * d,
        spent: spentCum,
      })
    }
    return pts
  }, [props.settings.netMonthlyIncomeCHF, dim, expenses])

  const onAddExpense = () => {
    const parsedAmount = Number(amount.replace(',', '.'))
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return

    const nextMonthKey = date.slice(0, 7)
    if (nextMonthKey !== monthKey) {
      // MVP: only manage the current month.
      return
    }

    const updated = addExpense(monthKey, {
      date,
      amountCHF: parsedAmount,
      title: title.trim(),
      category,
    })

    setExpenses(updated)
    setAmount('')
    setTitle('')
  }

  const onDeleteExpense = (id: string) => {
    const updated = deleteExpense(monthKey, id)
    setExpenses(updated)
  }

  return (
    <div className="space-y-4">
      <div className="ot-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Status</div>
            <div className="mt-1 text-sm text-zinc-400">
              {label} · {now.toLocaleDateString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-500">Today</div>
            <div className="font-mono text-sm">
              day {today}/{dim}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
            <div className="text-xs text-zinc-500">Earned so far</div>
            <div className="mt-1 text-xl font-semibold">{formatCHF(earned)}</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
            <div className="text-xs text-zinc-500">Spent this month</div>
            <div className="mt-1 text-xl font-semibold">{formatCHF(spent)}</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
            <div className="text-xs text-zinc-500">Balance</div>
            <div className="mt-1 flex items-baseline gap-2">
              <div className="text-2xl font-semibold">
                {isAhead ? '🟢' : '🔴'} {formatCHF(balanceCHF)}
              </div>
            </div>
            <div className="mt-1 text-sm text-zinc-400">
              {hourly > 0 ? `${formatHoursMinutes(balanceHours)} at your hourly rate` : 'Set hourly rate in Settings'}
            </div>
          </div>
        </div>
      </div>

      <LineChart points={dailyPoints} />

      <div className="ot-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Add expense</div>
            <div className="mt-1 text-xs text-zinc-500">Current month only.</div>
          </div>
          <div className="text-xs text-zinc-500">Stored in localStorage</div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="exp-date">Date</label>
              <input id="exp-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label htmlFor="exp-amount">Amount (CHF)</label>
              <input
                id="exp-amount"
                inputMode="decimal"
                placeholder="e.g. 12.50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="exp-title">Title</label>
            <input
              id="exp-title"
              placeholder="e.g. groceries"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="exp-category">Category</label>
            <select
              id="exp-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            >
              {expenseCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button type="button" className="ot-btn ot-btn-primary" onClick={onAddExpense}>
              Add
            </button>
            <button
              type="button"
              className="ot-btn"
              onClick={() => {
                setDate(isoDateLocal(new Date()))
                setAmount('')
                setTitle('')
                setCategory('Food')
              }}
            >
              Clear
            </button>
          </div>

          {date.slice(0, 7) !== monthKey && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 text-sm text-zinc-400">
              Only current-month expenses are shown in this MVP.
            </div>
          )}
        </div>
      </div>

      <div className="ot-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Expenses ({label})</div>
            <div className="mt-1 text-xs text-zinc-500">{expenses.length} item(s)</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-500">Total</div>
            <div className="font-mono text-sm">{formatCHF(spent)}</div>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {expenses.length === 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 text-sm text-zinc-400">
              No expenses recorded this month.
            </div>
          )}

          {expenses.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="truncate text-sm font-medium">
                    {e.title?.trim() ? e.title : 'Untitled'}
                  </div>
                  <div className="shrink-0 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-xs text-zinc-400">
                    {e.category}
                  </div>
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  {e.date}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <div className="font-mono text-sm">{formatCHF(e.amountCHF)}</div>
                <button type="button" className="ot-btn ot-btn-danger" onClick={() => onDeleteExpense(e.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
