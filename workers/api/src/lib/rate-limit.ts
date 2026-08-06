import { nextRateLimitWindow, type RateLimitWindow } from '@vowly/utils'
import type { Env } from './env'

const RSVP_LIMIT = 5
const RSVP_WINDOW_MS = 60 * 60 * 1000

export async function allowRsvp(env: Env, key: string, now = Date.now()): Promise<boolean> {
  const storageKey = `rsvp:${key}`
  const current = await env.RATE_LIMIT.get<RateLimitWindow>(storageKey, 'json')
  const result = nextRateLimitWindow(current, now, RSVP_LIMIT, RSVP_WINDOW_MS)
  await env.RATE_LIMIT.put(storageKey, JSON.stringify(result.window), {
    expiration: Math.ceil(result.window.resetAt / 1000),
  })
  return result.allowed
}

export function requestIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP') ?? 'unknown'
}
