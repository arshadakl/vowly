<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { MapPin } from 'lucide-vue-next'
import {
  isValidGoogleMapsUrl,
  isShortGoogleMapsLink,
  googleMapsEmbedUrl,
  googleMapsOpenUrl,
} from '@vowly/utils'

const props = defineProps<{
  event: PublicInvitation['events'][number] | undefined
}>()

const embedSrc = computed(() => {
  if (!props.event?.googleMapUrl) return ''
  if (!isValidGoogleMapsUrl(props.event.googleMapUrl)) return ''
  return googleMapsEmbedUrl(props.event.googleMapUrl)
})

const isShortLink = computed(() => {
  if (!props.event?.googleMapUrl) return false
  return isShortGoogleMapsLink(props.event.googleMapUrl)
})

const openUrl = computed(() => {
  if (!props.event?.googleMapUrl) return '#'
  return googleMapsOpenUrl(props.event.googleMapUrl)
})
</script>

<template>
  <section v-if="event && (event.venue || event.address)" class="bg-[#faf5ef] px-6 py-16">
    <div class="mx-auto max-w-3xl">
      <p class="text-center text-xs uppercase tracking-[0.3em] text-gold-500">Our Venue</p>
      <h2 class="mt-3 text-center font-display text-3xl text-ink-800">{{ event.venue || 'Venue' }}</h2>

      <div class="mt-10 grid gap-8 sm:grid-cols-2">
        <!-- Venue info -->
        <div class="flex flex-col justify-center">
          <p v-if="event.address" class="text-sm text-ink-700/70">{{ event.address }}</p>
          <p v-if="event.notes" class="mt-4 text-sm text-ink-700/60">{{ event.notes }}</p>
              <a
                v-if="event.googleMapUrl"
                :href="event.googleMapUrl ?? undefined"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm font-medium text-gold-500 transition-colors hover:text-gold-600"
              >
            <MapPin class="h-4 w-4" />
            Open in Google Maps
          </a>
        </div>

        <!-- Map embed -->
        <div class="overflow-hidden rounded-xl border border-ivory-200 bg-white">
          <template v-if="embedSrc">
            <iframe
              :src="embedSrc"
              width="100%"
              height="250"
              style="border: 0"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title="Venue map"
            />
          </template>
          <template v-else-if="isShortLink">
            <div class="flex h-[250px] flex-col items-center justify-center gap-3 bg-ivory-50 p-6 text-center">
              <MapPin class="h-10 w-10 text-gold-500" />
              <p class="text-sm text-ink-700/70">Short link — tap below to open in Maps</p>
              <a
                :href="openUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm font-medium text-gold-500 transition-colors hover:text-gold-600"
              >
                Open map
              </a>
            </div>
          </template>
          <template v-else>
            <div class="flex h-[250px] items-center justify-center bg-ivory-50">
              <p class="text-sm text-ink-700/40">Map not available</p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
