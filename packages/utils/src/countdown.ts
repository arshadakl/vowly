export interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
  ended: boolean
}

/**
 * Break the difference between a target instant and now into days/hours/minutes/seconds.
 * `target` is any Date, ISO string or millisecond timestamp.
 */
export function countdownParts(
  target: Date | string | number,
  now: Date | string | number = new Date(),
): CountdownParts {
  const targetMs = typeof target === 'number' ? target : new Date(target).getTime()
  const nowMs = typeof now === 'number' ? now : new Date(now).getTime()
  const diff = targetMs - nowMs

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true }
  }

  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds, ended: false }
}
