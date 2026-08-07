import { z } from 'zod'
import { EDIT_OVERRIDES, type EditOverride } from './enums'
import { templateIdSchema, type TemplateId } from './template'
import { eventInputSchema, type InvitationEvent } from './event'

export const invitationUpdateSchema = z.object({
  brideName: z.string().trim().max(60).default(''),
  groomName: z.string().trim().max(60).default(''),
  quote: z.string().trim().max(300).nullable().optional(),
  template: templateIdSchema.default('classic'),
  coverImage: z.string().max(500).nullable().optional(),
  brideImage: z.string().max(500).nullable().optional(),
  groomImage: z.string().max(500).nullable().optional(),
  showImages: z.boolean().optional(),
  rsvpEnabled: z.boolean().optional(),
  events: z.array(eventInputSchema).optional(),
})

export const editOverrideSchema = z.enum(EDIT_OVERRIDES)
export const editOverrideUpdateSchema = z.object({
  override: editOverrideSchema.nullable(),
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
  showImages: boolean
  quote: string | null
  editOverride: EditOverride | null
  rsvpEnabled: boolean
  published: boolean
  publishedAt: string | null
  ogImageUrl: string | null
  createdAt: string
  updatedAt: string
}
/**
 * The public-facing invitation data contract. This is the **only** type
 * templates receive as props. Templates must not import internal types.
 *
 * Field categories:
 * - **Identity**: `id`, `slug`, `template` — never displayed in templates
 * - **Names**: `brideName`, `groomName` — always visible, primary heading
 * - **Optional text**: `quote` — conditional (`v-if`)
 * - **Images**: `coverImage`, `brideImage`, `groomImage`, `showImages` — reserved, not yet used
 * - **Date**: `weddingDate` (YYYY-MM-DD), `weddingTz` (IANA timezone)
 * - **Events**: `events` array — can be 0..N items, each is an `InvitationEvent`
 * - **RSVP**: `rsvp.enabled` — controls RSVP form visibility
 * - **Footer**: `studio` — photography credits (name, instagram, phone)
 * - **OG**: `ogImageUrl` — social sharing image, never displayed in template
 *
 * @see docs/template-standards.md for full rendering rules
 */
export interface PublicInvitation {
  /** Internal UUID. Never display to guests. */
  id: string
  /** Bride's name. Plain text, max 60 chars. Always visible. */
  brideName: string
  /** Groom's name. Plain text, max 60 chars. Always visible. */
  groomName: string
  /** URL-safe slug for the public page. Never displayed in template. */
  slug: string
  /** Template ID. Determines which component renders. Not displayed. */
  template: TemplateId
  /** Optional quote. Max 300 chars. Display in italics with curly quotes. Conditional: `v-if`. */
  quote: string | null
  /** Hero background image URL. Reserved for future use. */
  coverImage: string | null
  /** Bride portrait URL. Reserved for future use. */
  brideImage: string | null
  /** Groom portrait URL. Reserved for future use. */
  groomImage: string | null
  /** Controls whether image sections render. Reserved for future use. */
  showImages: boolean
  /** Wedding date as YYYY-MM-DD. Display as 'MMMM D, YYYY'. Used by countdown. */
  weddingDate: string
  /** IANA timezone (e.g. 'Asia/Kolkata'). Used by CountdownTimer only. */
  weddingTz: string
  /** Array of events. Can be empty. Pre-sorted by sortOrder. See InvitationEvent. */
  events: InvitationEvent[]
  /** RSVP settings. `enabled` controls RSVP form visibility on public page. */
  rsvp: { enabled: boolean }
  /** OG social sharing image URL. Never displayed in template. */
  ogImageUrl: string | null
  /** Photography footer. Always render. instagram/phone are optional. */
  studio: {
    /** Photography studio name. Always visible. */
    name: string
    /** Instagram handle (no @). Render as https://instagram.com/{handle}. Conditional. */
    instagram: string | null
    /** E.164 phone number. Render as tel:{phone} link. Conditional. */
    phone: string | null
  }
}
