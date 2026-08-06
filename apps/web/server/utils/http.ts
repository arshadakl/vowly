import type { H3Event } from 'h3'
import { createError, getQuery, readBody } from 'h3'
import { getEnv } from './env'
import { sessionSubject } from './auth'

export function apiError(code: string, message: string, statusCode: number): never {
  throw createError({ statusCode, data: { error: { code, message } }, statusMessage: message })
}
export async function body<T>(event: H3Event) { return readBody<T>(event).catch(() => null) }
export function query(event: H3Event) { return getQuery(event) }
export async function requireAdmin(event: H3Event) { const value = await sessionSubject(event, 'admin'); if (!value) apiError('UNAUTHENTICATED', 'Admin login required.', 401); return value }
export async function requireClient(event: H3Event) { const value = await sessionSubject(event, 'client'); if (!value) apiError('UNAUTHENTICATED', 'Client login required.', 401); return value as { id: string; status: string; wedding_date: string; wedding_tz: string }
}
export function requestIp(event: H3Event) { return getRequestHeader(event, 'CF-Connecting-IP') ?? 'unknown' }
export async function allowRsvp(event: H3Event, key: string) {
  const kv = getEnv(event).RATE_LIMIT
  if (!kv) return true
  const storageKey = `rsvp:${key}`
  const current = await kv.get<{ count: number; resetAt: number }>(storageKey, 'json')
  const now = Date.now(); const window = current && current.resetAt > now ? current : { count: 0, resetAt: now + 60 * 60 * 1000 }
  if (window.count >= 5) return false
  window.count += 1
  await kv.put(storageKey, JSON.stringify(window), { expiration: Math.ceil(window.resetAt / 1000) })
  return true
}
export function envName(event: H3Event) { return getEnv(event).ENVIRONMENT ?? (process.env.NODE_ENV === 'production' ? 'production' : 'development') }
