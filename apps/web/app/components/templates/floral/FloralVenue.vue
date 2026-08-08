<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { MapPin } from 'lucide-vue-next'
import { parseGoogleMapsUrl, googleMapsOpenUrl, googleMapsEmbedUrl } from '@vowly/utils'
import { computed } from 'vue'

const props = defineProps<{
  event: PublicInvitation['events'][number] | undefined
}>()

const isShortLink = computed(() => {
  if (!props.event?.googleMapUrl) return false
  return parseGoogleMapsUrl(props.event.googleMapUrl).type === 'short'
})

const embedSrc = computed(() => {
  if (props.event?.googleMapEmbedUrl) return props.event.googleMapEmbedUrl
  if (props.event?.googleMapUrl) return googleMapsEmbedUrl(props.event.googleMapUrl) || ''
  return ''
})

const openUrl = computed(() => {
  if (!props.event?.googleMapUrl) return '#'
  return googleMapsOpenUrl(props.event.googleMapUrl)
})
</script>

<template>
  <section v-if="event && (event.venue || event.address || event.googleMapUrl)" class="px-4 py-12 @[640px]:px-6 @[640px]:py-16">
    <div class="mx-auto max-w-4xl">
      <div class="overflow-hidden rounded-2xl border border-ivory-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] @[640px]:grid @[640px]:grid-cols-2">
        <!-- Venue info -->
        <div class="flex flex-col justify-center items-center text-center p-8 @[640px]:items-start @[640px]:text-left @[640px]:p-12">
          <p class="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-600">Our Venue</p>
          <h2 class="mt-3 font-display text-4xl text-ink-800">{{ event.venue || 'Venue' }}</h2>
          <p v-if="event.address" class="mt-4 text-sm font-medium text-ink-700/80">{{ event.address }}</p>
          <p v-if="event.notes" class="mt-4 text-sm text-ink-700/60">{{ event.notes }}</p>
          
          <div v-if="event.googleMapUrl" class="mt-8">
            <a
              :href="openUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 rounded-lg bg-[#b5944b] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9d803e]"
            >
              <MapPin class="h-4 w-4" />
              Open in Google Maps
            </a>
          </div>
        </div>

        <!-- Map embed -->
        <div class="h-64 bg-ivory-50 border-t border-ivory-200 @[640px]:border-t-0 @[640px]:border-l @[640px]:h-auto">
          <!-- Embedded map -->
          <template v-if="embedSrc">
            <iframe
              :src="embedSrc"
              class="h-full w-full"
              style="border: 0"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title="Venue map"
            />
          </template>

          <!-- Short link fallback -->
          <template v-else-if="isShortLink && event.googleMapUrl">
            <div class="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
              <div class="flex h-16 w-16 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                <MapPin class="h-8 w-8" />
              </div>
              <p class="text-sm font-medium text-ink-700/70">Map embedded view unavailable for short links</p>
            </div>
          </template>

          <!-- No map available -->
          <template v-else>
            <div class="flex h-full items-center justify-center">
              <p class="text-sm text-ink-700/40">Map not available</p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
