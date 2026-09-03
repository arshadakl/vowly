import type { InjectionKey, Ref } from 'vue'
import type { PublicInvitation, TemplateTextStyle } from '@vowly/types'

export interface TemplateEditorContext {
  invitation: Ref<PublicInvitation>
  editable: Ref<boolean>
  updateField: (field: string, value: string) => void
  updateStyle: (field: string, style: TemplateTextStyle) => void
}

export const templateEditorKey: InjectionKey<TemplateEditorContext> = Symbol('template-editor')

export function useTemplateEditor(): TemplateEditorContext | null {
  return inject(templateEditorKey, null)
}
