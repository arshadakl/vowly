<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { formatDate } from '@vueuse/core'

const props = defineProps<{ invitation: PublicInvitation }>()

const formattedDate = computed(() =>
  formatDate(new Date(props.invitation.weddingDate), 'MMMM D, YYYY'),
)
</script>

<template>
  <section class="relative overflow-hidden bg-[#faf5ef] px-6 pt-16 pb-20 text-center">
    <!-- Placeholder floral SVGs — replace with real floral images -->
    <svg class="pointer-events-none absolute top-0 left-0 w-40 opacity-50 sm:w-56" viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="40" cy="40" r="30" fill="#c5d4a0" opacity="0.4" />
      <circle cx="70" cy="25" r="22" fill="#d4c5a9" opacity="0.35" />
      <circle cx="25" cy="70" r="26" fill="#e8dfd3" opacity="0.45" />
      <circle cx="55" cy="55" r="18" fill="#b8c994" opacity="0.3" />
    </svg>
    <svg class="pointer-events-none absolute top-0 right-0 w-40 opacity-50 sm:w-56" viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="160" cy="40" r="30" fill="#c5d4a0" opacity="0.4" />
      <circle cx="130" cy="25" r="22" fill="#d4c5a9" opacity="0.35" />
      <circle cx="175" cy="70" r="26" fill="#e8dfd3" opacity="0.45" />
      <circle cx="145" cy="55" r="18" fill="#b8c994" opacity="0.3" />
    </svg>

    <div class="relative z-10 mx-auto max-w-2xl">
      <p class="text-xs uppercase tracking-[0.3em] text-gold-500">The Wedding Of</p>

      <h1 class="mt-6 font-display text-5xl font-medium text-ink-800 sm:text-7xl">
        {{ invitation.brideName }}
        <span class="mx-3 text-gold-500">&amp;</span>
        {{ invitation.groomName }}
      </h1>

      <p class="mt-6 text-lg tracking-wide text-ink-800">{{ formattedDate }}</p>

      <div v-if="invitation.quote" class="mx-auto mt-8 max-w-md">
        <div class="mb-3 flex items-center justify-center gap-3">
          <span class="h-px w-12 bg-gold-500/40" />
          <span class="text-gold-500">&#10045;</span>
          <span class="h-px w-12 bg-gold-500/40" />
        </div>
        <p class="font-display text-lg italic text-ink-700/80">
          "{{ invitation.quote }}"
        </p>
      </div>
    </div>
  </section>
</template>
