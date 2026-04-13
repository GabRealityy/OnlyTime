import type { Settings } from '../../lib/settings'

export function DisplaySection(props: {
  settings: Settings
  onChange: (next: Settings) => void
}) {
  const { settings, onChange } = props

  return (
    <div className="ot-card">
      <div className="text-lg font-semibold">Anzeigeeinstellungen</div>
      <div className="mt-1 text-sm text-secondary">Wie sollen Werte angezeigt werden?</div>

      <div className="mt-4">
        <label className="text-sm font-medium">Währung</label>
        <div className="mt-2 flex gap-2">
          {(['CHF', 'EUR', 'USD'] as const).map((curr) => (
            <button
              key={curr}
              type="button"
              onClick={() => onChange({ ...settings, currency: curr })}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                settings.currency === curr
                  ? 'ot-btn-active'
                  : 'bg-card hover:bg-card-hover text-secondary hover:text-primary'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.preferTimeDisplay}
            onChange={(e) => onChange({ ...settings, preferTimeDisplay: e.target.checked })}
            className="h-5 w-5"
          />
          <div>
            <div className="text-sm font-medium">Zeit-Fokus-Modus</div>
            <div className="text-xs text-tertiary">
              Zeige Zeitwerte (Stunden) prominent an, CHF in Klammern
            </div>
          </div>
        </label>
      </div>
    </div>
  )
}
