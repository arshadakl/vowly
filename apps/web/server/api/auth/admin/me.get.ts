import { sessionSubject } from '../../../utils/auth'
import { apiError } from '../../../utils/http'

export default defineEventHandler(async (event) => {
  const admin = await sessionSubject(event, 'admin')
  if (!admin) apiError('UNAUTHENTICATED', 'Admin login required.', 401)
  return admin
})
