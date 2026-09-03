<script setup lang="ts">
import { Heart } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    /** Monogram text (e.g. "R & A") */
    initial?: string
    /** Blessing text */
    blessing?: string
    /** Background color class */
    bg?: string
    /** Text color class */
    textColor?: string
    /** Accent color for decorative elements (stars) */
    accentColor?: string
    /** Heart icon color class */
    heartColor?: string
  }>(),
  {
    initial: 'V',
    blessing: 'Wishing you love and happiness always',
    bg: 'bg-[#1a0a0a]',
    textColor: 'text-white/80',
    accentColor: 'text-white/40',
    heartColor: 'text-white/60',
  },
)
</script>

<template>
  <footer class="relative w-full text-center" :class="bg" style="margin-top: 3.5rem">
    <!-- Monogram Badge -->
    <div
      class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#C6A66A]/40 bg-white shadow-md"
      style="box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)"
    >
      <span
        class="text-sm font-bold tracking-widest text-[#4A171F]"
      >
        {{ initial }}
      </span>
    </div>
    <!-- Blessing -->
    <p class="mx-auto max-w-[260px] text-xs sm:text-sm font-light leading-relaxed" :class="textColor" style="color: #57534e">
      {{ blessing }}
    </p>
    <!-- Decorative: stars + heart -->
    <div class="mt-5 flex items-center justify-center gap-2">
      <span class="text-xs" :class="accentColor">&#10038;</span>
      <Heart :size="12" class="fill-current" :class="heartColor" style="color: #8A212E" />
      <span class="text-xs" :class="accentColor">&#10038;</span>
    </div>
  </footer>
</template>
