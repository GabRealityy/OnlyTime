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
    <div className="ot-card">
      <div className="mb-3 text-sm font-semibold">Schnellerfassung</div>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const timeHours = toHours(preset.amountCHF, hourlyRate)
          return (
            <button
              key={preset.id}
              type="button"
              className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm transition-colors hover:border-zinc-700 hover:bg-zinc-900/60"
              onClick={() => onAddExpense(preset)}
            >
              {preset.emoji && <span className="text-lg">{preset.emoji}</span>}
              <div className="text-left">
                <div className="font-medium">{preset.title}</div>
                <div className="text-xs text-zinc-500">
                  {formatCHF(preset.amountCHF)}
                  {hourlyRate > 0 && (
                    <span className="ml-1">· {formatHoursMinutes(timeHours)}</span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
      <div className="mt-2 text-xs text-zinc-500">
        Tipp: Konfiguriere diese Buttons in Einstellungen → Schnellerfassung
      </div>
    </div>
  )
}
