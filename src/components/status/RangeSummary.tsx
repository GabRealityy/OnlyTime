import { formatCHF, formatHoursMinutes } from '../../lib/money'

type Stats = {
  earned: number
  spent: number
  balance: number
  earnedHours: number
  spentHours: number
  balanceHours: number
}

function balanceFontSize(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1000000) return 'clamp(1rem, 3.5vw, 1.125rem)'
  if (abs >= 100000) return 'clamp(1.125rem, 4vw, 1.25rem)'
  return 'clamp(1.5rem, 6vw, 2rem)'
}

function formatValue(chf: number, hours: number, preferTimeDisplay: boolean, hourly: number) {
  if (!preferTimeDisplay || hourly === 0) {
    return {
      primary: formatCHF(chf),
      secondary: hourly > 0 ? formatHoursMinutes(hours) : null,
    }
  }
  return { primary: formatHoursMinutes(hours), secondary: formatCHF(chf) }
}

export function RangeSummary(props: {
  stats: Stats
  timeRangeLabel: string
  hourly: number
  preferTimeDisplay: boolean
}) {
  const { stats, timeRangeLabel, hourly, preferTimeDisplay } = props
  const earned = formatValue(stats.earned, stats.earnedHours, preferTimeDisplay, hourly)
  const spent = formatValue(stats.spent, stats.spentHours, preferTimeDisplay, hourly)
  const balance = formatValue(stats.balance, stats.balanceHours, preferTimeDisplay, hourly)
  const balancePositive = stats.balance >= 0

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-[1.5rem] border border-border-secondary bg-card p-4 sm:p-5">
        <div className="text-[10px] font-black uppercase tracking-widest text-secondary mb-2 whitespace-nowrap">Verdienst ({timeRangeLabel})</div>
        <div
          className="font-black tracking-tight text-primary break-words"
          style={{ fontSize: stats.earned >= 10000000 ? 'clamp(1rem, 4vw, 1.25rem)' : 'clamp(1.25rem, 5vw, 1.5rem)' }}
        >
          {earned.primary}
        </div>
        {earned.secondary && <div className="mt-1 text-xs font-bold text-secondary break-all">{earned.secondary}</div>}
      </div>

      <div className="rounded-[1.5rem] border border-border-secondary bg-card p-4 sm:p-5">
        <div className="text-[10px] font-black uppercase tracking-widest text-secondary mb-2 whitespace-nowrap">Ausgaben ({timeRangeLabel})</div>
        <div
          className="font-black tracking-tight text-primary break-words"
          style={{ fontSize: stats.spent >= 10000000 ? 'clamp(1rem, 4vw, 1.25rem)' : 'clamp(1.25rem, 5vw, 1.5rem)' }}
        >
          {spent.primary}
        </div>
        {spent.secondary && <div className="mt-1 text-xs font-bold text-secondary break-all">{spent.secondary}</div>}
      </div>

      <div
        className={`rounded-[1.5rem] border shadow-xl relative overflow-hidden ${
          balancePositive ? 'border-success bg-success text-success-text' : 'border-danger bg-danger text-danger-text'
        }`}
      >
        <div className="p-4 sm:p-5 pb-8">
          <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2 whitespace-nowrap">Bilanz ({timeRangeLabel})</div>
          <div className="font-black tracking-tighter break-words leading-tight" style={{ fontSize: balanceFontSize(stats.balance) }}>
            {balance.primary}
          </div>
          {balance.secondary && <div className="mt-1 text-xs font-bold opacity-60 break-all">{balance.secondary}</div>}
        </div>
        {stats.earned > 0 && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <div
              className={`px-3 py-1 rounded-t-lg text-xs font-black ${balancePositive ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'}`}
              style={{ boxShadow: '0 -2px 8px rgba(0,0,0,0.1)' }}
            >
              {((stats.spent / stats.earned) * 100).toFixed(0)}%
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
