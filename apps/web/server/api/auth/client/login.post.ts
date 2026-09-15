import { clientLoginSchema } from '@vowly/types'
import { verifyPasscode } from '@vowly/utils'
import { createSession, hashToken } from '../../../utils/auth'
import { apiError, body } from '../../../utils/http'
import { getEnv } from '../../../utils/env'
import { checkRateLimit, CLIENT_AUTH_RATE_LIMIT } from '../../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  const rl = await checkRateLimit(event, CLIENT_AUTH_RATE_LIMIT)
  if (!rl.allowed) apiError('RATE_LIMITED', 'Too many attempts. Please try again later.', 429)

  const parsed = clientLoginSchema.safeParse(await body(event))
  if (!parsed.success) apiError('INVALID_INPUT', 'Passcode and phone are required.', 400)
  const db = getEnv(event).DB
  const clients = await db.prepare('SELECT id, client_code, name, phone, status, passcode, share_token, login_link_token_hash FROM clients WHERE phone = ?').bind(parsed.data.phone).all<{ id: string; client_code: string; name: string; phone: string; status: string; passcode: string; share_token: string | null; login_link_token_hash: string | null }>()
  if (clients.results.length > 1) apiError('DUPLICATE_PHONE', 'This phone number is assigned to more than one client. Please contact Lace & Looms support.', 409)
  const client = clients.results[0]
  if (!client || client.status === 'DELETED' || client.status === 'ARCHIVED') apiError('INVALID_CREDENTIALS', 'Invalid passcode or phone.', 401)
  const valid = await verifyPasscode(parsed.data.passcode, client.passcode)
  if (!valid) {
    const tokenHash = await hashToken(parsed.data.passcode)
    const hashedTokenValid = client.login_link_token_hash === tokenHash
    const legacyTokenValid = Boolean(client.share_token) && client.share_token === parsed.data.passcode
    if (!hashedTokenValid && !legacyTokenValid)
      apiError('INVALID_CREDENTIALS', 'Invalid passcode or phone.', 401)
    if (legacyTokenValid)
      await db.prepare('UPDATE clients SET login_link_token_hash = ?, share_token = NULL WHERE id = ?').bind(tokenHash, client.id).run()
  }
  await createSession(event, 'client', client.id)
  return { id: client.id, clientCode: client.client_code, name: client.name, status: client.status }
})
