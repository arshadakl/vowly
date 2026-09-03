<script setup lang="ts">
import { FONT_SIZES } from './font-utils'

const props = defineProps<{ currentSize: number }>()
const emit = defineEmits<{ change: [size: number] }>()

const minSize = 12
const maxSize = 26

function getLabel(sz: number) {
  if (sz <= 14) return 'Small (S)'
  if (sz <= 16) return 'Medium (M)'
  if (sz <= 18) return 'Large (L)'
  if (sz <= 20) return 'Extra Large (XL)'
  return 'Display (XXL)'
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <p class="text-[11px] uppercase tracking-widest text-gray-400 font-bold">
        Adjust text size for editable fields
      </p>
      <span
        class="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full"
      >
        {{ getLabel(currentSize) }} · {{ Math.round((currentSize / 14) * 100) }}%
      </span>
    </div>

    <div class="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100/80">
      <div
        class="text-slate-900 font-medium leading-snug transition-all duration-200"
        :style="{ fontSize: `${currentSize}px` }"
      >
        {{ currentSize }}px — Preview Text Size
      </div>
      <p class="text-[10px] text-gray-400 mt-1">
        Applies to all editable invitation texts (Names, Dates, Venue, Family &amp; Quotes)
      </p>
    </div>

    <div class="grid grid-cols-5 gap-1.5 sm:gap-2">
      <button
        v-for="size in FONT_SIZES"
        :key="size.value"
        type="button"
        class="py-2.5 sm:py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-0.5 cursor-pointer"
        :class="
          currentSize === size.value
            ? 'border-emerald-500 bg-emerald-50/60 text-emerald-600 shadow-sm scale-[1.02]'
            : 'border-gray-100 bg-white hover:border-gray-200 text-gray-600'
        "
        @click="emit('change', size.value)"
      >
        <span
          class="text-[12px] sm:text-[13px] font-black"
          :class="currentSize === size.value ? 'text-emerald-600' : 'text-gray-800'"
        >
          {{ size.label }}
        </span>
        <span class="text-[9px] text-gray-400 font-semibold">{{ size.value }}px</span>
      </button>
    </div>

    <div class="px-1 pt-1">
      <div class="flex items-center justify-between mb-1.5 text-xs text-gray-500 font-medium">
        <span>Fine-tune Slider</span>
        <span class="font-bold text-slate-900">{{ currentSize }}px</span>
      </div>
      <input
        type="range"
        :min="minSize"
        :max="maxSize"
        :value="currentSize"
        class="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200 accent-emerald-500"
        @input="emit('change', Number(($event.target as HTMLInputElement).value))"
      />
      <div class="flex justify-between mt-1 text-[10px] text-gray-400 font-semibold">
        <span>{{ minSize }}px (S)</span>
        <span>14px (Default)</span>
        <span>{{ maxSize }}px (XXL)</span>
      </div>
    </div>
  </div>
</template>
