import { apiError, requireAdmin } from '../../../../../utils/http'
import { getEnv } from '../../../../../utils/env'
import { rsvpData } from '../../../../../utils/rsvps'
export default defineEventHandler(async (event) => { await requireAdmin(event); const id = getRouterParam(event, 'id')!; const invitation = await getEnv(event).DB.prepare('SELECT id FROM invitations WHERE client_id = ?').bind(id).first<{ id: string }>(); if (!invitation) apiError('NOT_FOUND', 'Invitation not found.', 404); return rsvpData(event, invitation!.id) })
