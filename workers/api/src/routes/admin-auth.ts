import { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { adminLoginSchema } from '@vowly/types'
import { verifyPassword } from '@vowly/utils'
import type { Env } from '../lib/env'
import { SESSION_COOKIE, getAdmin, hashToken } from '../lib/admin-session'

const SESSION_TTL_SECONDS = 60 * 60 * 12

interface AdminRow {
  id: string
  username: string
  password_hash: string
}

const app = new Hono<{ Bindings: Env }>()

app.post('/login', async (c) => {
  const parsed = adminLoginSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'Username and password are required.' } }, 400)
  }
  const { username, password } = parsed.data

  const admin = await c.env.DB.prepare(
    'SELECT id, username, password_hash FROM admins WHERE username = ?',
  )
    .bind(username)
    .first<AdminRow>()

  let passwordMatches = false
  if (admin) {
    try {
      passwordMatches = await verifyPassword(password, admin.password_hash)
    } catch (error) {
      console.error('Admin password verification failed', error instanceof Error ? error.message : 'unknown error')
      return c.json({ error: { code: 'AUTH_UNAVAILABLE', message: 'Admin authentication is unavailable.' } }, 500)
    }
  }

  if (!admin || !passwordMatches) {
    return c.json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password.' } }, 401)
  }

  const token = crypto.randomUUID() + crypto.randomUUID()
  const tokenHash = await hashToken(token)
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString()

  await c.env.DB.prepare(
    `INSERT INTO sessions (id, subject_type, subject_id, token_hash, expires_at, last_seen_at, ip, user_agent)
     VALUES (?, 'admin', ?, ?, ?, datetime('now'), ?, ?)`,
  )
    .bind(
      crypto.randomUUID(),
      admin.id,
      tokenHash,
      expiresAt,
      c.req.header('CF-Connecting-IP') ?? null,
      c.req.header('User-Agent') ?? null,
    )
    .run()

  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: c.req.url.startsWith('https://'),
    sameSite: 'Lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  })

  return c.json({ id: admin.id, username: admin.username })
})

app.get('/me', async (c) => {
  const admin = await getAdmin(c)
  if (!admin) {
    return c.json({ error: { code: 'UNAUTHENTICATED', message: 'Admin login required.' } }, 401)
  }
  return c.json(admin)
})

app.post('/logout', async (c) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (token) {
    await c.env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await hashToken(token)).run()
  }
  deleteCookie(c, SESSION_COOKIE, { path: '/' })
  return c.json({ ok: true })
})

export default app
