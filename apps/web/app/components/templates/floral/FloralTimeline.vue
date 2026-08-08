<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { formatDate } from '@vueuse/core'
import { Heart, Clock, MapPin, CalendarDays } from 'lucide-vue-next'
import { googleMapsOpenUrl } from '@vowly/utils'

defineProps<{ events: PublicInvitation['events'] }>()

function timeRange(event: PublicInvitation['events'][number]): string {
  if (event.startTime && event.endTime) return `${event.startTime} – ${event.endTime}`
  if (event.startTime) return event.startTime
  return ''
}
</script>

<template>
  <section class="px-4 py-12 @[640px]:px-6 @[640px]:py-16">
    <div class="mx-auto max-w-3xl">
      <p class="text-center text-[9px] font-semibold uppercase tracking-[0.3em] text-gold-600 @[640px]:text-[10px]">Our Events</p>
      <h2 class="mt-2 text-center font-display text-3xl text-ink-800 @[640px]:mt-3 @[640px]:text-4xl">Wedding Timeline</h2>

      <div class="my-6 flex justify-center @[640px]:my-8">
        <img src="/templates/floral/timer-and-timeline-underline.png" alt="" class="h-auto w-40 object-contain @[640px]:w-56" />
      </div>

      <div v-if="events.length" class="relative mt-8 @[640px]:mt-12">
        <!-- Vertical gold line -->
        <div class="absolute bottom-0 left-[19px] top-0 w-px bg-gold-500/30 @[640px]:left-[27px]" />

        <div class="space-y-6 @[640px]:space-y-8">
          <div
            v-for="(event, index) in events"
            :key="event.id"
            class="relative flex gap-4 @[640px]:gap-6"
          >
            <!-- Icon dot -->
            <div class="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-500/30 bg-[#faf5ef] shadow-sm @[640px]:h-14 @[640px]:w-14">
              <div class="flex h-7 w-7 items-center justify-center rounded-full bg-gold-500 text-white @[640px]:h-11 @[640px]:w-11">
                <Heart v-if="index === 0" class="h-3.5 w-3.5 @[640px]:h-5 @[640px]:w-5" />
                <Clock v-else-if="index === 1" class="h-3.5 w-3.5 @[640px]:h-5 @[640px]:w-5" />
                <Heart v-else class="h-3.5 w-3.5 @[640px]:h-5 @[640px]:w-5" />
              </div>
            </div>

            <!-- Event card -->
            <div class="relative flex-1 rounded-2xl border border-ivory-200 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.04)] @[640px]:flex @[640px]:items-center @[640px]:gap-6 @[640px]:p-6 @[1024px]:gap-8 @[1024px]:p-8">
              <!-- Left side (Time & Date) -->
              <div class="flex-1">
                <h3 class="font-display text-xl font-normal text-ink-800 @[640px]:text-2xl">{{ event.title }}</h3>
                <div class="mt-3 space-y-2 @[640px]:mt-4 @[640px]:space-y-3">
                  <div class="flex items-center gap-2.5 text-xs text-ink-700 @[640px]:text-sm">
                    <CalendarDays class="h-3.5 w-3.5 shrink-0 text-gold-500 @[640px]:h-4 @[640px]:w-4" />
                    <span class="font-medium">{{ formatDate(new Date(event.eventDate), 'DD MMMM YYYY') }}</span>
                  </div>
                  <div v-if="timeRange(event)" class="flex items-center gap-2.5 text-xs text-ink-700 @[640px]:text-sm">
                    <Clock class="h-3.5 w-3.5 shrink-0 text-gold-500 @[640px]:h-4 @[640px]:w-4" />
                    <span class="font-medium">{{ timeRange(event) }}</span>
                  </div>
                </div>
              </div>

              <!-- Separator (Desktop vertical, Mobile horizontal) -->
              <div class="my-4 h-px w-full bg-gold-500/20 @[640px]:my-0 @[640px]:h-24 @[640px]:w-px @[640px]:shrink-0" />

              <!-- Right side (Venue) -->
              <div class="flex-1">
                <div v-if="event.venue || event.address" class="flex items-start gap-2.5">
                  <MapPin class="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-500 @[640px]:h-4 @[640px]:w-4" />
                  <div>
                    <p class="text-sm font-semibold text-ink-800">{{ event.venue }}</p>
                    <p v-if="event.address" class="mt-1 text-xs text-ink-700/70">{{ event.address }}</p>
                    <a
                      v-if="event.googleMapUrl"
                      :href="googleMapsOpenUrl(event.googleMapUrl)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="mt-2.5 inline-flex items-center text-[10px] font-semibold uppercase tracking-wider text-gold-600 transition-colors hover:text-gold-700 @[640px]:mt-3 @[640px]:text-xs"
                    >
                      View on Maps
                      <svg class="ml-1 h-2.5 w-2.5 @[640px]:h-3 @[640px]:w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </a>
                  </div>
                </div>
              </div>

              <!-- Decorative Floral Leaf (Bottom Right) -->
              <div class="pointer-events-none absolute bottom-0 right-0 h-20 w-20 overflow-hidden rounded-br-2xl opacity-[0.85] mix-blend-multiply @[640px]:h-28 @[640px]:w-28">
                <img src="/templates/floral/Timeline-card-right.png" alt="" class="absolute bottom-0 right-0 h-full w-full object-cover" />
              </div>

              <!-- Notes -->
              <div v-if="event.notes" class="mt-4 w-full border-t border-ivory-200 pt-3 @[640px]:mt-5 @[640px]:pt-4">
                <p class="text-[11px] text-ink-700/60 @[640px]:text-xs">{{ event.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p v-else class="mt-12 text-center text-sm text-ink-700/50">No events scheduled yet.</p>
    </div>
  </section>
</template>
