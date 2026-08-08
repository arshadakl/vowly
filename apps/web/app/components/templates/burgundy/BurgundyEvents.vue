<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { computed } from 'vue'
import { formatDate } from '@vueuse/core'
import {
  isValidGoogleMapsUrl,
  isShortGoogleMapsLink,
  googleMapsOpenUrl,
} from '@vowly/utils'
import { MapPin, Clock, CalendarDays } from 'lucide-vue-next'

const props = defineProps<{ invitation: PublicInvitation }>()

function formattedDate(dateStr: string) {
  return formatDate(new Date(dateStr), 'DD MMMM YYYY')
}

// Just an aesthetic icon rotation for the 3 sample cards if possible. We can use a map or index.
function getIconForIndex(index: number) {
  if (index % 3 === 0) return 'nikah'
  if (index % 3 === 1) return 'reception'
  return 'walima'
}
</script>

<template>
  <section v-if="invitation.events.length > 0" class="py-12 @md:py-16 fade-in-up" style="animation-delay: 0.4s;">
    <div class="text-center mb-12">
      <p class="text-xs @md:text-sm @lg:text-base tracking-[0.2em] uppercase font-serif-cinzel text-gold-200">Our Events</p>
      <div class="ornament mt-4 text-gold-400 text-sm @md:text-base">
        ✿
      </div>
    </div>
    
    <div class="flex flex-col @lg:flex-row flex-wrap justify-center gap-6 @lg:gap-8">
      
      <!-- Event Card -->
      <div v-for="(event, index) in invitation.events" :key="event.id" class="glass-panel rounded-xl p-6 flex flex-row @lg:flex-col items-center @lg:justify-center @lg:text-center relative overflow-hidden group w-full @lg:w-[calc(33.333%-1.333rem)] @lg:max-w-[400px]">
        
        <div class="w-16 h-16 @lg:w-20 @lg:h-20 rounded-full border border-gold-400/50 flex items-center justify-center shrink-0 bg-burgundy-800/50 group-hover:scale-110 transition-transform duration-300">
          <svg v-if="getIconForIndex(index) === 'nikah'" class="w-8 h-8 @lg:w-10 @lg:h-10 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3zm0 0c2.761 0 5 2.239 5 5v1H7v-1c0-2.761 2.239-5 5-5z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path></svg>
          <svg v-else-if="getIconForIndex(index) === 'reception'" class="w-8 h-8 @lg:w-10 @lg:h-10 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 4v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path></svg>
          <svg v-else class="w-8 h-8 @lg:w-10 @lg:h-10 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path></svg>
        </div>
        
        <div class="ml-4 @lg:ml-0 @lg:mt-6 flex-1">
          <p class="text-[10px] @lg:text-xs text-gold-400 font-serif-cinzel tracking-widest mb-1 @lg:mb-2 uppercase">{{ formattedDate(event.eventDate) }}</p>
          <h3 class="text-xl @lg:text-2xl font-serif-cinzel text-white mb-2">{{ event.title }}</h3>
          <p v-if="event.startTime || event.endTime" class="text-xs @lg:text-sm flex items-center @lg:justify-center gap-1.5 text-gold-200/80">
            <Clock class="w-3.5 h-3.5" />
            <template v-if="event.startTime && event.endTime">
              {{ event.startTime }} - {{ event.endTime }}
            </template>
            <template v-else-if="event.startTime">
              {{ event.startTime }}
            </template>
          </p>
        </div>
        
        <div v-if="event.venue || event.address" class="w-px h-16 @lg:w-3/4 @lg:h-px bg-gold-400/30 mx-4 @lg:mx-0 @lg:my-6"></div>
        
        <div v-if="event.venue || event.address" class="flex-1 @lg:flex @lg:flex-col @lg:items-center">
          <p v-if="event.venue" class="text-[11px] @lg:text-sm font-semibold text-white mb-1.5 flex items-start @lg:items-center @lg:justify-center gap-1.5">
            <MapPin class="w-3.5 h-3.5 mt-0.5 @lg:mt-0 text-gold-400 shrink-0" />
            {{ event.venue }}
          </p>
          <p v-if="event.address" class="text-[10px] @lg:text-xs text-gold-200/80 mb-3">{{ event.address }}</p>
          
          <a
            v-if="event.googleMapUrl && isValidGoogleMapsUrl(event.googleMapUrl)"
            :href="googleMapsOpenUrl(event.googleMapUrl)"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[10px] @lg:text-xs text-gold-400 underline decoration-gold-400/50 underline-offset-4 flex items-center justify-center gap-1 hover:text-white transition-colors"
          >
            View on Maps
            <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
          </a>
        </div>
        
      </div>
      
    </div>
  </section>
</template>
