import type { H3Event } from 'h3'
import { createError, getQuery, readBody } from 'h3'
import { sessionSubject } from './auth'

export function apiError(code: string, message: string, statusCode: number): never {
  throw createError({ statusCode, data: { error: { code, message } }, statusMessage: message })
}
export async function body<T>(event: H3Event): Promise<T | null> {
  try {
    return await readBody<T>(event)
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode
      if (statusCode === 413) apiError('PAYLOAD_TOO_LARGE', 'Request body is too large.', 413)
      if (statusCode === 400) apiError('INVALID_INPUT', 'Request body is malformed.', 400)
    }
    return null
  }
}
export function query(event: H3Event) { return getQuery(event) }
function assertSameOrigin(event: H3Event) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(event.method)) return
  const origin = getHeader(event, 'origin')
  if (!origin) return
  if (origin !== getRequestURL(event).origin)
    apiError('CSRF_REJECTED', 'Request origin is not allowed.', 403)
}
export async function requireAdmin(event: H3Event) { assertSameOrigin(event); const value = await sessionSubject(event, 'admin'); if (!value) apiError('UNAUTHENTICATED', 'Admin login required.', 401); return value }
export async function requireClient(event: H3Event) { assertSameOrigin(event); const value = await sessionSubject(event, 'client'); if (!value) apiError('UNAUTHENTICATED', 'Client login required.', 401); return value as { id: string; status: string; wedding_date: string; wedding_tz: string } }
export function envName(event: H3Event) { const env = (event.context as H3Event['context'] & { cloudflare?: { env?: { ENVIRONMENT?: string } } }).cloudflare?.env; return env?.ENVIRONMENT ?? (process.env.NODE_ENV === 'production' ? 'production' : 'development') }
