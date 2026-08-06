import { Hono } from 'hono'
import type { Env } from '../lib/env'

interface Row { id: string; bride_name: string; groom_name: string; slug: string; template: 'classic' | 'luxury'; quote: string | null; cover_image: string | null; bride_image: string | null; groom_image: string | null; wedding_date: string; wedding_tz: string; rsvp_enabled: boolean; og_image_url: string | null }
interface EventRow { id: string; invitation_id: string; title: string; event_date: string; start_time: string | null; end_time: string | null; venue: string | null; google_map: string | null; address: string | null; notes: string | null; sort_order: number }
const app = new Hono<{ Bindings: Env }>()

function escapeXml(value: string) { return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!) }

app.get('/invitations/:slug/og.svg', async (c) => {
  const row = await c.env.DB.prepare('SELECT bride_name, groom_name, template FROM invitations WHERE slug = ? AND published = 1').bind(c.req.param('slug')).first<{ bride_name: string; groom_name: string; template: string }>()
  if (!row) return c.notFound()
  const dark = row.template === 'luxury'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="${dark ? '#14100c' : '#faf7f2'}"/><text x="600" y="250" text-anchor="middle" fill="${dark ? '#f5ead6' : '#2b2620'}" font-family="Georgia,serif" font-size="64">${escapeXml(row.bride_name)} &amp; ${escapeXml(row.groom_name)}</text><text x="600" y="340" text-anchor="middle" fill="${dark ? '#d4af37' : '#b08d57'}" font-family="Arial,sans-serif" font-size="22" letter-spacing="8">WEDDING INVITATION</text><text x="600" y="520" text-anchor="middle" fill="${dark ? '#f5ead6' : '#2b2620'}" font-family="Arial,sans-serif" font-size="18">VOWLY</text></svg>`
  return c.body(svg, 200, { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' })
})

app.get('/invitations/:slug', async (c) => {
  const row = await c.env.DB.prepare(`SELECT i.*, c.wedding_date, c.wedding_tz FROM invitations i JOIN clients c ON c.id = i.client_id WHERE i.slug = ? AND i.published = 1 AND c.status != 'DELETED'`).bind(c.req.param('slug')).first<Row>()
  if (!row) return c.json({ error: { code: 'NOT_FOUND', message: 'Invitation not found.' } }, 404)
  const events = await c.env.DB.prepare('SELECT * FROM events WHERE invitation_id = ? ORDER BY sort_order, id').bind(row.id).all<EventRow>()
  return c.json({ id: row.id, brideName: row.bride_name, groomName: row.groom_name, slug: row.slug, template: row.template, quote: row.quote, coverImage: row.cover_image, brideImage: row.bride_image, groomImage: row.groom_image, weddingDate: row.wedding_date, weddingTz: row.wedding_tz, events: events.results.map((event) => ({ id: event.id, invitationId: event.invitation_id, title: event.title, eventDate: event.event_date, startTime: event.start_time, endTime: event.end_time, venue: event.venue, googleMapUrl: event.google_map, address: event.address, notes: event.notes, sortOrder: event.sort_order })), rsvp: { enabled: Boolean(row.rsvp_enabled) }, ogImageUrl: row.og_image_url, studio: { name: 'Vowly', instagram: null, phone: null } })
})

export default app
