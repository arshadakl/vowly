<script setup lang="ts">
import { CalendarDays, Lightbulb, MapPin, Plus, Trash2, Clipboard, ExternalLink, AlertCircle } from 'lucide-vue-next'
import { isValidGoogleMapsUrl, isShortGoogleMapsLink, googleMapsEmbedUrl, googleMapsOpenUrl } from '@vowly/utils'
import type { EditorInvitation } from '~/types/client-wizard'

const props = defineProps<{ draft: EditorInvitation; locked: boolean }>()
const draft = computed(() => props.draft)

const inputClass = 'mt-2 w-full border border-ink-900/15 bg-white px-4 py-3 outline-none focus:border-gold-500'

function addEvent() {
  draft.value.events.push({
    id: crypto.randomUUID(),
    invitationId: draft.value.id,
    title: 'New event',
    eventDate: draft.value.weddingDate,
    startTime: null,
    endTime: null,
    venue: null,
    googleMapUrl: null,
    address: null,
    notes: null,
    sortOrder: draft.value.events.length,
  })
}

function removeEvent(index: number) {
  draft.value.events.splice(index, 1)
  draft.value.events.forEach((event, position) => {
    event.sortOrder = position
  })
}

function moveEvent(index: number, direction: -1 | 1) {
  const next = index + direction
  if (next < 0 || next >= draft.value.events.length) return
  const current = draft.value.events[index]!
  draft.value.events[index] = draft.value.events[next]!
  draft.value.events[next] = current
  draft.value.events.forEach((event, position) => {
    event.sortOrder = position
  })
}

function pasteFromClipboard(event: { googleMapUrl?: string | null }) {
  navigator.clipboard.readText().then((text) => {
    if (text) event.googleMapUrl = text.trim()
  }).catch(() => {})
}
</script>

<template>
  <section class="border border-ink-900/10 bg-white p-6 shadow-sm sm:p-8">
    <div class="flex items-start gap-4 border-b border-ink-900/10 pb-6">
      <span
        class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-ivory-100 text-gold-600"
      ><CalendarDays class="h-7 w-7" /></span>
      <div>
        <p class="text-[10px] uppercase tracking-[0.25em] text-gold-600">Step 2</p>
        <h2 class="mt-2 font-display text-4xl">Wedding Events</h2>
        <p class="mt-1 text-sm text-ink-700">Add all your wedding events and venue details.</p>
      </div>
    </div>
    <div
      class="mt-6 flex flex-wrap items-center justify-between gap-4 border border-gold-500/20 bg-gold-500/5 px-4 py-3 text-sm text-gold-600"
    >
      <span class="flex items-center gap-2"
      ><Lightbulb class="h-5 w-5" />Add as many events as you need. You can reorder them
        below.</span
      ><button class="lumiere-button shrink-0" :disabled="locked" @click="addEvent">
        <Plus class="mr-2 h-4 w-4" />Add Event
      </button>
    </div>
    <div v-if="draft.events.length" class="mt-6 space-y-6">
      <article
        v-for="(event, index) in draft.events"
        :key="event.id"
        class="border border-ink-900/10 p-5"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0 flex-1">
            <span class="text-xs text-gold-600">Event {{ index + 1 }}</span>
            <input
              v-model="event.title"
              :disabled="locked"
              class="mt-1 block w-full border-0 border-b border-transparent bg-transparent font-display text-3xl outline-none focus:border-gold-500 focus:border-b-solid"
              placeholder="Event title"
            >
          </div>
          <div class="flex gap-2">
            <button
              class="lumiere-button-secondary px-3 py-2"
              :disabled="locked"
              @click="moveEvent(index, -1)"
            >↑</button>
            <button
              class="lumiere-button-secondary px-3 py-2"
              :disabled="locked"
              @click="moveEvent(index, 1)"
            >↓</button>
            <button
              class="border border-red-200 px-3 py-2 text-red-600"
              :disabled="locked"
              @click="removeEvent(index)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label class="text-sm font-medium">Date</label>
            <input
              v-model="event.eventDate"
              type="date"
              :disabled="locked"
              :class="inputClass"
            >
          </div>
          <div>
            <label class="text-sm font-medium">Start time</label>
            <input
              v-model="event.startTime"
              type="time"
              :disabled="locked"
              :class="inputClass"
            >
          </div>
          <div>
            <label class="text-sm font-medium">End time</label>
            <input
              v-model="event.endTime"
              type="time"
              :disabled="locked"
              :class="inputClass"
            >
          </div>
          <div>
            <label class="text-sm font-medium"><MapPin class="mr-1 inline h-4 w-4" />Venue</label>
            <input
              v-model="event.venue"
              :disabled="locked"
              :class="inputClass"
              placeholder="e.g. Grand Ballroom"
            >
          </div>
          <div class="sm:col-span-2">
            <label class="text-sm font-medium">Address</label>
            <input
              v-model="event.address"
              :disabled="locked"
              :class="inputClass"
              placeholder="Full venue address"
            >
          </div>
          <div class="sm:col-span-2">
            <label class="text-sm font-medium">Google Maps link</label>
            <div class="flex gap-2">
              <input
                v-model="event.googleMapUrl"
                :disabled="locked"
                :class="inputClass + ' flex-1'"
                placeholder="https://maps.app.goo.gl/..."
              >
              <button
                type="button"
                class="lumiere-button-secondary mt-2 shrink-0 px-3"
                :disabled="locked"
                title="Paste from clipboard"
                @click="pasteFromClipboard(event)"
              >
                <Clipboard class="h-4 w-4" />
              </button>
            </div>
            <p
              v-if="event.googleMapUrl && !isValidGoogleMapsUrl(event.googleMapUrl)"
              class="mt-1 flex items-center gap-1 text-xs text-red-600"
            >
              <AlertCircle class="h-3 w-3" />Please enter a valid Google Maps link
            </p>
          </div>
          <div
            v-if="event.googleMapUrl && isValidGoogleMapsUrl(event.googleMapUrl) && !isShortGoogleMapsLink(event.googleMapUrl)"
            class="sm:col-span-2"
          >
            <div class="overflow-hidden border border-ink-900/10">
              <iframe
                :src="googleMapsEmbedUrl(event.googleMapUrl)"
                width="100%"
                height="250"
                style="border: 0"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              :href="googleMapsOpenUrl(event.googleMapUrl)"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-2 inline-flex items-center gap-1 text-xs text-gold-600 hover:underline"
            >Open in Google Maps <ExternalLink class="h-3 w-3" /></a>
          </div>
          <div
            v-else-if="event.googleMapUrl && isValidGoogleMapsUrl(event.googleMapUrl) && isShortGoogleMapsLink(event.googleMapUrl)"
            class="sm:col-span-2"
          >
            <div class="flex items-center gap-4 border border-ink-900/10 bg-ivory-50 px-5 py-4">
              <MapPin class="h-8 w-8 shrink-0 text-gold-600" />
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-ink-900">Location pinned</p>
                <p class="mt-0.5 truncate text-xs text-ink-700/60">{{ event.googleMapUrl }}</p>
              </div>
              <a
                :href="event.googleMapUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="lumiere-button-secondary shrink-0 px-4 py-2 text-xs"
              >Open map <ExternalLink class="ml-1 inline h-3 w-3" /></a>
            </div>
          </div>
          <div class="sm:col-span-2">
            <label class="text-sm font-medium">Notes</label>
            <textarea
              v-model="event.notes"
              :disabled="locked"
              rows="2"
              :class="inputClass + ' resize-none'"
              placeholder="Optional notes for this event"
              />
          </div>
        </div>
      </article>
    </div>
    <button
      v-else
      class="mt-6 flex w-full items-center justify-center gap-2 border border-dashed border-ink-900/20 py-8 text-sm text-ink-700/65"
      :disabled="locked"
      @click="addEvent"
    >
      <Plus class="h-5 w-5" />Add your first event
    </button>
  </section>
</template>
