import { generatePasscode } from '@vowly/utils'
import { apiError, requireAdmin } from '../../../../utils/http'
import { getEnv } from '../../../../utils/env'
import { revokeClientSessions } from '../../../../utils/auth'
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getEnv(event).DB
  const id = getRouterParam(event, 'id')
  if (!id) apiError('INVALID_INPUT', 'Client id is required.', 400)
  let passcode = generatePasscode()
  for (let attempt = 0; attempt < 5; attempt += 1) {
    if (!(await db.prepare('SELECT id FROM clients WHERE passcode = ?').bind(passcode).first()))
      break
    passcode = generatePasscode()
  }
  const collision = await db
    .prepare('SELECT id FROM clients WHERE passcode = ?')
    .bind(passcode)
    .first()
  if (collision)
    apiError('INTERNAL', 'Could not generate a unique passcode. Please try again.', 500)
  const result = await db
    .prepare('UPDATE clients SET passcode = ? WHERE id = ?')
    .bind(passcode, id)
    .run()
  if (!result.meta.changes) apiError('NOT_FOUND', 'Client not found.', 404)
  await revokeClientSessions(event, id)
  const row = await db
    .prepare('SELECT * FROM clients WHERE id = ?')
    .bind(id)
    .first<Record<string, unknown>>()
  if (!row) apiError('NOT_FOUND', 'Client not found.', 404)
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
})
