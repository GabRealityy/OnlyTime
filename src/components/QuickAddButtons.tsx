/*
  Quick-Add Component: Häufige Ausgaben mit einem Klick erfassen
*/

import type { QuickAddPreset } from '../lib/expenses'
import { formatCHF, formatHoursMinutes, toHours } from '../lib/money'

export function QuickAddButtons(props: {
  presets: QuickAddPreset[]
  hourlyRate: number
  onAddExpense: (preset: QuickAddPreset) => void
}) {
  const { presets, hourlyRate, onAddExpense } = props

  if (presets.length === 0) return null

  return (
    <div className="ot-card !rounded-[1.5rem] !p-4">
      <div className="mb-4 text-xs font-black uppercase tracking-widest text-zinc-400">Schnellerfassung</div>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {presets.map((preset) => {
          const timeHours = toHours(preset.amountCHF, hourlyRate)
          return (
            <button
              key={preset.id}
              type="button"
              className="ot-btn !justify-start !px-4 !py-3 !rounded-2xl border-zinc-100 bg-zinc-50 hover:border-zinc-950 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-50 active:scale-95 transition-transform touch-manipulation"
              onClick={() => onAddExpense(preset)}
            >
              {preset.emoji && <span className="mr-3 text-xl">{preset.emoji}</span>}
              <div className="text-left overflow-hidden">
                <div className="truncate text-sm font-bold leading-tight">{preset.title}</div>
                <div className="mt-0.5 text-[10px] font-bold text-zinc-400">
                  {formatCHF(preset.amountCHF)}
                  {hourlyRate > 0 && (
                    <span className="ml-1 opacity-50">· {formatHoursMinutes(timeHours)}</span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
