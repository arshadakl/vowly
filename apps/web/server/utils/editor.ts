import { googleMapsEmbedUrl, isInvitationLocked, isShortGoogleMapsLink } from '@vowly/utils'
import { templateIdSchema, DEFAULT_TEMPLATE_CUSTOMIZATION } from '@vowly/types'
import { getEnv } from './env'
import { apiError, requireClient } from './http'
import { cloudinaryDeliveryUrl } from './cloudinary'
import { readCustomizations } from './template-customization'
import type { H3Event } from 'h3'

interface InvitationDbRow {
  id: string
  client_id: string
  bride_name: string
  groom_name: string
  slug: string | null
  template: string | null
  bride_parents: string | null
  groom_parents: string | null
  cover_image: string | null
  bride_image: string | null
  groom_image: string | null
  show_images: boolean
  quote: string | null
  edit_override: 'force_open' | 'force_locked' | null
  rsvp_enabled: boolean
  featured_venue_event_id: string | null
  couple_image_asset_id: string | null
  couple_image_public_id: string | null
  couple_image_version: number | null
  couple_image_format: string | null
  couple_image_width: number | null
  couple_image_height: number | null
  published: boolean
  published_at: string | null
  og_image_url: string | null
  created_at: string
  updated_at: string
}
interface EventDbRow {
  id: string
  invitation_id: string
  title: string
  event_date: string
  start_time: string | null
  end_time: string | null
  venue: string | null
  google_map: string | null
  google_map_embed: string | null
  address: string | null
  notes: string | null
  sort_order: number
}

export async function editorContext(event: H3Event) {
  const client = await requireClient(event)
  const invitation = await getEnv(event)
    .DB.prepare('SELECT * FROM invitations WHERE client_id = ?')
    .bind(client.id)
    .first<InvitationDbRow>()
  if (!invitation) apiError('NOT_FOUND', 'Invitation not found.', 404)
  return {
    client,
    invitation: invitation!,
    locked: isInvitationLocked({
      weddingDate: client.wedding_date,
      timeZone: client.wedding_tz,
      override: invitation!.edit_override,
    }),
  }
}

export async function presentEditor(
  event: H3Event,
  context: Awaited<ReturnType<typeof editorContext>>,
) {
  const env = getEnv(event)
  const rows = await env.DB.prepare(
    'SELECT * FROM events WHERE invitation_id = ? ORDER BY sort_order, id',
  )
    .bind(context.invitation.id)
    .all<EventDbRow>()
  const customizations = await readCustomizations(env.DB, context.invitation.id)
  const templateResult = templateIdSchema.safeParse(context.invitation.template)
  const template = templateResult.success ? templateResult.data : null
  const coupleImageUrl = cloudinaryDeliveryUrl(
    env.CLOUDINARY_CLOUD_NAME,
    context.invitation.couple_image_public_id &&
      context.invitation.couple_image_version &&
      context.invitation.couple_image_format
      ? {
          publicId: context.invitation.couple_image_public_id,
          version: context.invitation.couple_image_version,
          format: context.invitation.couple_image_format,
        }
      : null,
  )
  return {
    id: context.invitation.id,
    clientId: context.invitation.client_id,
    brideName: context.invitation.bride_name,
    groomName: context.invitation.groom_name,
    brideParents: context.invitation.bride_parents,
    groomParents: context.invitation.groom_parents,
    slug: context.invitation.slug,
    template,
    coverImage: context.invitation.cover_image,
    brideImage: context.invitation.bride_image,
    groomImage: context.invitation.groom_image,
    showImages: Boolean(context.invitation.show_images),
    coupleImageUrl,
    quote: context.invitation.quote,
    editOverride: context.invitation.edit_override,
    rsvpEnabled: Boolean(context.invitation.rsvp_enabled),
    rsvp: { enabled: Boolean(context.invitation.rsvp_enabled) },
    customization: template
      ? (customizations[template] ?? DEFAULT_TEMPLATE_CUSTOMIZATION)
      : DEFAULT_TEMPLATE_CUSTOMIZATION,
    customizations,
    featuredVenueEventId: context.invitation.featured_venue_event_id,
    published: Boolean(context.invitation.published),
    publishedAt: context.invitation.published_at,
    ogImageUrl: context.invitation.og_image_url,
    createdAt: context.invitation.created_at,
    updatedAt: context.invitation.updated_at,
    weddingDate: context.client.wedding_date,
    weddingTz: context.client.wedding_tz,
    locked: context.locked,
    studio: { name: 'Vowly', instagram: null, phone: null },
    events: rows.results.map((item) => ({
      id: item.id,
      invitationId: item.invitation_id,
      title: item.title,
      eventDate: item.event_date,
      startTime: item.start_time,
      endTime: item.end_time,
      venue: item.venue,
      googleMapUrl: item.google_map,
      googleMapEmbedUrl:
        item.google_map && !isShortGoogleMapsLink(item.google_map)
          ? googleMapsEmbedUrl(item.google_map) || null
          : null,
      address: item.address,
      notes: item.notes,
      sortOrder: item.sort_order,
    })),
  }
}

export function assertEditable(context: Awaited<ReturnType<typeof editorContext>>) {
  if (context.locked || context.client.status === 'READ_ONLY')
    apiError('EDIT_LOCKED', 'This invitation is locked after the wedding day.', 403)
}
