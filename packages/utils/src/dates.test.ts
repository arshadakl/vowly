import { describe, expect, it } from 'vitest'
import { endOfWeddingDay, isInvitationLocked, tzOffsetMs } from './dates'

describe('tzOffsetMs', () => {
  it('returns +05:30 for Asia/Kolkata', () => {
    const offset = tzOffsetMs('Asia/Kolkata', new Date('2026-08-06T12:00:00Z'))
    expect(offset).toBe(19800000)
  })

  it('returns -05:00 for America/New_York in winter', () => {
    const offset = tzOffsetMs('America/New_York', new Date('2026-01-15T12:00:00Z'))
    expect(offset).toBe(-18000000)
  })
})

describe('endOfWeddingDay', () => {
  it('converts Asia/Kolkata end-of-day to UTC', () => {
    const end = endOfWeddingDay('2026-08-06', 'Asia/Kolkata')
    expect(end.toISOString()).toBe('2026-08-06T18:29:59.999Z')
  })

  it('handles DST edge in America/New_York', () => {
    const end = endOfWeddingDay('2026-03-08', 'America/New_York')
    expect(end.toISOString()).toBe('2026-03-09T03:59:59.999Z')
  })
})

describe('isInvitationLocked', () => {
  it('is locked after the wedding day', () => {
    expect(
      isInvitationLocked({
        weddingDate: '2026-08-06',
        timeZone: 'Asia/Kolkata',
        now: new Date('2026-08-07T00:00:00+05:30'),
      }),
    ).toBe(true)
  })

  it('is editable during the wedding day', () => {
    expect(
      isInvitationLocked({
        weddingDate: '2026-08-06',
        timeZone: 'Asia/Kolkata',
        now: new Date('2026-08-06T23:59:00+05:30'),
      }),
    ).toBe(false)
  })

  it('force_open unlocks even after the wedding', () => {
    expect(
      isInvitationLocked({
        weddingDate: '2026-08-06',
        timeZone: 'Asia/Kolkata',
        override: 'force_open',
        now: new Date('2026-09-01T00:00:00Z'),
      }),
    ).toBe(false)
  })

  it('force_locked locks even before the wedding', () => {
    expect(
      isInvitationLocked({
        weddingDate: '2030-01-01',
        timeZone: 'Asia/Kolkata',
        override: 'force_locked',
        now: new Date('2026-01-01T00:00:00Z'),
      }),
    ).toBe(true)
  })
})
