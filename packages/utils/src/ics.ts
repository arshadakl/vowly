import { tzOffsetMs } from './dates'

export interface IcsEventInput {
  title: string
  date: string // YYYY-MM-DD
  startTime?: string | null // HH:mm
  endTime?: string | null
  timeZone?: string
  venue?: string | null
  address?: string | null
  description?: string | null
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function formatUtcTimestamp(date: Date): string {
  return (
    `${date.getUTCFullYear()}${pad2(date.getUTCMonth() + 1)}${pad2(date.getUTCDate())}` +
    `T${pad2(date.getUTCHours())}${pad2(date.getUTCMinutes())}${pad2(date.getUTCSeconds())}Z`
  )
}

function formatUtcDate(date: Date): string {
  return `${date.getUTCFullYear()}${pad2(date.getUTCMonth() + 1)}${pad2(date.getUTCDate())}`
}

export function zonedTimeToUtc(date: string, time: string, timeZone: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  const naive = Date.UTC(year!, month! - 1, day!, hour!, minute!)
  let offset = tzOffsetMs(timeZone, new Date(naive))
  offset = tzOffsetMs(timeZone, new Date(naive - offset))
  return new Date(naive - offset)
}

function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

function buildLocation(input: IcsEventInput): string | null {
  const parts = [input.venue, input.address].filter(Boolean)
  return parts.length ? parts.join(', ') : null
}

/**
 * Build an iCalendar VEVENT string.
 * If no startTime is provided the event becomes an all-day event on `date`.
 */
export function buildIcsEvent(input: IcsEventInput): string {
  const timeZone = input.timeZone ?? 'Asia/Kolkata'
  const uid = `${escapeIcs(input.title).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}@vowly`

  let dtStart: string
  let dtEnd: string | null = null

  if (input.startTime) {
    const start = zonedTimeToUtc(input.date, input.startTime, timeZone)
    const end = input.endTime
      ? zonedTimeToUtc(input.date, input.endTime, timeZone)
      : new Date(start.getTime() + 2 * 60 * 60 * 1000)

    dtStart = `DTSTART:${formatUtcTimestamp(start)}`
    dtEnd = `DTEND:${formatUtcTimestamp(end)}`
  } else {
    const [year, month, day] = input.date.split('-').map(Number)
    const start = new Date(Date.UTC(year!, month! - 1, day!))
    const nextDay = new Date(start.getTime() + 86400000)

    dtStart = `DTSTART;VALUE=DATE:${formatUtcDate(start)}`
    dtEnd = `DTEND;VALUE=DATE:${formatUtcDate(nextDay)}`
  }

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Vowly//Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatUtcTimestamp(new Date())}`,
    `SUMMARY:${escapeIcs(input.title)}`,
    dtStart,
  ]

  if (dtEnd) lines.push(dtEnd)

  const location = buildLocation(input)
  if (location) lines.push(`LOCATION:${escapeIcs(location)}`)
  if (input.description) lines.push(`DESCRIPTION:${escapeIcs(input.description)}`)

  lines.push('END:VEVENT', 'END:VCALENDAR')
  return lines.join('\r\n')
}

function formatGcalDateTime(date: Date): string {
  return formatUtcTimestamp(date).replace(/[-:]/g, '')
}

function formatGcalDate(date: Date): string {
  return formatUtcDate(date)
}

/**
 * Build a Google Calendar "Add to calendar" URL for an event.
 */
export function googleCalendarUrl(input: IcsEventInput): string {
  const timeZone = input.timeZone ?? 'Asia/Kolkata'
  const params = new URLSearchParams({ action: 'TEMPLATE', text: input.title })

  if (input.startTime) {
    const start = zonedTimeToUtc(input.date, input.startTime, timeZone)
    const end = input.endTime
      ? zonedTimeToUtc(input.date, input.endTime, timeZone)
      : new Date(start.getTime() + 2 * 60 * 60 * 1000)

    params.set('dates', `${formatGcalDateTime(start)}/${formatGcalDateTime(end)}`)
  } else {
    const [year, month, day] = input.date.split('-').map(Number)
    const start = new Date(Date.UTC(year!, month! - 1, day!))
    const nextDay = new Date(start.getTime() + 86400000)
    params.set('dates', `${formatGcalDate(start)}/${formatGcalDate(nextDay)}`)
  }

  const location = buildLocation(input)
  if (location) params.set('location', location)
  if (input.description) params.set('details', input.description)

  // Google Calendar expects a raw `/` between start and end; URLSearchParams
  // encodes it, so we decode only that character after serialisation.
  const query = params.toString().replace(/%2F/g, '/')

  return `https://calendar.google.com/calendar/render?${query}`
}
