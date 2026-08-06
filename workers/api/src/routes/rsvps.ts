import { Hono } from 'hono'
import { rsvpSettingsSchema, rsvpSubmitSchema, type RsvpListItem, type RsvpSummary } from '@vowly/types'
import { ownsInvitation } from '@vowly/utils'
import type { Env } from '../lib/env'
import { getAdmin, getClient } from '../lib/admin-session'
import { allowRsvp, requestIp } from '../lib/rate-limit'

interface InvitationRow { id: string; client_id: string; rsvp_enabled: boolean; published: boolean }
interface ClientRow { id: string; status: string }
interface RsvpRow { id: string; guest_name: string; status: 'yes' | 'no' | 'maybe'; guest_count: number; created_at: string }
const app = new Hono<{ Bindings: Env }>()

function summary(rows: Array<{ status: 'yes' | 'no' | 'maybe'; guest_count: number }>): RsvpSummary {
  return {
    total: rows.length,
    yes: rows.filter((row) => row.status === 'yes').length,
    no: rows.filter((row) => row.status === 'no').length,
    maybe: rows.filter((row) => row.status === 'maybe').length,
    guests: rows.reduce((total, row) => total + row.guest_count, 0),
  }
}

async function getRsvps(c: Parameters<typeof getClient>[0], invitationId: string) {
  const rows = await c.env.DB.prepare(
    'SELECT id, guest_name, status, guest_count, created_at FROM rsvps WHERE invitation_id = ? ORDER BY created_at DESC, id DESC',
  ).bind(invitationId).all<RsvpRow>()
  const items: RsvpListItem[] = rows.results.map((row) => ({
    id: row.id, guestName: row.guest_name, status: row.status, guestCount: row.guest_count, createdAt: row.created_at,
  }))
  return { summary: summary(rows.results), items }
}

app.post('/invitations/:slug/rsvp', async (c) => {
  const parsed = rsvpSubmitSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: { code: 'INVALID_INPUT', message: 'RSVP details are invalid.' } }, 400)
  if (parsed.data.website) return c.json({ accepted: true }, 202)

  const invitation = await c.env.DB.prepare(
    `SELECT i.id, i.client_id, i.rsvp_enabled, i.published FROM invitations i
     JOIN clients c ON c.id = i.client_id
     WHERE i.slug = ? AND i.published = 1 AND c.status != 'DELETED'`,
  ).bind(c.req.param('slug')).first<InvitationRow>()
  if (!invitation) return c.json({ error: { code: 'NOT_FOUND', message: 'Invitation not found.' } }, 404)
  if (!invitation.rsvp_enabled) return c.json({ error: { code: 'RSVP_DISABLED', message: 'RSVP is not accepting responses.' } }, 403)
  if (!await allowRsvp(c.env, `${requestIp(c.req.raw)}:${invitation.id}`)) {
    return c.json({ error: { code: 'RATE_LIMITED', message: 'Too many RSVP attempts. Please try again later.' } }, 429)
  }
  await c.env.DB.prepare(
    'INSERT INTO rsvps (id, invitation_id, guest_name, status, guest_count) VALUES (?, ?, ?, ?, ?)',
  ).bind(crypto.randomUUID(), invitation.id, parsed.data.guestName, parsed.data.status, parsed.data.guestCount).run()
  return c.json({ accepted: true }, 201)
})

async function clientInvitation(c: Parameters<typeof getClient>[0]) {
  const client = await getClient(c) as ClientRow | null
  if (!client) return { error: c.json({ error: { code: 'UNAUTHENTICATED', message: 'Client login required.' } }, 401) }
  const invitation = await c.env.DB.prepare('SELECT id, client_id, rsvp_enabled, published FROM invitations WHERE client_id = ?')
    .bind(client.id).first<InvitationRow>()
  if (!invitation || !ownsInvitation(client.id, invitation.client_id)) {
    return { error: c.json({ error: { code: 'NOT_FOUND', message: 'Invitation not found.' } }, 404) }
  }
  return { client, invitation }
}

app.get('/invitation/rsvps', async (c) => {
  const context = await clientInvitation(c)
  if ('error' in context) return context.error
  return c.json(await getRsvps(c, context.invitation.id))
})

app.patch('/invitation/rsvp', async (c) => {
  const context = await clientInvitation(c)
  if ('error' in context) return context.error
  if (context.client.status === 'READ_ONLY') return c.json({ error: { code: 'EDIT_LOCKED', message: 'This invitation is read-only.' } }, 403)
  const parsed = rsvpSettingsSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: { code: 'INVALID_INPUT', message: 'RSVP setting is invalid.' } }, 400)
  await c.env.DB.prepare('UPDATE invitations SET rsvp_enabled = ?, updated_at = ? WHERE id = ? AND client_id = ?')
    .bind(parsed.data.enabled ? 1 : 0, new Date().toISOString(), context.invitation.id, context.client.id).run()
  return c.json({ enabled: parsed.data.enabled })
})

app.get('/clients/:id/invitation/rsvps', async (c) => {
  const admin = await getAdmin(c)
  if (!admin) return c.json({ error: { code: 'UNAUTHENTICATED', message: 'Admin login required.' } }, 401)
  const invitation = await c.env.DB.prepare(
    'SELECT id, client_id, rsvp_enabled, published FROM invitations WHERE client_id = ?',
  ).bind(c.req.param('id')).first<InvitationRow>()
  if (!invitation || !ownsInvitation(c.req.param('id'), invitation.client_id)) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Invitation not found.' } }, 404)
  }
  return c.json(await getRsvps(c, invitation.id))
})

export default app
