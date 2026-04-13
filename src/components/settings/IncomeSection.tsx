import { useState } from 'react'
import type { Settings, IncomeSource } from '../../lib/settings'
import { formatCHF } from '../../lib/money'
import { DecimalInput } from '../DecimalInput'

export function IncomeSection(props: {
  settings: Settings
  onChange: (next: Settings) => void
}) {
  const { settings, onChange } = props
  const [showAdditional, setShowAdditional] = useState(settings.additionalIncomeSources.length > 0)

  const addIncomeSource = () => {
    const next: IncomeSource = {
      id: String(Date.now()),
      name: '',
      amountCHF: 0,
      hoursPerMonth: 0,
    }
    onChange({ ...settings, additionalIncomeSources: [...settings.additionalIncomeSources, next] })
  }

  const updateIncomeSource = (id: string, updates: Partial<IncomeSource>) => {
    onChange({
      ...settings,
      additionalIncomeSources: settings.additionalIncomeSources.map((s) =>
        s.id === id ? { ...s, ...updates } : s,
      ),
    })
  }

  const removeIncomeSource = (id: string) => {
    onChange({
      ...settings,
      additionalIncomeSources: settings.additionalIncomeSources.filter((s) => s.id !== id),
    })
  }

  return (
    <>
      <div className="ot-card" data-section="income">
        <div className="text-lg font-semibold">Einkommen</div>
        <div className="mt-1 text-sm text-secondary">Wähle zwischen Netto- oder Bruttoeinkommen</div>

        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.useGrossIncome}
              onChange={(e) => onChange({ ...settings, useGrossIncome: e.target.checked })}
              className="h-4 w-4"
            />
            <span className="text-sm">Bruttoeinkommen verwenden</span>
          </label>

          {settings.useGrossIncome ? (
            <>
              <div>
                <label htmlFor="grossMonthlyIncome">
                  Brutto-Monatseinkommen (CHF)
                  <span className="ml-2 text-xs text-tertiary">vor Steuern/Abgaben</span>
                </label>
                <DecimalInput
                  placeholder="z.B. 7000"
                  value={settings.grossMonthlyIncomeCHF}
                  onChange={(val) => onChange({ ...settings, grossMonthlyIncomeCHF: val })}
                />
              </div>
              <div>
                <label htmlFor="taxRate">
                  Steuern & Sozialabgaben (%)
                  <span className="ml-2 text-xs text-tertiary">ca. 15-35%</span>
                </label>
                <DecimalInput
                  placeholder="z.B. 25"
                  value={settings.taxRatePercent}
                  onChange={(val) => onChange({ ...settings, taxRatePercent: Math.min(100, Math.max(0, val)) })}
                />
                {settings.grossMonthlyIncomeCHF > 0 && settings.taxRatePercent > 0 && (
                  <div className="mt-1 text-xs text-tertiary">
                    ≈ {formatCHF(settings.grossMonthlyIncomeCHF * (1 - settings.taxRatePercent / 100))} netto
                  </div>
                )}
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="netMonthlyIncome">
                Netto-Monatseinkommen (CHF)
                <span className="ml-2 text-xs text-tertiary">nach allen Abzügen</span>
              </label>
              <DecimalInput
                placeholder="z.B. 5500"
                value={settings.netMonthlyIncomeCHF}
                onChange={(val) => onChange({ ...settings, netMonthlyIncomeCHF: val })}
              />
            </div>
          )}
        </div>
      </div>

      <div className="ot-card">
        <button
          onClick={() => setShowAdditional(!showAdditional)}
          className="w-full flex items-center justify-between text-left"
        >
          <div>
            <div className="text-lg font-semibold">
              Zusätzliche Einkommen
              {settings.additionalIncomeSources.length > 0 && (
                <span className="ml-2 text-sm text-tertiary">({settings.additionalIncomeSources.length})</span>
              )}
            </div>
            <div className="mt-1 text-sm text-secondary">Nebenjobs, passive Einkünfte, etc.</div>
          </div>
          <svg className={`w-5 h-5 transition-transform ${showAdditional ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAdditional && (
          <div className="mt-4 space-y-3">
            {settings.additionalIncomeSources.map((source) => (
              <div key={source.id} className="p-3 rounded-lg border border-border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    placeholder="Name der Einkommensquelle"
                    value={source.name}
                    onChange={(e) => updateIncomeSource(source.id, { name: e.target.value })}
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                  />
                  <button
                    onClick={() => removeIncomeSource(source.id)}
                    className="text-tertiary hover:text-danger transition-colors"
                    title="Entfernen"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-tertiary">Betrag (CHF/Monat)</label>
                    <DecimalInput
                      placeholder="z.B. 500"
                      value={source.amountCHF}
                      onChange={(val) => updateIncomeSource(source.id, { amountCHF: val })}
                      className="w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-tertiary">Zeitaufwand (h/Monat)</label>
                    <DecimalInput
                      placeholder="z.B. 20"
                      value={source.hoursPerMonth}
                      onChange={(val) => updateIncomeSource(source.id, { hoursPerMonth: val })}
                      className="w-full text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addIncomeSource}
              className="w-full py-2 px-3 rounded-lg border border-dashed border-border hover:border-primary text-sm text-tertiary hover:text-secondary transition-colors"
            >
              + Einkommensquelle hinzufügen
            </button>
          </div>
        )}
      </div>
    </>
  )
}
