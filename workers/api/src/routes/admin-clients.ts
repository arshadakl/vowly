import { Hono } from 'hono'
import { clientCreateSchema, clientListQuerySchema, clientUpdateSchema } from '@vowly/types'
import { formatClientCode, generatePasscode } from '@vowly/utils'
import type { Env } from '../lib/env'
import { getAdmin } from '../lib/admin-session'

interface ClientRow {
  id: string
  client_code: string
  name: string
  phone: string
  passcode: string
  status: 'ACTIVE' | 'READ_ONLY' | 'ARCHIVED' | 'DELETED'
  wedding_date: string
  wedding_tz: string
  created_at: string
}

const app = new Hono<{ Bindings: Env }>()

function present(row: ClientRow) {
  return {
    id: row.id,
    clientCode: row.client_code,
    name: row.name,
    phone: row.phone,
    passcode: row.passcode,
    status: row.status,
    weddingDate: row.wedding_date,
    weddingTz: row.wedding_tz,
    createdAt: row.created_at,
  }
}

async function requireAdmin(c: Parameters<typeof getAdmin>[0]) {
  const admin = await getAdmin(c)
  if (!admin) {
    return c.json({ error: { code: 'UNAUTHENTICATED', message: 'Admin login required.' } }, 401)
  }
  return null
}

app.use('*', async (c, next) => {
  const unauthorized = await requireAdmin(c)
  if (unauthorized) return unauthorized
  await next()
})

app.get('/', async (c) => {
  const parsed = clientListQuerySchema.safeParse({
    search: c.req.query('search'),
    status: c.req.query('status'),
    page: c.req.query('page'),
    pageSize: c.req.query('pageSize'),
  })
  if (!parsed.success) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'Invalid client list filters.' } }, 400)
  }

  const { search, status, page, pageSize } = parsed.data
  const like = `%${search.replace(/[\\%_]/g, '\\$&')}%`
  const filter = `WHERE ${status === 'ALL' ? '' : 'status = ? AND '}(name LIKE ? ESCAPE '\\' OR client_code LIKE ? ESCAPE '\\' OR phone LIKE ? ESCAPE '\\')`
  const filterValues = status === 'ALL' ? [like, like, like] : [status, like, like, like]
  const count = await c.env.DB.prepare(`SELECT COUNT(*) AS total FROM clients ${filter}`)
    .bind(...filterValues)
    .first<{ total: number }>()
  const stats = await c.env.DB.prepare(
    `SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active,
      SUM(CASE WHEN status = 'READ_ONLY' THEN 1 ELSE 0 END) AS read_only,
      SUM(CASE WHEN status = 'ARCHIVED' THEN 1 ELSE 0 END) AS archived,
      SUM(CASE WHEN status = 'DELETED' THEN 1 ELSE 0 END) AS deleted
     FROM clients`,
  ).first<{ total: number; active: number; read_only: number; archived: number; deleted: number }>()
  const rows = await c.env.DB.prepare(
    `SELECT id, client_code, name, phone, passcode, status, wedding_date, wedding_tz, created_at
     FROM clients ${filter} ORDER BY created_at DESC, client_code DESC LIMIT ? OFFSET ?`,
  )
    .bind(...filterValues, pageSize, (page - 1) * pageSize)
    .all<ClientRow>()

  return c.json({
    items: rows.results.map(present),
    total: count?.total ?? 0,
    page,
    pageSize,
    stats: {
      total: stats?.total ?? 0,
      active: stats?.active ?? 0,
      readOnly: stats?.read_only ?? 0,
      archived: stats?.archived ?? 0,
      deleted: stats?.deleted ?? 0,
    },
  })
})

app.get('/:id', async (c) => {
  const client = await c.env.DB.prepare('SELECT * FROM clients WHERE id = ?')
    .bind(c.req.param('id'))
    .first<ClientRow>()
  if (!client) return c.json({ error: { code: 'NOT_FOUND', message: 'Client not found.' } }, 404)
  return c.json(present(client))
})

app.post('/', async (c) => {
  const parsed = clientCreateSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'Name, phone, and wedding date are required.' } }, 400)
  }

  const latest = await c.env.DB.prepare(
    `SELECT client_code FROM clients ORDER BY CAST(SUBSTR(client_code, 4) AS INTEGER) DESC LIMIT 1`,
  ).first<{ client_code: string }>()
  const sequence = latest ? Number.parseInt(latest.client_code.slice(3), 10) + 1 : 1
  const clientCode = formatClientCode(sequence)
  let passcode = generatePasscode()
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const existing = await c.env.DB.prepare('SELECT id FROM clients WHERE passcode = ?').bind(passcode).first()
    if (!existing) break
    passcode = generatePasscode()
  }

  await c.env.DB.prepare(
    `INSERT INTO clients (id, client_code, name, phone, passcode, status, wedding_date)
     VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?)`,
  )
    .bind(crypto.randomUUID(), clientCode, parsed.data.name, parsed.data.phone, passcode, parsed.data.weddingDate)
    .run()

  const createdClient = await c.env.DB.prepare('SELECT id FROM clients WHERE client_code = ?').bind(clientCode).first<{ id: string }>()
  await c.env.DB.prepare('INSERT INTO invitations (id, client_id) VALUES (?, ?)').bind(crypto.randomUUID(), createdClient!.id).run()

  const created = await c.env.DB.prepare('SELECT * FROM clients WHERE client_code = ?')
    .bind(clientCode)
    .first<ClientRow>()
  return c.json(present(created!), 201)
})

app.patch('/:id', async (c) => {
  const parsed = clientUpdateSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return c.json({ error: { code: 'INVALID_INPUT', message: 'Provide at least one valid client field.' } }, 400)
  }
  const fields = parsed.data
  const updates: string[] = []
  const values: string[] = []
  if (fields.name !== undefined) { updates.push('name = ?'); values.push(fields.name) }
  if (fields.phone !== undefined) { updates.push('phone = ?'); values.push(fields.phone) }
  if (fields.weddingDate !== undefined) { updates.push('wedding_date = ?'); values.push(fields.weddingDate) }
  values.push(c.req.param('id'))
  const result = await c.env.DB.prepare(`UPDATE clients SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run()
  if (!result.meta.changes) return c.json({ error: { code: 'NOT_FOUND', message: 'Client not found.' } }, 404)
  const updated = await c.env.DB.prepare('SELECT * FROM clients WHERE id = ?').bind(c.req.param('id')).first<ClientRow>()
  return c.json(present(updated!))
})

async function setStatus(c: Parameters<typeof getAdmin>[0], status: 'ARCHIVED' | 'DELETED') {
  const result = await c.env.DB.prepare('UPDATE clients SET status = ? WHERE id = ?')
    .bind(status, c.req.param('id')).run()
  if (!result.meta.changes) return c.json({ error: { code: 'NOT_FOUND', message: 'Client not found.' } }, 404)
  const updated = await c.env.DB.prepare('SELECT * FROM clients WHERE id = ?').bind(c.req.param('id')).first<ClientRow>()
  return c.json(present(updated!))
}

app.post('/:id/archive', (c) => setStatus(c, 'ARCHIVED'))
app.delete('/:id', (c) => setStatus(c, 'DELETED'))

app.post('/:id/passcode', async (c) => {
  let passcode = generatePasscode()
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const existing = await c.env.DB.prepare('SELECT id FROM clients WHERE passcode = ?').bind(passcode).first()
    if (!existing) break
    passcode = generatePasscode()
  }
  const result = await c.env.DB.prepare('UPDATE clients SET passcode = ? WHERE id = ?')
    .bind(passcode, c.req.param('id')).run()
  if (!result.meta.changes) return c.json({ error: { code: 'NOT_FOUND', message: 'Client not found.' } }, 404)
  const updated = await c.env.DB.prepare('SELECT * FROM clients WHERE id = ?').bind(c.req.param('id')).first<ClientRow>()
  return c.json(present(updated!))
})

export default app
