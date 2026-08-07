import { rsvpSettingsSchema } from '@vowly/types'
import { editorContext } from '../../../utils/editor'
import { apiError, body } from '../../../utils/http'
import { getEnv } from '../../../utils/env'
export default defineEventHandler(async (event) => { const context = await editorContext(event); if (context.locked || context.client.status === 'READ_ONLY') apiError('EDIT_LOCKED', 'This invitation is locked after the wedding day.', 403); const parsed = rsvpSettingsSchema.safeParse(await body(event)); if (!parsed.success) apiError('INVALID_INPUT', 'RSVP setting is invalid.', 400); await getEnv(event).DB.prepare('UPDATE invitations SET rsvp_enabled = ?, updated_at = ? WHERE id = ? AND client_id = ?').bind(parsed.data.enabled ? 1 : 0, new Date().toISOString(), context.invitation.id, context.client.id).run(); return { enabled: parsed.data.enabled } })
