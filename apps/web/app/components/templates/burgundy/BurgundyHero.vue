<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { computed } from 'vue'
import { formatDate } from '@vueuse/core'

const props = defineProps<{ invitation: PublicInvitation }>()

const formattedDate = computed(() => {
  const d = new Date(props.invitation.weddingDate)
  return formatDate(d, 'DD MMMM YYYY')
})
</script>

<template>
  <section class="pt-20 @lg:pt-32 pb-16 text-center flex flex-col items-center min-h-[600px] @lg:min-h-[800px] fade-in-up">
    <div class="absolute top-0 left-0 w-48 h-48 @md:w-64 @md:h-64 pointer-events-none z-20 opacity-80" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBQGg2ONv0vBiNTdDZDLeFCQEp7mu8BHuWVZYrlgVqyjBcRqI6jlEHEPRnLEJ3Ke-jshBnLTktdWjYjnXToOi1df6q8Zvx_WqXFUcK6URCsUmxDuVKusrnq2i1puQwo7nMukpVNvxKtPHK4NhICy-GZTtxtFqzdY6NUyAkdsCqCKLoSuf_9BShSw7a3izm6Ly8b-GLHJOlnsZJO4TT_g9gsfPtERhghPYmWs_R_ovA0IOHYOYuEUYdSFQ6gJ0llZpgRDA'); background-size: 1536px 1024px; background-position: 0px 0px; background-repeat: no-repeat;"></div>
    
    <div class="arch-border w-full max-w-[320px] @md:max-w-md @lg:max-w-lg @xl:max-w-xl p-8 @md:p-12 pt-16 @md:pt-24 mt-8 glass-panel flex flex-col items-center">
      
      <div class="ornament mb-6 text-gold-400 text-sm @md:text-base">
        ✿
      </div>
      
      <p class="text-[10px] @md:text-xs @lg:text-sm tracking-[0.3em] uppercase font-serif-cinzel mb-6 @md:mb-8 text-gold-200">
        <span v-if="invitation.quote" class="block mb-2 italic lowercase">{{ invitation.quote }}</span>
        <span v-else>Together with their families</span>
      </p>
      <p class="text-xs @md:text-sm @lg:text-base tracking-[0.2em] uppercase font-serif-cinzel mb-8 @md:mb-12 text-gold-400">The Wedding Of</p>
      
      <h1 class="font-script text-5xl @md:text-7xl @lg:text-8xl @xl:text-9xl leading-tight mb-4 text-white drop-shadow-md hover:scale-105 transition-transform duration-500">
        {{ invitation.brideName }}
      </h1>
      
      <span class="font-script text-4xl @md:text-5xl @lg:text-6xl text-gold-400 my-2 @md:my-6">&amp;</span>
      
      <h1 class="font-script text-5xl @md:text-7xl @lg:text-8xl @xl:text-9xl leading-tight mt-4 mb-12 @md:mb-16 text-white drop-shadow-md hover:scale-105 transition-transform duration-500">
        {{ invitation.groomName }}
      </h1>
      
      <div class="ornament mb-8 text-gold-400 text-sm @md:text-base">
        ✿
      </div>
      
      <p class="text-sm @md:text-base @lg:text-lg font-serif-cinzel tracking-[0.15em] font-semibold text-gold-200">{{ formattedDate }}</p>
    </div>
  </section>
</template>
