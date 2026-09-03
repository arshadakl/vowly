import { buildIcsEvent } from '@vowly/utils'
import { apiError } from '../../../../utils/http'
import { getEnv } from '../../../../utils/env'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const row = await getEnv(event)
    .DB.prepare(
      `SELECT e.title, e.event_date, e.start_time, e.end_time, e.venue, e.address,
        c.wedding_tz, i.bride_name, i.groom_name
       FROM invitations i
       JOIN clients c ON c.id = i.client_id
       JOIN events e ON e.invitation_id = i.id
       WHERE i.slug = ? AND i.published = 1 AND i.template IS NOT NULL
         AND c.status = 'ACTIVE'
       ORDER BY e.sort_order, e.id LIMIT 1`,
    )
    .bind(slug)
    .first<{
      title: string
      event_date: string
      start_time: string | null
      end_time: string | null
      venue: string | null
      address: string | null
      wedding_tz: string
      bride_name: string
      groom_name: string
    }>()
  if (!row) apiError('NOT_FOUND', 'Invitation event not found.', 404)
  const calendar = buildIcsEvent({
    title: `${row!.title}: ${row!.bride_name} & ${row!.groom_name}`,
    date: row!.event_date,
    startTime: row!.start_time,
    endTime: row!.end_time,
    timeZone: row!.wedding_tz,
    venue: row!.venue,
    address: row!.address,
    description: 'Wedding invitation from Vowly',
  })
  setResponseHeader(event, 'Content-Type', 'text/calendar; charset=utf-8')
  setResponseHeader(event, 'Content-Disposition', 'attachment; filename="wedding-invitation.ics"')
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return calendar
})
