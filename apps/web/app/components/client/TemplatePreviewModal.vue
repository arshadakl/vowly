<script setup lang="ts">
import type { TemplateId } from '@vowly/types'
import type { EditorInvitation } from '~/types/client-wizard'
import { X, PencilLine } from 'lucide-vue-next'
import { previewInvitation } from '~/utils/template-preview'
import { templateDefinitions } from '~/utils/templates'

const props = defineProps<{
  template: TemplateId
  source: EditorInvitation | null
  opening?: boolean
}>()

const emit = defineEmits<{
  close: []
  edit: []
}>()

const definition = computed(() => templateDefinitions.find((item) => item.id === props.template))
const sample = computed(() =>
  previewInvitation(props.template, props.source, undefined, { sample: true }),
)

function closeOnEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', closeOnEscape)
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', closeOnEscape)
})
</script>

<template>
  <div
    class="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-5"
    role="dialog"
    aria-modal="true"
    :aria-label="`Preview ${definition?.name ?? 'template'}`"
  >
    <button
      type="button"
      class="absolute inset-0 cursor-default bg-black/85 backdrop-blur-md"
      aria-label="Close preview"
      @click="emit('close')"
    />

    <div
      class="relative z-10 flex h-[90vh] max-h-[820px] w-full max-w-[480px] flex-col overflow-hidden rounded-[2.75rem] border-[6px] border-stone-800 bg-stone-950 shadow-[0_30px_90px_rgba(0,0,0,0.85)] ring-1 ring-white/15 sm:rounded-[3.5rem] sm:border-[7px]"
    >
      <div
        class="mx-auto mt-2 h-3.5 w-24 shrink-0 rounded-full bg-stone-900 sm:w-28"
        aria-hidden="true"
      />
      <div
        class="flex shrink-0 items-center justify-between gap-2 border-b border-stone-800/80 px-3.5 py-2.5"
      >
        <div class="min-w-0">
          <h2 class="truncate font-display text-sm font-bold text-white sm:text-base">
            {{ definition?.name ?? 'Template Preview' }}
          </h2>
          <p class="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-emerald-300">
            Free wedding design
          </p>
        </div>
        <button
          type="button"
          class="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/5 bg-stone-800 text-stone-300 transition hover:bg-stone-700 hover:text-white"
          aria-label="Close preview"
          @click="emit('close')"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <div class="relative min-h-0 flex-1 overflow-hidden bg-[#faf8f5]">
        <div class="absolute inset-0 overflow-y-auto overscroll-contain [scrollbar-width:none]">
          <TemplateRenderer :invitation="sample" />
        </div>
      </div>

      <div class="shrink-0 border-t border-stone-800/80 bg-stone-950 px-3.5 py-3">
        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 px-4 py-3 text-xs font-extrabold tracking-wide text-stone-950 shadow-[0_8px_25px_rgba(245,158,11,0.3)] transition hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 sm:rounded-2xl sm:py-3.5 sm:text-sm"
          :disabled="!source || source.locked || opening"
          @click="emit('edit')"
        >
          <PencilLine class="h-4 w-4" />
          {{ opening ? 'Opening editor...' : 'Edit this template' }}
        </button>
      </div>
    </div>
  </div>
</template>
