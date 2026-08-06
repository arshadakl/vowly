import { z } from 'zod'

export const eventInputSchema = z.object({
  title: z.string().trim().min(1).max(80),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD'),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullable()
    .optional(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullable()
    .optional(),
  venue: z.string().trim().max(120).nullable().optional(),
  googleMapUrl: z.string().url().max(500).nullable().optional(),
  address: z.string().trim().max(500).nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
})

export type EventInput = z.infer<typeof eventInputSchema>

export interface InvitationEvent extends EventInput {
  id: string
  invitationId: string
}
