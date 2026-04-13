import { describe, expect, it } from 'vitest'
import {
  buildPath,
  buildScales,
  buildXTickIndices,
  buildYTicks,
  findCrossing,
  findNearestDay,
  xForDay,
  yForValue,
  type GeomPoint,
  type Viewport,
} from '../chartGeometry'

const VIEW: Viewport = {
  width: 720,
  height: 220,
  marginTop: 30,
  marginBottom: 40,
  marginLeft: 65,
  marginRight: 65,
}

describe('chartGeometry', () => {
  it('handles empty input gracefully', () => {
    const scales = buildScales([], VIEW)
    expect(scales.minDay).toBe(1)
    expect(scales.maxDay).toBe(1)
    expect(scales.maxY).toBe(1)
    expect(buildPath([])).toBe('')
    expect(buildXTickIndices([])).toEqual([])
    expect(findNearestDay([], 100, scales)).toBeNull()
    expect(findCrossing([], scales)).toBeNull()
  })

  it('single point degenerates cleanly', () => {
    const pts: GeomPoint[] = [{ day: 5, earned: 100, spent: 40 }]
    const scales = buildScales(pts, VIEW)
    expect(scales.minDay).toBe(5)
    expect(scales.maxDay).toBe(5)
    expect(scales.maxY).toBe(100)
    // degenerate domain → clamped to leftmost position
    expect(xForDay(scales, 5)).toBe(VIEW.marginLeft)
    expect(yForValue(scales, 100)).toBe(VIEW.marginTop)
    expect(yForValue(scales, 0)).toBe(VIEW.marginTop + scales.innerH)
    expect(buildXTickIndices(pts)).toEqual([0])
  })

  it('linear series maps endpoints to viewport extremes', () => {
    const pts: GeomPoint[] = Array.from({ length: 31 }, (_, i) => ({
      day: i + 1,
      earned: (i + 1) * 10,
      spent: (i + 1) * 5,
    }))
    const scales = buildScales(pts, VIEW)
    expect(scales.maxY).toBe(310)
    expect(xForDay(scales, 1)).toBe(VIEW.marginLeft)
    expect(xForDay(scales, 31)).toBe(VIEW.width - VIEW.marginRight)
    const midX = xForDay(scales, 16)
    expect(midX).toBeGreaterThan(VIEW.marginLeft)
    expect(midX).toBeLessThan(VIEW.width - VIEW.marginRight)

    const path = buildPath([
      { x: 0, y: 0 },
      { x: 10, y: 20 },
      { x: 30, y: 40 },
    ])
    expect(path).toBe('M 0 0 L 10 20 L 30 40')
  })

  it('buildYTicks returns count+1 rows from max down to zero', () => {
    const scales = buildScales([{ day: 1, earned: 400, spent: 200 }], VIEW)
    const ticks = buildYTicks(scales, 4)
    expect(ticks).toHaveLength(5)
    expect(ticks[0].value).toBe(400)
    expect(ticks[ticks.length - 1].value).toBe(0)
    expect(ticks[0].y).toBe(VIEW.marginTop)
    expect(ticks[ticks.length - 1].y).toBe(VIEW.marginTop + scales.innerH)
  })

  it('buildXTickIndices thins out long series to 5 ticks with endpoints', () => {
    const long = Array.from({ length: 31 }, (_, i): GeomPoint => ({
      day: i + 1,
      earned: 0,
      spent: 0,
    }))
    const idxs = buildXTickIndices(long)
    expect(idxs[0]).toBe(0)
    expect(idxs[idxs.length - 1]).toBe(long.length - 1)
    expect(idxs.length).toBeLessThanOrEqual(5)
    expect(idxs).toEqual([...idxs].sort((a, b) => a - b))
  })

  it('findNearestDay picks the closest day by x-distance', () => {
    const pts: GeomPoint[] = Array.from({ length: 5 }, (_, i) => ({
      day: i + 1,
      earned: 0,
      spent: 0,
    }))
    const scales = buildScales(pts, VIEW)
    const xDay3 = xForDay(scales, 3)
    expect(findNearestDay(pts, xDay3, scales)).toBe(3)
    expect(findNearestDay(pts, xDay3 + 5, scales)).toBe(3)
    expect(findNearestDay(pts, xForDay(scales, 1) - 100, scales)).toBe(1)
    expect(findNearestDay(pts, xForDay(scales, 5) + 100, scales)).toBe(5)
  })

  it('findCrossing detects first day where spent overtakes earned', () => {
    const pts: GeomPoint[] = [
      { day: 1, earned: 100, spent: 50 },
      { day: 2, earned: 200, spent: 150 },
      { day: 3, earned: 300, spent: 350 },
      { day: 4, earned: 400, spent: 500 },
    ]
    const scales = buildScales(pts, VIEW)
    const cross = findCrossing(pts, scales)
    expect(cross).not.toBeNull()
    // crossing happens between day 2 and day 3
    expect(cross!.x).toBeGreaterThan(xForDay(scales, 2))
    expect(cross!.x).toBeLessThan(xForDay(scales, 3))
  })

  it('findCrossing returns null when spent never overtakes earned', () => {
    const pts: GeomPoint[] = [
      { day: 1, earned: 100, spent: 10 },
      { day: 2, earned: 200, spent: 20 },
      { day: 3, earned: 300, spent: 30 },
    ]
    const scales = buildScales(pts, VIEW)
    expect(findCrossing(pts, scales)).toBeNull()
  })
})
