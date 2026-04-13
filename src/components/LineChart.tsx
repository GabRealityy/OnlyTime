import { useState } from 'react'
import { formatCHF, formatHoursMinutes } from '../lib/money'
import {
  buildPath,
  buildScales,
  buildXTickIndices,
  buildYTicks,
  findCrossing,
  findNearestDay,
  xForDay,
  yForValue,
  type Scales,
} from '../lib/chartGeometry'

export type DailyPoint = {
  day: number
  earned: number
  spent: number
  earnedHours?: number
  spentHours?: number
  dayLabel?: string
}

const chfFmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })
const hoursFmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 })

export function LineChart(props: {
  points: DailyPoint[]
  width?: number
  height?: number
  hourlyRate?: number
  showTimeAxis?: boolean
  showXAxis?: boolean
  title?: string
  preferTimeDisplay?: boolean
  currentDay?: number
}) {
  const width = props.width ?? 720
  const height = props.height ?? 220
  const hourlyRate = props.hourlyRate ?? 0
  const showTimeAxis = props.showTimeAxis ?? hourlyRate > 0
  const showXAxis = props.showXAxis ?? true
  const title = props.title ?? 'This month'
  const preferTimeDisplay = props.preferTimeDisplay ?? false
  const currentDay = props.currentDay
  const showHoursAxis = showTimeAxis && hourlyRate > 0

  const [hoverDay, setHoverDay] = useState<number | null>(null)

  const viewport = {
    width,
    height,
    marginTop: 30,
    marginBottom: showXAxis ? 40 : 30,
    marginLeft: showHoursAxis ? 65 : 40,
    marginRight: 65,
  }
  const scales = buildScales(props.points, viewport)

  const earnedPts = props.points.map((p) => ({ x: xForDay(scales, p.day), y: yForValue(scales, p.earned) }))
  const spentPts = props.points.map((p) => ({ x: xForDay(scales, p.day), y: yForValue(scales, p.spent) }))
  const earnedPath = buildPath(earnedPts)
  const spentPath = buildPath(spentPts)
  const cross = findCrossing(props.points, scales)

  const hoverPoint = hoverDay !== null ? props.points.find((p) => p.day === hoverDay) ?? null : null
  const hoverX = hoverDay !== null ? xForDay(scales, hoverDay) : null

  const yTicks = buildYTicks(scales, 4)
  const xTickIndices = buildXTickIndices(props.points)
  const plotBottom = height - viewport.marginBottom

  return (
    <div className="ot-card">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold">{title}</div>
        <div className="flex items-center gap-3 text-xs text-secondary">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-success border border-success" />
            <span>Verdienst</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-danger border border-danger" />
            <span>Ausgaben</span>
          </div>
          {showTimeAxis && <span className="text-[10px]">(Zeitwerte berücksichtigt)</span>}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[220px] w-full text-primary"
        role="img"
        aria-label="Earned vs spent chart"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = ((e.clientX - rect.left) / rect.width) * width
          setHoverDay(findNearestDay(props.points, x, scales))
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

        {yTicks.map((t) => (
          <line
            key={`grid-${t.y}`}
            x1={viewport.marginLeft}
            x2={width - viewport.marginRight}
            y1={t.y}
            y2={t.y}
            stroke="currentColor"
            strokeWidth={1}
            opacity={0.2}
          />
        ))}

        {yTicks.map((t) => (
          <g key={`yTick-${t.y}`}>
            {showHoursAxis && (
              <text x={viewport.marginLeft - 12} y={t.y} fill="currentColor" fontSize={12} dominantBaseline="middle" textAnchor="end">
                {hoursFmt.format(t.value / hourlyRate)}
              </text>
            )}
            <text x={width - viewport.marginRight + 12} y={t.y} fill="currentColor" fontSize={12} dominantBaseline="middle" textAnchor="start">
              {chfFmt.format(t.value)}
            </text>
          </g>
        ))}

        {showHoursAxis && (
          <text x={viewport.marginLeft - 12} y={15} fill="currentColor" fontSize={12} fontWeight="bold" textAnchor="end">
            h
          </text>
        )}
        <text x={width - viewport.marginRight + 12} y={15} fill="currentColor" fontSize={12} fontWeight="bold" textAnchor="start">
          CHF
        </text>

        {earnedPts.length > 1 && (
          <path
            d={`${earnedPath} L ${earnedPts[earnedPts.length - 1].x} ${plotBottom} L ${earnedPts[0].x} ${plotBottom} Z`}
            fill="url(#earnedGlow)"
          />
        )}
        {spentPts.length > 1 && (
          <path
            d={`${spentPath} L ${spentPts[spentPts.length - 1].x} ${plotBottom} L ${spentPts[0].x} ${plotBottom} Z`}
            fill="url(#spentGlow)"
          />
        )}

        <path d={earnedPath} fill="none" stroke="#34d399" strokeWidth={2.5} />
        <path d={spentPath} fill="none" stroke="#fb7185" strokeWidth={2.5} />

        {cross && (
          <g>
            <line x1={cross.x} x2={cross.x} y1={viewport.marginTop} y2={plotBottom} stroke="#a1a1aa" strokeDasharray="4 6" opacity={0.7} />
            <circle cx={cross.x} cy={cross.y} r={5.5} fill="#0a0a0a" stroke="#e4e4e7" strokeWidth={2} />
            <circle cx={cross.x} cy={cross.y} r={2.5} fill="#e4e4e7" />
          </g>
        )}

        {hoverX !== null && (
          <line x1={hoverX} x2={hoverX} y1={viewport.marginTop} y2={plotBottom} stroke="currentColor" strokeDasharray="2 4" opacity={0.3} />
        )}

        {currentDay !== undefined && currentDay > 0 && (
          <line
            x1={xForDay(scales, currentDay)}
            x2={xForDay(scales, currentDay)}
            y1={viewport.marginTop}
            y2={plotBottom}
            stroke="currentColor"
            strokeDasharray="2 3"
            opacity={0.5}
            strokeWidth={1.5}
          />
        )}

        <rect
          x={viewport.marginLeft}
          y={viewport.marginTop}
          width={scales.innerW}
          height={scales.innerH}
          fill="none"
          stroke="currentColor"
          rx={10}
          opacity={0.2}
        />

        {showXAxis && <XAxisLabels points={props.points} indices={xTickIndices} scales={scales} plotBottom={plotBottom} height={height} />}
      </svg>

      <HoverCard point={hoverPoint} showTimeAxis={showTimeAxis} preferTimeDisplay={preferTimeDisplay} />

      <div className="mt-2 text-xs text-secondary">
        Crossing marker appears when spending overtakes earning.
      </div>
    </div>
  )
}

function XAxisLabels(props: {
  points: DailyPoint[]
  indices: number[]
  scales: Scales
  plotBottom: number
  height: number
}) {
  return (
    <>
      {props.indices.map((idx) => {
        const p = props.points[idx]
        if (!p) return null
        const x = xForDay(props.scales, p.day)
        const label = p.dayLabel ?? String(p.day)
        const isFirst = idx === props.indices[0]
        const isLast = idx === props.indices[props.indices.length - 1]
        const textAnchor: 'start' | 'middle' | 'end' = isFirst ? 'start' : isLast ? 'end' : 'middle'
        return (
          <g key={`xTick-${idx}`}>
            <line x1={x} x2={x} y1={props.plotBottom} y2={props.plotBottom + 4} stroke="currentColor" strokeWidth={1} opacity={0.3} />
            <text x={x} y={props.height - 8} fill="currentColor" fontSize={12} textAnchor={textAnchor}>
              {label}
            </text>
          </g>
        )
      })}
    </>
  )
}

function HoverCard(props: {
  point: DailyPoint | null
  showTimeAxis: boolean
  preferTimeDisplay: boolean
}) {
  const { point, showTimeAxis, preferTimeDisplay } = props
  return (
    <div className="mt-2 min-h-[64px]">
      {point && (
        <div className="rounded-lg border border-border bg-card p-2 text-xs">
          <div className="font-semibold text-secondary">
            {point.dayLabel ? point.dayLabel : `Tag ${point.day}`}
          </div>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <HoverRow label="Verdient:" colorClass="text-success" chf={point.earned} hours={point.earnedHours} showTimeAxis={showTimeAxis} preferTimeDisplay={preferTimeDisplay} />
            <HoverRow label="Ausgegeben:" colorClass="text-danger" chf={point.spent} hours={point.spentHours} showTimeAxis={showTimeAxis} preferTimeDisplay={preferTimeDisplay} />
          </div>
        </div>
      )}
    </div>
  )
}

function HoverRow(props: {
  label: string
  colorClass: string
  chf: number
  hours?: number
  showTimeAxis: boolean
  preferTimeDisplay: boolean
}) {
  const { label, colorClass, chf, hours, showTimeAxis, preferTimeDisplay } = props
  const timeFirst = preferTimeDisplay && showTimeAxis && hours !== undefined
  return (
    <div>
      <span className="text-secondary">{label}</span>{' '}
      {timeFirst ? (
        <>
          <span className={`${colorClass} font-semibold`}>{formatHoursMinutes(hours!)}</span>
          <span className="ml-1 text-secondary">({formatCHF(chf)})</span>
        </>
      ) : (
        <>
          <span className={colorClass}>{formatCHF(chf)}</span>
          {showTimeAxis && hours !== undefined && (
            <span className="ml-1 text-secondary">({formatHoursMinutes(hours)})</span>
          )}
        </>
      )}
    </div>
  )
}
