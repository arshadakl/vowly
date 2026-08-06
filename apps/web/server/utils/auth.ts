import { deleteCookie, getCookie, setCookie } from 'h3'
import type { H3Event } from 'h3'
import { getEnv } from './env'

export const SESSION_COOKIE = 'vowly_session'
const SESSION_TTL = 60 * 60 * 24 * 7

const webCrypto = globalThis.crypto

export async function hashToken(token: string) {
  const digest = await webCrypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function sessionSubject(event: H3Event, type: 'admin' | 'client') {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) return null
  const env = getEnv(event)
  const session = await env.DB.prepare(`SELECT subject_id FROM sessions WHERE token_hash = ? AND subject_type = ? AND expires_at > datetime('now')`).bind(await hashToken(token), type).first<{ subject_id: string }>()
  if (!session) return null
  if (type === 'admin') return env.DB.prepare('SELECT id, username FROM admins WHERE id = ?').bind(session.subject_id).first<{ id: string; username: string }>()
  return env.DB.prepare("SELECT * FROM clients WHERE id = ? AND status NOT IN ('DELETED', 'ARCHIVED')").bind(session.subject_id).first()
}

export async function createSession(event: H3Event, type: 'admin' | 'client', subjectId: string, ttl = SESSION_TTL) {
  const token = webCrypto.randomUUID() + webCrypto.randomUUID()
  const env = getEnv(event)
  await env.DB.prepare(`INSERT INTO sessions (id, subject_type, subject_id, token_hash, expires_at, last_seen_at, ip, user_agent) VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?)`).bind(webCrypto.randomUUID(), type, subjectId, await hashToken(token), new Date(Date.now() + ttl * 1000).toISOString(), getRequestHeader(event, 'CF-Connecting-IP') ?? null, getRequestHeader(event, 'User-Agent') ?? null).run()
  setCookie(event, SESSION_COOKIE, token, { httpOnly: true, secure: getRequestURL(event).protocol === 'https:', sameSite: 'lax', path: '/', maxAge: ttl })
}

export async function destroySession(event: H3Event) {
  const token = getCookie(event, SESSION_COOKIE)
  if (token) await getEnv(event).DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await hashToken(token)).run()
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}
