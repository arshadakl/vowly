import { clientListQuerySchema } from '@vowly/types'
import { apiError, query, requireAdmin } from '../../../utils/http'
import { getEnv } from '../../../utils/env'

function present(row: Record<string, unknown>) { return { id: row.id, clientCode: row.client_code, name: row.name, phone: row.phone, passcode: row.passcode, status: row.status, weddingDate: row.wedding_date, weddingTz: row.wedding_tz, createdAt: row.created_at } }
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const parsed = clientListQuerySchema.safeParse(query(event))
  if (!parsed.success) apiError('INVALID_INPUT', 'Invalid client list filters.', 400)
  const { search, status, page, pageSize } = parsed.data
  const like = `%${search.replace(/[\\%_]/g, '\\$&')}%`
  const filter = `WHERE ${status === 'ALL' ? '' : 'status = ? AND '}(name LIKE ? ESCAPE '\\' OR client_code LIKE ? ESCAPE '\\' OR phone LIKE ? ESCAPE '\\')`
  const values = status === 'ALL' ? [like, like, like] : [status, like, like, like]
  const db = getEnv(event).DB
  const count = await db.prepare(`SELECT COUNT(*) AS total FROM clients ${filter}`).bind(...values).first<{ total: number }>()
  const stats = await db.prepare("SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active, SUM(CASE WHEN status = 'READ_ONLY' THEN 1 ELSE 0 END) AS read_only, SUM(CASE WHEN status = 'ARCHIVED' THEN 1 ELSE 0 END) AS archived, SUM(CASE WHEN status = 'DELETED' THEN 1 ELSE 0 END) AS deleted FROM clients").first<{ total: number; active: number; read_only: number; archived: number; deleted: number }>()
  const rows = await db.prepare(`SELECT id, client_code, name, phone, passcode, status, wedding_date, wedding_tz, created_at FROM clients ${filter} ORDER BY created_at DESC, client_code DESC LIMIT ? OFFSET ?`).bind(...values, pageSize, (page - 1) * pageSize).all<Record<string, unknown>>()
  return { items: rows.results.map(present), total: count?.total ?? 0, page, pageSize, stats: { total: stats?.total ?? 0, active: stats?.active ?? 0, readOnly: stats?.read_only ?? 0, archived: stats?.archived ?? 0, deleted: stats?.deleted ?? 0 } }
})
