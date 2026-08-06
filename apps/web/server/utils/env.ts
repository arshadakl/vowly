import type { H3Event } from 'h3'
import type { D1Database } from '@cloudflare/workers-types'

export interface RuntimeEnv {
  DB: D1Database
  APP_NAME?: string
  ENVIRONMENT?: string
}

export function getEnv(event: H3Event): RuntimeEnv {
  const context = event.context as H3Event['context'] & { cloudflare?: { env?: RuntimeEnv } }
  const env = context.cloudflare?.env
  if (!env?.DB) throw new Error('Cloudflare D1 binding DB is unavailable')
  return env
}
