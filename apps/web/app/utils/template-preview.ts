import {
  DEFAULT_TEMPLATE_CUSTOMIZATION,
  TEMPLATE_IDS,
  type PublicInvitation,
  type TemplateCustomization,
  type TemplateId,
} from '@vowly/types'
import type { EditorInvitation } from '~/types/client-wizard'

const PREVIEW_DATE_OFFSETS = [3, 4, 6, 7] as const

function formatCalendarDate(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Keep gallery previews deterministic across SSR and hydration while ensuring
 * every sample countdown is visibly active. The four offsets also keep the
 * gallery feeling varied without mutating invitation data.
 */
export function previewDateForTemplate(template: TemplateId, now = new Date()) {
  const index = Math.max(0, TEMPLATE_IDS.indexOf(template))
  const offset = PREVIEW_DATE_OFFSETS[index % PREVIEW_DATE_OFFSETS.length] ?? 3
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset)
  return formatCalendarDate(date)
}

export function previewInvitation(
  template: TemplateId,
  source?: EditorInvitation | null,
  customization?: TemplateCustomization,
  options: { sample?: boolean } = {},
): PublicInvitation {
  const sample = options.sample === true
  const date = sample
    ? previewDateForTemplate(template)
    : (source?.weddingDate ?? previewDateForTemplate(template))
  return {
    id: source?.id ?? '00000000-0000-4000-8000-000000000001',
    brideName: sample ? 'Meera' : source?.brideName || 'Ananya',
    groomName: sample ? 'Arjun' : source?.groomName || 'Arjun',
    brideParents: sample
      ? 'Daughter of Smt. Radha & Sri. K. Narayanan'
      : (source?.brideParents ?? 'Daughter of Meera & Rajan'),
    groomParents: sample
      ? 'Son of Smt. Lakshmi & Sri. R. Menon'
      : (source?.groomParents ?? 'Son of Latha & Dev'),
    slug: source?.slug ?? 'preview',
    template,
    quote: sample
      ? 'With the blessings of our families, we invite you to share in our joy.'
      : source?.quote || 'Two lives, one beautiful beginning.',
    coverImage: null,
    brideImage: null,
    groomImage: null,
    showImages: sample ? false : (source?.showImages ?? false),
    coupleImageUrl: sample ? null : (source?.coupleImageUrl ?? null),
    featuredVenueEventId: sample
      ? '00000000-0000-4000-8000-000000000002'
      : (source?.featuredVenueEventId ?? null),
    weddingDate: date,
    weddingTz: source?.weddingTz ?? 'Asia/Kolkata',
    events:
      !sample && source?.events.length
        ? source.events
        : [
            {
              id: '00000000-0000-4000-8000-000000000002',
              invitationId: source?.id ?? '00000000-0000-4000-8000-000000000001',
              title: sample ? 'Wedding Celebration' : 'Wedding Ceremony',
              eventDate: date,
              startTime: sample ? '18:30' : '10:30',
              endTime: null,
              venue: sample ? 'Grand Heritage Palace' : 'The Grand Garden',
              googleMapUrl: sample ? 'https://maps.google.com/?q=Marine+Drive+Kochi' : null,
              googleMapEmbedUrl: null,
              address: sample ? 'Marine Drive, Kochi, Kerala' : 'Kochi, Kerala',
              notes: null,
              sortOrder: 0,
            },
          ],
    rsvp: { enabled: sample ? true : (source?.rsvpEnabled ?? true) },
    customization:
      customization ??
      (!sample ? source?.customizations[template] : undefined) ??
      (!sample && source?.template === template
        ? source.customization
        : DEFAULT_TEMPLATE_CUSTOMIZATION),
    ogImageUrl: source?.ogImageUrl ?? null,
    studio: source?.studio ?? { name: 'Vowly', instagram: null, phone: null },
  }
}

export function invitationUpdateBody(invitation: EditorInvitation, template = invitation.template) {
  return {
    brideName: invitation.brideName,
    groomName: invitation.groomName,
    brideParents: invitation.brideParents,
    groomParents: invitation.groomParents,
    quote: invitation.quote,
    template,
    showImages: invitation.showImages,
    rsvpEnabled: invitation.rsvpEnabled,
    featuredVenueEventId: invitation.featuredVenueEventId,
    events: invitation.events,
  }
}
