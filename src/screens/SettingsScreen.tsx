/*
  Settings screen.
  Stores inputs in localStorage and shows derived values.
*/

import { monthlyWorkingHours, hourlyRateCHF, type Settings } from '../lib/settings'
import { formatCHF } from '../lib/money'

export function SettingsScreen(props: {
  settings: Settings
  onChange: (next: Settings) => void
}) {
  const { settings, onChange } = props

  const monthlyHours = monthlyWorkingHours(settings)
  const hourlyRate = hourlyRateCHF(settings)

  return (
    <div className="space-y-4">
      <div className="ot-card">
        <div className="text-lg font-semibold">Settings</div>
        <div className="mt-1 text-sm text-zinc-400">
          Keep it simple. These numbers drive everything.
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <div>
            <label htmlFor="netMonthlyIncome">Net monthly income (CHF)</label>
            <input
              id="netMonthlyIncome"
              inputMode="decimal"
              placeholder="e.g. 5500"
              value={String(settings.netMonthlyIncomeCHF)}
              onChange={(e) =>
                onChange({
                  ...settings,
                  netMonthlyIncomeCHF: Number(e.target.value.replace(',', '.')) || 0,
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="weeklyHours">Weekly working hours</label>
              <input
                id="weeklyHours"
                inputMode="decimal"
                placeholder="e.g. 40"
                value={String(settings.weeklyWorkingHours)}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    weeklyWorkingHours: Number(e.target.value.replace(',', '.')) || 0,
                  })
                }
              />
            </div>
            <div>
              <label htmlFor="weeksPerMonth">Weeks per month</label>
              <input
                id="weeksPerMonth"
                inputMode="decimal"
                placeholder="4.33"
                value={String(settings.weeksPerMonth)}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    weeksPerMonth: Number(e.target.value.replace(',', '.')) || 0,
                  })
                }
              />
              <div className="mt-1 text-xs text-zinc-500">Default: 4.33</div>
            </div>
          </div>
        </div>
      </div>

      <div className="ot-card">
        <div className="text-sm font-semibold">Derived</div>
        <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="text-zinc-400">Monthly working hours</div>
            <div className="font-mono">{monthlyHours.toFixed(2)} h</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-zinc-400">Hourly rate</div>
            <div className="font-mono">{hourlyRate > 0 ? `${formatCHF(hourlyRate)}/h` : '—'}</div>
          </div>
        </div>

        {hourlyRate <= 0 && (
          <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 text-sm text-zinc-400">
            Set income and working hours to unlock time conversions.
          </div>
        )}
      </div>
    </div>
  )
}
