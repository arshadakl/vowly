<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { formatDate, useClipboard } from '@vueuse/core'

const props = defineProps<{ invitation: PublicInvitation }>()
const { copy, copied } = useClipboard()

function addressText(event: PublicInvitation['events'][number]): string {
  return [event.venue, event.address].filter(Boolean).join(', ')
}

function openMap(event: PublicInvitation['events'][number]) {
  if (event.googleMapUrl) {
    window.open(event.googleMapUrl, '_blank', 'noopener,noreferrer')
  }
}

const formattedDate = computed(() =>
  formatDate(new Date(props.invitation.weddingDate), 'MMMM D, YYYY'),
)
</script>

<template>
  <article class="min-h-screen bg-ivory-50 text-ink-900">
    <section class="relative flex flex-col items-center justify-center px-6 py-20 text-center">
      <div class="max-w-2xl">
        <p class="text-sm uppercase tracking-[0.25em] text-gold-600">Wedding Invitation</p>
        <h1 class="mt-4 font-display text-5xl font-medium md:text-7xl">
          {{ invitation.brideName }}
          <span class="mx-3 text-gold-500">&amp;</span>
          {{ invitation.groomName }}
        </h1>
        <p v-if="invitation.quote" class="mt-6 font-display text-xl italic text-ink-700">
          "{{ invitation.quote }}"
        </p>
        <p class="mt-6 text-lg tracking-wide">{{ formattedDate }}</p>
      </div>
    </section>

    <section class="px-6 py-12">
      <CountdownTimer :target="invitation.weddingDate" :time-zone="invitation.weddingTz" />
    </section>

    <section class="mx-auto max-w-3xl px-6 py-12">
      <h2 class="text-center font-display text-3xl">Events</h2>
      <div class="mt-8 space-y-6">
        <div
          v-for="event in invitation.events"
          :key="event.id"
          class="rounded-xl bg-white p-6 shadow-sm"
        >
          <h3 class="font-display text-2xl text-ink-800">{{ event.title }}</h3>
          <p class="mt-1 text-ink-700">
            {{ formatDate(new Date(event.eventDate), 'MMMM D, YYYY') }}
            <span v-if="event.startTime"> · {{ event.startTime }}</span>
            <span v-if="event.endTime"> – {{ event.endTime }}</span>
          </p>
          <div v-if="event.venue || event.address" class="mt-3">
            <p class="font-medium">{{ event.venue }}</p>
            <p class="text-sm text-ink-700">{{ event.address }}</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                v-if="event.googleMapUrl"
                class="rounded-full border border-ink-800/20 px-4 py-2 text-sm transition-colors hover:bg-ink-800 hover:text-white"
                @click="openMap(event)"
              >
                Open in Google Maps
              </button>
              <button
                class="rounded-full border border-ink-800/20 px-4 py-2 text-sm transition-colors hover:bg-ink-800 hover:text-white"
                @click="copy(addressText(event))"
              >
                {{ copied ? 'Copied!' : 'Copy Address' }}
              </button>
            </div>
          </div>
          <p v-if="event.notes" class="mt-3 text-sm text-ink-700">{{ event.notes }}</p>
        </div>
      </div>
    </section>

    <div class="px-6"><PhotographyFooter :studio="invitation.studio" /></div>
  </article>
</template>
