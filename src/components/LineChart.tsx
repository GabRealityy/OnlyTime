/*
  SVG line chart (no external chart libs).

  Requirements:
  - X axis: days of the current month
  - Line 1 (green): cumulative earned per day
  - Line 2 (red): cumulative expenses per day
  - If red crosses green, show that point
*/

import { clamp01, inverseLerp, lerp } from '../lib/math'
import { formatCHF, formatHoursMinutes } from '../lib/money'
import { useState } from 'react'

export type DailyPoint = {
  day: number // 1..daysInMonth
  earned: number
  spent: number
  earnedHours?: number
  spentHours?: number
  /** Optional display label for the x-value (e.g., month name for multi-month charts) */
  dayLabel?: string
}

function buildPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  const [first, ...rest] = points
  return `M ${first.x} ${first.y} ${rest.map((p) => `L ${p.x} ${p.y}`).join(' ')}`
}

export function LineChart(props: {
  points: DailyPoint[]
  width?: number
  height?: number
  hourlyRate?: number
  showTimeAxis?: boolean
  showXAxis?: boolean
  title?: string
  preferTimeDisplay?: boolean
}) {
  const width = props.width ?? 720
  const height = props.height ?? 220
  const hourlyRate = props.hourlyRate ?? 0
  const showTimeAxis = props.showTimeAxis ?? (hourlyRate > 0)
  const showXAxis = props.showXAxis ?? true
  const title = props.title ?? 'This month'
  const preferTimeDisplay = props.preferTimeDisplay ?? false

  const [hoverDay, setHoverDay] = useState<number | null>(null)

  const showHoursAxis = showTimeAxis && hourlyRate > 0
  const chfTickFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })
  const hoursTickFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 })

  // Extra margins so labels never overlap the plot/grid.
  const marginTop = 30
  const marginBottom = showXAxis ? 40 : 30
  const marginLeft = showHoursAxis ? 65 : 40
  const marginRight = 65

  const innerW = Math.max(1, width - marginLeft - marginRight)
  const innerH = Math.max(1, height - marginTop - marginBottom)

  const maxY = Math.max(
    1,
    ...props.points.map((p) => Math.max(p.earned, p.spent)),
  )

  const xForDay = (day: number) => {
    const minDay = props.points[0]?.day ?? 1
    const maxDay = props.points[props.points.length - 1]?.day ?? 1
    const t = clamp01(inverseLerp(minDay, maxDay, day))
    return marginLeft + t * innerW
  }

  const yForValue = (v: number) => {
    const t = clamp01(inverseLerp(0, maxY, v))
    // invert y for SVG
    return marginTop + (1 - t) * innerH
  }

  const earnedPts = props.points.map((p) => ({ x: xForDay(p.day), y: yForValue(p.earned) }))
  const spentPts = props.points.map((p) => ({ x: xForDay(p.day), y: yForValue(p.spent) }))

  // Find first crossing where spent becomes > earned.
  // We also estimate a sub-day intersection for a nicer marker.
  let cross: { x: number; y: number } | null = null
  for (let i = 1; i < props.points.length; i++) {
    const prev = props.points[i - 1]
    const cur = props.points[i]

    const prevDiff = prev.spent - prev.earned
    const curDiff = cur.spent - cur.earned

    if (prevDiff <= 0 && curDiff > 0) {
      // Solve for t where diff(t) = 0 assuming linear interpolation within the day.
      const t = clamp01(prevDiff / (prevDiff - curDiff))
      const x = lerp(xForDay(prev.day), xForDay(cur.day), t)
      const earnedAt = lerp(prev.earned, cur.earned, t)
      const y = yForValue(earnedAt)
      cross = { x, y }
      break
    }
  }

  const earnedPath = buildPath(earnedPts)
  const spentPath = buildPath(spentPts)

  // Finde Hover-Point
  const hoverPoint = hoverDay !== null ? props.points.find(p => p.day === hoverDay) : null
  const hoverX = hoverDay !== null ? xForDay(hoverDay) : null

  // A simple grid (subtle) to read the slope.
  const gridLines = 4
  const gridYs = Array.from({ length: gridLines + 1 }, (_, i) => marginTop + (innerH * i) / gridLines)

  const xTickIndices = (() => {
    const n = props.points.length
    if (n <= 1) return [0]
    if (n <= 8) return Array.from({ length: n }, (_, i) => i)
    // Keep labels readable on dense data: show ~5 evenly spaced ticks.
    const steps = 4
    const idxs = [
      0,
      ...Array.from({ length: steps - 1 }, (_, i) => Math.round(((i + 1) * (n - 1)) / steps)),
      n - 1,
    ]
    return Array.from(new Set(idxs)).filter((i) => i >= 0 && i < n)
  })()

  return (
    <div className="ot-card">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold">{title}</div>
        <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <span>earned</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
            <span>spent</span>
          </div>
          {showTimeAxis && (
            <span className="text-[10px]">(Zeitwerte berücksichtigt)</span>
          )}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[220px] w-full text-black dark:text-white"
        role="img"
        aria-label="Earned vs spent chart"
        onMouseMove={(e) => {
          const svg = e.currentTarget
          const rect = svg.getBoundingClientRect()
          const x = ((e.clientX - rect.left) / rect.width) * width

          // Finde den nächsten Tag
          let closestDay: number | null = null
          let minDist = Infinity
          for (const pt of props.points) {
            const ptX = xForDay(pt.day)
            const dist = Math.abs(x - ptX)
            if (dist < minDist) {
              minDist = dist
              closestDay = pt.day
            }
          }
          setHoverDay(closestDay)
        }}
        onMouseLeave={() => setHoverDay(null)}
      >
        <defs>
          <linearGradient id="earnedGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#34d399" stopOpacity="0.35" />
            <stop offset="1" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="spentGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fb7185" stopOpacity="0.25" />
            <stop offset="1" stopColor="#fb7185" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* grid */}
        {gridYs.map((y) => (
          <line
            key={y}
            x1={marginLeft}
            x2={width - marginRight}
            y1={y}
            y2={y}
            stroke="#27272a"
            strokeWidth={1}
          />
        ))}

        {/* y-axis tick labels */}
        {gridYs.map((y, i) => {
          const t = i / gridLines
          const chfValue = maxY * (1 - t)
          const chfLabel = chfTickFormat.format(chfValue)
          const hoursLabel = showHoursAxis ? hoursTickFormat.format(chfValue / hourlyRate) : ''

          return (
            <g key={`yTick-${y}`}>
              {showHoursAxis && (
                <text
                  x={marginLeft - 12}
                  y={y}
                  fill="currentColor"
                  fontSize={12}
                  dominantBaseline="middle"
                  textAnchor="end"
                >
                  {hoursLabel}
                </text>
              )}
              <text
                x={width - marginRight + 12}
                y={y}
                fill="currentColor"
                fontSize={12}
                dominantBaseline="middle"
                textAnchor="start"
              >
                {chfLabel}
              </text>
            </g>
          )
        })}

        {/* y-axis unit labels */}
        {showHoursAxis && (
          <text x={marginLeft - 12} y={15} fill="currentColor" fontSize={12} fontWeight="bold" textAnchor="end">
            h
          </text>
        )}
        <text x={width - marginRight + 12} y={15} fill="currentColor" fontSize={12} fontWeight="bold" textAnchor="start">
          CHF
        </text>

        {/* area fill (subtle) */}
        {earnedPts.length > 1 && (
          <path
            d={`${earnedPath} L ${earnedPts[earnedPts.length - 1].x} ${height - marginBottom} L ${earnedPts[0].x} ${height - marginBottom} Z`}
            fill="url(#earnedGlow)"
          />
        )}
        {spentPts.length > 1 && (
          <path
            d={`${spentPath} L ${spentPts[spentPts.length - 1].x} ${height - marginBottom} L ${spentPts[0].x} ${height - marginBottom} Z`}
            fill="url(#spentGlow)"
          />
        )}

        {/* lines */}
        <path d={earnedPath} fill="none" stroke="#34d399" strokeWidth={2.5} />
        <path d={spentPath} fill="none" stroke="#fb7185" strokeWidth={2.5} />

        {/* crossing marker */}
        {cross && (
          <g>
            <line
              x1={cross.x}
              x2={cross.x}
              y1={marginTop}
              y2={height - marginBottom}
              stroke="#a1a1aa"
              strokeDasharray="4 6"
              opacity={0.7}
            />
            <circle cx={cross.x} cy={cross.y} r={5.5} fill="#0a0a0a" stroke="#e4e4e7" strokeWidth={2} />
            <circle cx={cross.x} cy={cross.y} r={2.5} fill="#e4e4e7" />
          </g>
        )}

        {/* hover marker */}
        {hoverX !== null && hoverPoint && (
          <g>
            <line
              x1={hoverX}
              x2={hoverX}
              y1={marginTop}
              y2={height - marginBottom}
              stroke="#71717a"
              strokeDasharray="2 4"
              opacity={0.5}
            />
          </g>
        )}

        {/* frame */}
        <rect
          x={marginLeft}
          y={marginTop}
          width={innerW}
          height={innerH}
          fill="none"
          stroke="#27272a"
          rx={10}
        />

        {/* x-axis ticks/labels */}
        {showXAxis &&
          xTickIndices.map((idx) => {
            const p = props.points[idx]
            if (!p) return null
            const x = xForDay(p.day)
            const label = p.dayLabel ?? String(p.day)
            const isFirst = idx === xTickIndices[0]
            const isLast = idx === xTickIndices[xTickIndices.length - 1]
            const textAnchor: 'start' | 'middle' | 'end' = isFirst ? 'start' : isLast ? 'end' : 'middle'

            return (
              <g key={`xTick-${idx}`}>
                <line
                  x1={x}
                  x2={x}
                  y1={height - marginBottom}
                  y2={height - marginBottom + 4}
                  stroke="#52525b"
                  strokeWidth={1}
                  opacity={0.8}
                />
                <text
                  x={x}
                  y={height - 8}
                  fill="currentColor"
                  fontSize={12}
                  textAnchor={textAnchor}
                >
                  {label}
                </text>
              </g>
            )
          })}
      </svg>

      <div className="mt-2 min-h-[64px]">
        {hoverPoint && (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2 text-xs">
            <div className="font-semibold text-zinc-700 dark:text-zinc-300">
              {hoverPoint.dayLabel ? hoverPoint.dayLabel : `Tag ${hoverPoint.day}`}
            </div>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <div>
                <span className="text-zinc-600 dark:text-zinc-500">Verdient:</span>{' '}
                {preferTimeDisplay && showTimeAxis && hoverPoint.earnedHours !== undefined ? (
                  <>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatHoursMinutes(hoverPoint.earnedHours)}</span>
                    <span className="ml-1 text-zinc-600 dark:text-zinc-500">({formatCHF(hoverPoint.earned)})</span>
                  </>
                ) : (
                  <>
                    <span className="text-emerald-600 dark:text-emerald-400">{formatCHF(hoverPoint.earned)}</span>
                    {showTimeAxis && hoverPoint.earnedHours !== undefined && (
                      <span className="ml-1 text-zinc-600 dark:text-zinc-500">({formatHoursMinutes(hoverPoint.earnedHours)})</span>
                    )}
                  </>
                )}
              </div>
              <div>
                <span className="text-zinc-600 dark:text-zinc-500">Ausgegeben:</span>{' '}
                {preferTimeDisplay && showTimeAxis && hoverPoint.spentHours !== undefined ? (
                  <>
                    <span className="text-rose-600 dark:text-rose-400 font-semibold">{formatHoursMinutes(hoverPoint.spentHours)}</span>
                    <span className="ml-1 text-zinc-600 dark:text-zinc-500">({formatCHF(hoverPoint.spent)})</span>
                  </>
                ) : (
                  <>
                    <span className="text-rose-600 dark:text-rose-400">{formatCHF(hoverPoint.spent)}</span>
                    {showTimeAxis && hoverPoint.spentHours !== undefined && (
                      <span className="ml-1 text-zinc-600 dark:text-zinc-500">({formatHoursMinutes(hoverPoint.spentHours)})</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-500">
        Crossing marker appears when spending overtakes earning.
      </div>
    </div>
  )
}
