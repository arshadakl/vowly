import { z } from 'zod'
import { RSVP_STATUSES, type RsvpStatus } from './enums'

export const rsvpSubmitSchema = z.object({
  guestName: z.string().trim().min(1).max(80),
  status: z.enum(RSVP_STATUSES),
  guestCount: z.number().int().min(1).max(20).default(1),
  website: z.string().optional(), // honeypot — bots fill this in; handler returns fake success
})

export const rsvpSettingsSchema = z.object({
  enabled: z.boolean(),
})

export type RsvpSubmit = z.infer<typeof rsvpSubmitSchema>

export interface RsvpRecord extends RsvpSubmit {
  id: string
  invitationId: string
  createdAt: string
}

export interface RsvpSummary {
  total: number
  yes: number
  no: number
  maybe: number
  guests: number
}

export interface RsvpListItem {
  id: string
  guestName: string
  status: RsvpStatus
  guestCount: number
  createdAt: string
}
