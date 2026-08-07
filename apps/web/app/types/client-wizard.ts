import type { PublicInvitation } from '@vowly/types'

export type ClientWizardStep = 1 | 2 | 3 | 4

export interface EditorInvitation extends Omit<PublicInvitation, 'slug'> {
  slug: string | null
  clientId: string
  editOverride: 'force_open' | 'force_locked' | null
  locked: boolean
  published: boolean
  rsvpEnabled: boolean
}

export interface RsvpData {
  summary: { total: number; yes: number; no: number; maybe: number; guests: number }
  items: Array<{
    id: string
    guestName: string
    status: string
    guestCount: number
    createdAt: string
  }>
}
