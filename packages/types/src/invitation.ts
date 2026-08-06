import { z } from 'zod'
import { EDIT_OVERRIDES, type EditOverride } from './enums'
import { templateIdSchema, type TemplateId } from './template'
import { eventInputSchema, type EventInput, type InvitationEvent } from './event'

export const invitationUpdateSchema = z.object({
  brideName: z.string().trim().min(1).max(60),
  groomName: z.string().trim().min(1).max(60),
  quote: z.string().trim().max(300).nullable().optional(),
  template: templateIdSchema.default('classic'),
  coverImage: z.string().max(500).nullable().optional(),
  brideImage: z.string().max(500).nullable().optional(),
  groomImage: z.string().max(500).nullable().optional(),
  events: z.array(eventInputSchema).max(20).optional(),
})

export type InvitationUpdate = z.infer<typeof invitationUpdateSchema>

export interface Invitation {
  id: string
  clientId: string
  brideName: string
  groomName: string
  slug: string | null
  template: TemplateId
  coverImage: string | null
  brideImage: string | null
  groomImage: string | null
  quote: string | null
  editOverride: EditOverride | null
  rsvpEnabled: boolean
  published: boolean
  publishedAt: string | null
  ogImageUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface PublicInvitation {
  id: string
  brideName: string
  groomName: string
  slug: string
  template: TemplateId
  quote: string | null
  coverImage: string | null
  brideImage: string | null
  groomImage: string | null
  weddingDate: string
  weddingTz: string
  events: InvitationEvent[]
  rsvp: { enabled: boolean }
  ogImageUrl: string | null
  studio: {
    name: string
    instagram: string | null
    phone: string | null
  }
}

export { templateIdSchema, EDIT_OVERRIDES }
export type { EditOverride, TemplateId, EventInput }
