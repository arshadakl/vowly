<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { countdownParts, startOfLocalDate } from '@vowly/utils'
import { ref, computed } from 'vue'
import { useIntervalFn } from '@vueuse/core'

const props = defineProps<{ invitation: PublicInvitation }>()

const now = ref(Date.now())
useIntervalFn(() => {
  now.value = Date.now()
}, 1000)

const parts = computed(() =>
  countdownParts(startOfLocalDate(props.invitation.weddingDate, props.invitation.weddingTz), now.value),
)
</script>

<template>
  <section class="py-12 @md:py-16 text-center fade-in-up" style="animation-delay: 0.2s;">
    <p class="text-xs @md:text-sm @lg:text-base tracking-[0.2em] uppercase font-serif-cinzel mb-6 text-gold-200">The Celebration Begins In</p>
    <div class="ornament mb-8 text-gold-400 text-sm @md:text-base">
         ✿
    </div>
    
    <div v-if="!parts.ended" class="flex justify-center items-center gap-4 @md:gap-12 @lg:gap-16 text-gold-400 font-serif-cinzel">
      <div class="flex flex-col items-center">
        <span class="text-4xl @md:text-6xl @lg:text-7xl font-semibold">{{ parts.days }}</span>
        <span class="text-[9px] @md:text-[11px] @lg:text-xs tracking-widest mt-2 @md:mt-4 text-gold-200">DAYS</span>
      </div>
      <span class="text-2xl @md:text-4xl text-gold-400/30 mb-4 @md:mb-6 font-light">|</span>
      <div class="flex flex-col items-center">
        <span class="text-4xl @md:text-6xl @lg:text-7xl font-semibold">{{ parts.hours }}</span>
        <span class="text-[9px] @md:text-[11px] @lg:text-xs tracking-widest mt-2 @md:mt-4 text-gold-200">HOURS</span>
      </div>
      <span class="text-2xl @md:text-4xl text-gold-400/30 mb-4 @md:mb-6 font-light">|</span>
      <div class="flex flex-col items-center">
        <span class="text-4xl @md:text-6xl @lg:text-7xl font-semibold">{{ parts.minutes }}</span>
        <span class="text-[9px] @md:text-[11px] @lg:text-xs tracking-widest mt-2 @md:mt-4 text-gold-200">MINUTES</span>
      </div>
      <span class="text-2xl @md:text-4xl text-gold-400/30 mb-4 @md:mb-6 font-light">|</span>
      <div class="flex flex-col items-center">
        <span class="text-4xl @md:text-6xl @lg:text-7xl font-semibold">{{ parts.seconds }}</span>
        <span class="text-[9px] @md:text-[11px] @lg:text-xs tracking-widest mt-2 @md:mt-4 text-gold-200">SECONDS</span>
      </div>
    </div>
    <div v-else class="text-center font-serif-cinzel mt-4">
      <p class="text-3xl text-gold-400">Happily Ever After</p>
    </div>
  </section>
</template>
