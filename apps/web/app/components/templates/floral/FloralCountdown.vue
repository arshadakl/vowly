<script setup lang="ts">
import { countdownParts, startOfLocalDate } from '@vowly/utils'
import { ref, computed } from 'vue'
import { useIntervalFn } from '@vueuse/core'

const props = defineProps<{ target: string; timeZone?: string }>()

const now = ref(Date.now())
useIntervalFn(() => {
  now.value = Date.now()
}, 1000)

const parts = computed(() =>
  countdownParts(startOfLocalDate(props.target, props.timeZone ?? 'Asia/Kolkata'), now.value),
)
</script>

<template>
  <div class="mx-auto max-w-lg">
    <div class="rounded-2xl border border-ivory-200 bg-white px-6 pt-6 pb-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] @[640px]:px-8 @[640px]:pt-8 @[640px]:pb-6">
      <template v-if="parts.ended">
        <p class="text-center font-display text-2xl text-ink-800 @[768px]:text-3xl">
          Thank you for celebrating with us ❤️
        </p>
      </template>
      <template v-else>
        <p class="text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-ink-700/60">
          Wedding Begins In
        </p>
        <div class="mt-6 flex items-center justify-between">
          <template
            v-for="(item, index) in [
              { value: parts.days, label: 'Days' },
              { value: parts.hours, label: 'Hours' },
              { value: parts.minutes, label: 'Minutes' },
              { value: parts.seconds, label: 'Seconds' },
            ]"
            :key="item.label"
          >
            <div class="flex flex-1 flex-col items-center">
              <span class="font-playfair text-3xl font-normal text-gold-600 @[640px]:text-4xl">{{ item.value.toString().padStart(2, '0') }}</span>
              <span class="mt-1 text-[9px] uppercase tracking-widest text-ink-700/60 @[640px]:text-[10px]">{{ item.label }}</span>
            </div>
            <div v-if="index < 3" class="h-10 w-px bg-gold-500/30" />
          </template>
        </div>
        <div class="mt-5 flex justify-center @[640px]:mt-6">
          <img src="/templates/floral/timer-and-timeline-underline.png" alt="" class="h-auto w-32 object-contain opacity-70 @[640px]:w-48" />
        </div>
      </template>
    </div>
  </div>
</template>
