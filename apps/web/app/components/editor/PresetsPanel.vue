<script setup lang="ts">
import { Wand2, Check } from 'lucide-vue-next'
import { SECTION_PRESETS, getFontOption, type PresetOption } from './font-utils'

defineProps<{
  currentFont: string
  currentSize: number
}>()

const emit = defineEmits<{
  pick: [preset: PresetOption]
  reset: []
}>()

function activeId(font: string, size: number) {
  return SECTION_PRESETS.find((p) => p.fontFamily === font && p.fontSize === size)?.id ?? null
}
</script>

<template>
  <div class="space-y-4">
    <div class="bg-emerald-50/60 border border-emerald-200/60 rounded-2xl p-3 flex items-start gap-2.5">
      <Wand2 class="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
      <p class="text-[11px] text-emerald-800 font-medium leading-relaxed">
        One-tap makeovers for the whole invitation. Still editable afterwards.
      </p>
    </div>

    <div class="grid grid-cols-1 gap-2.5">
      <button
        v-for="p in SECTION_PRESETS"
        :key="p.id"
        type="button"
        class="w-full text-left p-3.5 rounded-2xl border-2 transition-all"
        :class="
          activeId(currentFont, currentSize) === p.id
            ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
            : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
        "
        @click="emit('pick', p)"
      >
        <div class="flex items-center gap-3">
          <span
            class="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-inner text-white/90 text-lg font-bold"
            :class="p.accent"
          >
            {{ p.name[0] }}
          </span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-[13px] font-bold text-slate-900">{{ p.name }}</span>
              <span
                v-if="activeId(currentFont, currentSize) === p.id"
                class="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider"
              >
                <Check class="w-2.5 h-2.5" /> Applied
              </span>
            </div>
            <div class="text-[11px] text-gray-500 mt-0.5">{{ p.tagline }}</div>
            <div class="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1">
              {{ getFontOption(p.fontFamily).name }} · {{ p.fontSize }}px
            </div>
          </div>
        </div>
      </button>
    </div>

    <button
      type="button"
      class="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
      @click="emit('reset')"
    >
      Reset to template defaults
    </button>
  </div>
</template>
