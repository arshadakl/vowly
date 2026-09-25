import type { H3Event } from 'h3'
import { getEnv } from './env'

export interface RateLimitConfig {
  windowMs: number
  max: number
  keyPrefix: string
}

function clientIp(event: H3Event) {
  // Cloudflare controls this header; unlike X-Forwarded-For it cannot be spoofed by callers.
  return getHeader(event, 'CF-Connecting-IP') ?? 'unknown'
}

export async function checkRateLimit(
  event: H3Event,
  config: RateLimitConfig,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now()
  const resetAt = new Date(now + config.windowMs).toISOString()
  const key = `${config.keyPrefix}:${clientIp(event)}`
  const db = getEnv(event).DB
  try {
    await db.prepare(
      `INSERT INTO rate_limit_buckets (bucket_key, count, reset_at, updated_at)
       VALUES (?, 1, ?, datetime('now'))
       ON CONFLICT(bucket_key) DO UPDATE SET
         count = CASE WHEN datetime(rate_limit_buckets.reset_at) <= datetime('now') THEN 1 ELSE rate_limit_buckets.count + 1 END,
         reset_at = CASE WHEN datetime(rate_limit_buckets.reset_at) <= datetime('now') THEN excluded.reset_at ELSE rate_limit_buckets.reset_at END,
         updated_at = datetime('now')`,
    ).bind(key, resetAt).run()
    const entry = await db.prepare('SELECT count, reset_at FROM rate_limit_buckets WHERE bucket_key = ?').bind(key).first<{ count: number; reset_at: string }>()
    const count = entry?.count ?? config.max + 1
    return {
      allowed: count <= config.max,
      remaining: Math.max(0, config.max - count),
      resetAt: entry ? Date.parse(entry.reset_at) : now + config.windowMs,
    }
  } catch (error) {
    console.error('Rate limit check failed, failing open:', error)
    return { allowed: true, remaining: 0, resetAt: now + config.windowMs }
  }
}

export const ADMIN_AUTH_RATE_LIMIT: RateLimitConfig = { windowMs: 15 * 60 * 1000, max: 10, keyPrefix: 'admin-auth' }
export const CLIENT_AUTH_RATE_LIMIT: RateLimitConfig = { windowMs: 15 * 60 * 1000, max: 10, keyPrefix: 'client-auth' }
export const RSVP_RATE_LIMIT: RateLimitConfig = { windowMs: 60 * 1000, max: 5, keyPrefix: 'rsvp' }
export const MAPS_RATE_LIMIT: RateLimitConfig = { windowMs: 60 * 1000, max: 20, keyPrefix: 'maps' }
export const MEDIA_RATE_LIMIT: RateLimitConfig = { windowMs: 60 * 1000, max: 30, keyPrefix: 'media' }
