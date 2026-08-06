/**
 * Compute the offset of `timeZone` from UTC at a given instant.
 * Positive means the timezone is ahead of UTC.
 */
export function tzOffsetMs(timeZone: string, date: Date): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  )

  const naiveUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  )

  const instantMs = Math.floor(date.getTime() / 1000) * 1000
  return naiveUtc - instantMs
}

/**
 * Return the instant (UTC) that corresponds to 23:59:59.999 on `weddingDate`
 * in the given timezone.
 */
export function endOfWeddingDay(weddingDate: string, timeZone: string): Date {
  const [year, month, day] = weddingDate.split('-').map(Number)
  const naiveEnd = Date.UTC(year!, month! - 1, day!, 23, 59, 59, 999)

  // Two passes give an accurate result even across DST transitions.
  let offset = tzOffsetMs(timeZone, new Date(naiveEnd))
  offset = tzOffsetMs(timeZone, new Date(naiveEnd - offset))

  return new Date(naiveEnd - offset)
}

/** Convert a calendar date at local midnight into its UTC instant. */
export function startOfLocalDate(date: string, timeZone: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  const naive = Date.UTC(year!, month! - 1, day!)
  let offset = tzOffsetMs(timeZone, new Date(naive))
  offset = tzOffsetMs(timeZone, new Date(naive - offset))
  return new Date(naive - offset)
}

/**
 * Determine whether an invitation should be read-only.
 * Admin overrides always win; otherwise it is locked after the end of the
 * wedding day in the couple's timezone.
 */
export function isInvitationLocked(input: {
  weddingDate: string
  timeZone: string
  override?: 'force_open' | 'force_locked' | null
  now?: Date
}): boolean {
  if (input.override === 'force_locked') return true
  if (input.override === 'force_open') return false

  const now = input.now ?? new Date()
  return now.getTime() > endOfWeddingDay(input.weddingDate, input.timeZone).getTime()
}
