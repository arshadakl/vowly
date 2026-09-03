<script setup lang="ts">
import { Check, Sparkles } from 'lucide-vue-next'
import { FONT_OPTIONS, type FontOption } from './font-utils'

defineProps<{ currentFont: string }>()
const emit = defineEmits<{ select: [fontId: string] }>()

const filter = ref('all')
const types = ['all', 'serif', 'sans', 'cursive'] as const

const filtered = computed<FontOption[]>(() =>
  filter.value === 'all' ? FONT_OPTIONS : FONT_OPTIONS.filter((f) => f.style === filter.value),
)
</script>

<template>
  <div class="space-y-4">
    <div class="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3 flex items-center gap-2.5">
      <Sparkles class="w-4 h-4 text-amber-600 shrink-0" />
      <p class="text-[11px] text-amber-800 font-medium leading-relaxed">
        Font selection applies to all text in the invitation.
      </p>
    </div>

    <div class="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
      <button
        v-for="t in types"
        :key="t"
        class="flex-1 py-2 px-3 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all"
        :class="
          filter === t
            ? 'bg-white text-emerald-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        "
        @click="filter = t"
      >
        {{ t === 'all' ? 'All' : t }}
      </button>
    </div>

    <div class="grid grid-cols-1 gap-2">
      <button
        v-for="font in filtered"
        :key="font.id"
        type="button"
        class="flex items-center gap-4 p-3.5 rounded-2xl border-2 transition-all text-left"
        :class="
          currentFont === font.id
            ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
            : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
        "
        @click="emit('select', font.id)"
      >
        <div class="flex-1 min-w-0">
          <div class="text-lg text-slate-900 truncate" :style="{ fontFamily: font.family }">
            {{ font.name }}
          </div>
          <div class="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-0.5">
            {{ font.label }} · {{ font.style }}
          </div>
        </div>
        <div
          v-if="currentFont === font.id"
          class="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0"
        >
          <Check class="w-3.5 h-3.5 text-white" />
        </div>
      </button>
    </div>
  </div>
</template>
