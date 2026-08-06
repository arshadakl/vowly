import { Hono } from 'hono'
import { buildBaseSlug, isInvitationLocked, resolveSlug } from '@vowly/utils'
import { editOverrideUpdateSchema } from '@vowly/types'
import type { Env } from '../lib/env'
import { getAdmin, getClient } from '../lib/admin-session'

interface ClientRow { id: string; wedding_date: string; wedding_tz: string; status: string }
interface InvitationRow {
  id: string; client_id: string; bride_name: string; groom_name: string; slug: string | null
  published: boolean; published_at: string | null; edit_override: 'force_open' | 'force_locked' | null
}

const app = new Hono<{ Bindings: Env }>()

async function publish(c: Parameters<typeof getClient>[0], invitation: InvitationRow, client: ClientRow) {
  if (isInvitationLocked({ weddingDate: client.wedding_date, timeZone: client.wedding_tz, override: invitation.edit_override }) || client.status === 'READ_ONLY') {
    return c.json({ error: { code: 'EDIT_LOCKED', message: 'This invitation is locked.' } }, 403)
  }
  if (invitation.published && invitation.slug) return c.json({ slug: invitation.slug, published: true, publishedAt: invitation.published_at })
  if (invitation.slug) {
    const publishedAt = new Date().toISOString()
    const ogImageUrl = `${new URL(c.req.url).origin}/api/public/invitations/${invitation.slug}/og.svg?v=${encodeURIComponent(publishedAt)}`
    await c.env.DB.prepare('UPDATE invitations SET published = 1, published_at = ?, og_image_url = ?, updated_at = ? WHERE id = ? AND client_id = ?').bind(publishedAt, ogImageUrl, publishedAt, invitation.id, client.id).run()
    return c.json({ slug: invitation.slug, published: true, publishedAt, ogImageUrl })
  }

  const base = buildBaseSlug(invitation.bride_name, invitation.groom_name, client.wedding_date)
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slugs = await c.env.DB.prepare('SELECT slug FROM invitations WHERE slug IS NOT NULL').all<{ slug: string }>()
    const slug = resolveSlug(base, slugs.results.map((row) => row.slug))
    const publishedAt = new Date().toISOString()
    const ogImageUrl = `${new URL(c.req.url).origin}/api/public/invitations/${slug}/og.svg?v=${encodeURIComponent(publishedAt)}`
    try {
      await c.env.DB.batch([
        c.env.DB.prepare('UPDATE invitations SET slug = ?, published = 1, published_at = ?, og_image_url = ?, updated_at = ? WHERE id = ? AND client_id = ?').bind(slug, publishedAt, ogImageUrl, publishedAt, invitation.id, client.id),
      ])
      return c.json({ slug, published: true, publishedAt, ogImageUrl })
    } catch (error: unknown) {
      if (attempt === 4) throw error
    }
  }
  throw new Error('Could not publish invitation')
}

app.post('/invitation/publish', async (c) => {
  const client = await getClient(c)
  if (!client) return c.json({ error: { code: 'UNAUTHENTICATED', message: 'Client login required.' } }, 401)
  const clientRow = client as unknown as ClientRow
  const invitation = await c.env.DB.prepare('SELECT * FROM invitations WHERE client_id = ?').bind(clientRow.id).first<InvitationRow>()
  if (!invitation) return c.json({ error: { code: 'NOT_FOUND', message: 'Invitation not found.' } }, 404)
  return publish(c, invitation, clientRow)
})

app.post('/invitation/unpublish', async (c) => {
  const client = await getClient(c)
  if (!client) return c.json({ error: { code: 'UNAUTHENTICATED', message: 'Client login required.' } }, 401)
  const result = await c.env.DB.prepare('UPDATE invitations SET published = 0, updated_at = ? WHERE client_id = ?').bind(new Date().toISOString(), (client as unknown as ClientRow).id).run()
  if (!result.meta.changes) return c.json({ error: { code: 'NOT_FOUND', message: 'Invitation not found.' } }, 404)
  return c.json({ published: false })
})

app.post('/clients/:id/invitation/override', async (c) => {
  const admin = await getAdmin(c)
  if (!admin) return c.json({ error: { code: 'UNAUTHENTICATED', message: 'Admin login required.' } }, 401)
  const parsed = editOverrideUpdateSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: { code: 'INVALID_INPUT', message: 'Invalid edit override.' } }, 400)
  const result = await c.env.DB.prepare('UPDATE invitations SET edit_override = ?, updated_at = ? WHERE client_id = ?').bind(parsed.data.override, new Date().toISOString(), c.req.param('id')).run()
  if (!result.meta.changes) return c.json({ error: { code: 'NOT_FOUND', message: 'Invitation not found.' } }, 404)
  return c.json({ override: parsed.data.override })
})

export default app
