import { apiError } from '../../../utils/http'
import { getEnv } from '../../../utils/env'
import { DEFAULT_STUDIO } from '../../../utils/constants'
import { templateIdSchema } from '@vowly/types'
import { googleMapsEmbedUrl, isShortGoogleMapsLink } from '@vowly/utils'
import { cloudinaryDeliveryUrl } from '../../../utils/cloudinary'
import { readCustomization } from '../../../utils/template-customization'
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const db = getEnv(event).DB
  const row = await db
    .prepare(
      "SELECT i.*, c.wedding_date, c.wedding_tz FROM invitations i JOIN clients c ON c.id = i.client_id WHERE i.slug = ? AND i.published = 1 AND c.status = 'ACTIVE'",
    )
    .bind(slug)
    .first<{
      id: string
      bride_name: string
      groom_name: string
      slug: string
      template: string | null
      bride_parents: string | null
      groom_parents: string | null
      quote: string | null
      cover_image: string | null
      bride_image: string | null
      groom_image: string | null
      show_images: boolean
      featured_venue_event_id: string | null
      couple_image_public_id: string | null
      couple_image_version: number | null
      couple_image_format: string | null
      wedding_date: string
      wedding_tz: string
      rsvp_enabled: boolean
      og_image_url: string | null
    }>()
  if (!row) apiError('NOT_FOUND', 'Invitation not found.', 404)
  const template = templateIdSchema.safeParse(row!.template)
  if (!template.success) apiError('NOT_FOUND', 'Invitation not found.', 404)
  const events = await db
    .prepare('SELECT * FROM events WHERE invitation_id = ? ORDER BY sort_order, id')
    .bind(row!.id)
    .all<{
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
    }>()
  const customization = await readCustomization(db, row!.id, template.data)
  return {
    id: row!.id,
    brideName: row!.bride_name,
    groomName: row!.groom_name,
    brideParents: row!.bride_parents,
    groomParents: row!.groom_parents,
    slug: row!.slug,
    template: template.data,
    quote: row!.quote,
    coverImage: row!.cover_image,
    brideImage: row!.bride_image,
    groomImage: row!.groom_image,
    showImages: Boolean(row!.show_images),
    coupleImageUrl: cloudinaryDeliveryUrl(
      getEnv(event).CLOUDINARY_CLOUD_NAME,
      row!.couple_image_public_id && row!.couple_image_version && row!.couple_image_format
        ? {
            publicId: row!.couple_image_public_id,
            version: row!.couple_image_version,
            format: row!.couple_image_format,
          }
        : null,
    ),
    featuredVenueEventId: row!.featured_venue_event_id,
    weddingDate: row!.wedding_date,
    weddingTz: row!.wedding_tz,
    events: events.results.map((item) => ({
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
    rsvp: { enabled: Boolean(row!.rsvp_enabled) },
    customization,
    ogImageUrl: row!.og_image_url,
    studio: DEFAULT_STUDIO,
  }
})
