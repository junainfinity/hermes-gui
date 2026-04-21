import { describe, expect, it } from 'vitest'
import { fmtCost, fmtSecs, fmtTokens, relTime } from './fmt'

describe('relTime', () => {
  const NOW = 1_800_000_000_000

  it('says "just now" for < 45s', () => {
    expect(relTime(NOW - 30_000, NOW)).toBe('just now')
  })

  it('says "1m ago" for < 90s', () => {
    expect(relTime(NOW - 60_000, NOW)).toBe('1m ago')
  })

  it('uses minutes under an hour', () => {
    expect(relTime(NOW - 10 * 60_000, NOW)).toBe('10m ago')
  })

  it('uses hours under a day', () => {
    expect(relTime(NOW - 3 * 60 * 60_000, NOW)).toBe('3h ago')
  })

  it('says "yesterday" for < 2 days', () => {
    expect(relTime(NOW - 30 * 60 * 60_000, NOW)).toBe('yesterday')
  })

  it('uses days otherwise', () => {
    expect(relTime(NOW - 5 * 24 * 60 * 60_000, NOW)).toBe('5d ago')
  })
})

describe('fmtTokens', () => {
  it('shows bare number under 1k', () => {
    expect(fmtTokens(500)).toBe('500')
  })

  it('shows .1 precision under 10k', () => {
    expect(fmtTokens(1500)).toBe('1.5K')
  })

  it('rounds at 10k+', () => {
    expect(fmtTokens(12_400)).toBe('12K')
  })
})

describe('fmtSecs', () => {
  it('shows seconds under a minute', () => {
    expect(fmtSecs(45)).toBe('45s')
  })

  it('shows m s over a minute', () => {
    expect(fmtSecs(125)).toBe('2m 5s')
  })
})

describe('fmtCost', () => {
  it('fixes to 2 decimals with $', () => {
    expect(fmtCost(0.061)).toBe('$0.06')
    expect(fmtCost(12.345)).toBe('$12.35')
  })
})
