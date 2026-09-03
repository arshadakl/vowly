<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{
  open: boolean
  title?: string
}>()

const emit = defineEmits<{ close: [] }>()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <template v-if="open">
      <div class="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] animate-fadeIn" @click="emit('close')" />
      <div class="fixed bottom-0 left-0 right-0 z-[101] animate-slideUp">
        <div
          class="max-w-lg mx-auto bg-white rounded-t-3xl shadow-[0_-20px_60px_rgba(0,0,0,0.15)] max-h-[70vh] flex flex-col overflow-hidden"
        >
          <div class="px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between shrink-0">
            <h3 v-if="title" class="text-sm font-bold text-slate-900">{{ title }}</h3>
            <button
              class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors ml-auto"
              aria-label="Close panel"
              @click="emit('close')"
            >
              <X class="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div class="overflow-y-auto overscroll-contain px-5 py-4 flex-1">
            <slot />
          </div>
        </div>
      </div>
    </template>
  </Teleport>
</template>
