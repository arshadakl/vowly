import { rsvpSubmitSchema } from '@vowly/types'
import { apiError, body } from '../../../../utils/http'
import { getEnv } from '../../../../utils/env'
export default defineEventHandler(async (event) => {
  const parsed = rsvpSubmitSchema.safeParse(await body(event))
  if (!parsed.success) apiError('INVALID_INPUT', 'RSVP details are invalid.', 400)
  if (parsed.data.website) {
    setResponseStatus(event, 202)
    return { accepted: true }
  }
  const db = getEnv(event).DB
  const invitation = await db
    .prepare(
      "SELECT i.id, i.rsvp_enabled FROM invitations i JOIN clients c ON c.id = i.client_id WHERE i.slug = ? AND i.published = 1 AND c.status = 'ACTIVE'",
    )
    .bind(getRouterParam(event, 'slug'))
    .first<{ id: string; rsvp_enabled: boolean }>()
  if (!invitation) apiError('NOT_FOUND', 'Invitation not found.', 404)
  if (!invitation!.rsvp_enabled) apiError('RSVP_DISABLED', 'RSVP is not accepting responses.', 403)
  await db
    .prepare(
      'INSERT INTO rsvps (id, invitation_id, guest_name, status, guest_count) VALUES (?, ?, ?, ?, ?)',
    )
    .bind(
      crypto.randomUUID(),
      invitation!.id,
      parsed.data.guestName,
      parsed.data.status,
      parsed.data.guestCount,
    )
    .run()
  setResponseStatus(event, 201)
  return { accepted: true }
})
