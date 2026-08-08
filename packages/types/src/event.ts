import { z } from 'zod'
import { calendarDateSchema, timeSchema } from './date'

export const eventInputSchema = z
  .object({
    title: z.string().trim().min(1).max(80),
    eventDate: calendarDateSchema,
    startTime: timeSchema.nullable().optional(),
    endTime: timeSchema.nullable().optional(),
    venue: z.string().trim().max(120).nullable().optional(),
    googleMapUrl: z.string().url().max(500).nullable().optional(),
    googleMapEmbedUrl: z.string().max(1000).nullable().optional(),
    address: z.string().trim().max(500).nullable().optional(),
    notes: z.string().trim().max(1000).nullable().optional(),
    sortOrder: z.number().int().min(0).default(0),
  })
  .superRefine((event, context) => {
    if (event.startTime && event.endTime && event.endTime < event.startTime) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endTime'],
        message: 'End time must not be earlier than start time',
      })
    }
  })

export type EventInput = z.infer<typeof eventInputSchema>

/**
 * A single wedding event (e.g. ceremony, reception, mehndi).
 *
 * Templates receive an array of these via `invitation.events`.
 * The array can be empty (0 items). Events arrive pre-sorted by `sortOrder`.
 *
 * Required fields: `title`, `eventDate`, `sortOrder`
 * Optional fields: `startTime`, `endTime`, `venue`, `googleMapUrl`, `googleMapEmbedUrl`, `address`, `notes`
 * Internal fields: `id`, `invitationId` — never display to guests.
 *
 * Date format: `YYYY-MM-DD`. Display as `'MMMM D, YYYY'`.
 * Time format: `HH:MM` (24-hour). Display with ` · ` and ` – ` separators.
 * Google Maps: Use `@vowly/utils` functions, never raw URL handling.
 *
 * @see docs/template-standards.md for full rendering rules
 */
export interface InvitationEvent extends EventInput {
  /** Internal UUID. Never display to guests. */
  id: string
  /** Internal FK to invitation. Never display to guests. */
  invitationId: string
}
