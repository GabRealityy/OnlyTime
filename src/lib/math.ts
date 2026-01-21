/*
  Small math helpers for chart scaling.
*/

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function inverseLerp(a: number, b: number, v: number): number {
  if (a === b) return 0
  return (v - a) / (b - a)
}

export function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t))
}
