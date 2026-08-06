import { Hono } from 'hono'
import type { Context } from 'hono'
import { invitationUpdateSchema, type EventInput } from '@vowly/types'
import { isInvitationLocked } from '@vowly/utils'
import type { Env } from '../lib/env'
import { getClient } from '../lib/admin-session'

interface ClientRow {
  id: string
  wedding_date: string
  wedding_tz: string
  status: string
}
interface InvitationRow {
  id: string
  client_id: string
  bride_name: string
  groom_name: string
  slug: string | null
  template: 'classic' | 'luxury'
  cover_image: string | null
  bride_image: string | null
  groom_image: string | null
  quote: string | null
  edit_override: 'force_open' | 'force_locked' | null
  rsvp_enabled: boolean
  published: boolean
  published_at: string | null
  og_image_url: string | null
  created_at: string
  updated_at: string
}
interface EventRow {
  id: string
  invitation_id: string
  title: string
  event_date: string
  start_time: string | null
  end_time: string | null
  venue: string | null
  google_map: string | null
  address: string | null
  notes: string | null
  sort_order: number
}

interface EditorContext {
  client: ClientRow
  invitation: InvitationRow
  locked: boolean
}
type EditorContextType = Context<{ Bindings: Env; Variables: { editorContext: EditorContext } }>
const app = new Hono<{ Bindings: Env; Variables: { editorContext: EditorContext } }>()

async function context(c: EditorContextType) {
  const client = await getClient(c as unknown as Parameters<typeof getClient>[0]) as ClientRow | null
  if (!client) return { error: c.json({ error: { code: 'UNAUTHENTICATED', message: 'Client login required.' } }, 401) }
  const invitation = await c.env.DB.prepare('SELECT * FROM invitations WHERE client_id = ?').bind(client.id).first<InvitationRow>()
  if (!invitation) return { error: c.json({ error: { code: 'NOT_FOUND', message: 'Invitation not found.' } }, 404) }
  const locked = isInvitationLocked({ weddingDate: client.wedding_date, timeZone: client.wedding_tz, override: invitation.edit_override })
  return { client, invitation, locked }
}

function present(invitation: InvitationRow, client: ClientRow, events: EventRow[], locked: boolean) {
  return {
    id: invitation.id, clientId: invitation.client_id, brideName: invitation.bride_name, groomName: invitation.groom_name,
    slug: invitation.slug, template: invitation.template, coverImage: invitation.cover_image, brideImage: invitation.bride_image,
    groomImage: invitation.groom_image, quote: invitation.quote, editOverride: invitation.edit_override,
    rsvpEnabled: invitation.rsvp_enabled, published: invitation.published, publishedAt: invitation.published_at,
    ogImageUrl: invitation.og_image_url, createdAt: invitation.created_at, updatedAt: invitation.updated_at,
    weddingDate: client.wedding_date, weddingTz: client.wedding_tz, locked,
    events: events.sort((a, b) => a.sort_order - b.sort_order).map((event) => ({
      id: event.id, invitationId: event.invitation_id, title: event.title, eventDate: event.event_date,
      startTime: event.start_time, endTime: event.end_time, venue: event.venue, googleMapUrl: event.google_map,
      address: event.address, notes: event.notes, sortOrder: event.sort_order,
    })),
  }
}

async function load(c: EditorContextType, invitation: InvitationRow, client: ClientRow, locked: boolean) {
  const rows = await c.env.DB.prepare('SELECT * FROM events WHERE invitation_id = ? ORDER BY sort_order, id').bind(invitation.id).all<EventRow>()
  return present(invitation, client, rows.results, locked)
}

app.use('*', async (c, next) => {
  const result = await context(c)
  if ('error' in result) return result.error
  c.set('editorContext', result)
  await next()
})

app.get('/invitation', async (c) => {
  const { client, invitation, locked } = c.get('editorContext')
  return c.json(await load(c, invitation, client, locked))
})

app.put('/invitation', async (c) => {
  const { client, invitation, locked } = c.get('editorContext')
  if (locked || client.status === 'READ_ONLY') return c.json({ error: { code: 'EDIT_LOCKED', message: 'This invitation is locked after the wedding day.' } }, 403)
  const parsed = invitationUpdateSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: { code: 'INVALID_INPUT', message: 'Invitation details are invalid.' } }, 400)
  const input = parsed.data
  const now = new Date().toISOString()
  const statements = [c.env.DB.prepare(
    `UPDATE invitations SET bride_name = ?, groom_name = ?, quote = ?, template = ?, cover_image = ?, bride_image = ?, groom_image = ?, rsvp_enabled = COALESCE(?, rsvp_enabled), updated_at = ? WHERE id = ? AND client_id = ?`,
  ).bind(input.brideName, input.groomName, input.quote ?? null, input.template, input.coverImage ?? null, input.brideImage ?? null, input.groomImage ?? null, input.rsvpEnabled === undefined ? null : input.rsvpEnabled ? 1 : 0, now, invitation.id, client.id)]
  if (input.events) {
    statements.push(c.env.DB.prepare('DELETE FROM events WHERE invitation_id = ?').bind(invitation.id))
    for (const [index, event] of input.events.entries()) {
      const item = event as EventInput
      statements.push(c.env.DB.prepare(
        `INSERT INTO events (id, invitation_id, title, event_date, start_time, end_time, venue, google_map, address, notes, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(crypto.randomUUID(), invitation.id, item.title, item.eventDate, item.startTime ?? null, item.endTime ?? null, item.venue ?? null, item.googleMapUrl ?? null, item.address ?? null, item.notes ?? null, item.sortOrder ?? index))
    }
  }
  await c.env.DB.batch(statements)
  const updated = await c.env.DB.prepare('SELECT * FROM invitations WHERE id = ?').bind(invitation.id).first<InvitationRow>()
  return c.json(await load(c, updated!, client, false))
})

app.post('/uploads/:clientId/:name', async (c) => {
  const { client, locked } = c.get('editorContext')
  if (locked || client.status === 'READ_ONLY') return c.json({ error: { code: 'EDIT_LOCKED', message: 'This invitation is locked.' } }, 403)
  if (c.req.param('clientId') !== client.id) return c.json({ error: { code: 'FORBIDDEN', message: 'Invalid upload owner.' } }, 403)
  const name = c.req.param('name')
  if (!/^[a-f0-9-]{36}\.(jpg|jpeg|png|webp)$/i.test(name)) return c.json({ error: { code: 'INVALID_INPUT', message: 'Invalid image key.' } }, 400)
  const contentType = c.req.header('Content-Type') ?? ''
  const length = Number(c.req.header('Content-Length') ?? 0)
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(contentType) || length > 5 * 1024 * 1024) return c.json({ error: { code: 'INVALID_IMAGE', message: 'Use a JPEG, PNG, or WebP image up to 5 MB.' } }, 400)
  const data = await c.req.arrayBuffer()
  if (data.byteLength > 5 * 1024 * 1024) return c.json({ error: { code: 'INVALID_IMAGE', message: 'Image must be 5 MB or smaller.' } }, 400)
  await c.env.MEDIA.put(`clients/${client.id}/${name}`, data, { httpMetadata: { contentType } })
  return c.json({ key: `clients/${client.id}/${name}` })
})

app.post('/uploads', async (c) => {
  const { client, locked } = c.get('editorContext')
  if (locked || client.status === 'READ_ONLY') return c.json({ error: { code: 'EDIT_LOCKED', message: 'This invitation is locked.' } }, 403)
  const body = await c.req.json().catch(() => null) as { field?: string; contentType?: string } | null
  if (!body || !['coverImage', 'brideImage', 'groomImage'].includes(body.field ?? '') || !['image/jpeg', 'image/png', 'image/webp'].includes(body.contentType ?? '')) return c.json({ error: { code: 'INVALID_IMAGE', message: 'Invalid image type or field.' } }, 400)
  const extension = body.contentType === 'image/png' ? 'png' : body.contentType === 'image/webp' ? 'webp' : 'jpg'
  const name = `${crypto.randomUUID()}.${extension}`
  return c.json({ key: `clients/${client.id}/${name}`, uploadUrl: `/api/client/uploads/${client.id}/${name}`, contentType: body.contentType })
})

export default app
