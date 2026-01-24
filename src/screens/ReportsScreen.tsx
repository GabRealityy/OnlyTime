/*
  Reports Screen - Historische Analysen & Berichte
  
  Zeigt:
  - Zeitraum-Filter (5Y, 3Y, 1Y, YTD, 6M, 3M, 1M)
  - Top-Insights (wichtigste Erkenntnisse)
  - Historisches LineChart (mehrere Monate)
  - Kategorie-Breakdown (Balken/Donut-Chart)
  - Sparziele (Time Goals) - kommt später
*/

import { useMemo, useState } from 'react'
import type { Settings } from '../lib/settings'
import { hourlyRateCHF } from '../lib/settings'
import { formatCHF, formatHoursMinutes, toHours } from '../lib/money'
import { LineChart, type DailyPoint } from '../components/LineChart'
import {
  buildMonthlyData,
  summarizeMonthlyData,
  timeRangeButtons,
  topCategoryFromMonthlyData,
  type TimeRange,
} from '../lib/rangeAnalytics'

export function ReportsScreen(props: { settings: Settings }) {
  const [timeRange, setTimeRange] = useState<TimeRange>('3M')
  
  const hourly = hourlyRateCHF(props.settings)
  const monthlyData = useMemo(
    () => buildMonthlyData(props.settings, timeRange),
    [props.settings, timeRange],
  )

  const totalStats = useMemo(() => summarizeMonthlyData(monthlyData, hourly), [monthlyData, hourly])
  const topCategory = useMemo(() => topCategoryFromMonthlyData(monthlyData, hourly), [monthlyData, hourly])

  const timeRangeLabel = useMemo(() => {
    return timeRangeButtons.find((b) => b.id === timeRange)?.label ?? timeRange
  }, [timeRange])

  const chartPoints: DailyPoint[] = useMemo(() => {
    let earnedCum = 0
    let spentCum = 0
    return monthlyData.map((m, idx) => {
      earnedCum += m.earned
      spentCum += m.spent
      return {
        day: idx + 1,
        dayLabel: m.label,
        earned: earnedCum,
        spent: spentCum,
        earnedHours: toHours(earnedCum, hourly),
        spentHours: toHours(spentCum, hourly),
      }
    })
  }, [monthlyData, hourly])

  const categoryBreakdown = useMemo(() => {
    const totals = new Map<string, number>()
    for (const month of monthlyData) {
      for (const [cat, amount] of month.categorySpending) {
        totals.set(cat, (totals.get(cat) || 0) + amount)
      }
    }

    const items = Array.from(totals.entries())
      .map(([categoryId, amount]) => {
        const displayName =
          props.settings.customCategories.find((c) => c.id === categoryId)?.name ?? categoryId
        const pct = totalStats.spent > 0 ? (amount / totalStats.spent) * 100 : 0
        return {
          categoryId,
          name: displayName,
          amount,
          hours: toHours(amount, hourly),
          pct,
        }
      })
      .sort((a, b) => b.amount - a.amount)

    return items
  }, [monthlyData, props.settings.customCategories, totalStats.spent, hourly])

  if (hourly <= 0) {
    return (
      <div className="space-y-4">
        <div className="ot-card">
          <div className="text-lg font-semibold">📈 Berichte</div>
          <div className="mt-1 text-sm text-secondary">
            Historische Analysen deiner Einnahmen und Ausgaben
          </div>
        </div>
        
        <div className="ot-card">
          <div className="rounded-xl border border-warning bg-warning-bg p-4 text-center">
            <div className="text-2xl mb-2">⚠️</div>
            <div className="font-semibold text-warning">Stundenlohn fehlt</div>
            <div className="mt-2 text-sm text-warning-text">
              Gehe zu Einstellungen und lege dein Einkommen und deine Arbeitszeit fest,
              um Berichte in Arbeitszeit anzeigen zu können.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="ot-card">
        <div className="text-lg font-semibold">📈 Berichte</div>
        <div className="mt-1 text-sm text-secondary">
          Historische Analysen deiner Einnahmen und Ausgaben
        </div>
      </div>

      {/* Zeitraum-Filter */}
      <div className="ot-card">
        <div className="text-sm font-semibold mb-3">Zeitraum</div>
        <div className="flex flex-wrap gap-2">
          {timeRangeButtons.map(btn => (
            <button
              key={btn.id}
              onClick={() => setTimeRange(btn.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeRange === btn.id
                  ? 'bg-success text-primary-inverse'
                  : 'bg-input text-secondary hover:bg-card'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top-Insights */}
      <div className="ot-card">
        <div className="text-sm font-semibold mb-3">📊 Wichtigste Erkenntnisse</div>
        
        <div className="space-y-3">
          {/* Gesamtbilanz */}
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-xs text-tertiary mb-1">Gesamtbilanz ({timeRange})</div>
            <div className="flex items-baseline gap-2">
              <div className={`text-2xl font-semibold ${totalStats.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCHF(totalStats.balance)}
              </div>
              <div className="text-sm text-secondary">
                ({formatHoursMinutes(Math.abs(totalStats.balanceHours))})
              </div>
            </div>
            <div className="mt-2 text-xs text-secondary">
              Verdient: {formatCHF(totalStats.earned)} ({formatHoursMinutes(totalStats.earnedHours)}) • 
              Ausgegeben: {formatCHF(totalStats.spent)} ({formatHoursMinutes(totalStats.spentHours)})
            </div>
          </div>

          {/* Top-Kategorie */}
          {topCategory.category && (
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="text-xs text-tertiary mb-1">Größte Ausgabenkategorie</div>
              <div className="flex items-baseline gap-2">
                <div className="text-lg font-semibold">{topCategory.category}</div>
                <div className="text-sm text-secondary">
                  {formatCHF(topCategory.amount)}
                </div>
              </div>
              <div className="mt-1 text-xs text-secondary">
                Das entspricht {formatHoursMinutes(topCategory.hours)} Arbeitszeit
                ({((topCategory.amount / totalStats.spent) * 100).toFixed(1)}% deiner Gesamtausgaben)
              </div>
            </div>
          )}

          {/* Durchschnitt pro Monat */}
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-xs text-tertiary mb-1">Ø Ausgaben pro Monat</div>
            <div className="flex items-baseline gap-2">
              <div className="text-lg font-semibold">
                {formatCHF(totalStats.spent / monthlyData.length)}
              </div>
              <div className="text-sm text-secondary">
                ({formatHoursMinutes(totalStats.spentHours / monthlyData.length)})
              </div>
            </div>
            <div className="mt-1 text-xs text-secondary">
              Insgesamt {totalStats.expenseCount} Ausgaben erfasst
            </div>
          </div>
        </div>
      </div>

      {/* Visualisierungen */}
      <div className="ot-card">
        <div className="text-sm font-semibold mb-3">📊 Visualisierungen</div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-semibold text-secondary">Historisches Chart (kumuliert)</div>
            {chartPoints.length > 0 ? (
              <LineChart
                points={chartPoints}
                hourlyRate={hourly}
                showTimeAxis={hourly > 0}
                showXAxis={true}
                title={`Zeitraum: ${timeRangeLabel}`}
              />
            ) : (
              <div className="rounded-lg border border-border bg-card p-4 text-sm text-secondary">
                Keine Daten im ausgewählten Zeitraum.
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold text-secondary">Kategorie-Breakdown</div>

            {totalStats.spent <= 0 || categoryBreakdown.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-4 text-sm text-secondary">
                Noch keine Ausgaben im ausgewählten Zeitraum.
              </div>
            ) : (
              <div className="space-y-2">
                {categoryBreakdown.slice(0, 6).map((it) => (
                  <div
                    key={it.categoryId}
                    className="rounded-lg border border-border bg-card p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{it.name}</div>
                        <div className="mt-0.5 text-xs text-tertiary">
                          {it.pct.toFixed(1)}% von {formatCHF(totalStats.spent)}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="font-mono text-sm">{formatCHF(it.amount)}</div>
                        {hourly > 0 && (
                          <div className="text-xs text-tertiary">
                            {formatHoursMinutes(it.hours)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-input">
                      <div
                        className="h-full bg-success transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(100, Math.max(0, it.pct))}%` }}
                      />
                    </div>
                  </div>
                ))}

                {categoryBreakdown.length > 6 && (
                  <div className="text-xs text-tertiary">
                    +{categoryBreakdown.length - 6} weitere Kategorie(n)
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monatliche Übersicht */}
      <div className="ot-card">
        <div className="text-sm font-semibold mb-3">Monatliche Übersicht</div>
        
        <div className="space-y-2">
          {monthlyData.map(month => (
            <div
              key={month.monthKey}
              className="rounded-lg border border-border bg-card p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{month.label}</div>
                <div className={`text-sm font-semibold ${month.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                  {month.balance >= 0 ? '+' : ''}{formatCHF(month.balance)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-tertiary">Verdient</div>
                  <div className="font-mono">{formatCHF(month.earned)}</div>
                  <div className="text-secondary">{formatHoursMinutes(month.earnedHours)}</div>
                </div>
                <div>
                  <div className="text-tertiary">Ausgegeben</div>
                  <div className="font-mono">{formatCHF(month.spent)}</div>
                  <div className="text-secondary">{formatHoursMinutes(month.spentHours)}</div>
                </div>
              </div>
              
              {month.expenseCount > 0 && (
                <div className="mt-2 text-xs text-tertiary">
                  {month.expenseCount} Ausgabe{month.expenseCount !== 1 ? 'n' : ''}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
