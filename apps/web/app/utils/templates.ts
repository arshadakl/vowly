import type { TemplateId } from '@vowly/types'
import { TEMPLATE_DEFINITIONS } from '@vowly/types'

/**
 * Template registry.
 *
 * Adding a new invitation template:
 * 1. Add the id to TEMPLATE_IDS in packages/types (with definition + OG theme).
 * 2. Create the component at app/components/templates/<id>/<Id>Template.vue.
 *    It must accept a single prop: `invitation: PublicInvitation`.
 * 3. Register it below.
 *
 * The picker, preview, public page and OG renderer will pick it up automatically.
 */
export const templateComponents: Record<TemplateId, () => Promise<Component>> = {
  classic: () => import('~/components/templates/classic/ClassicTemplate.vue'),
  luxury: () => import('~/components/templates/luxury/LuxuryTemplate.vue'),
}

export const templateDefinitions = TEMPLATE_DEFINITIONS

export function resolveTemplateComponent(id: TemplateId) {
  return defineAsyncComponent(templateComponents[id])
}
