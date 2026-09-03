import { invitationUpdateSchema } from '@vowly/types'
import { googleMapsEmbedUrl, isShortGoogleMapsLink, isValidGoogleMapsUrl } from '@vowly/utils'
import { editorContext, assertEditable, presentEditor } from '../../utils/editor'
import { apiError, body } from '../../utils/http'
import { getEnv } from '../../utils/env'
export default defineEventHandler(async (event) => {
  const context = await editorContext(event)
  assertEditable(context)
  const parsed = invitationUpdateSchema.safeParse(await body(event))
  if (!parsed.success) apiError('INVALID_INPUT', 'Invitation details are invalid.', 400)
  const input = parsed.data
  if (input.events?.some((item) => item.googleMapUrl && !isValidGoogleMapsUrl(item.googleMapUrl)))
    apiError('INVALID_INPUT', 'Google Maps links must point to Google Maps.', 400)
  const db = getEnv(event).DB
  const statements = [
    db
      .prepare(
        'UPDATE invitations SET bride_name = ?, groom_name = ?, bride_parents = ?, groom_parents = ?, quote = ?, template = COALESCE(?, template), cover_image = COALESCE(?, cover_image), bride_image = COALESCE(?, bride_image), groom_image = COALESCE(?, groom_image), show_images = COALESCE(?, show_images), rsvp_enabled = COALESCE(?, rsvp_enabled), featured_venue_event_id = ?, updated_at = ? WHERE id = ? AND client_id = ?',
      )
      .bind(
        input.brideName,
        input.groomName,
        input.brideParents ?? null,
        input.groomParents ?? null,
        input.quote ?? null,
        input.template ?? null,
        input.coverImage ?? null,
        input.brideImage ?? null,
        input.groomImage ?? null,
        input.showImages === undefined ? null : input.showImages ? 1 : 0,
        input.rsvpEnabled === undefined ? null : input.rsvpEnabled ? 1 : 0,
        input.featuredVenueEventId ?? null,
        new Date().toISOString(),
        context.invitation.id,
        context.client.id,
      ),
  ]
  if (input.events) {
    statements.push(
      db.prepare('DELETE FROM events WHERE invitation_id = ?').bind(context.invitation.id),
    )
    for (const [index, item] of input.events.entries()) {
      statements.push(
        db
          .prepare(
            'INSERT INTO events (id, invitation_id, title, event_date, start_time, end_time, venue, google_map, google_map_embed, address, notes, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          )
          .bind(
            item.id ?? crypto.randomUUID(),
            context.invitation.id,
            item.title,
            item.eventDate,
            item.startTime ?? null,
            item.endTime ?? null,
            item.venue ?? null,
            item.googleMapUrl ?? null,
            item.googleMapUrl && !isShortGoogleMapsLink(item.googleMapUrl)
              ? googleMapsEmbedUrl(item.googleMapUrl) || null
              : null,
            item.address ?? null,
            item.notes ?? null,
            item.sortOrder ?? index,
          ),
      )
    }
  }
  await db.batch(statements)
  const updated = await db
    .prepare('SELECT * FROM invitations WHERE id = ?')
    .bind(context.invitation.id)
    .first<typeof context.invitation>()
  return presentEditor(event, { ...context, invitation: updated!, locked: false })
})
