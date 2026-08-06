import { editOverrideUpdateSchema } from '@vowly/types'
import { apiError, body, requireAdmin } from '../../../../../utils/http'
import { getEnv } from '../../../../../utils/env'
export default defineEventHandler(async (event) => { await requireAdmin(event); const parsed = editOverrideUpdateSchema.safeParse(await body(event)); if (!parsed.success) apiError('INVALID_INPUT', 'Invalid edit override.', 400); const result = await getEnv(event).DB.prepare('UPDATE invitations SET edit_override = ?, updated_at = ? WHERE client_id = ?').bind(parsed.data.override, new Date().toISOString(), getRouterParam(event, 'id')).run(); if (!result.meta.changes) apiError('NOT_FOUND', 'Invitation not found.', 404); return { override: parsed.data.override } })
