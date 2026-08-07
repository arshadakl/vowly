import { buildBaseSlug, resolveSlug } from '@vowly/utils'
import { editorContext } from '../../../utils/editor'
import { apiError } from '../../../utils/http'
import { getEnv } from '../../../utils/env'
export default defineEventHandler(async (event) => {
  const context = await editorContext(event)
  if (context.locked || context.client.status === 'READ_ONLY')
    apiError('EDIT_LOCKED', 'This invitation is locked after the wedding day.', 403)
  if (!context.invitation.bride_name.trim() || !context.invitation.groom_name.trim())
    apiError('INVITATION_INCOMPLETE', 'Add both names before publishing the invitation.', 400)
  if (context.invitation.published && context.invitation.slug)
    return {
      slug: context.invitation.slug,
      published: true,
      publishedAt: context.invitation.published_at,
    }
  const db = getEnv(event).DB
  const base = buildBaseSlug(
    context.invitation.bride_name,
    context.invitation.groom_name,
    context.client.wedding_date,
  )
  const publishedAt = new Date().toISOString()
  let slug = context.invitation.slug ?? ''
  let ogImageUrl = ''
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const rows = await db
      .prepare('SELECT slug FROM invitations WHERE slug IS NOT NULL')
      .all<{ slug: string }>()
    slug =
      context.invitation.slug ??
      resolveSlug(
        base,
        rows.results.map((row) => row.slug),
      )
    ogImageUrl = `${getRequestURL(event).origin}/api/public/invitations/${slug}/og.svg?v=${encodeURIComponent(publishedAt)}`
    try {
      await db
        .prepare(
          'UPDATE invitations SET slug = ?, published = 1, published_at = ?, og_image_url = ?, updated_at = ? WHERE id = ? AND client_id = ?',
        )
        .bind(slug, publishedAt, ogImageUrl, publishedAt, context.invitation.id, context.client.id)
        .run()
      return { slug, published: true, publishedAt, ogImageUrl }
    } catch {
      if (context.invitation.slug) break
    }
  }
  apiError('CONFLICT', 'Could not reserve a public invitation link. Please try again.', 409)
})
