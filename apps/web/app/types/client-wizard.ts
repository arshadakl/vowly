import type { PublicInvitation, TemplateCustomization, TemplateId } from '@vowly/types'

export interface EditorInvitation extends Omit<PublicInvitation, 'slug' | 'template'> {
  slug: string | null
  template: TemplateId | null
  clientId: string
  editOverride: 'force_open' | 'force_locked' | null
  locked: boolean
  published: boolean
  rsvpEnabled: boolean
  customizations: Partial<Record<TemplateId, TemplateCustomization>>
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
