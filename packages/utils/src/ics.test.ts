import { describe, expect, it } from 'vitest'
import { buildIcsEvent, googleCalendarUrl, zonedTimeToUtc } from './ics'

describe('zonedTimeToUtc', () => {
  it('converts IST to UTC', () => {
    const utc = zonedTimeToUtc('2026-08-06', '18:30', 'Asia/Kolkata')
    expect(utc.toISOString()).toBe('2026-08-06T13:00:00.000Z')
  })
})

describe('buildIcsEvent', () => {
  it('contains the event title', () => {
    const ics = buildIcsEvent({ title: 'Reception', date: '2026-08-06', startTime: '18:30' })
    expect(ics).toContain('SUMMARY:Reception')
    expect(ics).toContain('DTSTART:20260806T130000Z')
  })

  it('escapes commas and newlines', () => {
    const ics = buildIcsEvent({
      title: 'Party, big party',
      date: '2026-08-06',
      startTime: '18:30',
      description: 'Line one\nLine two',
    })
    expect(ics).toContain('SUMMARY:Party\\, big party')
    expect(ics).toContain('DESCRIPTION:Line one\\nLine two')
  })

  it('defaults to a 2-hour event when end time is missing', () => {
    const ics = buildIcsEvent({ title: 'Dinner', date: '2026-08-06', startTime: '19:00' })
    expect(ics).toContain('DTEND:20260806T153000Z')
  })

  it('handles all-day events', () => {
    const ics = buildIcsEvent({ title: 'Haldi', date: '2026-08-06' })
    expect(ics).toContain('DTSTART;VALUE=DATE:20260806')
  })
})

describe('googleCalendarUrl', () => {
  it('includes encoded dates', () => {
    const url = googleCalendarUrl({ title: 'Nikah', date: '2026-08-06', startTime: '10:00' })
    expect(url).toContain('text=Nikah')
    expect(url).toContain('dates=20260806T043000Z/20260806T063000Z')
  })
})
