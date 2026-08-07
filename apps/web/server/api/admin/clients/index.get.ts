import { clientListQuerySchema } from '@vowly/types'
import { apiError, query, requireAdmin } from '../../../utils/http'
import { getEnv } from '../../../utils/env'

function present(row: Record<string, unknown>) {
  return {
    id: row.id, clientCode: row.client_code, name: row.name, phone: row.phone, passcode: row.passcode, status: row.status,
    weddingDate: row.wedding_date, weddingTz: row.wedding_tz, createdAt: row.created_at,
    invitation: {
      created: Boolean(row.invitation_id),
      published: Boolean(row.invitation_published),
      slug: row.invitation_slug ?? null,
    },
  }
}
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const parsed = clientListQuerySchema.safeParse(query(event))
  if (!parsed.success) apiError('INVALID_INPUT', 'Invalid client list filters.', 400)
  const { search, status, page, pageSize } = parsed.data
  const like = `%${search.replace(/[\\%_]/g, '\\$&')}%`
  const filter = `WHERE ${status === 'ALL' ? '' : 'c.status = ? AND '}(c.name LIKE ? ESCAPE '\\' OR c.client_code LIKE ? ESCAPE '\\' OR c.phone LIKE ? ESCAPE '\\')`
  const values = status === 'ALL' ? [like, like, like] : [status, like, like, like]
  const db = getEnv(event).DB
  const count = await db.prepare(`SELECT COUNT(*) AS total FROM clients c ${filter}`).bind(...values).first<{ total: number }>()
  const stats = await db.prepare("SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active, SUM(CASE WHEN status = 'READ_ONLY' THEN 1 ELSE 0 END) AS read_only, SUM(CASE WHEN status = 'ARCHIVED' THEN 1 ELSE 0 END) AS archived, SUM(CASE WHEN status = 'DELETED' THEN 1 ELSE 0 END) AS deleted FROM clients").first<{ total: number; active: number; read_only: number; archived: number; deleted: number }>()
  const rows = await db.prepare(`SELECT c.id, c.client_code, c.name, c.phone, c.passcode, c.status, c.wedding_date, c.wedding_tz, c.created_at, i.id AS invitation_id, i.published AS invitation_published, i.slug AS invitation_slug FROM clients c LEFT JOIN invitations i ON i.client_id = c.id ${filter} ORDER BY c.created_at DESC, c.client_code DESC LIMIT ? OFFSET ?`).bind(...values, pageSize, (page - 1) * pageSize).all<Record<string, unknown>>()
  return { items: rows.results.map(present), total: count?.total ?? 0, page, pageSize, stats: { total: stats?.total ?? 0, active: stats?.active ?? 0, readOnly: stats?.read_only ?? 0, archived: stats?.archived ?? 0, deleted: stats?.deleted ?? 0 } }
})
