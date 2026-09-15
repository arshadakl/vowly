import { generatePasscode, hashPasscode } from '@vowly/utils'
import { apiError, requireAdmin } from '../../../../utils/http'
import { getEnv } from '../../../../utils/env'
import { hashToken, revokeClientSessions } from '../../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getEnv(event).DB
  const id = getRouterParam(event, 'id')
  if (!id) apiError('INVALID_INPUT', 'Client id is required.', 400)
  const passcode = generatePasscode()
  const passcodeHash = await hashPasscode(passcode)
  const loginToken = crypto.randomUUID() + crypto.randomUUID()
  const result = await db
    .prepare('UPDATE clients SET passcode = ?, share_token = NULL, login_link_token_hash = ? WHERE id = ?')
    .bind(passcodeHash, await hashToken(loginToken), id)
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
    passcode,
    loginToken,
    status: row.status,
    weddingDate: row.wedding_date,
    weddingTz: row.wedding_tz,
    createdAt: row.created_at,
  }
})
