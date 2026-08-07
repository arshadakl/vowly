import { apiError, requireClient } from '../../../utils/http'
import { getEnv } from '../../../utils/env'
export default defineEventHandler(async (event) => { const client = await requireClient(event); const result = await getEnv(event).DB.prepare('UPDATE invitations SET published = 0, updated_at = ? WHERE client_id = ?').bind(new Date().toISOString(), client.id).run(); if (!result.meta.changes) apiError('NOT_FOUND', 'Invitation not found.', 404); return { published: false } })
