import { z } from 'zod'

export const googleMapsResolveSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1)
    .max(2000)
    .url()
    .refine(
      (url) => {
        try {
          return ['http:', 'https:'].includes(new URL(url).protocol)
        } catch {
          return false
        }
      },
      {
        message: 'Only HTTP URLs are supported',
      },
    ),
})

export type GoogleMapsResolveInput = z.infer<typeof googleMapsResolveSchema>
