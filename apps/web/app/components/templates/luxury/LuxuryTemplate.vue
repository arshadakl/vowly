<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { formatDate, useClipboard } from '@vueuse/core'

const props = defineProps<{ invitation: PublicInvitation }>()
const { copy, copied } = useClipboard()

function addressText(event: PublicInvitation['events'][number]): string {
  return [event.venue, event.address].filter(Boolean).join(', ')
}

function openMap(event: PublicInvitation['events'][number]) {
  if (event.googleMapUrl) window.open(event.googleMapUrl, '_blank', 'noopener,noreferrer')
}

const formattedDate = computed(() =>
  formatDate(new Date(props.invitation.weddingDate), 'MMMM D, YYYY'),
)
</script>

<template>
  <article class="min-h-screen bg-ink-900 text-ivory-100">
    <section class="relative flex flex-col items-center justify-center px-6 py-24 text-center">
      <div class="max-w-2xl">
        <p class="text-xs uppercase tracking-[0.3em] text-gold-400">Wedding Invitation</p>
        <h1 class="mt-6 font-display text-6xl font-medium md:text-8xl">
          {{ invitation.brideName }}
          <span class="mx-3 text-gold-400">&amp;</span>
          {{ invitation.groomName }}
        </h1>
        <p v-if="invitation.quote" class="mt-8 font-display text-2xl italic text-ivory-200/80">
          "{{ invitation.quote }}"
        </p>
        <p class="mt-8 text-lg tracking-widest text-gold-400">{{ formattedDate }}</p>
      </div>
    </section>

    <section class="bg-ink-800 px-6 py-14">
      <CountdownTimer :target="invitation.weddingDate" :time-zone="invitation.weddingTz" />
    </section>

    <section class="mx-auto max-w-3xl px-6 py-16">
      <h2 class="text-center font-display text-3xl text-gold-400">Events</h2>
      <div class="mt-10 space-y-6">
        <div
          v-for="event in invitation.events"
          :key="event.id"
          class="rounded-xl border border-ivory-100/10 bg-ink-800/50 p-6"
        >
          <h3 class="font-display text-2xl text-ivory-100">{{ event.title }}</h3>
          <p class="mt-1 text-ivory-200/80">
            {{ formatDate(new Date(event.eventDate), 'MMMM D, YYYY') }}
            <span v-if="event.startTime"> · {{ event.startTime }}</span>
            <span v-if="event.endTime"> – {{ event.endTime }}</span>
          </p>
          <div v-if="event.venue || event.address" class="mt-4">
            <p class="font-medium text-ivory-100">{{ event.venue }}</p>
            <p class="text-sm text-ivory-200/70">{{ event.address }}</p>
            <div class="mt-4 flex flex-wrap gap-2">
              <button
                v-if="event.googleMapUrl"
                class="rounded-full bg-gold-500 px-4 py-2 text-sm font-medium text-ink-900 transition-colors hover:bg-gold-400"
                @click="openMap(event)"
              >
                Open in Google Maps
              </button>
              <button
                class="rounded-full border border-ivory-100/30 px-4 py-2 text-sm transition-colors hover:bg-ivory-100/10"
                @click="copy(addressText(event))"
              >
                {{ copied ? 'Copied!' : 'Copy Address' }}
              </button>
            </div>
          </div>
          <p v-if="event.notes" class="mt-4 text-sm text-ivory-200/70">{{ event.notes }}</p>
        </div>
      </div>
    </section>

    <div class="bg-ink-800 px-6"><PhotographyFooter :studio="invitation.studio" /></div>
  </article>
</template>
