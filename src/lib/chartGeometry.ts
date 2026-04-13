import { clamp01, inverseLerp, lerp } from './math'

export type GeomPoint = {
  day: number
  earned: number
  spent: number
}

export type Viewport = {
  width: number
  height: number
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number
}

export type Scales = {
  minDay: number
  maxDay: number
  maxY: number
  viewport: Viewport
  innerW: number
  innerH: number
}

export function buildScales(points: GeomPoint[], viewport: Viewport): Scales {
  const innerW = Math.max(1, viewport.width - viewport.marginLeft - viewport.marginRight)
  const innerH = Math.max(1, viewport.height - viewport.marginTop - viewport.marginBottom)
  const minDay = points[0]?.day ?? 1
  const maxDay = points[points.length - 1]?.day ?? 1
  const maxY = Math.max(1, ...points.map((p) => Math.max(p.earned, p.spent)))
  return { minDay, maxDay, maxY, viewport, innerW, innerH }
}

export function xForDay(scales: Scales, day: number): number {
  const t = clamp01(inverseLerp(scales.minDay, scales.maxDay, day))
  return scales.viewport.marginLeft + t * scales.innerW
}

export function yForValue(scales: Scales, value: number): number {
  const t = clamp01(inverseLerp(0, scales.maxY, value))
  return scales.viewport.marginTop + (1 - t) * scales.innerH
}

export function buildPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return ''
  const [first, ...rest] = points
  return `M ${first.x} ${first.y} ${rest.map((p) => `L ${p.x} ${p.y}`).join(' ')}`
}

export type TickRow = {
  y: number
  value: number
}

export function buildYTicks(scales: Scales, count: number): TickRow[] {
  const rows: TickRow[] = []
  for (let i = 0; i <= count; i++) {
    const t = i / count
    rows.push({
      y: scales.viewport.marginTop + scales.innerH * t,
      value: scales.maxY * (1 - t),
    })
  }
  return rows
}

export function buildXTickIndices(points: GeomPoint[]): number[] {
  const n = points.length
  if (n <= 0) return []
  if (n === 1) return [0]
  if (n <= 8) return Array.from({ length: n }, (_, i) => i)
  const steps = 4
  const idxs = [
    0,
    ...Array.from({ length: steps - 1 }, (_, i) => Math.round(((i + 1) * (n - 1)) / steps)),
    n - 1,
  ]
  return Array.from(new Set(idxs)).filter((i) => i >= 0 && i < n)
}

export function findNearestDay(
  points: GeomPoint[],
  mouseX: number,
  scales: Scales,
): number | null {
  let closestDay: number | null = null
  let minDist = Infinity
  for (const pt of points) {
    const dist = Math.abs(mouseX - xForDay(scales, pt.day))
    if (dist < minDist) {
      minDist = dist
      closestDay = pt.day
    }
  }
  return closestDay
}

export function findCrossing(
  points: GeomPoint[],
  scales: Scales,
): { x: number; y: number } | null {
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const cur = points[i]
    const prevDiff = prev.spent - prev.earned
    const curDiff = cur.spent - cur.earned
    if (prevDiff <= 0 && curDiff > 0) {
      const t = clamp01(prevDiff / (prevDiff - curDiff))
      const x = lerp(xForDay(scales, prev.day), xForDay(scales, cur.day), t)
      const earnedAt = lerp(prev.earned, cur.earned, t)
      const y = yForValue(scales, earnedAt)
      return { x, y }
    }
  }
  return null
}
