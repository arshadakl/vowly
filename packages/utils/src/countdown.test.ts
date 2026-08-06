import { describe, expect, it } from 'vitest'
import { countdownParts } from './countdown'

describe('countdownParts', () => {
  it('returns zero when the target has passed', () => {
    expect(countdownParts('2020-01-01T00:00:00Z', '2025-01-01T00:00:00Z')).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      ended: true,
    })
  })

  it('computes all units correctly', () => {
    const now = new Date('2026-08-01T00:00:00Z').getTime()
    const target = now + (2 * 86400 + 5 * 3600 + 17 * 60 + 42) * 1000
    expect(countdownParts(target, now)).toEqual({
      days: 2,
      hours: 5,
      minutes: 17,
      seconds: 42,
      ended: false,
    })
  })
})
