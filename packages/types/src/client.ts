import { z } from 'zod'
import { CLIENT_STATUSES, type ClientStatus } from './enums'
import type { TemplateId } from './template'
import { calendarDateSchema } from './date'

export function normalizePhone(value: string): string {
  return value.trim().replace(/[()\s-]/g, '')
}

export const phoneSchema = z.preprocess(
  (value) => (typeof value === 'string' ? normalizePhone(value) : value),
  z
    .string()
    .regex(
      /^\+?[1-9]\d{6,14}$/,
      'Invalid phone number. Use digits only, optionally starting with +.',
    ),
)

export const clientCreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  phone: phoneSchema,
  weddingDate: calendarDateSchema,
})

export type ClientCreate = z.infer<typeof clientCreateSchema>

export const clientUpdateSchema = clientCreateSchema.partial()

export type ClientUpdate = z.infer<typeof clientUpdateSchema>

export const clientStatusSchema = z.enum(CLIENT_STATUSES)

export const clientListQuerySchema = z.object({
  search: z.string().trim().max(80).optional().default(''),
  status: clientStatusSchema.or(z.literal('ALL')).optional().default('ACTIVE'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
})

export type ClientListQuery = z.infer<typeof clientListQuerySchema>

export const clientActionSchema = z.enum(['archive', 'delete', 'regenerate-passcode'])
export type ClientAction = z.infer<typeof clientActionSchema>

export interface Client {
  id: string
  clientCode: string
  name: string
  phone: string
  passcode: string
  status: ClientStatus
  weddingDate: string
  weddingTz: string
  createdAt: string
  invitation?: {
    created: boolean
    published: boolean
    slug: string | null
    template?: TemplateId
    publishedAt?: string | null
  }
}
