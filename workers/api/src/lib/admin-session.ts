import { getCookie } from 'hono/cookie'
import type { Context } from 'hono'
import type { Env } from './env'

export const SESSION_COOKIE = 'vowly_session'

interface SessionRow {
  subject_id: string
}

export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function getAdmin(c: Context<{ Bindings: Env }>) {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) return null

  const session = await c.env.DB.prepare(
    `SELECT subject_id FROM sessions
     WHERE token_hash = ? AND subject_type = 'admin' AND expires_at > datetime('now')`,
  )
    .bind(await hashToken(token))
    .first<SessionRow>()

  if (!session) return null

  return c.env.DB.prepare('SELECT id, username FROM admins WHERE id = ?')
    .bind(session.subject_id)
    .first<{ id: string; username: string }>()
}
