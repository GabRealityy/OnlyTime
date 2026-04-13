import type { CustomCategory } from '../../lib/expenses'
import { formatCHF } from '../../lib/money'

export type BudgetWarning = {
  category: string
  spent: number
  budgetCHF: number
  budgetHours?: number
  percentage: number
}

export function BudgetWarnings(props: {
  warnings: BudgetWarning[]
  customCategories: CustomCategory[]
}) {
  if (props.warnings.length === 0) return null

  return (
    <div className="mt-4 space-y-3">
      {props.warnings.map((warning) => {
        const isExceeded = warning.percentage >= 100
        const categoryName = props.customCategories.find((c) => c.id === warning.category)?.name || warning.category
        return (
          <div
            key={warning.category}
            className={`rounded-2xl border p-4 transition-all ${isExceeded ? 'border-danger bg-danger-bg' : 'border-warning bg-warning-bg'}`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${isExceeded ? 'text-danger' : 'text-warning'}`}>
                {isExceeded ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className={`text-xs font-black uppercase tracking-widest ${isExceeded ? 'text-danger' : 'text-warning'}`}>
                  {categoryName} {isExceeded ? 'Über Limit' : 'Warnung'}
                </div>
                <div className={`mt-1 text-sm font-bold ${isExceeded ? 'text-danger-text' : 'text-warning-text'}`}>
                  {formatCHF(warning.spent)} / {formatCHF(warning.budgetCHF)}
                  <span className="ml-2">({warning.percentage.toFixed(0)}%)</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className={`h-full transition-all duration-700 ease-out ${isExceeded ? 'bg-danger' : 'bg-warning'}`}
                    style={{ width: `${Math.min(100, warning.percentage)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
