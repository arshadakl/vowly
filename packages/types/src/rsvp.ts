import { z } from 'zod'
import { RSVP_STATUSES, type RsvpStatus } from './enums'

export const rsvpSubmitSchema = z.object({
  guestName: z.string().trim().min(1).max(80),
  status: z.enum(RSVP_STATUSES),
  guestCount: z.number().int().min(1).max(20).default(1),
  website: z.string().max(0).optional(), // honeypot — must stay empty
})

export type RsvpSubmit = z.infer<typeof rsvpSubmitSchema>

export interface RsvpRecord extends RsvpSubmit {
  id: string
  invitationId: string
  createdAt: string
}

export { RSVP_STATUSES }
export type { RsvpStatus }
