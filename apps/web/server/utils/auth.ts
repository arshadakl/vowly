import { deleteCookie, getCookie, setCookie } from 'h3'
import type { H3Event } from 'h3'
import { getEnv } from './env'
import { ADMIN_SESSION_TTL, CLIENT_SESSION_TTL } from './constants'

export const ADMIN_SESSION_COOKIE = 'vowly_admin_session'
export const CLIENT_SESSION_COOKIE = 'vowly_client_session'
const webCrypto = globalThis.crypto

function sessionCookie(type: 'admin' | 'client') {
  return type === 'admin' ? ADMIN_SESSION_COOKIE : CLIENT_SESSION_COOKIE
}

function sessionCookieOptions(event: H3Event, maxAge: number) {
  return {
    httpOnly: true,
    secure: getRequestURL(event).protocol === 'https:',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

export async function hashToken(token: string) {
  const digest = await webCrypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function sessionSubject(event: H3Event, type: 'admin' | 'client') {
  const token = getCookie(event, sessionCookie(type))
  if (!token) return null
  const env = getEnv(event)
  const tokenHash = await hashToken(token)
  const session = await env.DB.prepare(
    "SELECT subject_id FROM sessions WHERE token_hash = ? AND subject_type = ? AND datetime(expires_at) > datetime('now')",
  )
    .bind(tokenHash, type)
    .first<{ subject_id: string }>()
  if (!session) return null
  const ttl = type === 'client' ? CLIENT_SESSION_TTL : ADMIN_SESSION_TTL
  // Refresh at most once every six hours. This avoids a D1 write for every authenticated request.
  await env.DB.prepare(
    "UPDATE sessions SET last_seen_at = datetime('now'), expires_at = ? WHERE token_hash = ? AND (last_seen_at IS NULL OR datetime(last_seen_at) < datetime('now', '-6 hours'))",
  )
    .bind(new Date(Date.now() + ttl * 1000).toISOString(), tokenHash)
    .run()
  setCookie(event, sessionCookie(type), token, sessionCookieOptions(event, ttl))
  if (type === 'admin')
    return env.DB.prepare('SELECT id, username FROM admins WHERE id = ?')
      .bind(session.subject_id)
      .first<{ id: string; username: string }>()
  return env.DB.prepare(
    'SELECT id, client_code, name, phone, status, wedding_date, wedding_tz, created_at FROM clients WHERE id = ? AND status NOT IN (?, ?)',
  )
    .bind(session.subject_id, 'DELETED', 'ARCHIVED')
    .first()
}

export async function createSession(
  event: H3Event,
  type: 'admin' | 'client',
  subjectId: string,
  ttl = type === 'client' ? CLIENT_SESSION_TTL : ADMIN_SESSION_TTL,
) {
  const token = webCrypto.randomUUID() + webCrypto.randomUUID()
  const env = getEnv(event)
  await env.DB.prepare(
    `INSERT INTO sessions (id, subject_type, subject_id, token_hash, expires_at, last_seen_at, ip, user_agent) VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?)`,
  )
    .bind(
      webCrypto.randomUUID(),
      type,
      subjectId,
      await hashToken(token),
      new Date(Date.now() + ttl * 1000).toISOString(),
      getRequestHeader(event, 'CF-Connecting-IP') ?? null,
      getRequestHeader(event, 'User-Agent') ?? null,
    )
    .run()
  setCookie(event, sessionCookie(type), token, sessionCookieOptions(event, ttl))
}

export async function revokeClientSessions(event: H3Event, clientId: string) {
  await getEnv(event)
    .DB.prepare("DELETE FROM sessions WHERE subject_type = 'client' AND subject_id = ?")
    .bind(clientId)
    .run()
}

export async function destroySession(event: H3Event, type: 'admin' | 'client') {
  const token = getCookie(event, sessionCookie(type))
  if (token)
    await getEnv(event)
      .DB.prepare('DELETE FROM sessions WHERE token_hash = ?')
      .bind(await hashToken(token))
      .run()
  deleteCookie(event, sessionCookie(type), { path: '/' })
}
