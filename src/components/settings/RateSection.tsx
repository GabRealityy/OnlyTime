import { useState } from 'react'
import type { Settings } from '../../lib/settings'
import {
  monthlyWorkingHours,
  hourlyRateCHF,
  effectiveNetMonthlyIncome,
  weeklyCommuteHours,
} from '../../lib/settings'
import { formatCHF } from '../../lib/money'
import { DecimalInput } from '../DecimalInput'

export function RateSection(props: {
  settings: Settings
  onChange: (next: Settings) => void
}) {
  const { settings, onChange } = props
  const [showAdvanced, setShowAdvanced] = useState(false)

  const monthlyHours = monthlyWorkingHours(settings)
  const hourlyRate = hourlyRateCHF(settings)
  const totalIncome = effectiveNetMonthlyIncome(settings)
  const commuteHours = weeklyCommuteHours(settings)

  return (
    <>
      <div className="ot-card">
        <div className="text-lg font-semibold">Arbeitszeit</div>
        <div className="mt-1 text-sm text-secondary">Reguläre Arbeitsstunden pro Woche</div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="weeklyHours">Wöchentliche Arbeitsstunden</label>
            <DecimalInput
              placeholder="z.B. 40"
              value={settings.weeklyWorkingHours}
              onChange={(val) => onChange({ ...settings, weeklyWorkingHours: val })}
            />
          </div>
          <div>
            <label htmlFor="weeksPerMonth">
              Wochen pro Monat
              <span className="ml-2 text-xs text-tertiary">Standard: 4.33</span>
            </label>
            <DecimalInput
              placeholder="4.33"
              value={settings.weeksPerMonth}
              onChange={(val) => onChange({ ...settings, weeksPerMonth: val })}
            />
          </div>
        </div>
      </div>

      <div className="ot-card">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-left"
        >
          <div>
            <div className="text-lg font-semibold">Zeitfaktoren</div>
            <div className="mt-1 text-sm text-secondary">Pendelzeit, Überstunden & Arbeitstage</div>
          </div>
          <svg
            className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="commuteMinutes">
                Pendelzeit pro Arbeitstag (Minuten)
                <span className="ml-2 text-xs text-tertiary">Hin + Zurück</span>
              </label>
              <DecimalInput
                placeholder="z.B. 60"
                value={settings.commuteMinutesPerDay}
                onChange={(val) => onChange({ ...settings, commuteMinutesPerDay: val })}
              />
              {settings.commuteMinutesPerDay > 0 && (
                <div className="mt-1 text-xs text-tertiary">
                  = {commuteHours.toFixed(1)} h pro Woche, {(commuteHours * settings.weeksPerMonth).toFixed(1)} h pro Monat
                </div>
              )}
              <div className="mt-2 text-xs text-tertiary">
                💡 Dein Arbeitsweg zählt zur Zeit, die du aufwendest, um dein Einkommen zu verdienen
              </div>
            </div>

            <div>
              <label htmlFor="overtimeHours">
                Unbezahlte Überstunden pro Woche
                <span className="ml-2 text-xs text-tertiary">nicht extra vergütet</span>
              </label>
              <DecimalInput
                placeholder="z.B. 5"
                value={settings.overtimeHoursPerWeek}
                onChange={(val) => onChange({ ...settings, overtimeHoursPerWeek: val })}
              />
              {settings.overtimeHoursPerWeek > 0 && (
                <div className="mt-1 text-xs text-tertiary">
                  = {(settings.overtimeHoursPerWeek * settings.weeksPerMonth).toFixed(1)} h pro Monat
                </div>
              )}
            </div>

            <div>
              <label htmlFor="workingDays">
                Arbeitstage pro Woche
                <span className="ml-2 text-xs text-tertiary">für Pendelzeit-Berechnung</span>
              </label>
              <DecimalInput
                placeholder="z.B. 5"
                value={settings.workingDaysPerWeek}
                onChange={(val) => onChange({ ...settings, workingDaysPerWeek: Math.min(7, Math.max(1, val)) })}
              />
            </div>
          </div>
        )}
      </div>

      <div className="ot-card">
        <div className="text-sm font-semibold">Effektive Werte</div>
        <div className="mt-1 text-xs text-tertiary">Diese Werte berücksichtigen alle oben angegebenen Faktoren</div>
        <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="text-secondary">Gesamtes Netto-Einkommen</div>
            <div className="font-mono">{formatCHF(totalIncome)}/Monat</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-secondary">Gesamte Arbeitszeit</div>
            <div className="font-mono">{monthlyHours.toFixed(2)} h/Monat</div>
          </div>
          <div className="h-px bg-border my-1"></div>
          <div className="flex items-center justify-between">
            <div className="text-primary font-medium">Effektiver Stundenlohn</div>
            <div className="font-mono text-lg font-semibold text-success">
              {hourlyRate > 0 ? `${formatCHF(hourlyRate)}/h` : '—'}
            </div>
          </div>
        </div>

        {hourlyRate <= 0 && (
          <div className="mt-3 rounded-xl border border-border bg-card p-3 text-sm text-secondary">
            Gib Einkommen und Arbeitszeit ein, um deinen effektiven Stundenlohn zu berechnen.
          </div>
        )}

        {hourlyRate > 0 && monthlyHours > 0 && (
          <div className="mt-3 rounded-xl border border-success bg-success-bg p-3 text-sm text-success">
            ✓ Dein Stundenlohn ist berechnet. Die App kann jetzt Preise in Arbeitszeit umrechnen.
          </div>
        )}
      </div>
    </>
  )
}
