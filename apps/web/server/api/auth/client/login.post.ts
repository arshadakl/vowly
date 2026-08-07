import { clientLoginSchema } from '@vowly/types'
import { createSession } from '../../../utils/auth'
import { apiError, body } from '../../../utils/http'
import { getEnv } from '../../../utils/env'

export default defineEventHandler(async (event) => {
  const parsed = clientLoginSchema.safeParse(await body(event))
  if (!parsed.success) apiError('INVALID_INPUT', 'Passcode and phone are required.', 400)
  const client = await getEnv(event).DB.prepare('SELECT id, client_code, name, phone, status FROM clients WHERE passcode = ? AND phone = ?').bind(parsed.data.passcode, parsed.data.phone).first<{ id: string; client_code: string; name: string; phone: string; status: string }>()
  if (!client || client.status === 'DELETED' || client.status === 'ARCHIVED') apiError('INVALID_CREDENTIALS', 'Invalid passcode or phone.', 401)
  await createSession(event, 'client', client.id)
  return { id: client.id, clientCode: client.client_code, name: client.name, status: client.status }
})
