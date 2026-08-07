import { adminLoginSchema } from '@vowly/types'
import { verifyPassword } from '@vowly/utils'
import { createSession } from '../../../utils/auth'
import { apiError, body } from '../../../utils/http'
import { getEnv } from '../../../utils/env'
import { ADMIN_SESSION_TTL } from '../../../utils/constants'

export default defineEventHandler(async (event) => {
  const parsed = adminLoginSchema.safeParse(await body(event))
  if (!parsed.success) apiError('INVALID_INPUT', 'Username and password are required.', 400)
  const admin = await getEnv(event)
    .DB.prepare('SELECT id, username, password_hash FROM admins WHERE username = ?')
    .bind(parsed.data.username)
    .first<{ id: string; username: string; password_hash: string }>()
  let matches = false
  if (admin) {
    try {
      matches = await verifyPassword(parsed.data.password, admin.password_hash)
    } catch {
      apiError('AUTH_UNAVAILABLE', 'Admin authentication is unavailable.', 500)
    }
  }
  if (!admin || !matches) apiError('INVALID_CREDENTIALS', 'Invalid username or password.', 401)
  await createSession(event, 'admin', admin.id, ADMIN_SESSION_TTL)
  return { id: admin.id, username: admin.username }
})
