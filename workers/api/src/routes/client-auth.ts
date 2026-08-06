import { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { clientLoginSchema } from '@vowly/types'
import type { Env } from '../lib/env'
import { SESSION_COOKIE, getClient, hashToken } from '../lib/admin-session'

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7
interface ClientRow { id: string; client_code: string; name: string; phone: string; status: string }
const app = new Hono<{ Bindings: Env }>()

app.post('/login', async (c) => {
  const parsed = clientLoginSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: { code: 'INVALID_INPUT', message: 'Passcode and phone are required.' } }, 400)
  const client = await c.env.DB.prepare(
    'SELECT id, client_code, name, phone, status FROM clients WHERE passcode = ? AND phone = ?',
  ).bind(parsed.data.passcode, parsed.data.phone).first<ClientRow>()
  if (!client || client.status === 'DELETED' || client.status === 'ARCHIVED') {
    return c.json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid passcode or phone.' } }, 401)
  }
  const token = crypto.randomUUID() + crypto.randomUUID()
  await c.env.DB.prepare(
    `INSERT INTO sessions (id, subject_type, subject_id, token_hash, expires_at, last_seen_at, ip, user_agent)
     VALUES (?, 'client', ?, ?, ?, datetime('now'), ?, ?)`,
  ).bind(crypto.randomUUID(), client.id, await hashToken(token), new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString(), c.req.header('CF-Connecting-IP') ?? null, c.req.header('User-Agent') ?? null).run()
  setCookie(c, SESSION_COOKIE, token, { httpOnly: true, secure: c.req.url.startsWith('https://'), sameSite: 'Lax', path: '/', maxAge: SESSION_TTL_SECONDS })
  return c.json({ id: client.id, clientCode: client.client_code, name: client.name, status: client.status })
})

app.get('/me', async (c) => {
  const client = await getClient(c)
  if (!client) return c.json({ error: { code: 'UNAUTHENTICATED', message: 'Client login required.' } }, 401)
  return c.json(client)
})

app.post('/logout', async (c) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (token) await c.env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await hashToken(token)).run()
  deleteCookie(c, SESSION_COOKIE, { path: '/' })
  return c.json({ ok: true })
})

export default app
