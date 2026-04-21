/**
 * Small formatters used across the UI. Kept framework-free so they can be
 * unit tested directly.
 */

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

export function relTime(ts: number, now: number = Date.now()): string {
  const d = now - ts
  if (d < 45_000) return 'just now'
  if (d < 90_000) return '1m ago'
  if (d < HOUR) return `${Math.floor(d / MIN).toString()}m ago`
  if (d < DAY) return `${Math.floor(d / HOUR).toString()}h ago`
  if (d < 2 * DAY) return 'yesterday'
  return `${Math.floor(d / DAY).toString()}d ago`
}

export function fmtTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n > 10_000 ? 0 : 1)}K`
  return n.toString()
}

export function fmtSecs(s: number): string {
  if (s < 60) return `${s.toString()}s`
  const m = Math.floor(s / 60)
  return `${m.toString()}m ${(s % 60).toString()}s`
}

export function fmtCost(n: number): string {
  return `$${n.toFixed(2)}`
}
