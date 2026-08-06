import { describe, expect, it } from 'vitest'
import { nextRateLimitWindow, ownsInvitation } from './rsvp'

describe('RSVP protections', () => {
  it('allows the limit and rejects the next request in the same window', () => {
    const first = nextRateLimitWindow(null, 1000, 2, 60_000)
    const second = nextRateLimitWindow(first.window, 1001, 2, 60_000)
    const third = nextRateLimitWindow(second.window, 1002, 2, 60_000)
    expect(first.allowed).toBe(true)
    expect(second.allowed).toBe(true)
    expect(third.allowed).toBe(false)
  })

  it('starts a new window after expiry', () => {
    const result = nextRateLimitWindow({ count: 99, resetAt: 1000 }, 1000, 2, 60_000)
    expect(result.allowed).toBe(true)
    expect(result.window.count).toBe(1)
  })

  it('requires an exact invitation owner match', () => {
    expect(ownsInvitation('client-1', 'client-1')).toBe(true)
    expect(ownsInvitation('client-1', 'client-2')).toBe(false)
    expect(ownsInvitation('', '')).toBe(false)
  })
})
