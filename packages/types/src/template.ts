import { z } from 'zod'

export const TEMPLATE_IDS = ['classic', 'luxury'] as const
export const templateIdSchema = z.enum(TEMPLATE_IDS)
export type TemplateId = z.infer<typeof templateIdSchema>

export interface TemplateOgTheme {
  background: string
  foreground: string
  accent: string
}

export interface TemplateDefinition {
  id: TemplateId
  name: string
  description: string
  ogTheme: TemplateOgTheme
}

export const TEMPLATE_DEFINITIONS: readonly TemplateDefinition[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Timeless serif elegance with a soft ivory palette.',
    ogTheme: { background: '#faf7f2', foreground: '#2b2620', accent: '#b08d57' },
  },
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'Dark, dramatic and gold — for grand celebrations.',
    ogTheme: { background: '#14100c', foreground: '#f5ead6', accent: '#d4af37' },
  },
] as const

export function getTemplateDefinition(id: TemplateId): TemplateDefinition {
  const definition = TEMPLATE_DEFINITIONS.find((d) => d.id === id)
  if (!definition) throw new Error(`Unknown template: ${id}`)
  return definition
}
