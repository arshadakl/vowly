<script setup lang="ts">
import type { TemplateTextStyle } from '@vowly/types'
import { Bold, Check, Minus, Plus } from 'lucide-vue-next'
import { useTemplateEditor } from '~/composables/useTemplateEditor'

const props = withDefaults(
  defineProps<{
    field: string
    value: string | null | undefined
    as?: string
    multiline?: boolean
    placeholder?: string
  }>(),
  { as: 'span', multiline: false, placeholder: 'Tap to edit' },
)

const editor = useTemplateEditor()
const element = ref<HTMLElement | null>(null)
const editing = ref(false)
const blockTags = new Set(['address', 'blockquote', 'div', 'h1', 'h2', 'h3', 'h4', 'p'])
const wrapperTag = computed(() => (blockTags.has(props.as) ? 'div' : 'span'))

const style = computed<TemplateTextStyle>(
  () =>
    editor?.invitation.value.customization.styles[props.field] ?? {
      sizeDelta: 0,
      bold: false,
      italic: false,
    },
)

const inlineStyle = computed(() => ({
  fontSize: style.value.sizeDelta ? `calc(1em + ${style.value.sizeDelta}px)` : undefined,
  fontWeight: style.value.bold ? '700' : undefined,
  fontStyle: style.value.italic ? 'italic' : undefined,
}))
const displayValue = computed(
  () => props.value || (editor?.editable.value ? props.placeholder : ''),
)

function start() {
  if (!editor?.editable.value || editing.value) return
  editing.value = true
  nextTick(() => {
    element.value?.focus()
    const selection = window.getSelection()
    if (!selection || !element.value) return
    const range = document.createRange()
    range.selectNodeContents(element.value)
    selection.removeAllRanges()
    selection.addRange(range)
  })
}

function commit() {
  if (!editing.value) return
  const value = element.value?.innerText.replace(/\u00a0/g, ' ').trim() ?? ''
  editing.value = false
  editor?.updateField(props.field, value)
}

function cancel() {
  if (!editing.value) return
  editing.value = false
  if (element.value) element.value.innerText = displayValue.value
}

function patchStyle(patch: Partial<TemplateTextStyle>) {
  editor?.updateStyle(props.field, { ...style.value, ...patch })
}
</script>

<template>
  <component
    :is="wrapperTag"
    class="template-editable-wrap"
    :class="{ 'is-block': wrapperTag === 'div', 'is-editing': editing }"
  >
    <span v-if="editing" class="template-editable-tools" @pointerdown.prevent.stop @click.stop>
      <button
        type="button"
        aria-label="Smaller text"
        @click="patchStyle({ sizeDelta: Math.max(-8, style.sizeDelta - 1) })"
      >
        <Minus />
      </button>
      <button
        type="button"
        aria-label="Larger text"
        @click="patchStyle({ sizeDelta: Math.min(12, style.sizeDelta + 1) })"
      >
        <Plus />
      </button>
      <button
        type="button"
        aria-label="Bold text"
        :class="{ active: style.bold }"
        @click="patchStyle({ bold: !style.bold })"
      >
        <Bold />
      </button>
      <button
        type="button"
        aria-label="Italic text"
        :class="{ active: style.italic }"
        @click="patchStyle({ italic: !style.italic })"
      >
        <em>I</em>
      </button>
      <button type="button" aria-label="Finish editing" @click="commit"><Check /></button>
    </span>
    <component
      :is="as"
      ref="element"
      class="template-editable"
      :class="{ editable: editor?.editable.value }"
      :style="inlineStyle"
      :contenteditable="editing"
      :tabindex="editor?.editable.value ? 0 : undefined"
      :title="editor?.editable.value && !editing ? 'Click to edit this text' : undefined"
      spellcheck="false"
      @click.stop="start"
      @focus="start"
      @blur="commit"
      @keydown.enter="!multiline && ($event.preventDefault(), commit())"
      @keydown.esc.prevent="cancel"
      >{{ displayValue }}</component
    >
  </component>
</template>

<style scoped>
.template-editable-wrap {
  position: relative;
  display: inline-block;
  max-width: 100%;
}
.template-editable-wrap.is-block {
  display: block;
}
.template-editable {
  white-space: pre-wrap;
  outline: none;
}
.template-editable.editable {
  cursor: text;
  border-radius: 0.4rem;
  transition:
    box-shadow 0.15s,
    background 0.15s;
}
.template-editable.editable:hover,
.is-editing .template-editable {
  background: rgb(255 255 255 / 16%);
  box-shadow: 0 0 0 2px rgb(251 191 36 / 70%);
}
.template-editable-tools {
  position: absolute;
  bottom: calc(100% + 0.45rem);
  left: 50%;
  z-index: 80;
  display: flex;
  transform: translateX(-50%);
  gap: 0.2rem;
  border-radius: 0.8rem;
  background: white;
  padding: 0.25rem;
  color: #334155;
  box-shadow: 0 10px 30px rgb(15 23 42 / 25%);
}
.template-editable-tools button {
  display: grid;
  width: 1.8rem;
  height: 1.8rem;
  place-items: center;
  border-radius: 0.55rem;
}
.template-editable-tools button:hover,
.template-editable-tools button.active {
  background: #fef3c7;
  color: #92400e;
}
.template-editable-tools :deep(svg) {
  width: 0.85rem;
  height: 0.85rem;
}
</style>
