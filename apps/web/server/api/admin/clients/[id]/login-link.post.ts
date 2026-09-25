import { apiError, requireAdmin } from '../../../../utils/http'
import { getEnv } from '../../../../utils/env'
import { hashToken } from '../../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) apiError('INVALID_INPUT', 'Client id is required.', 400)
  const loginToken = crypto.randomUUID()
  const result = await getEnv(event)
    .DB.prepare('UPDATE clients SET login_link_token_hash = ?, share_token = NULL WHERE id = ?')
    .bind(await hashToken(loginToken), id)
    .run()
  if (!result.meta.changes) apiError('NOT_FOUND', 'Client not found.', 404)
  return { loginToken }
})