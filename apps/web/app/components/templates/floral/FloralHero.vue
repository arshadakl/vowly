<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { formatDate } from '@vueuse/core'
import { computed } from 'vue'

const props = defineProps<{ invitation: PublicInvitation }>()

const formattedDate = computed(() =>
  formatDate(new Date(props.invitation.weddingDate), 'MMMM DD, YYYY'),
)

// Dynamically handle lengthy names for desktop
const isLongNames = computed(() => {
  const combinedLength = props.invitation.brideName.length + props.invitation.groomName.length
  return combinedLength > 16
})

function getFontSizeClass(name: string) {
  if (name.length > 15) return 'text-3xl @[640px]:text-4xl'
  if (name.length > 10) return 'text-4xl @[640px]:text-5xl @[1024px]:text-6xl'
  return 'text-5xl @[640px]:text-6xl @[1024px]:text-7xl'
}
</script>

<template>
  <section class="relative overflow-hidden px-4 pt-20 pb-16 text-center @[640px]:px-6 @[640px]:pt-24">
    <img src="/templates/floral/left-top.png" alt="" class="pointer-events-none absolute top-0 left-0 w-32 @[640px]:w-48 @[1024px]:w-64 opacity-90 mix-blend-multiply" />
    <img src="/templates/floral/right-top.png" alt="" class="pointer-events-none absolute bottom-10 right-0 w-32 @[640px]:w-48 @[1024px]:w-64 opacity-90 mix-blend-multiply" />

    <div class="relative z-10 mx-auto max-w-2xl mt-4 @[640px]:mt-0">
      <p class="text-[9px] font-semibold uppercase tracking-[0.3em] text-gold-600 @[640px]:text-[10px]">
        The Wedding Of
      </p>

      <!-- Dynamic Name Layout: Always stacked on mobile, conditional on desktop -->
      <h1 class="mt-4 flex flex-col items-center justify-center font-playfair text-ink-800 @[640px]:mt-6"
          :class="isLongNames ? '' : '@[640px]:flex-row'">
        
        <span class="text-balance leading-tight text-center" :class="getFontSizeClass(invitation.brideName)">
          {{ invitation.brideName }}
        </span>
        
        <img src="/templates/floral/ring-and.png" alt="&" class="shrink-0 object-contain my-3 h-10 w-10 @[640px]:h-12 @[640px]:w-12 @[1024px]:h-16 @[1024px]:w-16"
             :class="isLongNames ? '@[640px]:my-4' : '@[640px]:mx-4 @[640px]:my-0 @[1024px]:mx-6'" />
        
        <span class="text-balance leading-tight text-center" :class="getFontSizeClass(invitation.groomName)">
          {{ invitation.groomName }}
        </span>
      </h1>

      <div class="my-6 flex justify-center @[640px]:my-8">
        <img src="/templates/floral/names-underline.png" alt="" class="h-auto w-40 object-contain @[640px]:w-56 @[1024px]:w-72" />
      </div>

      <p class="text-[10px] font-semibold tracking-[0.2em] text-gold-600 uppercase @[640px]:text-xs">
        {{ formattedDate }}
      </p>

      <div v-if="invitation.quote" class="mx-auto mt-6 max-w-md px-4 @[640px]:px-0">
        <p class="font-display text-[13px] italic text-ink-700/80 @[640px]:text-[15px]">
          "{{ invitation.quote }}"
        </p>
        <p class="mt-2 text-[9px] uppercase tracking-widest text-ink-700/50 @[640px]:text-[10px]">
          — Qur'an 78:8 —
        </p>
      </div>
    </div>
  </section>
</template>
