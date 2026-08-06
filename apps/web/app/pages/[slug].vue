<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import QRCode from 'qrcode'
import { buildIcsEvent, googleCalendarUrl } from '@vowly/utils'

const api = useApi()
const route = useRoute()
const slug = route.params.slug as string
const requestUrl = useRequestURL()
const shareUrl = computed(() => invitation.value ? `${requestUrl.origin}/${invitation.value.slug}` : '')
const qrCode = ref('')
const rsvpName = ref('')
const rsvpStatus = ref<'yes' | 'no' | 'maybe'>('yes')
const rsvpGuestCount = ref(1)
const rsvpWebsite = ref('')
const rsvpSubmitting = ref(false)
const rsvpMessage = ref<string | null>(null)
const rsvpError = ref<string | null>(null)

const { data: invitation, error: _error } = await useAsyncData(
  `invitation-${slug}`,
  async () => {
    try {
      return await api<PublicInvitation>(`/public/invitations/${slug}`)
    } catch {
      return null
    }
  },
)

const event = useRequestEvent()
if (!invitation.value && event) {
  setResponseStatus(event, 404)
}

onMounted(async () => {
  if (invitation.value) qrCode.value = await QRCode.toDataURL(shareUrl.value, { width: 240, margin: 1 })
})

async function share() {
  if (!invitation.value) return
  if (navigator.share) await navigator.share({ title: pageTitle.value, url: shareUrl.value })
  else await navigator.clipboard?.writeText(shareUrl.value)
}
async function copyLink() {
  await navigator.clipboard?.writeText(shareUrl.value)
}
async function submitRsvp() {
  if (!invitation.value || !rsvpName.value.trim()) return
  rsvpSubmitting.value = true
  rsvpError.value = null
  rsvpMessage.value = null
  try {
    await api(`/public/invitations/${invitation.value.slug}/rsvp`, {
      method: 'POST',
      body: { guestName: rsvpName.value, status: rsvpStatus.value, guestCount: rsvpGuestCount.value, website: rsvpWebsite.value },
    })
    rsvpMessage.value = 'Your RSVP has been received. Thank you.'
    rsvpName.value = ''
    rsvpGuestCount.value = 1
  } catch (error: unknown) {
    rsvpError.value = error instanceof Error ? error.message : 'Could not send your RSVP.'
  } finally {
    rsvpSubmitting.value = false
  }
}
async function downloadCalendar(event: PublicInvitation['events'][number]) {
  if (!invitation.value) return
  const input = { title: event.title, date: event.eventDate, startTime: event.startTime, endTime: event.endTime, timeZone: invitation.value.weddingTz, venue: event.venue, address: event.address, description: event.notes }
  const blob = new Blob([buildIcsEvent(input)], { type: 'text/calendar' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${event.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.ics`
  link.click()
  URL.revokeObjectURL(link.href)
}

const pageTitle = computed(() =>
  invitation.value
    ? `${invitation.value.brideName} & ${invitation.value.groomName} — Wedding Invitation`
    : 'Invitation not found',
)

useSeoMeta({
  title: pageTitle,
  description: () =>
    invitation.value
      ? `You are invited to celebrate the wedding of ${invitation.value.brideName} & ${invitation.value.groomName}`
      : 'Invitation not found',
  robots: 'index, follow',
  ogTitle: pageTitle,
  ogDescription: () =>
    invitation.value
      ? `You are invited to celebrate the wedding of ${invitation.value.brideName} & ${invitation.value.groomName}`
      : undefined,
  ogImage: () => invitation.value?.ogImageUrl ?? undefined,
  twitterCard: 'summary_large_image',
  twitterImage: () => invitation.value?.ogImageUrl ?? undefined,
})
</script>

<template>
  <main>
    <section v-if="invitation" class="flex flex-wrap items-center justify-center gap-3 bg-ink-900 px-6 py-4 text-xs text-white">
      <button class="border border-white/30 px-4 py-2" @click="share">Share invitation</button>
      <button class="border border-white/30 px-4 py-2" @click="copyLink">Copy link</button>
      <div v-if="qrCode" class="flex items-center gap-3 bg-white p-2 text-ink-900"><img :src="qrCode" alt="QR code for this invitation" width="72" height="72"><span>Scan to open</span></div>
      <div class="flex gap-2"><a v-for="item in invitation.events" :key="item.id" :href="googleCalendarUrl({ title: item.title, date: item.eventDate, startTime: item.startTime, endTime: item.endTime, timeZone: invitation.weddingTz, venue: item.venue, address: item.address, description: item.notes })" target="_blank" rel="noopener noreferrer" class="border border-white/30 px-4 py-2">{{ item.title }} calendar</a><button v-for="item in invitation.events" :key="`${item.id}-ics`" class="border border-white/30 px-4 py-2" @click="downloadCalendar(item)">Download .ics</button></div>
    </section>
     <TemplateRenderer v-if="invitation" :invitation="invitation" />
     <section v-if="invitation?.rsvp.enabled" aria-labelledby="rsvp-title" class="mx-auto max-w-xl px-6 py-16">
       <p class="text-center text-[10px] uppercase tracking-[0.24em] text-gold-600">Kindly reply</p>
       <h2 id="rsvp-title" class="mt-2 text-center font-display text-4xl">Will you join us?</h2>
       <p v-if="rsvpMessage" role="status" class="mt-5 bg-green-50 px-4 py-3 text-center text-sm text-green-800">{{ rsvpMessage }}</p>
       <p v-if="rsvpError" role="alert" class="mt-5 bg-red-50 px-4 py-3 text-center text-sm text-red-700">{{ rsvpError }}</p>
       <form v-if="!rsvpMessage" class="mt-7 space-y-4" @submit.prevent="submitRsvp">
          <label class="block text-sm">Your name<input v-model="rsvpName" required maxlength="80" autocomplete="name" class="mt-1 w-full border border-ink-900/15 bg-white px-4 py-3"></label>
          <fieldset><legend class="text-sm">Response</legend><div class="mt-2 grid grid-cols-3 gap-2"><label v-for="option in [{ value: 'yes', label: 'Joyfully yes' }, { value: 'maybe', label: 'Maybe' }, { value: 'no', label: 'Sadly no' }]" :key="option.value" class="border border-ink-900/15 bg-white p-3 text-center text-xs"><input v-model="rsvpStatus" :value="option.value" type="radio" class="sr-only">{{ option.label }}</label></div></fieldset>
          <label class="block text-sm">Guests<input v-model.number="rsvpGuestCount" type="number" min="1" max="20" class="mt-1 w-full border border-ink-900/15 bg-white px-4 py-3"></label>
          <label class="sr-only">Website<input v-model="rsvpWebsite" tabindex="-1" autocomplete="off"></label>
         <button type="submit" class="w-full bg-ink-900 py-4 text-xs uppercase tracking-[0.2em] text-white disabled:opacity-50" :disabled="rsvpSubmitting || !rsvpName.trim()">{{ rsvpSubmitting ? 'Sending...' : 'Send RSVP' }}</button>
       </form>
     </section>
    <div v-else class="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 class="font-display text-4xl">Invitation not found</h1>
      <p class="mt-4 text-ink-700">The link you followed may have expired or been removed.</p>
    </div>
  </main>
</template>
