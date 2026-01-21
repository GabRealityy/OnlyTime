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
}) {
  const width = props.width ?? 720
  const height = props.height ?? 220
  const hourlyRate = props.hourlyRate ?? 0
  const showTimeAxis = props.showTimeAxis ?? (hourlyRate > 0)

  const [hoverDay, setHoverDay] = useState<number | null>(null)

  const pad = 18
  const innerW = width - pad * 2
  const innerH = height - pad * 2

  const maxY = Math.max(
    1,
    ...props.points.map((p) => Math.max(p.earned, p.spent)),
  )

  const xForDay = (day: number) => {
    const minDay = props.points[0]?.day ?? 1
    const maxDay = props.points[props.points.length - 1]?.day ?? 1
    const t = clamp01(inverseLerp(minDay, maxDay, day))
    return pad + t * innerW
  }

  const yForValue = (v: number) => {
    const t = clamp01(inverseLerp(0, maxY, v))
    // invert y for SVG
    return pad + (1 - t) * innerH
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
  const gridYs = Array.from({ length: gridLines + 1 }, (_, i) => pad + (innerH * i) / gridLines)

  return (
    <div className="ot-card">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold">This month</div>
        <div className="flex items-center gap-3 text-xs text-zinc-400">
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
        className="h-[220px] w-full"
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
            x1={pad}
            x2={width - pad}
            y1={y}
            y2={y}
            stroke="#27272a"
            strokeWidth={1}
          />
        ))}

        {/* area fill (subtle) */}
        {earnedPts.length > 1 && (
          <path
            d={`${earnedPath} L ${earnedPts[earnedPts.length - 1].x} ${height - pad} L ${earnedPts[0].x} ${height - pad} Z`}
            fill="url(#earnedGlow)"
          />
        )}
        {spentPts.length > 1 && (
          <path
            d={`${spentPath} L ${spentPts[spentPts.length - 1].x} ${height - pad} L ${spentPts[0].x} ${height - pad} Z`}
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
              y1={pad}
              y2={height - pad}
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
              y1={pad}
              y2={height - pad}
              stroke="#71717a"
              strokeDasharray="2 4"
              opacity={0.5}
            />
          </g>
        )}

        {/* frame */}
        <rect
          x={pad}
          y={pad}
          width={innerW}
          height={innerH}
          fill="none"
          stroke="#27272a"
          rx={10}
        />
      </svg>

      {hoverPoint && (
        <div className="mt-2 rounded-lg border border-zinc-800 bg-zinc-950 p-2 text-xs">
          <div className="font-semibold text-zinc-300">Tag {hoverPoint.day}</div>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <div>
              <span className="text-zinc-500">Verdient:</span>{' '}
              <span className="text-emerald-400">{formatCHF(hoverPoint.earned)}</span>
              {showTimeAxis && hoverPoint.earnedHours !== undefined && (
                <span className="ml-1 text-zinc-500">({formatHoursMinutes(hoverPoint.earnedHours)})</span>
              )}
            </div>
            <div>
              <span className="text-zinc-500">Ausgegeben:</span>{' '}
              <span className="text-rose-400">{formatCHF(hoverPoint.spent)}</span>
              {showTimeAxis && hoverPoint.spentHours !== undefined && (
                <span className="ml-1 text-zinc-500">({formatHoursMinutes(hoverPoint.spentHours)})</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-2 text-xs text-zinc-500">
        Crossing marker appears when spending overtakes earning.
      </div>
    </div>
  )
}
