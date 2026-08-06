import { sessionSubject } from '../../../utils/auth'
import { apiError } from '../../../utils/http'

export default defineEventHandler(async (event) => { const client = await sessionSubject(event, 'client'); if (!client) apiError('UNAUTHENTICATED', 'Client login required.', 401); return client })
