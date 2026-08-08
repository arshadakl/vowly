<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { formatDate } from '@vueuse/core'
import { Heart, Clock, MapPin } from 'lucide-vue-next'
import { googleMapsOpenUrl } from '@vowly/utils'

defineProps<{ events: PublicInvitation['events'] }>()

function timeRange(event: PublicInvitation['events'][number]): string {
  if (event.startTime && event.endTime) return `${event.startTime} – ${event.endTime}`
  if (event.startTime) return event.startTime
  return ''
}
</script>

<template>
  <section class="bg-white px-6 py-16">
    <div class="mx-auto max-w-3xl">
      <p class="text-center text-xs uppercase tracking-[0.3em] text-gold-500">Our Events</p>
      <h2 class="mt-3 text-center font-display text-3xl text-ink-800">Wedding Timeline</h2>

      <div v-if="events.length" class="relative mt-12">
        <!-- Vertical gold line -->
        <div class="absolute top-0 bottom-0 left-5 w-px bg-gold-500/30" />

        <div class="space-y-8">
          <div
            v-for="event in events"
            :key="event.id"
            class="relative flex gap-5"
          >
            <!-- Icon dot -->
            <div class="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gold-500/40 bg-[#faf5ef]">
              <Heart class="h-4 w-4 text-gold-500" />
            </div>

            <!-- Event card -->
            <div class="flex-1 rounded-xl border border-ivory-200 bg-[#faf5ef] p-5">
              <h3 class="font-display text-xl font-medium text-ink-800">{{ event.title }}</h3>

              <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-700/70">
                <span class="flex items-center gap-1.5">
                  <Clock class="h-3.5 w-3.5 text-gold-500" />
                  {{ formatDate(new Date(event.eventDate), 'MMMM D, YYYY') }}
                  <span v-if="timeRange(event)"> · {{ timeRange(event) }}</span>
                </span>
              </div>

              <div v-if="event.venue || event.address" class="mt-3">
                <p class="text-sm font-medium text-ink-800">{{ event.venue }}</p>
                <p v-if="event.address" class="text-xs text-ink-700/60">{{ event.address }}</p>
                <a
                  v-if="event.googleMapUrl"
                  :href="googleMapsOpenUrl(event.googleMapUrl)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-gold-500 transition-colors hover:text-gold-600"
                >
                  <MapPin class="h-3 w-3" />
                  View on Maps
                </a>
              </div>

              <p v-if="event.notes" class="mt-3 text-xs text-ink-700/60">{{ event.notes }}</p>
            </div>
          </div>
        </div>
      </div>

      <p v-else class="mt-12 text-center text-ink-700/50">No events scheduled yet.</p>
    </div>
  </section>
</template>
