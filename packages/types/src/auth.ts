import { z } from 'zod'
import { phoneSchema } from './client'
import { SUBJECT_TYPES } from './enums'

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1).max(60),
  password: z.string().min(1).max(200),
})

export type AdminLogin = z.infer<typeof adminLoginSchema>

export const clientLoginSchema = z.object({
  passcode: z.string().trim().regex(/^[a-hjkmnp-z2-9]{6}$/, 'Invalid passcode'),
  phone: phoneSchema,
})

export type ClientLogin = z.infer<typeof clientLoginSchema>

export const sessionSubjectSchema = z.object({
  type: z.enum(SUBJECT_TYPES),
  id: z.string().min(1),
  name: z.string().min(1),
})

export type SessionSubject = z.infer<typeof sessionSubjectSchema>
