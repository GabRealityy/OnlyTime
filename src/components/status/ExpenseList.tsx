import { formatCHF, formatHoursMinutes, toHours } from '../../lib/money'
import type { Expense } from '../../lib/expenses'
import { CategoryFilterBar } from './CategoryFilterBar'

type SortOrder = 'asc' | 'desc'

export function ExpenseList(props: {
  heading: string
  expenses: Expense[]
  sortOrder: SortOrder
  onToggleSort: () => void
  availableCategories: string[]
  selectedCategory: string
  onSelectCategory: (cat: string) => void
  getCategoryInfo: (catId: string) => { name: string; emoji?: string }
  hourly: number
  onDelete: (id: string, title: string) => void
}) {
  const {
    heading,
    expenses,
    sortOrder,
    onToggleSort,
    availableCategories,
    selectedCategory,
    onSelectCategory,
    getCategoryInfo,
    hourly,
    onDelete,
  } = props

  const total = expenses.reduce((sum, e) => sum + e.amountCHF, 0)

  return (
    <div className="ot-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{heading}</div>
          <div className="mt-1 text-xs text-tertiary">{expenses.length} item(s)</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-tertiary">Total</div>
            <div className="font-mono text-sm">{formatCHF(total)}</div>
          </div>
          <button
            type="button"
            onClick={onToggleSort}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-secondary hover:text-primary transition-colors"
            title={sortOrder === 'desc' ? 'Neueste zuerst' : 'Älteste zuerst'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {sortOrder === 'desc' ? (
                <path d="m3 16 4 4 4-4M7 20V4M13 18h8M13 12h8M13 6h8" />
              ) : (
                <path d="m3 8 4-4 4 4M7 4v16M13 18h8M13 12h8M13 6h8" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <CategoryFilterBar
        available={availableCategories}
        selected={selectedCategory}
        getCategoryInfo={getCategoryInfo}
        onSelect={onSelectCategory}
      />

      <div className="mt-4 space-y-2">
        {expenses.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-3 text-sm text-secondary">
            {selectedCategory === 'all'
              ? 'No expenses recorded in this period.'
              : `No expenses found in category "${selectedCategory}" for this period.`}
          </div>
        )}

        {expenses.map((e) => (
          <ExpenseRow key={e.id} expense={e} hourly={hourly} getCategoryInfo={getCategoryInfo} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}

function ExpenseRow(props: {
  expense: Expense
  hourly: number
  getCategoryInfo: (catId: string) => { name: string; emoji?: string }
  onDelete: (id: string, title: string) => void
}) {
  const { expense: e, hourly, getCategoryInfo, onDelete } = props
  const expenseHours = toHours(e.amountCHF, hourly)
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="truncate text-sm font-medium">{e.title?.trim() ? e.title : 'Untitled'}</div>
          <div className="shrink-0 rounded-md border border-border bg-input px-2 py-0.5 text-xs text-secondary">
            {getCategoryInfo(e.category).name}
          </div>
        </div>
        <div className="mt-1 text-xs text-secondary">{e.date}</div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="text-right">
          <div className="font-mono text-sm">{formatCHF(e.amountCHF)}</div>
          {hourly > 0 && <div className="text-xs text-secondary">{formatHoursMinutes(expenseHours)}</div>}
        </div>
        <button type="button" className="ot-btn ot-btn-danger" onClick={() => onDelete(e.id, e.title)}>
          Delete
        </button>
      </div>
    </div>
  )
}
