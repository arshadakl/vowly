<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { computed } from 'vue'
import {
  isValidGoogleMapsUrl,
  isShortGoogleMapsLink,
  googleMapsEmbedUrl,
  googleMapsOpenUrl,
} from '@vowly/utils'
import { MapPin } from 'lucide-vue-next'

const props = defineProps<{ invitation: PublicInvitation }>()

const featuredEvent = computed(() => {
  if (props.invitation.featuredVenueEventId) {
    const found = props.invitation.events.find((e) => e.id === props.invitation.featuredVenueEventId)
    if (found) return found
  }
  return props.invitation.events.find((e) => e.venue || e.address || e.googleMapUrl)
})

const isShortLink = computed(() => {
  if (!featuredEvent.value?.googleMapUrl) return false
  return isShortGoogleMapsLink(featuredEvent.value.googleMapUrl)
})

const embedUrl = computed(() => {
  if (featuredEvent.value?.googleMapEmbedUrl) return featuredEvent.value.googleMapEmbedUrl
  if (featuredEvent.value?.googleMapUrl && !isShortLink.value) {
    return googleMapsEmbedUrl(featuredEvent.value.googleMapUrl)
  }
  return null
})

const openUrl = computed(() => {
  if (!featuredEvent.value?.googleMapUrl) return null
  return googleMapsOpenUrl(featuredEvent.value.googleMapUrl)
})
</script>

<template>
  <div v-if="featuredEvent" class="flex flex-col gap-6 @lg:gap-8 mt-6">
    <section class="fade-in-up" style="animation-delay: 0.6s;">
      <div class="glass-panel rounded-xl overflow-hidden flex flex-col @lg:flex-row h-full">
        <div class="p-8 @lg:w-1/2 flex flex-col justify-center">
          <p class="text-[10px] @lg:text-xs tracking-[0.25em] text-gold-400 mb-2 font-serif-cinzel uppercase">Venue</p>
          <h3 class="text-2xl @lg:text-3xl font-serif-cinzel text-white mb-3">{{ featuredEvent.venue }}</h3>
          
          <p v-if="featuredEvent.address" class="text-xs @lg:text-sm text-gold-200/80 mb-4 flex items-center gap-1.5">
            <MapPin class="w-4 h-4 text-gold-400 shrink-0" />
            {{ featuredEvent.address }}
          </p>
          
          <p class="text-xs @lg:text-sm text-gold-200 mb-8 leading-relaxed max-w-md">
            A beautiful place to celebrate love and begin our forever.
          </p>
          
          <a
            v-if="openUrl"
            :href="openUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="bg-transparent border border-gold-400 text-gold-400 text-xs @lg:text-sm px-6 py-3 rounded-full flex items-center justify-center gap-2 hover:bg-gold-400 hover:text-burgundy-900 transition-colors w-full @sm:w-auto self-start font-semibold uppercase tracking-wider"
          >
            <MapPin class="w-4 h-4" />
            Open in Google Maps
          </a>
        </div>
        
        <div class="h-64 @lg:h-96 @lg:w-1/2 bg-cover bg-center border-t @lg:border-t-0 @lg:border-l border-gold-400/30 relative" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDEDNKRPiYAUbfgqF-TWOIjvuTY3C1EC5qWeyzM64YrtFUXTP3fDSO7t0dt49clrhANc78n1lPFzAU2Pc9ALvqd_T5b13EGiPeSCfaCjt-XxVLQlECWV_gbGPOUCRPWB8--d5q4hKxuwgIhCjXWhtM9aCz_1m5GmM0Jhk5l48FD4p4aQ9jr1UdRY4WcmlVewJAtecqgsQ9A6E30aLyAFlfL9sKT-BnLX2vkIDtHoT7QEfnO8tlpLRcF');">
          <div v-if="!embedUrl" class="absolute inset-0 bg-burgundy-900/40 mix-blend-multiply transition-opacity hover:opacity-0 duration-500"></div>
          
          <iframe
            v-if="embedUrl"
            :src="embedUrl"
            class="absolute inset-0 h-full w-full border-0"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            title="Venue location map"
          ></iframe>
          
          <div v-else-if="isShortLink" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-dustypink pointer-events-none">
            <svg class="w-10 h-10 drop-shadow-2xl" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path></svg>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
