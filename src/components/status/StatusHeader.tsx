import type { Settings } from '../../lib/settings'
import { timeRangeButtons, type TimeRange } from '../../lib/rangeAnalytics'

export function StatusHeader(props: {
  label: string
  timeRangeLabel: string
  timeRange: TimeRange
  today: number
  dim: number
  hourly: number
  settings: Settings
  onSettingsChange: (next: Settings) => void
  onTimeRangeChange: (range: TimeRange) => void
}) {
  const { label, timeRangeLabel, timeRange, today, dim, hourly, settings, onSettingsChange, onTimeRangeChange } = props

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-black tracking-tighter">Status</div>
          <div className="mt-1 text-xs font-bold uppercase tracking-widest text-secondary">
            {label} · {timeRangeLabel}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {hourly > 0 && (
            <button
              type="button"
              onClick={() => onSettingsChange({ ...settings, preferTimeDisplay: !settings.preferTimeDisplay })}
              className="relative h-8 w-14 rounded-full transition-all border-2"
              style={{
                backgroundColor: settings.preferTimeDisplay ? 'var(--color-primary)' : 'var(--color-input)',
                borderColor: 'var(--color-border)',
              }}
              title={settings.preferTimeDisplay ? 'Zu CHF wechseln' : 'Zu Zeitanzeige wechseln'}
              aria-label="Anzeigemodus wechseln"
            >
              <div
                className="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-card shadow-md transition-transform flex items-center justify-center"
                style={{ transform: settings.preferTimeDisplay ? 'translateX(22px)' : 'translateX(0px)' }}
              >
                <span className="text-sm">{settings.preferTimeDisplay ? '⏰' : '💰'}</span>
              </div>
            </button>
          )}
          {timeRange === '1M' && (
            <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-widest text-secondary">Tag</div>
              <div className="font-mono text-sm font-bold">
                {today}/{dim}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {timeRangeButtons.map((btn) => (
          <button
            key={btn.id}
            type="button"
            onClick={() => onTimeRangeChange(btn.id)}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all touch-manipulation active:scale-95 ${
              timeRange === btn.id ? 'ot-btn-active' : 'bg-card hover:bg-card-hover text-secondary hover:text-primary'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </>
  )
}
