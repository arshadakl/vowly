<script setup lang="ts">
import { defineAsyncComponent, type Component } from 'vue'
import type { PublicInvitation, TemplateId, TemplateTextStyle } from '@vowly/types'
import { templateEditorKey } from '~/composables/useTemplateEditor'
import { templateComponents } from '~/utils/templates'

const props = withDefaults(defineProps<{ invitation: PublicInvitation; editable?: boolean }>(), {
  editable: false,
})
const emit = defineEmits<{
  field: [field: string, value: string]
  style: [field: string, style: TemplateTextStyle]
}>()

const invitationRef = toRef(props, 'invitation')
const editableRef = toRef(props, 'editable')
const asyncComponents = {} as Record<TemplateId, Component>
for (const id of Object.keys(templateComponents) as TemplateId[]) {
  asyncComponents[id] = defineAsyncComponent(templateComponents[id])
}
const component = computed(() => asyncComponents[props.invitation.template])

provide(templateEditorKey, {
  invitation: invitationRef,
  editable: editableRef,
  updateField: (field, value) => emit('field', field, value),
  updateStyle: (field, style) => emit('style', field, style),
})
</script>

<template>
  <component :is="component" :invitation="invitation" />
</template>
