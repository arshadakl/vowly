import type { PublicInvitation } from '@vowly/types'

export function makeMockInvitation(template: 'classic' | 'luxury' = 'classic'): PublicInvitation {
  return {
    id: 'inv-0001',
    brideName: 'Fathima',
    groomName: 'Arshad',
    slug: 'arshad-fathima-06-08-26',
    template,
    quote: 'Two souls, one journey, endless love.',
    coverImage: null,
    brideImage: null,
    groomImage: null,
    weddingDate: '2026-08-06',
    weddingTz: 'Asia/Kolkata',
    events: [
      {
        id: 'evt-001',
        invitationId: 'inv-0001',
        title: 'Nikah',
        eventDate: '2026-08-06',
        startTime: '10:00',
        endTime: '11:00',
        venue: 'Grand Mosque Hall',
        googleMapUrl: 'https://maps.google.com/?q=example',
        address: '123 Mosque Road, Kochi',
        notes: 'Please arrive 15 minutes early.',
        sortOrder: 0,
      },
      {
        id: 'evt-002',
        invitationId: 'inv-0001',
        title: 'Reception',
        eventDate: '2026-08-06',
        startTime: '18:30',
        endTime: '22:00',
        venue: 'The Royal Banquet',
        googleMapUrl: 'https://maps.google.com/?q=example',
        address: '456 Palace Avenue, Kochi',
        notes: null,
        sortOrder: 1,
      },
    ],
    rsvp: { enabled: true },
    ogImageUrl: null,
    studio: {
      name: 'Dream Frame Photography',
      instagram: 'dreamframe_photography',
      phone: '+919876543210',
    },
  }
}
