import { z } from 'zod'

export const TEMPLATE_IDS = ['floral'] as const
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
    id: 'floral',
    name: 'Floral',
    description: 'Warm ivory with gold accents and botanical charm.',
    ogTheme: { background: '#faf5ef', foreground: '#2b2620', accent: '#b08d57' },
  },
] as const

export function getTemplateDefinition(id: TemplateId): TemplateDefinition {
  const definition = TEMPLATE_DEFINITIONS.find((d) => d.id === id)
  if (!definition) throw new Error(`Unknown template: ${id}`)
  return definition
}
