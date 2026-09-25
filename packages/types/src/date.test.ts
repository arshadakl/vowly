import { describe, expect, it } from 'vitest'
import { ianaTimeZoneSchema } from './date'

describe('ianaTimeZoneSchema', () => {
  it('accepts known IANA timezones', () => {
    expect(ianaTimeZoneSchema.safeParse('Asia/Kolkata').success).toBe(true)
    expect(ianaTimeZoneSchema.safeParse('America/New_York').success).toBe(true)
    expect(ianaTimeZoneSchema.safeParse('UTC').success).toBe(true)
  })

  it('rejects unknown or malformed timezones', () => {
    expect(ianaTimeZoneSchema.safeParse('Not/AZone').success).toBe(false)
    expect(ianaTimeZoneSchema.safeParse('').success).toBe(false)
    expect(ianaTimeZoneSchema.safeParse('UTC+5:30').success).toBe(false)
  })
})