<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { Instagram, Phone } from 'lucide-vue-next'

defineProps<{ invitation: PublicInvitation }>()
</script>

<template>
  <footer class="text-center pt-24 pb-8 fade-in-up" style="animation-delay: 1s;">
    <div class="ornament mb-4 text-gold-400 text-sm @md:text-base">
         ✿
    </div>
    <h2 class="font-serif-cinzel text-3xl @md:text-4xl text-white mb-3 tracking-wide">{{ invitation.studio.name }}</h2>
    <p class="text-[10px] @md:text-xs tracking-[0.3em] uppercase text-gold-200/80">Captured with love, celebrated forever</p>
    
    <div v-if="invitation.studio.instagram || invitation.studio.phone" class="mt-6 flex items-center justify-center gap-6">
      <a
        v-if="invitation.studio.instagram"
        :href="`https://instagram.com/${invitation.studio.instagram}`"
        target="_blank"
        rel="noopener noreferrer"
        class="text-gold-200 hover:text-white transition-colors"
        :aria-label="`Follow ${invitation.studio.name} on Instagram`"
      >
        <Instagram class="h-5 w-5" />
      </a>
      <a
        v-if="invitation.studio.phone"
        :href="`tel:${invitation.studio.phone}`"
        class="text-gold-200 hover:text-white transition-colors"
        :aria-label="`Call ${invitation.studio.name}`"
      >
        <Phone class="h-5 w-5" />
      </a>
    </div>
    
    <div class="mt-6 text-dustypink text-sm @md:text-base animate-pulse">♥</div>
  </footer>
</template>
